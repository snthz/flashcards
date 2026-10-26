import type { Messages } from "@/lib/i18n/messages";
import { RESET_TOKEN_MINUTES } from "@/lib/validation/auth";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function passwordResetEmail(t: Messages["auth"], name: string, url: string) {
  const greeting = t.resetEmailGreeting(name);
  const expiry = t.resetEmailExpiry(RESET_TOKEN_MINUTES);
  const text = [greeting, "", t.resetEmailIntro, "", url, "", expiry, t.resetEmailIgnore].join("\n");
  const muted = "font-size:13px;line-height:1.5;color:#57534e;margin:0 0 8px";
  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f5f5f4;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#1c1917">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;padding:28px">
      <p style="margin:0 0 20px;font-weight:600;font-size:15px">Flashcards</p>
      <p style="margin:0 0 12px;line-height:1.5">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 24px;line-height:1.5">${escapeHtml(t.resetEmailIntro)}</p>
      <p style="margin:0 0 24px">
        <a href="${escapeHtml(url)}" style="display:inline-block;background:#1c1917;color:#fafaf9;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600">${escapeHtml(t.resetEmailButton)}</a>
      </p>
      <p style="${muted}">${escapeHtml(expiry)}</p>
      <p style="${muted}">${escapeHtml(t.resetEmailIgnore)}</p>
      <p style="font-size:12px;line-height:1.5;color:#78716c;margin:16px 0 0;word-break:break-all">${escapeHtml(url)}</p>
    </div>
  </body>
</html>`;
  return { subject: t.resetEmailSubject, text, html };
}
