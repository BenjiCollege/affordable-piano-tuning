/* ============================================================
   Affordable Piano Tuning — interaction controller.
   Ported from the Claude Design DC prototype's Component class.
   Owns all imperative behavior: Web Audio piano synthesis, the
   GSAP/ScrollTrigger timelines, Lenis smooth scroll, the
   scroll-driven keyboard, theme + sound toggles, parallax,
   magnetic buttons, and the cursor spotlight.

   The React layer renders the markup (including the static
   service/FAQ/map content that the prototype injected via
   innerHTML); this controller only wires up behavior against
   that DOM after mount.
   ============================================================ */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { setSoundEnabled } from "./pianoAudio";

export type MotionLevel = "Subtle" | "Balanced" | "Maximal";

export interface APTProps {
  theme?: "Dark" | "Light";
  accentColor?: string;
  motionLevel?: MotionLevel;
  soundOn?: boolean;
}

export interface APTLibs {
  gsap: any;
  ScrollTrigger: any;
  Lenis: any;
}

interface WhiteKey {
  glow: HTMLDivElement;
  midi: number;
  el: HTMLDivElement;
}

export class APTController {
  props: APTProps;
  gsap: any;
  ST: any;
  Lenis: any;

  accent!: string;
  theme!: "light" | "dark";
  mo!: number;
  soundOn!: boolean;
  reduce!: boolean;

  heroWhites: WhiteKey[] = [];

  actx?: AudioContext;
  master?: GainNode;
  lenis?: any;
  private tickerFn?: (t: number) => void;

  private _headOn = false;
  syncHeader?: () => void;
  private cleanups: Array<() => void> = [];

  constructor(props: APTProps, libs: APTLibs) {
    this.props = props || {};
    this.gsap = libs.gsap;
    this.ST = libs.ScrollTrigger;
    this.Lenis = libs.Lenis;
  }

  /* ---------- lifecycle ---------- */
  mount() {
    const p = this.props || {};
    this.accent = p.accentColor || "#D4AF37";
    if (this.accent && this.accent.toLowerCase() !== "#d4af37")
      document.documentElement.style.setProperty("--gold", this.accent);
    let t = (p.theme || "Dark").toString().toLowerCase();
    try {
      const s = localStorage.getItem("apt-theme");
      if (s) t = s;
    } catch {}
    this.theme = t === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", this.theme);
    const lvl = p.motionLevel || "Balanced";
    this.mo = lvl === "Subtle" ? 0.5 : lvl === "Maximal" ? 1.5 : 1;
    this.soundOn = p.soundOn !== false;
    this.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (this.reduce) this.mo = 0;

    this.buildKeyboards();
    try {
      this.init();
    } catch (e) {
      console.error("init", e);
      this.revealAll();
    }
  }

  unmount() {
    this.cleanups.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
    this.cleanups = [];
    try {
      if (this.tickerFn && this.gsap) this.gsap.ticker.remove(this.tickerFn);
    } catch {}
    try {
      if (this.lenis) this.lenis.destroy();
      if ((window as any).__aptLenis === this.lenis)
        (window as any).__aptLenis = null;
    } catch {}
    try {
      if (this.ST) this.ST.getAll().forEach((tr: any) => tr.kill());
    } catch {}
    try {
      if (this.actx) this.actx.close();
    } catch {}
  }

  private on(
    target: EventTarget,
    type: string,
    handler: EventListenerOrEventListenerObject,
    opts?: AddEventListenerOptions
  ) {
    target.addEventListener(type, handler, opts);
    this.cleanups.push(() => target.removeEventListener(type, handler, opts));
  }

  revealAll() {
    document
      .querySelectorAll<HTMLElement>(".reveal-i")
      .forEach((el) => (el.style.transform = "translateY(0)"));
  }

