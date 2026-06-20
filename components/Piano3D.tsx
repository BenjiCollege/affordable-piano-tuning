"use client";

// Premium WebGL concert grand piano (Steinway Model D-inspired).
// Idle 3/4 hero view with a slow orbit → click → cinematic dolly into the
// keys → play (click + physical keyboard) → exit zooms back out.
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { playMidi, ensureAudio } from "@/lib/pianoAudio";

import PianoBody from "./piano/PianoBody";
import Harp from "./piano/Harp";
import Strings from "./piano/Strings";
import Lid from "./piano/Lid";
import Keyboard from "./piano/Keyboard";
import Legs from "./piano/Legs";
import Pedals from "./piano/Pedals";
import SceneLighting from "./piano/SceneLighting";

/* physical keyboard → midi (home row = middle octave, Z row = lower whites) */
const KEYMAP: Record<string, number> = {
  KeyA: 60, KeyW: 61, KeyS: 62, KeyE: 63, KeyD: 64, KeyF: 65, KeyT: 66,
  KeyG: 67, KeyY: 68, KeyH: 69, KeyU: 70, KeyJ: 71, KeyK: 72,
  KeyZ: 48, KeyX: 50, KeyC: 52, KeyV: 53, KeyB: 55, KeyN: 57, KeyM: 59,
};
const SCROLL_KEYS = new Set([
  "Space", "PageUp", "PageDown", "ArrowUp", "ArrowDown", "Home", "End",
]);

/* ------------------------------------------------------------------ *
 * Camera path — adjust here to recompose. v=0 is the idle 3/4 hero
 * shot; v=1 is the close-up on the keys for playing.
 * ------------------------------------------------------------------ */
type CamState = { v: number };
const CAM = [
  { p: 0.0, pos: new THREE.Vector3(2.5, 1.95, 5.6), tgt: new THREE.Vector3(0, 0.25, -0.7) },
  { p: 0.5, pos: new THREE.Vector3(1.1, 1.35, 3.3), tgt: new THREE.Vector3(0, 0.22, -0.25) },
  { p: 0.8, pos: new THREE.Vector3(0, 0.92, 1.7), tgt: new THREE.Vector3(0, 0.2, 0.02) },
  { p: 1.0, pos: new THREE.Vector3(0, 0.62, 1.05), tgt: new THREE.Vector3(0, 0.17, 0.06) },
];
function sampleCam(v: number) {
  const p = Math.max(0, Math.min(1, v));
  let a = CAM[0], b = CAM[1];
  for (let i = 0; i < CAM.length - 1; i++)
    if (p >= CAM[i].p && p <= CAM[i + 1].p) { a = CAM[i]; b = CAM[i + 1]; break; }
  const span = b.p - a.p || 1;
  const t = Math.max(0, Math.min(1, (p - a.p) / span));
  return { pos: a.pos.clone().lerp(b.pos, t), tgt: a.tgt.clone().lerp(b.tgt, t) };
}

