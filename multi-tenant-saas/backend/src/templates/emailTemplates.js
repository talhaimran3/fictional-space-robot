import { sendEmail } from "../services/emailService";

export const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: "Welcome to our platform",
    html: `
        <h2>Welcome, ${user.name}!</h2>
        <p>Your account has been created successfully.</p>
      `,
  });
};

export const sendLoginEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: "New login to your account",
    html: `
        <h2>Hello, ${user.name}!</h2>
        <p>Your account was just used to log in.</p>
      `,
  });
};

export const sendShiftCreatedEmail = async (user, shift) => {
  await sendEmail({
    to: user.email,
    subject: "Shift created",
    html: `
        <h2>Hello, ${user.name}!</h2>
        <p>A shift${shift?.name ? ` (${shift.name})` : ""} has been created.</p>
      `,
  });
};

export const sendShiftEditedEmail = async (user, shift) => {
  await sendEmail({
    to: user.email,
    subject: "Shift updated",
    html: `
        <h2>Hello, ${user.name}!</h2>
        <p>A shift${shift?.name ? ` (${shift.name})` : ""} has been updated.</p>
      `,
  });
};

export const sendShiftDeletedEmail = async (user, shift) => {
  await sendEmail({
    to: user.email,
    subject: "Shift deleted",
    html: `
        <h2>Hello, ${user.name}!</h2>
        <p>A shift${shift?.name ? ` (${shift.name})` : ""} has been deleted.</p>
      `,
  });
};

export const sendProfileEditedEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: "Profile updated",
    html: `
        <h2>Hello, ${user.name}!</h2>
        <p>Your profile has been updated.</p>
      `,
  });
};

export const sendProfileDeletedEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: "Profile deleted",
    html: `
        <h2>Hello, ${user.name}!</h2>
        <p>Your profile has been deleted.</p>
      `,
  });
};
