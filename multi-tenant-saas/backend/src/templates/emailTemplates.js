const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

const layout = (title, body) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto;padding:24px">
    <h2 style="color:#111827">${escapeHtml(title)}</h2>
    ${body}
    <p style="color:#6b7280;font-size:12px;margin-top:32px">This is an automated notification. Please do not reply to this email.</p>
  </div>
`;

export const welcomeEmail = (user = {}) => ({
  subject: "Welcome to the platform",
  html: layout(
    `Welcome, ${user.name || user.full_name || "there"}!`,
    "<p>Your account has been created successfully. You can now sign in using your registered email address.</p>",
  ),
});

export const profileEmail = ({ action, employee = {}, organizationName = "" }) => {
  const messages = {
    created: ["Your account has been created", "A new employee account has been created."],
    updated: ["Your profile has been updated", "Your employee account details have been updated."],
    deleted: ["Your account has been deleted", "Your employee account has been deleted."],
  };
  const [subject, message] = messages[action] || messages.updated;
  return {
    subject,
    html: layout(
      `Hello, ${employee.full_name || employee.name || "there"}`,
      `<p>${escapeHtml(message)}</p>${organizationName ? `<p>Organization: <strong>${escapeHtml(organizationName)}</strong></p>` : ""}`,
    ),
  };
};

export const shiftEmail = ({ action, employee = {}, shift = {}, organizationName = "" }) => {
  const messages = {
    created: ["New shift assigned to you", "A new shift has been assigned to you."],
    updated: ["Your shift has been updated", "One of your assigned shifts has been updated."],
    deleted: ["Your shift has been cancelled", "One of your assigned shifts has been deleted."],
  };
  const [subject, message] = messages[action] || messages.updated;
  const details = [
    shift.name ? `<p><strong>Shift:</strong> ${escapeHtml(shift.name)}</p>` : "",
    shift.start_time ? `<p><strong>Start:</strong> ${escapeHtml(new Date(shift.start_time).toLocaleString())}</p>` : "",
    shift.end_time ? `<p><strong>End:</strong> ${escapeHtml(new Date(shift.end_time).toLocaleString())}</p>` : "",
    organizationName ? `<p><strong>Organization:</strong> ${escapeHtml(organizationName)}</p>` : "",
  ].join("");
  return {
    subject,
    html: layout(`Hello, ${employee.full_name || employee.name || "there"}`, `<p>${escapeHtml(message)}</p>${details}`),
  };
};

export const organizationEmail = ({ action, actor = {}, organization = {} }) => {
  const messages = {
    created: ["Organization created", "created"],
    updated: ["Organization updated", "updated"],
    deactivated: ["Organization deactivated", "deactivated"],
    reactivated: ["Organization reactivated", "reactivated"],
  };
  const [subject, verb] = messages[action] || messages.updated;
  return {
    subject,
    html: layout(
      `Hello, ${actor.full_name || actor.name || "there"}`,
      `<p>The organization <strong>${escapeHtml(organization.name || "your organization")}</strong> was ${verb} successfully.</p>`,
    ),
  };
};
