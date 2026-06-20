import type { CSSProperties } from "react";

/* Branded 404 — rendered inside the root layout (fonts + theme vars). */
export default function NotFound() {
  const wrap: CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "40px 24px",
    background: "var(--ink)",
    color: "var(--ivory)",
  };

  return (
    <main style={wrap}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
        <span style={{ display: "inline-flex", gap: 3, alignItems: "flex-end", height: 22 }}>
          <span style={{ width: 4, height: 10, background: "var(--gold)", borderRadius: 1 }} />
          <span style={{ width: 4, height: 20, background: "var(--gold)", borderRadius: 1 }} />
          <span style={{ width: 4, height: 14, background: "var(--gold)", borderRadius: 1 }} />
        </span>
        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 600 }}>
          Affordable Piano Tuning
        </span>
      </div>

      <div
        style={{
          fontFamily: "'Playfair Display',serif",
          fontWeight: 500,
          fontStyle: "italic",
          fontSize: "clamp(64px,16vw,140px)",
          lineHeight: 1,
          color: "var(--gold)",
          marginBottom: 8,
        }}
      >
        404
      </div>

      <h1
        style={{
          fontFamily: "'Playfair Display',serif",
          fontWeight: 500,
          fontSize: "clamp(26px,4vw,44px)",
          margin: "0 0 16px",
        }}
      >
        This page is out of tune
      </h1>

      <p
        style={{
          maxWidth: "44ch",
          fontSize: 16,
          lineHeight: 1.7,
          color: "var(--gray)",
          fontWeight: 300,
          margin: "0 0 36px",
        }}
      >
        We couldn&apos;t find the page you were looking for. Let&apos;s get you back to where the
        music lives.
      </p>

      <a
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 11,
          background: "var(--gold)",
          color: "var(--onGold)",
          padding: "16px 30px",
          borderRadius: 46,
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: ".01em",
        }}
      >
        Back to home
      </a>
    </main>
  );
}
