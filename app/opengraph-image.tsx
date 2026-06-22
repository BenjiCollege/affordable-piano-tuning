import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social-share card (1200×630). Uses the default font for build robustness.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background:
            "radial-gradient(120% 90% at 50% 0%, #1c1b16 0%, #0B0B0B 60%)",
          color: "#F8F4EC",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 40 }}>
            <div style={{ width: 8, height: 20, background: "#D4AF37", borderRadius: 3 }} />
            <div style={{ width: 8, height: 40, background: "#D4AF37", borderRadius: 3 }} />
            <div style={{ width: 8, height: 30, background: "#D4AF37", borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: 0.5 }}>Affordable Piano Tuning</div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#D4AF37",
            }}
          >
            San Antonio, Texas · Est. 2025
          </div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
            Affordable Piano Tuning
          </div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.05, color: "#D4AF37" }}>
            in San Antonio
          </div>
        </div>

        {/* footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, color: "#B8B8B8" }}>
          <div style={{ display: "flex", width: 60, height: 2, background: "#D4AF37" }} />
          Tuning · Maintenance · Restoration
        </div>
      </div>
    ),
    { ...size }
  );
}
