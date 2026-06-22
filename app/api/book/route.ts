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
  ["preferredDate", "Preferred date"],
  ["preferredTime", "Preferred time"],
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

    // Best-effort confirmation to the customer — never fails the request.
    // NOTE: the shared onboarding@resend.dev sender only delivers to the Resend
    // account owner until you verify your own domain. After verifying a domain
    // in Resend, change the `from` here to an address on it and customer
    // confirmations will deliver to anyone.
    const customerEmail = get("email");
    if (customerEmail) {
      const confirmHtml = `
        <div style="font-family:Inter,Arial,sans-serif;max-width:620px;margin:0 auto;color:#111">
          <h2 style="font-family:Georgia,serif;color:#111;margin:0 0 6px">Thanks, ${esc(name)} — we've got your request</h2>
          <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 18px">
            This confirms your piano tuning request reached Affordable Piano Tuning. We'll review the
            details and follow up soon with a clear, honest quote. For anything urgent, call or text
            <a href="tel:${SITE.phone}" style="color:#8f7117">${SITE.phoneDisplay}</a>.
          </p>
          <h3 style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#8a8a8a;margin:0 0 8px">Your request</h3>
          <table style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table>
          <p style="color:#999;font-size:12px;margin-top:20px">Affordable Piano Tuning · San Antonio, TX</p>
        </div>`;
      try {
        await resend.emails.send({
          from: "Affordable Piano Tuning <onboarding@resend.dev>",
          to: [customerEmail],
          subject: "We received your request — Affordable Piano Tuning",
          html: confirmHtml,
        });
      } catch {
        // confirmation is non-critical; the owner already got the request
      }
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { ok: false, error: "Something went wrong. Please call or text instead." },
      { status: 500 }
    );
  }
}