/* ------------------------------------------------------------------ */
/* the 3D scene                                                       */
/* ------------------------------------------------------------------ */
function PianoScene({
  camState, playingRef, phaseRef, started, reflections, mobile,
}: {
  camState: React.MutableRefObject<CamState>;
  playingRef: React.MutableRefObject<boolean>;
  phaseRef: React.MutableRefObject<string>;
  started: boolean;
  reflections: boolean;
  mobile: boolean;
}) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 0.25, -0.95));
  const mouse = useRef({ x: 0, y: 0 });
  const orbitCenter = useMemo(() => new THREE.Vector3(0, 0.25, -0.9), []);

  // interaction state
  const active = useRef<Set<number>>(new Set());
  const hover = useRef<number | null>(null);
  const press = (midi: number, sustain: boolean) => {
    if (!playingRef.current) return;
    ensureAudio();
    if (!active.current.has(midi)) {
      active.current.add(midi);
      playMidi(midi, 2.2);
    }
    if (!sustain) window.setTimeout(() => active.current.delete(midi), 150);
  };
  const release = (midi: number) => active.current.delete(midi);

  // physical keyboard + parallax pointer
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!playingRef.current) return;
      if (SCROLL_KEYS.has(e.code)) e.preventDefault();
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const m = KEYMAP[e.code];
      if (m != null) press(m, true);
    };
    const up = (e: KeyboardEvent) => {
      const m = KEYMAP[e.code];
      if (m != null) release(m);
    };
    const move = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("pointermove", move);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // intro reveal — slide + rotate the instrument into view once on first sight
  const pianoRef = useRef<THREE.Group>(null);
  const revealed = useRef(false);
  useEffect(() => {
    if (started && pianoRef.current && !revealed.current) {
      revealed.current = true;
      gsap.fromTo(pianoRef.current.position, { y: -0.5 }, { y: 0, duration: 1.6, ease: "power3.out" });
      gsap.fromTo(pianoRef.current.rotation, { y: -0.4 }, { y: 0, duration: 1.8, ease: "power3.out" });
    }
  }, [started]);

  useFrame((state) => {
    const { pos, tgt } = sampleCam(camState.current.v);
    let p = pos.clone();
    if (phaseRef.current === "idle") {
      // pull back on mobile so the wide instrument fits a portrait screen
      if (mobile) p = orbitCenter.clone().add(p.clone().sub(orbitCenter).multiplyScalar(1.5));
      // slow cinematic orbit + gentle mouse parallax
      const a = Math.sin(state.clock.elapsedTime * 0.1) * 0.07;
      const off = p.clone().sub(orbitCenter).applyAxisAngle(new THREE.Vector3(0, 1, 0), a);
      p = orbitCenter.clone().add(off);
      if (!mobile) {
        p.x += mouse.current.x * 0.15;
        p.y += -mouse.current.y * 0.08;
      }
    }
    camera.position.lerp(p, phaseRef.current === "idle" ? 0.06 : 0.14);
    lookTarget.current.lerp(tgt, 0.12);
    camera.lookAt(lookTarget.current);
    // key press/glow animation lives in <Keyboard>
  });

  return (
    <>
      <SceneLighting reflections={reflections} />
      <group ref={pianoRef}>
        <PianoBody />
        <Harp />
        <Strings />
        <Lid />
        <Legs />
        <Pedals />
        <Keyboard active={active} hover={hover} press={press} playingRef={playingRef} />
      </group>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* section wrapper                                                    */
/* ------------------------------------------------------------------ */
type Phase = "idle" | "enter" | "play" | "exit";

function lockScroll() {
  const lenis = (window as { __aptLenis?: { stop: () => void } }).__aptLenis;
  if (lenis) lenis.stop();
  document.documentElement.style.overflow = "hidden";
}
function unlockScroll() {
  const lenis = (window as { __aptLenis?: { start: () => void } }).__aptLenis;
  if (lenis) lenis.start();
  document.documentElement.style.overflow = "";
}

export default function Piano3D() {
  const camState = useRef<CamState>({ v: 0 });
  const playingRef = useRef(false);
  const phaseRef = useRef<Phase>("idle");
  const [phase, setPhase] = useState<Phase>("idle");
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");
  const [started, setStarted] = useState(false);
  const [mobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const fadeChrome = (hidden: boolean) => {
    const kb = document.getElementById("kb-head");
    if (kb) kb.style.opacity = hidden ? "0" : "1";
    const head = document.getElementById("sapt-head");
    if (head) {
      head.style.transition = "opacity .5s ease";
      head.style.opacity = hidden ? "0" : "1";
      head.style.pointerEvents = hidden ? "none" : "";
    }
  };

  const enter = () => {
    if (phaseRef.current !== "idle") return;
    setPhase("enter");
    lockScroll();
    fadeChrome(true);
    gsap.to(camState.current, {
      v: 1, duration: 3.0, ease: "power2.inOut",
      onComplete: () => { playingRef.current = true; setPhase("play"); },
    });
  };

  const exit = () => {
    if (phaseRef.current !== "play") return;
    playingRef.current = false;
    setPhase("exit");
    gsap.to(camState.current, {
      v: 0, duration: 2.0, ease: "power2.inOut",
      onComplete: () => { unlockScroll(); fadeChrome(false); setPhase("idle"); },
    });
  };

  useEffect(() => {
    const sec = document.getElementById("keyboard");
    let io: IntersectionObserver | undefined;
    if (sec) {
      io = new IntersectionObserver(
        (e) => {
          const vis = e[0].isIntersecting;
          setFrameloop(vis ? "always" : "never");
          if (vis) setStarted(true);
        },
        { rootMargin: "200px" }
      );
      io.observe(sec);
    }
    return () => { io?.disconnect(); unlockScroll(); };
  }, []);

  const layered = phase !== "idle";
  const glass = "rgba(14,13,17,.62)";
  const ivory = "#F4EEE0";

  return (
    <div
      style={{
        position: layered ? "fixed" : "absolute",
        inset: 0,
        zIndex: layered ? 300 : 1,
        background:
          "radial-gradient(120% 100% at 50% 22%, #1c1b22 0%, #111017 45%, #050507 100%)",
      }}
    >
      <Canvas
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
        dpr={[1, mobile ? 1.5 : 2]}
        gl={{ alpha: true, antialias: true }}
        camera={{ fov: mobile ? 52 : 38, position: [2.5, 1.95, 5.6], near: 0.05, far: 100 }}
        frameloop={frameloop}
      >
        <PianoScene
          camState={camState}
          playingRef={playingRef}
          phaseRef={phaseRef}
          started={started}
          reflections={!mobile}
          mobile={mobile}
        />
      </Canvas>

      {/* idle: click to play */}
      <button
        onClick={enter}
        aria-label="Play the piano"
        style={{
          position: "absolute", inset: 0, zIndex: 2,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          paddingBottom: "12vh",
          background: "transparent", border: "none",
          cursor: phase === "idle" ? "pointer" : "default",
          opacity: phase === "idle" ? 1 : 0,
          pointerEvents: phase === "idle" ? "auto" : "none",
          transition: "opacity .5s ease",
        }}
      >
        <span
          style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            padding: "15px 26px", borderRadius: 46,
            background: glass, backdropFilter: "blur(8px)",
            border: "1px solid rgba(212,175,55,.45)", color: ivory,
            fontFamily: "'Inter',sans-serif", fontSize: 14,
            letterSpacing: ".08em", textTransform: "uppercase",
            boxShadow: "0 0 36px rgba(212,175,55,.22)",
            animation: "bob 2.4s ease-in-out infinite",
          }}
        >
          <span style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--gold)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "11px solid #0B0B0B", marginLeft: 3 }} />
          </span>
          Click me to play
        </span>
      </button>

      {/* play: hint + exit */}
      <div
        style={{
          position: "absolute", bottom: "7vh", left: 0, width: "100%",
          textAlign: "center", zIndex: 2,
          opacity: phase === "play" ? 1 : 0, pointerEvents: "none",
          transition: "opacity .6s ease", fontSize: 13, letterSpacing: ".04em",
          color: "rgba(244,238,224,.75)",
        }}
      >
        {mobile ? "Tap the keys to play" : "Click the keys — or play with your keyboard (letters A–K)"}
      </div>
      <button
        onClick={exit}
        style={{
          position: "absolute", top: 26, right: 40, zIndex: 200,
          display: "inline-flex", alignItems: "center", gap: 9,
          padding: "11px 18px", borderRadius: 40,
          background: glass, backdropFilter: "blur(8px)",
          border: "1px solid rgba(244,238,224,.25)", color: ivory,
          fontFamily: "'Inter',sans-serif", fontSize: 12,
          letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer",
          opacity: phase === "play" ? 1 : 0,
          pointerEvents: phase === "play" ? "auto" : "none",
          transition: "opacity .5s ease",
        }}
      >
        <span style={{ fontSize: 15, lineHeight: 1 }}>✕</span> Exit
      </button>
    </div>
  );
}
