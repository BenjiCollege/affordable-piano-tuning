"use client";

import { useState, type FormEvent } from "react";
import { SITE } from "@/lib/site";

/* Option lists mirror Tommy's intake form (with pricing). */
const RADIOS: { name: string; label: string; options: string[] }[] = [
  {
    name: "heard",
    label: "How did you hear about us?",
    options: [
      "Flyers",
      "Social media (Facebook, Instagram, TikTok, NextDoor…)",
      "Friend or acquaintance",
      "Other",
    ],
  },
  {
    name: "pianoType",
    label: "What type of piano?",
    options: ["Upright", "Baby grand", "Grand", "Unsure"],
  },
  {
    name: "tuning",
    label: "Tuning service",
    options: [
      "Basic tuning — tuned within 2 years ($70 upright / $85 grand)",
      "Pitch raise & retune — not tuned in 2+ years ($120 upright / $135 grand)",
    ],
  },
  {
    name: "cleaning",
    label: "Interior cleaning",
    options: [
      "Basic vacuuming & interior cleaning ($50 upright / $65 grand)",
      "Deep interior cleaning & action cleaning ($80 upright / $100 grand)",
      "No cleaning",
    ],
  },
  {
    name: "polish",
    label: "Exterior polishing?",
    options: ["Yes ($30 upright / $40 grand)", "No"],
  },
];

function RadioGroup({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <div className="book-field">
      <label className="book-q">{label} *</label>
      <div className="book-opts">
        {options.map((opt, i) => (
          <label key={opt} className="book-opt">
            <input type="radio" name={name} value={opt} required={i === 0} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function BookingForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/book", { method: "POST", body: new FormData(formEl) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setStatus("sent");
        formEl.reset();
      } else {
        setStatus("error");
        setError(data.error || "Something went wrong. Please call or text instead.");
      }
    } catch {
      setStatus("error");
      setError("Network error. Please call or text instead.");
    }
  }

  if (status === "sent") {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, color: "var(--gold)", marginBottom: 14 }}>
          Request received
        </div>
        <p style={{ color: "var(--gray)", fontSize: 16, lineHeight: 1.7, maxWidth: "42ch", margin: "0 auto" }}>
          Thank you — your request is on its way to Tommy. You&apos;ll hear back soon. For anything urgent,
          call or text <a href={`tel:${SITE.phone}`} style={{ color: "var(--gold)" }}>{SITE.phoneDisplay}</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false}>
      {/* honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      <RadioGroup {...RADIOS[0]} />

      <div className="book-field">
        <label className="book-q" htmlFor="bf-name">Your name *</label>
        <input id="bf-name" className="book-input" name="name" required placeholder="Full name" />
      </div>

      <div className="book-field">
        <label className="book-q" htmlFor="bf-phone">Phone number *</label>
        <input id="bf-phone" className="book-input" name="phone" type="tel" required placeholder="(956) 614-0078" />
      </div>

      <div className="book-field">
        <label className="book-q" htmlFor="bf-email">Email <span>(optional — so we can reply)</span></label>
        <input id="bf-email" className="book-input" name="email" type="email" placeholder="you@email.com" />
      </div>

      <RadioGroup {...RADIOS[1]} />
      <RadioGroup {...RADIOS[2]} />
      <RadioGroup {...RADIOS[3]} />
      <RadioGroup {...RADIOS[4]} />

      <div className="book-field">
        <label className="book-q" htmlFor="bf-address">Service address *</label>
        <textarea id="bf-address" className="book-input" name="address" required placeholder="Street, city, ZIP" />
        <p className="book-note">First 20 travel miles are complimentary; any further miles are $1 per mile.</p>
      </div>

      <div className="book-field">
        <label className="book-q" htmlFor="bf-photos">Photos of the piano <span>(optional)</span></label>
        <input id="bf-photos" className="book-file" name="photos" type="file" accept="image/*" multiple />
        <p className="book-note">
          One from the outside and one from the inside (facing the tuning pins). Up to 3 photos, 6 MB each — or
          text them to {SITE.phoneDisplay}.
        </p>
      </div>

      <div className="book-field">
        <label className="book-q" htmlFor="bf-notes">Anything else? <span>(optional)</span></label>
        <textarea id="bf-notes" className="book-input" name="notes" placeholder="Other details that would help…" />
      </div>

      <button className="book-submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send request"}
      </button>

      {status === "error" && (
        <p style={{ color: "#d06666", fontSize: 14, marginTop: 14, textAlign: "center" }}>{error}</p>
      )}
    </form>
  );
}
