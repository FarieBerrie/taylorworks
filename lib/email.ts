import "server-only";

import { site } from "@/lib/config";
import { isProduction } from "@/lib/env";
import { appUrl } from "@/lib/listing";

type Email = {
  to: string;
  subject: string;
  /** Paragraphs of plain text; links are written out in full so they work in any mail client */
  paragraphs: string[];
};

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Plain text with its URLs turned into links, one <p> per paragraph. */
function toHtml(paragraphs: string[]) {
  const body = paragraphs
    .map((p) => {
      const linked = escapeHtml(p).replace(/https?:\/\/[^\s<]+/g, (url) => `<a href="${url}">${url}</a>`);
      return `<p style="margin:0 0 16px">${linked.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#2a2622;max-width:560px">${body}</div>`;
}

function signature() {
  return `${site.name}\n${appUrl()}`;
}

/**
 * Sends an email through Resend. Without RESEND_API_KEY (local development) the email is printed to
 * the server log instead, so you can click its links. Returns false if it couldn't be sent;
 * callers carry on either way, since nothing a visitor does should fail because email is down.
 */
export async function sendEmail({ to, subject, paragraphs }: Email): Promise<boolean> {
  const all = [...paragraphs, signature()];
  const text = all.join("\n\n");
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!key || !from) {
    if (isProduction()) {
      console.warn(`[email] Not sent ("${subject}"): RESEND_API_KEY or EMAIL_FROM is not set.`);
    } else {
      console.log(`\n[email] To: ${to}\n[email] Subject: ${subject}\n\n${text}\n`);
    }
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text, html: toHtml(all) }),
    });
    if (!response.ok) {
      console.error(`[email] Resend rejected "${subject}": ${response.status} ${await response.text()}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[email] Could not reach Resend for "${subject}":`, error);
    return false;
  }
}
