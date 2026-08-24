import { NextResponse } from "next/server";
import { differenceInCalendarDays, startOfDay } from "date-fns";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendComplianceReminderEmail, type ReminderItem } from "@/lib/email";
import type { ComplianceDeadline, Profile, Property } from "@/types/database";

// Reminder ladder: stage 1 fires inside 45 days out, stage 2 inside 14 days,
// stage 3 inside 3 days. reminder_stage only ever moves forward, so each
// deadline sends at most one email per threshold it crosses.
function targetStage(daysUntil: number): number {
  if (daysUntil <= 3) return 3;
  if (daysUntil <= 14) return 2;
  if (daysUntil <= 45) return 1;
  return 0;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const today = startOfDay(new Date());

  const { data: deadlines } = await supabase
    .from("compliance_deadlines")
    .select("*, properties(id,nickname,user_id)")
    .eq("status", "upcoming")
    .lt("reminder_stage", 3)
    .returns<(ComplianceDeadline & { properties: Pick<Property, "id" | "nickname" | "user_id"> })[]>();

  const due = (deadlines ?? [])
    .map((d) => {
      const daysUntil = differenceInCalendarDays(new Date(d.due_date), today);
      return { deadline: d, daysUntil, stage: targetStage(daysUntil) };
    })
    .filter((d) => d.stage > d.deadline.reminder_stage);

  if (due.length === 0) {
    return NextResponse.json({ sent: 0, checked: deadlines?.length ?? 0 });
  }

  const userIds = [...new Set(due.map((d) => d.deadline.properties.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,email")
    .in("id", userIds)
    .returns<Pick<Profile, "id" | "email">[]>();

  const emailByUserId = new Map((profiles ?? []).map((p) => [p.id, p.email]));

  const byUser = new Map<string, ReminderItem[]>();
  for (const { deadline, daysUntil } of due) {
    const userId = deadline.properties.user_id;
    const list = byUser.get(userId) ?? [];
    list.push({
      propertyNickname: deadline.properties.nickname,
      title: deadline.title,
      dueDate: deadline.due_date,
      daysUntil,
    });
    byUser.set(userId, list);
  }

  let sent = 0;
  for (const [userId, items] of byUser) {
    const email = emailByUserId.get(userId);
    if (!email) continue;
    await sendComplianceReminderEmail(email, items);
    sent += 1;
  }

  await Promise.all(
    due.map(({ deadline, stage }) =>
      supabase
        .from("compliance_deadlines")
        .update({ reminder_stage: stage, reminder_sent_at: new Date().toISOString() })
        .eq("id", deadline.id)
    )
  );

  return NextResponse.json({ sent, deadlinesNotified: due.length, checked: deadlines?.length ?? 0 });
}
