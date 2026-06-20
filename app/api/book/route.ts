import { Resend } from "resend";
import { SITE } from "@/lib/site";

/**
 * Booking form → email to the owner.
 *
 * Requires the env var RESEND_API_KEY (free at resend.com). If the owner
 * signs up with their own inbox, emails from `onboarding@resend.dev` reach
 * it with no domain verification needed. Optionally set BOOKING_TO_EMAIL to
 * override the recipient (defaults to the site email).
 */
export const runtime = "nodejs";

const MAX_FILE = 6 * 1024 * 1024; // 6 MB per photo
const MAX_TOTAL = 12 * 1024 * 1024; // 12 MB total

const FIELDS: [string, string][] = [
  ["heard", "How they heard about us"],
  ["name", "Name"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["pianoType", "Piano type"],
  ["tuning", "Tuning service"],
  ["cleaning", "Interior cleaning"],
  ["polish", "Exterior polishing"],
  ["address", "Service address"],
  ["notes", "Additional info"],
];

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json(
      { ok: false, error: "Booking email isn't configured yet. Please call or text instead." },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ ok: false, error: "Invalid submission." }, { status: 400 });
  }

  const get = (k: string) => (form.get(k)?.toString() || "").trim();
  const name = get("name");
  const phone = get("phone");
  if (!name || !phone) {
    return Response.json(
      { ok: false, error: "Please include at least your name and phone number." },
      { status: 400 }
    );
  }

  // honeypot (bots fill hidden fields)
  if (get("company")) return Response.json({ ok: true });

  // photo attachments (optional)
  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const attachments: { filename: string; content: Buffer }[] = [];
  const skipped: string[] = [];
  let total = 0;
  for (const f of files.slice(0, 3)) {
    if (f.size > MAX_FILE) {
      skipped.push(`${f.name} (over 6 MB)`);
      continue;
    }
    if (total + f.size > MAX_TOTAL) {
      skipped.push(`${f.name} (would exceed the email size limit)`);
      continue;
    }
    total += f.size;
    attachments.push({ filename: f.name, content: Buffer.from(await f.arrayBuffer()) });
  }

  const rows = FIELDS.map(([k, label]) => {
    const v = get(k);
    if (!v) return "";
    return `<tr><td style="padding:8px 14px;color:#8a8a8a;border-bottom:1px solid #eee;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:8px 14px;color:#111;border-bottom:1px solid #eee">${esc(v)}</td></tr>`;
  }).join("");

  const note = skipped.length
    ? `<p style="color:#8a6a00;font-size:13px">Some photos were not attached: ${esc(skipped.join(", "))}. Ask the customer to text them.</p>`
    : "";

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:620px;margin:0 auto">
      <h2 style="font-family:Georgia,serif;color:#111">New tuning request</h2>
      <table style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table>
      ${note}
    </div>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Affordable Piano Tuning <onboarding@resend.dev>",
      to: [process.env.BOOKING_TO_EMAIL || SITE.email],
      replyTo: get("email") || undefined,
      subject: `New tuning request — ${name}`,
      html,
      attachments: attachments.length ? attachments : undefined,
    });
    if (error) {
      return Response.json(
        { ok: false, error: "We couldn't send your request. Please call or text instead." },
        { status: 502 }
      );
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { ok: false, error: "Something went wrong. Please call or text instead." },
      { status: 500 }
    );
  }
}
