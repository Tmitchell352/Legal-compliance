import { urgencyOf, URGENCY_LABEL, type UrgencyLevel } from "@/lib/compliance-engine";

const STYLES: Record<UrgencyLevel, string> = {
  overdue: "bg-red-500/10 text-red-400 border-red-500/30",
  urgent: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  soon: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  later: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

export function DeadlineBadge({ dueDate }: { dueDate: string | Date }) {
  const urgency = urgencyOf(new Date(dueDate));
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[urgency]}`}>
      {URGENCY_LABEL[urgency]}
    </span>
  );
}
