"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { css } from "@/lib/css";
import { services, cities, mapPoints, faqs, sheetNotes } from "@/lib/data";
import { SITE } from "@/lib/site";
import BookingForm from "@/components/BookingForm";
import { CadenceController } from "@/lib/cadenceController";

// WebGL piano — client-only (no SSR), loaded as its own chunk.
const Piano3D = dynamic(() => import("@/components/Piano3D"), { ssr: false });

/** A small gold eighth-note glyph used throughout the testimonials section. */
function Note({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={Math.round(size * 1.5)}
      viewBox="0 0 16 24"
      fill="var(--gold)"
      aria-hidden="true"
    >
      <ellipse cx="4.6" cy="18.4" rx="4.4" ry="3.2" transform="rotate(-20 4.6 18.4)" />
      <rect x="8" y="3" width="1.7" height="15.4" />
      <path d="M9.7,3 c4.6,1.8 4.4,6.2 1.2,8.4 c1.8,-3 0.6,-5.6 -1.2,-6.4 z" />
    </svg>
  );
}

export default function CadenceSite() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let controller: CadenceController | null = null;
    let cancelled = false;

    (async () => {
      const [gsapMod, stMod, lenisMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (cancelled) return;
      const gsap = (gsapMod as any).gsap || gsapMod.default;
      const ScrollTrigger = (stMod as any).ScrollTrigger || stMod.default;
      const Lenis = lenisMod.default;

      controller = new CadenceController(
        {
          theme: "Light",
          accentColor: "#D4AF37",
          motionLevel: "Maximal",
          soundOn: true,
        },
        { gsap, ScrollTrigger, Lenis }
      );
      controller.mount();
    })();

    return () => {
      cancelled = true;
      if (controller) controller.unmount();
    };
  }, []);

  return (
    <div id="sapt-root" style={css("position:relative;background:var(--ink);overflow:hidden;transition:background .5s ease;")}>
      {/* progress + spotlight */}
      <div id="sapt-progress" style={css("position:fixed;top:0;left:0;height:2px;width:0%;background:linear-gradient(90deg,var(--walnut),var(--gold));z-index:200;box-shadow:0 0 12px rgba(212,175,55,.6);")} />
      <div id="sapt-spot" style={css("position:fixed;top:0;left:0;width:520px;height:520px;margin:-260px 0 0 -260px;border-radius:50%;pointer-events:none;z-index:5;background:radial-gradient(circle,rgba(212,175,55,.10),transparent 60%);mix-blend-mode:screen;opacity:0;transition:opacity .4s;")} />

      {/* HEADER */}
      <header id="sapt-head" style={css("position:fixed;top:0;left:0;width:100%;z-index:150;padding:22px 0;transition:background .45s,padding .45s,border-color .45s;border-bottom:1px solid transparent;")}>
        <div style={css("max-width:1280px;margin:0 auto;padding:0 var(--gutter);display:flex;align-items:center;justify-content:space-between;")}>
          <a href="#hero" data-nav style={css("display:flex;align-items:center;gap:12px;")}>
            <span style={css("display:inline-flex;gap:3px;align-items:flex-end;height:20px;")}>
              <span style={css("width:3px;height:9px;background:var(--gold);border-radius:1px;")} />
              <span style={css("width:3px;height:18px;background:var(--gold);border-radius:1px;")} />
              <span style={css("width:3px;height:13px;background:var(--gold);border-radius:1px;")} />
            </span>
            <span style={css("font-family:'Playfair Display',serif;font-size:19px;font-weight:600;letter-spacing:.02em;")}>Affordable Piano Tuning</span>
          </a>
          <nav className="nav-desktop" style={css("display:flex;align-items:center;gap:38px;")}>
            <a href="#services" data-nav style={css("font-size:13.5px;letter-spacing:.04em;color:var(--gray);")}>Services</a>
            <a href="#why" data-nav style={css("font-size:13.5px;letter-spacing:.04em;color:var(--gray);")}>Why Tuning</a>
            <a href="#about" data-nav style={css("font-size:13.5px;letter-spacing:.04em;color:var(--gray);")}>About</a>
            <a href="#area" data-nav style={css("font-size:13.5px;letter-spacing:.04em;color:var(--gray);")}>Service Area</a>
            <a href="#faq" data-nav style={css("font-size:13.5px;letter-spacing:.04em;color:var(--gray);")}>FAQ</a>
            <a href="#book" data-nav className="magnetic" style={css("display:inline-flex;align-items:center;gap:9px;font-size:13.5px;letter-spacing:.04em;color:var(--onGold);background:var(--gold);padding:11px 20px;border-radius:40px;font-weight:500;")}>Book Your Tuning</a>
          </nav>
          {/* mobile hamburger */}
          <button className="nav-burger" aria-label="Open menu" onClick={() => setMobileOpen(true)} style={css("display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:8px;")}>
            <span style={css("width:24px;height:2px;background:var(--ivory);border-radius:2px;")} />
            <span style={css("width:24px;height:2px;background:var(--ivory);border-radius:2px;")} />
            <span style={css("width:24px;height:2px;background:var(--ivory);border-radius:2px;")} />
          </button>
        </div>
        {/* mobile menu overlay */}
        <div className="nav-mobile" data-open={mobileOpen ? "1" : "0"} style={css("display:none;")}>
          <button className="nav-close" aria-label="Close menu" onClick={() => setMobileOpen(false)} style={css("position:absolute;top:24px;right:26px;background:none;border:none;color:var(--ivory);font-size:30px;line-height:1;cursor:pointer;")}>&times;</button>
          <a href="#services" data-nav onClick={() => setMobileOpen(false)}>Services</a>
          <a href="#why" data-nav onClick={() => setMobileOpen(false)}>Why Tuning</a>
          <a href="#about" data-nav onClick={() => setMobileOpen(false)}>About</a>
          <a href="#area" data-nav onClick={() => setMobileOpen(false)}>Service Area</a>
          <a href="#faq" data-nav onClick={() => setMobileOpen(false)}>FAQ</a>
          <a href="#book" data-nav onClick={() => setMobileOpen(false)} className="nav-mobile-cta">Book Your Tuning</a>
        </div>
      </header>

      {/* sound toggle */}
      <button id="sapt-sound" className="magnetic" style={css("position:fixed;right:40px;bottom:34px;z-index:160;display:flex;align-items:center;gap:10px;background:var(--glass);backdrop-filter:blur(8px);border:1px solid rgba(212,175,55,.3);color:var(--ivory);padding:11px 16px;border-radius:40px;font-family:'Inter',sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;")}>
        <span id="sapt-sound-dot" style={css("width:7px;height:7px;border-radius:50%;background:var(--gold);box-shadow:0 0 8px var(--gold);")} />
        <span id="sapt-sound-label">Sound On</span>
      </button>

      {/* theme toggle */}
      <button id="sapt-theme" className="magnetic" style={css("position:fixed;left:40px;bottom:34px;z-index:160;display:flex;align-items:center;gap:10px;background:var(--glass);backdrop-filter:blur(8px);border:1px solid var(--line2);color:var(--ivory);padding:11px 16px;border-radius:40px;font-family:'Inter',sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;")}>
        <span id="sapt-theme-ic" style={css("position:relative;width:13px;height:13px;display:inline-block;")}>
          <span id="sapt-theme-disc" style={css("position:absolute;inset:0;border-radius:50%;border:1.5px solid var(--gold);")} />
          <span id="sapt-theme-fill" style={css("position:absolute;top:0;left:0;width:50%;height:100%;background:var(--gold);border-radius:50% 0 0 50%;")} />
        </span>
        <span id="sapt-theme-label">Light</span>
      </button>

      {/* ============ HERO ============ */}
      <section id="hero" style={css("position:relative;min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:80px 0 0;")}>
        <div data-par="0.25" style={css("position:absolute;inset:0;z-index:0;opacity:.5;")}>
          <svg width="200%" height="100%" viewBox="0 0 2000 600" preserveAspectRatio="none" style={css("position:absolute;top:42%;left:0;width:200%;height:60%;animation:waveMove 26s linear infinite;")}>
            <path d="M0,300 C166,180 333,420 500,300 C666,180 833,420 1000,300 C1166,180 1333,420 1500,300 C1666,180 1833,420 2000,300" fill="none" stroke="rgba(212,175,55,.16)" strokeWidth="1.5" />
          </svg>
        </div>
        <div data-par="0.5" style={css("position:absolute;inset:0;z-index:0;opacity:.4;")}>
          <svg width="200%" height="100%" viewBox="0 0 2000 600" preserveAspectRatio="none" style={css("position:absolute;top:55%;left:0;width:200%;height:55%;animation:waveMove 38s linear infinite;")}>
            <path d="M0,300 C200,360 300,200 500,300 C700,400 800,180 1000,300 C1200,360 1300,200 1500,300 C1700,400 1800,180 2000,300" fill="none" stroke="rgba(90,70,52,.5)" strokeWidth="1.5" />
          </svg>
        </div>
        <div id="hero-dust" style={css("position:absolute;inset:0;z-index:1;pointer-events:none;")} />
        <div style={css("position:absolute;inset:0;z-index:1;background:radial-gradient(120% 90% at 50% 0%,rgba(212,175,55,.07),transparent 55%);")} />

        <div style={css("position:relative;z-index:3;max-width:1280px;margin:0 auto;padding:0 var(--gutter);width:100%;")}>
          <div id="hero-eyebrow" style={css("display:flex;align-items:center;gap:14px;margin-bottom:30px;opacity:0;")}>
            <span style={css("width:34px;height:1px;background:var(--gold);")} />
            <span style={css("font-size:12.5px;letter-spacing:.32em;text-transform:uppercase;color:var(--gold);")}>San Antonio, Texas · Est. 2025</span>
          </div>
          <h1 style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:clamp(44px,7.4vw,108px);line-height:1.02;letter-spacing:-.015em;margin:0;max-width:14ch;")}>
            <span className="line" style={css("display:block;overflow:hidden;padding-bottom:.06em;")}>
              <span className="reveal-i" style={css("display:inline-block;transform:translateY(118%);")}>Expert</span>{" "}
              <span className="reveal-i" style={css("display:inline-block;transform:translateY(118%);")}>Piano</span>{" "}
              <span className="reveal-i" style={css("display:inline-block;transform:translateY(118%);")}>Tuning</span>
            </span>
            <span className="line" style={css("display:block;overflow:hidden;padding-bottom:.06em;")}>
              <span className="reveal-i" style={css("display:inline-block;transform:translateY(118%);")}>in</span>{" "}
              <span className="reveal-i" style={css("display:inline-block;transform:translateY(118%);font-style:italic;color:var(--gold);")}>San</span>{" "}
              <span className="reveal-i" style={css("display:inline-block;transform:translateY(118%);font-style:italic;color:var(--gold);")}>Antonio</span>
            </span>
          </h1>
          <p id="hero-sub" style={css("margin:34px 0 0;max-width:46ch;font-size:clamp(16px,1.5vw,20px);line-height:1.6;color:var(--gray);font-weight:300;opacity:0;")}>Precision tuning, maintenance, and restoration for homes, churches, schools, studios, and the stages where music lives.</p>
          <div id="hero-cta" style={css("display:flex;flex-wrap:wrap;gap:18px;margin-top:42px;opacity:0;")}>
            <a href="#book" data-nav className="magnetic" style={css("display:inline-flex;align-items:center;gap:11px;background:var(--gold);color:var(--onGold);padding:17px 30px;border-radius:46px;font-size:15px;font-weight:500;letter-spacing:.01em;")}>Book Your Tuning
              <span style={css("display:inline-block;width:16px;height:1px;background:var(--onGold);position:relative;")}><span style={css("position:absolute;right:0;top:-3px;width:6px;height:6px;border-top:1px solid var(--onGold);border-right:1px solid var(--onGold);transform:rotate(45deg);")} /></span>
            </a>
            <a href="#services" data-nav className="magnetic" style={css("display:inline-flex;align-items:center;gap:11px;border:1px solid var(--line2);color:var(--ivory);padding:17px 30px;border-radius:46px;font-size:15px;font-weight:400;")}>Explore Services</a>
          </div>
        </div>

        {/* illuminating key strip */}
        <div style={css("position:relative;z-index:3;margin-top:auto;width:100%;display:flex;justify-content:center;padding-bottom:28px;")}>
          <div id="hero-keys" style={css("position:relative;height:116px;width:100%;max-width:1280px;")} />
        </div>
        <div id="hero-scrollcue" style={css("position:absolute;bottom:24px;left:50%;transform:translateX(-50%);z-index:4;display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0;")}>
          <span style={css("font-size:10.5px;letter-spacing:.3em;text-transform:uppercase;color:var(--gray);")}>Scroll</span>
          <span style={css("width:1px;height:34px;background:linear-gradient(var(--gold),transparent);animation:bob 2.4s ease-in-out infinite;")} />
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section id="services" className="panel" style={css("position:relative;padding:150px 0 130px;")}>
        <div style={css("max-width:1280px;margin:0 auto;padding:0 var(--gutter);")}>
          <div className="fade" style={css("display:flex;align-items:flex-end;justify-content:space-between;gap:30px;flex-wrap:wrap;margin-bottom:64px;")}>
            <div>
              <div style={css("display:flex;align-items:center;gap:13px;margin-bottom:22px;")}><span style={css("width:30px;height:1px;background:var(--gold);")} /><span style={css("font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);")}>The Craft</span></div>
              <h2 style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:clamp(34px,4.6vw,62px);line-height:1.05;letter-spacing:-.01em;margin:0;max-width:16ch;")}>A complete service for the<span style={css("font-style:italic;color:var(--gold);")}> instrument you love</span></h2>
            </div>
            <p style={css("max-width:34ch;font-size:16px;line-height:1.65;color:var(--gray);font-weight:300;")}>Every visit is unhurried and exacting — measured by ear, by tool, and by a respect for how your piano is meant to sound.</p>
          </div>
          <div id="svc-grid" style={css("display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);border:1px solid var(--line);")}>
            {services.map((s) => (
              <div key={s.num} className="svc-card" style={css("position:relative;background:var(--ink);padding:38px 30px 34px;cursor:default;overflow:hidden;transition:background .5s;")}>
                <div className="svc-spot" style={css("position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(212,175,55,.13),transparent 60%);opacity:0;pointer-events:none;transform:translate(-50%,-50%);transition:opacity .35s;")} />
                <div style={css("position:relative;z-index:1;")}>
                  <div style={css("font-family:'Playfair Display',serif;font-size:18px;color:var(--gold);margin-bottom:38px;")}>{s.num}</div>
                  <h3 style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:22px;margin:0 0 14px;line-height:1.15;")}>{s.title}</h3>
                  <p style={css("font-size:14px;line-height:1.62;color:var(--gray);font-weight:300;margin:0;")}>{s.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY TUNING MATTERS ============ */}
      <section id="why" className="panel" style={css("position:relative;padding:130px 0;background:var(--ink2);border-top:1px solid var(--line);border-bottom:1px solid var(--line);overflow:hidden;")}>
        <svg id="sheet" viewBox="0 0 1400 360" preserveAspectRatio="xMidYMid meet" style={css("position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:130%;height:auto;opacity:.62;pointer-events:none;")}>
          <g className="staff" fill="none" style={css("stroke:var(--gold);stroke-opacity:.55;stroke-width:1.5;")}>
            <path d="M40,90 H1360" /><path d="M40,130 H1360" /><path d="M40,170 H1360" /><path d="M40,210 H1360" /><path d="M40,250 H1360" />
          </g>
          <path className="melody" d="M80,250 C200,250 220,130 340,130 C460,130 470,210 590,170 C720,128 740,250 880,210 C1010,174 1040,90 1160,130 C1260,162 1300,210 1340,170" fill="none" stroke="var(--gold)" strokeWidth="2.4" />
          <g className="notes" fill="var(--gold)">
            {sheetNotes.map(([x, y], i) => (
              <g className="note" key={i} style={{ opacity: 0 }}>
                <ellipse cx={x} cy={y} rx="11" ry="8" transform={`rotate(-18 ${x} ${y})`} />
                <rect x={x + 9} y={y - 48} width="2.4" height="48" />
              </g>
            ))}
          </g>
        </svg>
        <div style={css("position:relative;z-index:2;max-width:1280px;margin:0 auto;padding:0 var(--gutter);")}>
          <div className="fade" style={css("text-align:center;max-width:30ch;margin:0 auto 70px;")}>
            <div style={css("display:inline-flex;align-items:center;gap:13px;margin-bottom:22px;")}><span style={css("width:30px;height:1px;background:var(--gold);")} /><span style={css("font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);")}>Why It Matters</span><span style={css("width:30px;height:1px;background:var(--gold);")} /></div>
            <h2 style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:clamp(32px,4.4vw,58px);line-height:1.08;margin:0;")}>A piano is always<span style={css("font-style:italic;color:var(--gold);")}> moving</span></h2>
          </div>
          <div className="why-grid" style={css("display:grid;grid-template-columns:repeat(4,1fr);gap:40px;")}>
            <div className="fade" style={css("text-align:center;")}><div style={css("font-family:'Playfair Display',serif;font-size:30px;color:var(--gold);margin-bottom:18px;")}>01</div><h3 style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:21px;margin:0 0 12px;")}>Sound Quality</h3><p style={css("font-size:14.5px;line-height:1.65;color:var(--gray);font-weight:300;margin:0;")}>In-tune intervals let chords bloom instead of beat. The difference is felt the moment you sit down to play.</p></div>
            <div className="fade" style={css("text-align:center;")}><div style={css("font-family:'Playfair Display',serif;font-size:30px;color:var(--gold);margin-bottom:18px;")}>02</div><h3 style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:21px;margin:0 0 12px;")}>Longevity</h3><p style={css("font-size:14.5px;line-height:1.65;color:var(--gray);font-weight:300;margin:0;")}>Twenty tons of string tension want to drift. Regular care keeps the structure stable for generations.</p></div>
            <div className="fade" style={css("text-align:center;")}><div style={css("font-family:'Playfair Display',serif;font-size:30px;color:var(--gold);margin-bottom:18px;")}>03</div><h3 style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:21px;margin:0 0 12px;")}>Seasons</h3><p style={css("font-size:14.5px;line-height:1.65;color:var(--gray);font-weight:300;margin:0;")}>Texas humidity swells and shrinks the soundboard. Twice-yearly visits hold pitch through the changes.</p></div>
            <div className="fade" style={css("text-align:center;")}><div style={css("font-family:'Playfair Display',serif;font-size:30px;color:var(--gold);margin-bottom:18px;")}>04</div><h3 style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:21px;margin:0 0 12px;")}>Performance</h3><p style={css("font-size:14.5px;line-height:1.65;color:var(--gray);font-weight:300;margin:0;")}>When the room is listening, an even, voiced instrument lets the player disappear into the music.</p></div>
          </div>
        </div>
      </section>

      {/* ============ 3D WEBGL CONCERT GRAND (cinematic stage + playable) ============ */}
      <section id="keyboard" style={css("position:relative;height:100vh;overflow:hidden;background:#070708;")}>
        <div id="kb-head" style={css("position:absolute;top:9vh;left:0;width:100%;text-align:center;z-index:2;pointer-events:none;transition:opacity .6s ease;")}>
          <div style={css("font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);margin-bottom:12px;")}>The Concert Grand</div>
          <h2 style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:clamp(28px,3.6vw,46px);margin:0;color:#F4EEE0;")}>Sit down at the keys</h2>
        </div>
        <Piano3D />
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="panel" style={css("position:relative;padding:150px 0;")}>
        <div className="about-grid" style={css("max-width:1280px;margin:0 auto;padding:0 var(--gutter);display:grid;grid-template-columns:0.85fr 1fr;gap:80px;align-items:center;")}>
          <div className="fade tilt" style={css("position:relative;")}>
            <div style={css("position:relative;border-radius:4px;overflow:hidden;border:1px solid var(--line);background:repeating-linear-gradient(135deg,var(--ink2) 0 14px,var(--ink3) 14px 28px);aspect-ratio:4/5;display:flex;align-items:flex-end;")}>
              <div style={css("position:absolute;inset:0;display:flex;align-items:center;justify-content:center;")}><span style={css("font-family:'JetBrains Mono',monospace,monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--gray);")}>technician portrait</span></div>
              <div style={css("position:relative;width:100%;padding:24px;background:linear-gradient(transparent,var(--scrim));")}><div style={css("font-family:'Playfair Display',serif;font-size:22px;")}>Tommy Galvan</div><div style={css("font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-top:5px;")}>Piano Technician</div></div>
            </div>
          </div>
          <div>
            <div className="fade" style={css("display:flex;align-items:center;gap:13px;margin-bottom:24px;")}><span style={css("width:30px;height:1px;background:var(--gold);")} /><span style={css("font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);")}>The Technician</span></div>
            <h2 className="fade" style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:clamp(30px,4vw,52px);line-height:1.1;margin:0 0 28px;")}>Trained by ear,<span style={css("font-style:italic;color:var(--gold);")}> guided by patience</span></h2>
            <p className="fade" style={css("font-size:16.5px;line-height:1.75;color:var(--gray);font-weight:300;margin:0 0 20px;max-width:52ch;")}>I came to tuning the long way — first as a player, then as an apprentice who couldn&apos;t stop chasing the perfect unison. For seventeen years I&apos;ve cared for instruments across San Antonio, from upright pianos in living rooms to concert grands on church platforms.</p>
            <p className="fade" style={css("font-size:16.5px;line-height:1.75;color:var(--gray);font-weight:300;margin:0 0 34px;max-width:52ch;")}>My philosophy is simple: treat every piano as if it were the only one, and leave it sounding like its best self.</p>
            <div className="fade" style={css("display:flex;gap:46px;")}>
              <div><div style={css("font-family:'Playfair Display',serif;font-size:30px;color:var(--ivory);")}>RPT</div><div style={css("font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--gray);margin-top:6px;")}>PTG Certified</div></div>
              <div><div style={css("font-family:'Playfair Display',serif;font-size:30px;color:var(--ivory);")}>A&nbsp;440</div><div style={css("font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--gray);margin-top:6px;")}>Concert Standard</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROCESS ============ */}
      <section id="process" className="panel" style={css("position:relative;padding:130px 0;background:var(--ink2);border-top:1px solid var(--line);border-bottom:1px solid var(--line);")}>
        <div style={css("max-width:1280px;margin:0 auto;padding:0 var(--gutter);")}>
          <div className="fade" style={css("text-align:center;margin-bottom:74px;")}>
            <div style={css("display:inline-flex;align-items:center;gap:13px;margin-bottom:22px;")}><span style={css("width:30px;height:1px;background:var(--gold);")} /><span style={css("font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);")}>The Process</span><span style={css("width:30px;height:1px;background:var(--gold);")} /></div>
            <h2 style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:clamp(32px,4.4vw,58px);margin:0;")}>Three movements to a<span style={css("font-style:italic;color:var(--gold);")}> tuned piano</span></h2>
          </div>
          <div className="proc-grid" style={css("position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:40px;")}>
            <div id="proc-line" style={css("position:absolute;top:34px;left:8%;right:8%;height:1px;background:rgba(212,175,55,.25);transform-origin:left;transform:scaleX(0);")} />
            <div className="fade proc-step" style={css("position:relative;text-align:center;")}><div style={css("width:68px;height:68px;border-radius:50%;border:1px solid rgba(212,175,55,.4);display:flex;align-items:center;justify-content:center;margin:0 auto 28px;background:var(--ink2);font-family:'Playfair Display',serif;font-size:24px;color:var(--gold);")}>I</div><h3 style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:23px;margin:0 0 12px;")}>Request Appointment</h3><p style={css("font-size:15px;line-height:1.65;color:var(--gray);font-weight:300;margin:0 auto;max-width:32ch;")}>Tell me about your piano and where it lives. We&apos;ll find a time that fits your week.</p></div>
            <div className="fade proc-step" style={css("position:relative;text-align:center;")}><div style={css("width:68px;height:68px;border-radius:50%;border:1px solid rgba(212,175,55,.4);display:flex;align-items:center;justify-content:center;margin:0 auto 28px;background:var(--ink2);font-family:'Playfair Display',serif;font-size:24px;color:var(--gold);")}>II</div><h3 style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:23px;margin:0 0 12px;")}>Piano Evaluation</h3><p style={css("font-size:15px;line-height:1.65;color:var(--gray);font-weight:300;margin:0 auto;max-width:32ch;")}>I assess pitch, condition, and action — and explain exactly what your instrument needs.</p></div>
            <div className="fade proc-step" style={css("position:relative;text-align:center;")}><div style={css("width:68px;height:68px;border-radius:50%;border:1px solid rgba(212,175,55,.4);display:flex;align-items:center;justify-content:center;margin:0 auto 28px;background:var(--ink2);font-family:'Playfair Display',serif;font-size:24px;color:var(--gold);")}>III</div><h3 style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:23px;margin:0 0 12px;")}>Precision Tuning</h3><p style={css("font-size:15px;line-height:1.65;color:var(--gray);font-weight:300;margin:0 auto;max-width:32ch;")}>Unison by unison, the piano is brought to concert pitch and voiced to the room.</p></div>
          </div>
        </div>
      </section>

      {/* ============ SERVICE AREA ============ */}
      <section id="area" className="panel" style={css("position:relative;padding:150px 0;overflow:hidden;")}>
        <div className="area-grid" style={css("max-width:1280px;margin:0 auto;padding:0 var(--gutter);display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center;")}>
          <div>
            <div className="fade" style={css("display:flex;align-items:center;gap:13px;margin-bottom:24px;")}><span style={css("width:30px;height:1px;background:var(--gold);")} /><span style={css("font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);")}>Service Area</span></div>
            <h2 className="fade" style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:clamp(30px,4vw,52px);line-height:1.1;margin:0 0 22px;")}>Across San Antonio<span style={css("font-style:italic;color:var(--gold);")}> &amp; the Hill Country</span></h2>
            <p className="fade" style={css("font-size:16px;line-height:1.7;color:var(--gray);font-weight:300;margin:0 0 36px;max-width:46ch;")}>House calls throughout San Antonio and the surrounding towns — your piano is tuned where it stands. Traveling farther afield (Austin, New Braunfels, and beyond) is available by arrangement.</p>
            <div id="area-list" className="fade" style={css("display:grid;grid-template-columns:repeat(2,1fr);gap:14px 30px;max-width:420px;")}>
              {cities.map((c) => (
                <div key={c} style={css("display:flex;align-items:center;gap:11px;font-size:15px;color:var(--ivory);font-weight:300;")}><span style={css("width:5px;height:5px;border-radius:50%;background:var(--gold);")} />{c}</div>
              ))}
            </div>
          </div>
          <div className="fade" style={css("position:relative;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;")}>
            <div id="map" style={css("position:relative;width:100%;height:100%;")}>
              <svg viewBox="0 0 100 100" style={css("position:absolute;inset:0;width:100%;height:100%;overflow:visible;")}>
                <circle className="ring" cx="50" cy="50" r="20" fill="none" stroke="rgba(212,175,55,.22)" strokeWidth="0.4" />
                <circle className="ring" cx="50" cy="50" r="33" fill="none" stroke="rgba(212,175,55,.16)" strokeWidth="0.4" />
                <circle className="ring" cx="50" cy="50" r="46" fill="none" stroke="rgba(212,175,55,.1)" strokeWidth="0.4" />
                {mapPoints.map((p) => (
                  <line key={p[0]} x1="50" y1="50" x2={p[1]} y2={p[2]} stroke="rgba(212,175,55,.14)" strokeWidth="0.3" />
                ))}
              </svg>
              <div style={css("position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;")}>
                <span style={css("position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;border:1px solid var(--gold);animation:ringpulse 3s ease-out infinite;")} />
                <span style={css("display:block;width:12px;height:12px;border-radius:50%;background:var(--gold);box-shadow:0 0 16px var(--gold);margin:0 auto;")} />
                <span style={css("display:block;margin-top:10px;font-family:'Playfair Display',serif;font-size:14px;color:var(--ivory);white-space:nowrap;")}>San Antonio</span>
              </div>
              {mapPoints.map((p) => (
                <div key={p[0]} className="mappt" style={css(`position:absolute;left:${p[1]}%;top:${p[2]}%;transform:translate(-50%,-50%);text-align:center;opacity:0;`)}>
                  <span style={css("display:block;width:7px;height:7px;border-radius:50%;background:var(--dot);margin:0 auto;")} />
                  <span style={css("display:block;margin-top:6px;font-size:10.5px;letter-spacing:.04em;color:var(--gray);white-space:nowrap;")}>{p[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS (pinned sequential reveal) ============ */}
      <section id="testimonials" style={css("position:relative;height:100vh;overflow:hidden;background:var(--ink2);border-top:1px solid var(--line);border-bottom:1px solid var(--line);")}>
        {/* header */}
        <div style={css("position:absolute;top:84px;left:0;width:100%;display:flex;flex-direction:column;align-items:center;gap:14px;z-index:4;")}>
          <div style={css("display:flex;align-items:center;gap:13px;")}>
            <span style={css("width:30px;height:1px;background:var(--gold);")} />
            <span style={css("font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);")}>In Their Words</span>
            <span style={css("display:inline-flex;align-items:flex-end;gap:5px;margin-left:6px;")}>
              <span style={css("animation:noteBob 2.6s ease-in-out infinite;")}><Note size={13} /></span>
              <span style={css("animation:noteBob 2.6s ease-in-out .4s infinite;")}><Note size={16} /></span>
            </span>
          </div>
          <a href={SITE.reviewsUrl} target="_blank" rel="noopener noreferrer" style={css("display:inline-flex;align-items:center;gap:9px;font-size:13px;letter-spacing:.05em;color:var(--gray);")}>
            <span style={css("color:var(--gold);letter-spacing:2px;font-size:14px;")}>★★★★★</span> 5.0 on Google
          </a>
        </div>

        {/* stacked slides */}
        <div id="t-stage" style={css("position:absolute;inset:0;")}>
          {/* slide 1 — tuning fork */}
          <div className="t-slide" style={css("position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:0 var(--gutter);")}>
            <div style={css("max-width:1000px;width:100%;text-align:center;")}>
              <div className="t-svg" style={css("display:flex;justify-content:center;margin-bottom:34px;")}>
                <svg width="58" height="76" viewBox="0 0 60 80" fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path className="t-draw" d="M22,8 L22,44 Q22,56 30,56 Q38,56 38,44 L38,8 M30,56 L30,74" />
                  <path d="M45,28 Q52,40 45,52" stroke="var(--gold)" strokeWidth="2" style={css("transform-origin:45px 40px;animation:swave 1.7s ease-out infinite;")} />
                  <path d="M49,22 Q59,40 49,58" stroke="var(--gold)" strokeWidth="2" style={css("transform-origin:49px 40px;animation:swave 1.7s ease-out .55s infinite;opacity:0;")} />
                </svg>
              </div>
              <blockquote className="t-quote" style={css("font-family:'Cormorant Garamond','Playfair Display',serif;font-size:clamp(28px,4vw,52px);line-height:1.3;font-weight:400;margin:0;color:var(--ivory);")}>Awesome service — I enjoy playing my piano now again.</blockquote>
              <figcaption className="t-cap" style={css("margin-top:30px;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);")}>Rafi Sarussi · ★★★★★ on Google</figcaption>
            </div>
          </div>

          {/* slide 2 — vibrating string */}
          <div className="t-slide" style={css("position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:0 var(--gutter);")}>
            <div style={css("max-width:1000px;width:100%;text-align:center;")}>
              <div className="t-svg" style={css("display:flex;justify-content:center;margin-bottom:34px;")}>
                <svg width="118" height="44" viewBox="0 0 120 44" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round">
                  <path className="t-draw" d="M6,22 C18,4 26,40 40,22 C54,4 62,40 76,22 C90,4 98,40 114,22" style={css("transform-origin:center;animation:vstring .5s ease-in-out infinite;")} />
                </svg>
              </div>
              <blockquote className="t-quote" style={css("font-family:'Cormorant Garamond','Playfair Display',serif;font-size:clamp(40px,7vw,80px);letter-spacing:.12em;line-height:1.3;font-weight:400;margin:0;color:var(--gold);")}>★★★★★</blockquote>
              <figcaption className="t-cap" style={css("margin-top:24px;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);")}>Sabrina Del Angel · 5-star Google review</figcaption>
            </div>
          </div>
        </div>

        {/* progress dots */}
        <div style={css("position:absolute;left:0;bottom:8vh;width:100%;display:flex;justify-content:center;gap:11px;z-index:4;")}>
          <span className="t-dot" style={css("width:24px;height:8px;border-radius:4px;background:var(--gold);transition:width .4s ease,background .4s ease;")} />
          <span className="t-dot" style={css("width:8px;height:8px;border-radius:4px;background:var(--line2);transition:width .4s ease,background .4s ease;")} />
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="panel" style={css("position:relative;padding:150px 0;")}>
        <div style={css("max-width:920px;margin:0 auto;padding:0 var(--gutter);")}>
          <div className="fade" style={css("text-align:center;margin-bottom:64px;")}>
            <div style={css("display:inline-flex;align-items:center;gap:13px;margin-bottom:22px;")}><span style={css("width:30px;height:1px;background:var(--gold);")} /><span style={css("font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);")}>Questions</span><span style={css("width:30px;height:1px;background:var(--gold);")} /></div>
            <h2 style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:clamp(30px,4vw,52px);margin:0;")}>Before your<span style={css("font-style:italic;color:var(--gold);")}> first visit</span></h2>
          </div>
          <div id="faq-list">
            {faqs.map((f, i) => (
              <div key={f.q} className="faq-item" style={css(`border-top:1px solid var(--line);${i === faqs.length - 1 ? "border-bottom:1px solid var(--line);" : ""}`)}>
                <button className="faq-q" style={css("width:100%;display:flex;align-items:center;justify-content:space-between;gap:24px;background:none;border:none;color:var(--ivory);text-align:left;padding:28px 4px;cursor:pointer;font-family:'Playfair Display',serif;font-size:clamp(19px,2vw,25px);font-weight:500;")}>
                  <span>{f.q}</span>
                  <span className="faq-ic" style={css("flex:none;width:26px;height:26px;position:relative;transition:transform .4s;")}><span style={css("position:absolute;top:50%;left:0;width:100%;height:1px;background:var(--gold);")} /><span className="faq-v" style={css("position:absolute;left:50%;top:0;width:1px;height:100%;background:var(--gold);transition:opacity .4s;")} /></span>
                </button>
                <div className="faq-a" style={css("overflow:hidden;height:0;opacity:0;transition:height .45s ease,opacity .45s ease;")}>
                  <p style={css("margin:0;padding:0 60px 30px 4px;font-size:15.5px;line-height:1.7;color:var(--gray);font-weight:300;max-width:60ch;")}>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section id="book" style={css("position:relative;padding:130px 0 120px;text-align:center;overflow:hidden;")}>
        <div id="cresc" style={css("position:absolute;inset:0;z-index:0;opacity:.55;")}>
          <svg width="200%" height="100%" viewBox="0 0 2000 400" preserveAspectRatio="none" style={css("position:absolute;top:50%;left:0;transform:translateY(-50%) scaleY(0.4);transform-origin:center;width:200%;height:80%;animation:waveMove 20s linear infinite;")}>
            <path d="M0,200 C166,80 333,320 500,200 C666,80 833,320 1000,200 C1166,80 1333,320 1500,200 C1666,80 1833,320 2000,200" fill="none" stroke="rgba(212,175,55,.4)" strokeWidth="2" />
          </svg>
        </div>
        <div style={css("position:absolute;inset:0;z-index:0;background:radial-gradient(70% 120% at 50% 100%,rgba(212,175,55,.1),transparent 60%);")} />
        <div style={css("position:relative;z-index:2;max-width:1280px;margin:0 auto;padding:0 var(--gutter);")}>
          <div className="fade" style={css("display:flex;align-items:center;justify-content:center;gap:13px;margin-bottom:22px;")}><span style={css("width:30px;height:1px;background:var(--gold);")} /><span style={css("font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);")}>Request a Tuning</span><span style={css("width:30px;height:1px;background:var(--gold);")} /></div>
          <h2 className="fade" style={css("font-family:'Playfair Display',serif;font-weight:500;font-size:clamp(38px,5.6vw,82px);line-height:1.04;letter-spacing:-.015em;margin:0;")}>Bring your piano<br /><span style={css("font-style:italic;color:var(--gold);")}>back to life</span></h2>
          <p className="fade" style={css("margin:28px auto 0;max-width:46ch;font-size:18px;line-height:1.6;color:var(--gray);font-weight:300;")}>Tell us about your piano and where it lives — Tommy will follow up with a clear, honest quote.</p>
          <div style={css("max-width:620px;margin:50px auto 0;text-align:left;")}>
            <BookingForm />
          </div>
          <p style={css("margin:30px auto 0;text-align:center;font-size:15px;color:var(--gray);line-height:1.7;")}>Prefer to talk? Call or text <a href="tel:+19566140078" style={css("color:var(--gold);")}>(956) 614-0078</a> · <a href="mailto:tomasgalvan2000@gmail.com" style={css("color:var(--gold);")}>tomasgalvan2000@gmail.com</a></p>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={css("position:relative;padding:80px 0 44px;border-top:1px solid var(--line);background:var(--ink);")}>
        <div className="footer-grid" style={css("max-width:1280px;margin:0 auto;padding:0 var(--gutter);display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:48px;")}>
          <div>
            <div style={css("display:flex;align-items:center;gap:12px;margin-bottom:18px;")}>
              <span style={css("display:inline-flex;gap:3px;align-items:flex-end;height:20px;")}><span style={css("width:3px;height:9px;background:var(--gold);border-radius:1px;")} /><span style={css("width:3px;height:18px;background:var(--gold);border-radius:1px;")} /><span style={css("width:3px;height:13px;background:var(--gold);border-radius:1px;")} /></span>
              <span style={css("font-family:'Playfair Display',serif;font-size:21px;font-weight:600;")}>Affordable Piano Tuning</span>
            </div>
            <p style={css("font-size:14.5px;line-height:1.7;color:var(--gray);font-weight:300;max-width:36ch;margin:0;")}>Expert piano tuning, maintenance, and restoration for San Antonio and the surrounding Hill Country since 2025.</p>
          </div>
          <div>
            <div style={css("font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);margin-bottom:18px;")}>Contact</div>
            <div style={css("font-size:14.5px;line-height:2;color:var(--gray);font-weight:300;")}><a href="tel:+19566140078">(956) 614-0078</a><br /><a href="mailto:tomasgalvan2000@gmail.com">tomasgalvan2000@gmail.com</a><br />San Antonio, TX</div>
          </div>
          <div>
            <div style={css("font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);margin-bottom:18px;")}>Service Areas</div>
            <div style={css("font-size:14.5px;line-height:2;color:var(--gray);font-weight:300;")}>San Antonio · Alamo Heights<br />Stone Oak · Helotes<br />Boerne · New Braunfels<br />Schertz · Cibolo</div>
          </div>
          <div>
            <div style={css("font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);margin-bottom:18px;")}>Follow</div>
            <div style={css("font-size:14.5px;line-height:2;color:var(--gray);font-weight:300;")}><a href="https://www.instagram.com/tommytunessatx" target="_blank" rel="noopener noreferrer">Instagram</a><br /><a href="https://www.tiktok.com/@tommytunessatx" target="_blank" rel="noopener noreferrer">TikTok</a><br /><a href="https://www.youtube.com/@tommytunessatx" target="_blank" rel="noopener noreferrer">YouTube</a><br /><a href="https://www.threads.net/@tommytunessatx" target="_blank" rel="noopener noreferrer">Threads</a></div>
          </div>
        </div>
        <div style={css("max-width:1280px;margin:54px auto 0;padding:24px 40px 0;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;font-size:12.5px;color:var(--gray);letter-spacing:.04em;")}>
          <span>© 2026 Affordable Piano Tuning. All rights reserved.</span>
          <span>Piano Tuning · Repair · Maintenance — San Antonio, Texas</span>
        </div>
      </footer>
    </div>
  );
}
