import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = process.env.EMAIL_FROM ?? "Permitly <reminders@permitly.app>";

export interface ReminderItem {
  propertyNickname: string;
  title: string;
  dueDate: string;
  daysUntil: number;
}

export async function sendComplianceReminderEmail(to: string, items: ReminderItem[]) {
  const rows = items
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #1e293b;color:#e2e8f0;">${item.propertyNickname}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #1e293b;color:#e2e8f0;">${item.title}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #1e293b;color:#f59e0b;font-weight:600;">${
            item.daysUntil < 0 ? "Overdue" : `${item.daysUntil} day${item.daysUntil === 1 ? "" : "s"}`
          }</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;background:#020617;color:#e2e8f0;padding:24px;">
      <h2 style="color:#f8fafc;">Compliance deadlines coming up</h2>
      <p style="color:#94a3b8;">Here's what needs your attention across your properties:</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 12px;color:#64748b;font-size:12px;">PROPERTY</th>
            <th style="text-align:left;padding:8px 12px;color:#64748b;font-size:12px;">DEADLINE</th>
            <th style="text-align:left;padding:8px 12px;color:#64748b;font-size:12px;">DUE IN</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:24px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://permitly.app"}/dashboard"
           style="background:#f59e0b;color:#020617;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;">
          Open Permitly
        </a>
      </p>
      <p style="margin-top:24px;font-size:12px;color:#64748b;">Not legal advice — always confirm current requirements with your local authority.</p>
    </div>`;

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `${items.length} compliance deadline${items.length === 1 ? "" : "s"} coming up`,
    html,
  });
}