  /* ---------- AUDIO ---------- */
  ensureAudio() {
    if (!this.actx) {
      const AC =
        window.AudioContext ||
        (window as any).webkitAudioContext;
      if (!AC) return;
      this.actx = new AC();
      this.master = this.actx.createGain();
      this.master.gain.value = 0.85;
      this.master.connect(this.actx.destination);
    }
    if (this.actx.state === "suspended") this.actx.resume();
  }

  playMidi(m: number, dur?: number) {
    if (!this.soundOn) return;
    this.ensureAudio();
    if (!this.actx || !this.master) return;
    const ctx = this.actx,
      now = ctx.currentTime;
    const freq = 440 * Math.pow(2, (m - 69) / 12);
    const d = dur || 1.9;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 4600;
    lp.Q.value = 0.3;
    lp.connect(this.master);
    (
      [
        [1, 1],
        [2, 0.55],
        [3, 0.3],
        [4, 0.17],
        [5, 0.1],
        [6, 0.05],
      ] as Array<[number, number]>
    ).forEach(([h, a]) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq * h;
      o.detune.value = Math.random() * 4 - 2;
      const g = ctx.createGain();
      const peak = 0.15 * a;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(peak, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + d);
      o.connect(g).connect(lp);
      o.start(now);
      o.stop(now + d + 0.05);
    });
  }

  /* ---------- KEYBOARDS ---------- */
  buildKeyboards() {
    this.heroWhites = this.buildKeyboard(
      document.getElementById("hero-keys"),
      60,
      2,
      { mode: "hero" }
    );
  }

  buildKeyboard(
    container: HTMLElement | null,
    startMidi: number,
    octaves: number,
    opts: { mode: "hero" | "scroll" }
  ): WhiteKey[] {
    if (!container) return [];
    container.innerHTML = ""; // guard against double-mount (React StrictMode)
    const mode = opts.mode;
    const whiteW = mode === "scroll" ? 74 : 72;
    // Hero keys scale with viewport height so the full keyboard stays visible
    // on short/wide screens while still reading large on tall ones.
    const whiteH =
      mode === "scroll"
        ? 300
        : Math.max(84, Math.min(120, Math.round(window.innerHeight * 0.135)));
    const blackW = Math.round(whiteW * 0.62);
    const blackH = Math.round(whiteH * 0.62);
    const whiteSemi = [0, 2, 4, 5, 7, 9, 11];
    const blackAfter: Record<number, number> = { 0: 1, 1: 3, 3: 6, 4: 8, 5: 10 };
    const whites: WhiteKey[] = [];
    const totalW = octaves * 7 * whiteW;
    container.style.width = totalW + "px";
    if (mode === "hero") container.style.height = whiteH + "px";
    const frag = document.createDocumentFragment();
    for (let o = 0; o < octaves; o++) {
      for (let i = 0; i < 7; i++) {
        const idx = o * 7 + i;
        const midi = startMidi + o * 12 + whiteSemi[i];
        const key = document.createElement("div");
        key.style.cssText = `position:absolute;top:0;left:${idx * whiteW}px;width:${whiteW - 2}px;height:${whiteH}px;background:linear-gradient(#fbf8f1,#e9e3d6);border:1px solid #c9c2b2;border-radius:0 0 4px 4px;z-index:1;cursor:pointer;`;
        const glow = document.createElement("div");
        glow.className = "kglow";
        glow.style.cssText =
          "position:absolute;inset:0;border-radius:0 0 4px 4px;background:linear-gradient(rgba(212,175,55,.95),rgba(212,175,55,.35));opacity:0;pointer-events:none;box-shadow:0 0 26px rgba(212,175,55,.7);";
        key.appendChild(glow);
        // hover lights the key; click/tap plays the note
        key.addEventListener("pointerenter", () => {
          this.lightEl(glow);
        });
        key.addEventListener("pointerdown", () => {
          this.lightEl(glow);
          this.playMidi(midi);
        });
        frag.appendChild(key);
        whites.push({ glow, midi, el: key });
      }
    }
    // blacks on top
    for (let o = 0; o < octaves; o++) {
      for (let i = 0; i < 7; i++) {
        if (!(i in blackAfter)) continue;
        const idx = o * 7 + i;
        const midi = startMidi + o * 12 + blackAfter[i];
        const left = (idx + 1) * whiteW - blackW / 2;
        const bk = document.createElement("div");
        bk.style.cssText = `position:absolute;top:0;left:${left}px;width:${blackW}px;height:${blackH}px;background:linear-gradient(#2a2722,#0c0b0a);border-radius:0 0 3px 3px;z-index:2;cursor:pointer;box-shadow:0 3px 5px rgba(0,0,0,.5);`;
        const glow = document.createElement("div");
        glow.style.cssText =
          "position:absolute;inset:0;border-radius:0 0 3px 3px;background:linear-gradient(rgba(212,175,55,.9),rgba(212,175,55,.25));opacity:0;pointer-events:none;box-shadow:0 0 22px rgba(212,175,55,.65);";
        bk.appendChild(glow);
        // hover lights the key; click/tap plays the note
        bk.addEventListener("pointerenter", () => {
          this.lightEl(glow);
        });
        bk.addEventListener("pointerdown", () => {
          this.lightEl(glow);
          this.playMidi(midi);
        });
        frag.appendChild(bk);
      }
    }
    container.appendChild(frag);
    return whites;
  }

  lightEl(el: HTMLElement) {
    if (!this.gsap) {
      el.style.opacity = "0.9";
      setTimeout(() => (el.style.opacity = "0"), 500);
      return;
    }
    this.gsap.killTweensOf(el);
    this.gsap.fromTo(
      el,
      { opacity: 0.95 },
      { opacity: 0, duration: 1.1, ease: "power2.out" }
    );
  }

  /* ---------- INIT (gsap + lenis + scroll) ---------- */
  init() {
    const gsap = this.gsap,
      ST = this.ST;
    gsap.registerPlugin(ST);

    // Lenis smooth scroll
    if (!this.reduce) {
      const lenis = new this.Lenis({
        lerp: 0.09,
        smoothWheel: true,
        wheelMultiplier: 0.9,
      });
      this.lenis = lenis;
      // expose for the WebGL piano so it can lock/unlock scroll in play mode
      (window as any).__aptLenis = lenis;
      lenis.on("scroll", ST.update);
      this.tickerFn = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(this.tickerFn);
      gsap.ticker.lagSmoothing(0);
    }

    this.setupTheme();
    this.buildParticles();
    this.heroIntro();
    this.setupNav();
    this.setupHeader();
    this.setupProgress();
    this.setupReveals();
    this.setupSheet();
    this.setupHeroParallax();
    this.setupTestimonials();
    this.setupProcess();
    this.setupMap();
    this.setupTilt();
    this.setupMagnetic();
    this.setupSpotlight();
    this.setupFAQ();
    this.setupCrescendo();
    this.setupSound();
    this.setupAudioGesture();

    ST.refresh();
  }

  buildParticles() {
    const host = document.getElementById("hero-dust");
    if (!host || this.mo === 0) return;
    const n = Math.round(26 * this.mo);
    let html = "";
    for (let i = 0; i < n; i++) {
      const x = Math.random() * 100,
        y = 40 + Math.random() * 60;
      const s = 1 + Math.random() * 2.4;
      const dur = 9 + Math.random() * 12;
      const dx = Math.random() * 60 - 30 + "px";
      const dy = -(60 + Math.random() * 120) + "px";
      html += `<span style="position:absolute;left:${x}%;top:${y}%;width:${s}px;height:${s}px;border-radius:50%;background:rgba(212,175,55,.7);--dx:${dx};--dy:${dy};animation:dust ${dur}s linear ${-Math.random() * dur}s infinite;"></span>`;
    }
    host.innerHTML = html;
  }

  heroIntro() {
    const gsap = this.gsap;
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to("#hero-eyebrow", { opacity: 1, duration: 0.8 })
      .to(".reveal-i", { y: 0, duration: 1.1, stagger: 0.07 }, "-=0.5")
      .to("#hero-sub", { opacity: 1, y: 0, duration: 0.9 }, "-=0.6")
      .to("#hero-cta", { opacity: 1, y: 0, duration: 0.9 }, "-=0.7")
      .to("#hero-scrollcue", { opacity: 1, duration: 0.8 }, "-=0.3");
    // key strip illumination like a scale
    if (this.heroWhites && this.heroWhites.length) {
      const glows = this.heroWhites.map((w) => w.glow);
      tl.fromTo(
        glows,
        { opacity: 0.9 },
        { opacity: 0, duration: 1.0, stagger: 0.06, ease: "power2.out" },
        "-=1.4"
      );
    }
  }

  setupNav() {
    document.querySelectorAll<HTMLAnchorElement>("[data-nav]").forEach((a) => {
      this.on(a, "click", (e) => {
        const href = a.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
        const t = document.querySelector(href);
        if (!t) return;
        e.preventDefault();
        if (this.lenis) this.lenis.scrollTo(t, { offset: -10, duration: 1.3 });
        else (t as HTMLElement).scrollIntoView();
      });
    });
  }

  setupHeader() {
    const head = document.getElementById("sapt-head");
    if (!head) return;
    this._headOn = false;
    this.syncHeader = () => {
      const on = this._headOn;
      const dark = this.theme !== "light";
      head.style.background = on
        ? dark
          ? "rgba(11,11,11,.82)"
          : "rgba(246,241,230,.86)"
        : "transparent";
      head.style.backdropFilter = on ? "blur(14px)" : "none";
      head.style.padding = on ? "15px 0" : "22px 0";
      head.style.borderColor = on ? "var(--line)" : "transparent";
    };
    this.ST.create({
      start: 60,
      end: "max",
      onUpdate: (self: any) => {
        this._headOn = self.scroll() > 60;
        this.syncHeader!();
      },
    });
    this.syncHeader();
  }

  setupTheme() {
    const btn = document.getElementById("sapt-theme");
    const label = document.getElementById("sapt-theme-label");
    const fill = document.getElementById("sapt-theme-fill");
    const spot = document.getElementById("sapt-spot");
    const apply = (t: string, persist: boolean) => {
      this.theme = t === "light" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", this.theme);
      if (label) label.textContent = this.theme === "light" ? "Light" : "Dark";
      if (fill) {
        if (this.theme === "light") {
          fill.style.left = "0";
          fill.style.right = "auto";
          fill.style.borderRadius = "50% 0 0 50%";
        } else {
          fill.style.left = "auto";
          fill.style.right = "0";
          fill.style.borderRadius = "0 50% 50% 0";
        }
      }
      if (spot)
        spot.style.mixBlendMode = this.theme === "light" ? "multiply" : "screen";
      if (this.syncHeader) this.syncHeader();
      if (persist) {
        try {
          localStorage.setItem("apt-theme", this.theme);
        } catch {}
      }
    };
    apply(this.theme, false);
    if (btn)
      this.on(btn, "click", () => {
        const next = this.theme === "light" ? "dark" : "light";
        apply(next, true);
        this.playMidi(next === "light" ? 72 : 55, 1.1);
      });
  }

  setupProgress() {
    const bar = document.getElementById("sapt-progress");
    if (!bar) return;
    this.ST.create({
      start: 0,
      end: "max",
      scrub: true,
      onUpdate: (self: any) => {
        bar.style.width = self.progress * 100 + "%";
      },
    });
  }

  setupReveals() {
    const gsap = this.gsap;
    gsap.utils.toArray(".fade").forEach((el: any) => {
      gsap.from(el, {
        opacity: 0,
        y: this.reduce ? 0 : 46,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 86%" },
      });
    });
  }

  setupSheet() {
    const gsap = this.gsap;
    const staff = document.querySelectorAll<SVGPathElement>("#sheet .staff path");
    const mel = document.querySelector<SVGPathElement>("#sheet .melody");
    staff.forEach((p) => {
      const L = p.getTotalLength();
      p.style.strokeDasharray = String(L);
      p.style.strokeDashoffset = String(L);
    });
    if (mel) {
      const L = mel.getTotalLength();
      mel.style.strokeDasharray = String(L);
      mel.style.strokeDashoffset = String(L);
    }
    gsap.to("#sheet .staff path", {
      strokeDashoffset: 0,
      ease: "none",
      stagger: 0.05,
      scrollTrigger: {
        trigger: "#why",
        start: "top 75%",
        end: "center center",
        scrub: 1,
      },
    });
    if (mel)
      gsap.to(mel, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: "#why",
          start: "top 60%",
          end: "bottom center",
          scrub: 1,
        },
      });
    // reveal the musical notes one by one as the melody draws on
    gsap.fromTo(
      "#sheet .note",
      { opacity: 0 },
      {
        opacity: 1,
        ease: "none",
        stagger: 0.4,
        scrollTrigger: {
          trigger: "#why",
          start: "top 60%",
          end: "bottom center",
          scrub: 1,
        },
      }
    );
  }

  setupHeroParallax() {
    if (this.reduce) return;
    const gsap = this.gsap;
    document.querySelectorAll<HTMLElement>("#hero [data-par]").forEach((el) => {
      const d = parseFloat(el.dataset.par || "0");
      gsap.to(el, {
        yPercent: d * 40,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  }

  // Pin "In Their Words" and play the three quotes as a scroll-driven sequence:
  // each one reveals, holds, then clears before the next. Every quote has its
  // own text animation and its own animated SVG (tuning fork, vibrating string,
  // metronome). Driven by a single scrubbed timeline so it reverses cleanly.
  setupTestimonials() {
    const gsap = this.gsap;
    const sec = document.getElementById("testimonials");
    if (!sec) return;
    const slideEls = Array.from(sec.querySelectorAll<HTMLElement>(".t-slide"));
    if (!slideEls.length) return;

    const slides = slideEls.map((el) => {
      const q = el.querySelector<HTMLElement>(".t-quote");
      const words: HTMLElement[] = [];
      if (q) {
        const text = (q.textContent || "").trim();
        q.textContent = "";
        text.split(/\s+/).forEach((wd) => {
          const span = document.createElement("span");
          span.className = "t-word";
          span.textContent = wd;
          span.style.cssText =
            "display:inline-block;will-change:transform,opacity,filter;";
          q.appendChild(span);
          q.appendChild(document.createTextNode(" "));
          words.push(span);
        });
      }
      const draws = Array.from(el.querySelectorAll<SVGPathElement>(".t-draw"));
      draws.forEach((p) => {
        const L = p.getTotalLength();
        p.style.strokeDasharray = String(L);
        p.style.strokeDashoffset = String(L);
      });
      return {
        el,
        words,
        cap: el.querySelector<HTMLElement>(".t-cap"),
        svg: el.querySelector<HTMLElement>(".t-svg"),
        draws,
      };
    });

    slides.forEach((s) => gsap.set(s.el, { autoAlpha: 0 }));
    const dots = Array.from(sec.querySelectorAll<HTMLElement>(".t-dot"));
    const total = slides.length;

    const tl = gsap.timeline();
    slides.forEach((s, i) => {
      tl.set(s.el, { autoAlpha: 1 });
      tl.add(this.tIn(s, i));
      tl.to({}, { duration: 0.9 }); // hold for reading
      if (i < total - 1) {
        tl.add(this.tOut(s, i));
        tl.set(s.el, { autoAlpha: 0 });
      }
    });

    this.ST.create({
      trigger: sec,
      start: "top top",
      end: "+=" + total * 900,
      pin: true,
      scrub: 0.8,
      animation: tl,
      onUpdate: (self: any) => {
        const idx = Math.min(total - 1, Math.floor(self.progress * total));
        dots.forEach((d, di) => {
          const on = di === idx;
          d.style.width = on ? "24px" : "8px";
          d.style.background = on ? "var(--gold)" : "var(--line2)";
        });
      },
    });
  }

  // Entrance timeline for quote `i` — a distinct text animation per quote,
  // plus the SVG fading in and its line drawing on.
  tIn(s: any, i: number) {
    const gsap = this.gsap;
    const t = gsap.timeline();
    if (s.svg)
      t.fromTo(s.svg, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0);
    if (s.draws.length)
      t.to(s.draws, { strokeDashoffset: 0, duration: 0.6, ease: "none" }, 0);
    if (s.words.length) {
      if (i === 0)
        t.fromTo(s.words, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power3.out" }, 0.15);
      else if (i === 1)
        t.fromTo(s.words, { opacity: 0, filter: "blur(10px)", scale: 0.9 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.55, stagger: 0.04, ease: "power2.out" }, 0.15);
      else
        t.fromTo(s.words, { opacity: 0, x: -28, skewX: 10 }, { opacity: 1, x: 0, skewX: 0, duration: 0.5, stagger: 0.05, ease: "back.out(1.4)" }, 0.15);
    }
    if (s.cap)
      t.fromTo(s.cap, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, ">-0.1");
    return t;
  }

  // Exit timeline for quote `i` — distinct per quote, mirrors the entrance.
  tOut(s: any, i: number) {
    const gsap = this.gsap;
    const t = gsap.timeline();
    if (s.cap)
      t.to(s.cap, { opacity: 0, y: -10, duration: 0.3, ease: "power1.in" }, 0);
    if (s.words.length) {
      if (i === 0)
        t.to(s.words, { opacity: 0, y: -26, duration: 0.35, stagger: 0.025, ease: "power2.in" }, 0);
      else if (i === 1)
        t.to(s.words, { opacity: 0, filter: "blur(10px)", scale: 1.06, duration: 0.4, stagger: 0.02, ease: "power2.in" }, 0);
      else
        t.to(s.words, { opacity: 0, x: 28, duration: 0.35, stagger: 0.025, ease: "power2.in" }, 0);
    }
    if (s.svg)
      t.to(s.svg, { opacity: 0, y: -14, duration: 0.35, ease: "power1.in" }, 0);
    return t;
  }

  setupProcess() {
    const gsap = this.gsap;
    gsap.to("#proc-line", {
      scaleX: 1,
      duration: 1.3,
      ease: "power2.out",
      scrollTrigger: { trigger: "#process", start: "top 60%" },
    });
  }

  setupMap() {
    const gsap = this.gsap;
    gsap.from("#map .ring", {
      scale: 0.4,
      opacity: 0,
      transformOrigin: "50% 50%",
      duration: 1.1,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: { trigger: "#area", start: "top 65%" },
    });
    gsap.to("#map .mappt", {
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: { trigger: "#area", start: "top 55%" },
    });
  }

  setupTilt() {
    if (this.reduce) return;
    const gsap = this.gsap;
    document.querySelectorAll<HTMLElement>(".tilt").forEach((el) => {
      const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" });
      const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" });
      gsap.set(el, { transformPerspective: 900, transformOrigin: "center" });
      this.on(el, "pointermove", (e) => {
        const ev = e as PointerEvent;
        const r = el.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width - 0.5;
        const py = (ev.clientY - r.top) / r.height - 0.5;
        ry(px * 9);
        rx(-py * 9);
      });
      this.on(el, "pointerleave", () => {
        rx(0);
        ry(0);
      });
    });
    // service card spotlight + lift
    document.querySelectorAll<HTMLElement>(".svc-card").forEach((card) => {
      const spot = card.querySelector<HTMLElement>(".svc-spot");
      if (!spot) return;
      this.on(card, "pointermove", (e) => {
        const ev = e as PointerEvent;
        const r = card.getBoundingClientRect();
        spot.style.left = ev.clientX - r.left + "px";
        spot.style.top = ev.clientY - r.top + "px";
      });
      this.on(card, "pointerenter", () => {
        spot.style.opacity = "1";
        card.style.background = "var(--cardHover)";
      });
      this.on(card, "pointerleave", () => {
        spot.style.opacity = "0";
        card.style.background = "var(--ink)";
      });
    });
  }

  setupMagnetic() {
    if (this.reduce) return;
    const gsap = this.gsap;
    document.querySelectorAll<HTMLElement>(".magnetic").forEach((el) => {
      const xT = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
      const yT = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
      this.on(el, "pointermove", (e) => {
        const ev = e as PointerEvent;
        const r = el.getBoundingClientRect();
        xT((ev.clientX - (r.left + r.width / 2)) * 0.32);
        yT((ev.clientY - (r.top + r.height / 2)) * 0.42);
      });
      this.on(el, "pointerleave", () => {
        xT(0);
        yT(0);
      });
    });
  }

  setupSpotlight() {
    if (this.reduce) return;
    const gsap = this.gsap;
    const spot = document.getElementById("sapt-spot");
    if (!spot) return;
    const xT = gsap.quickTo(spot, "x", { duration: 0.6, ease: "power2" });
    const yT = gsap.quickTo(spot, "y", { duration: 0.6, ease: "power2" });
    this.on(window, "pointermove", (e) => {
      const ev = e as PointerEvent;
      spot.style.opacity = "1";
      xT(ev.clientX);
      yT(ev.clientY);
    });
    this.on(window, "pointerleave", () => {
      spot.style.opacity = "0";
    });
  }

  setupFAQ() {
    document.querySelectorAll<HTMLElement>(".faq-item").forEach((item) => {
      const q = item.querySelector<HTMLElement>(".faq-q");
      const a = item.querySelector<HTMLElement>(".faq-a");
      const ic = item.querySelector<HTMLElement>(".faq-ic");
      const v = item.querySelector<HTMLElement>(".faq-v");
      if (!q || !a || !ic || !v) return;
      this.on(q, "click", () => {
        const open = item.dataset.open === "1";
        if (open) {
          a.style.height = "0px";
          a.style.opacity = "0";
          ic.style.transform = "rotate(0deg)";
          v.style.opacity = "1";
          item.dataset.open = "0";
        } else {
          a.style.height = a.scrollHeight + "px";
          a.style.opacity = "1";
          ic.style.transform = "rotate(180deg)";
          v.style.opacity = "0";
          item.dataset.open = "1";
          this.playMidi(64, 1.0);
        }
      });
    });
  }

  setupCrescendo() {
    if (this.reduce) return;
    const gsap = this.gsap;
    const wave = document.querySelector("#cresc svg");
    if (wave)
      gsap.to(wave, {
        scaleY: 1.6,
        ease: "none",
        scrollTrigger: {
          trigger: "#book",
          start: "top bottom",
          end: "center center",
          scrub: true,
        },
      });
  }

  setupSound() {
    const btn = document.getElementById("sapt-sound");
    const label = document.getElementById("sapt-sound-label");
    const dot = document.getElementById("sapt-sound-dot");
    if (!btn || !label || !dot) return;
    const sync = () => {
      label.textContent = this.soundOn ? "Sound On" : "Sound Off";
      dot.style.background = this.soundOn ? "var(--gold)" : "rgba(184,184,184,.5)";
      dot.style.boxShadow = this.soundOn ? "0 0 8px var(--gold)" : "none";
      setSoundEnabled(this.soundOn); // keep the 3D piano's engine in sync
    };
    sync();
    this.on(btn, "click", () => {
      this.soundOn = !this.soundOn;
      if (this.soundOn) {
        this.ensureAudio();
        this.playMidi(67, 1.2);
      }
      sync();
    });
  }

  setupAudioGesture() {
    const resume = () => {
      this.ensureAudio();
    };
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    window.addEventListener("wheel", resume, { once: true, passive: true });
    this.cleanups.push(() => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
      window.removeEventListener("wheel", resume);
    });
  }
}
