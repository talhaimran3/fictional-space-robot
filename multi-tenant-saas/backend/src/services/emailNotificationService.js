import db from "../config/database.js";
import { sendEmail } from "./emailService.js";

/**
 * Notifications are best-effort: an email provider failure must never undo
 * a successful database operation or change its HTTP response.
 */
export const sendEmailSafely = async ({ to, subject, html }) => {
  const recipients = [...new Set((Array.isArray(to) ? to : [to]).filter(Boolean))];
  if (!recipients.length) return;

  try {
    await sendEmail({ to: recipients, subject, html });
  } catch (error) {
    console.error("Notification email failed:", error.message);
  }
};

export const notifyEmployeeAndOrganizationManagers = async ({
  employee,
  organizationId,
  email,
}) => {
  try {
    const { rows } = await db.query(
      `SELECT email
       FROM users
       WHERE organization_id = $1
         AND role IN ('admin', 'manager')
         AND email IS NOT NULL`,
      [organizationId],
    );

    const recipients = [
      employee?.email,
      ...rows.map((row) => row.email),
    ];
    await sendEmailSafely({ to: recipients, ...email });
  } catch (error) {
    console.error("Organization staff notification failed:", error.message);
  }
};
