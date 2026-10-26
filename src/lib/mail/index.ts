import nodemailer, { type Transporter } from "nodemailer";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

let transporter: Transporter | null = null;

function smtpUrl() {
  if (process.env.SMTP_URL) return process.env.SMTP_URL;
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  const port = process.env.SMTP_PORT || "587";
  const secure = process.env.SMTP_SECURE === "true" || port === "465";
  const user = process.env.SMTP_USER;
  const auth = user ? `${encodeURIComponent(user)}:${encodeURIComponent(process.env.SMTP_PASSWORD ?? "")}@` : "";
  return `${secure ? "smtps" : "smtp"}://${auth}${host}:${port}`;
}

export function isMailConfigured() {
  return smtpUrl() !== null;
}

function getTransporter() {
  const url = smtpUrl();
  if (!url) return null;
  transporter ??= nodemailer.createTransport(url);
  return transporter;
}

export async function sendMail(message: MailMessage) {
  const transport = getTransporter();
  if (!transport) {
    if (process.env.NODE_ENV === "production") {
      console.warn(`[mail] SMTP is not configured; "${message.subject}" was not sent`);
    } else {
      console.info(`[mail] SMTP is not configured. Email for ${message.to}:\n${message.subject}\n\n${message.text}`);
    }
    return false;
  }
  await transport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
  return true;
}
