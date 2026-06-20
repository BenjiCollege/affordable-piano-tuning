"use client";

import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { IVORY, EBONY_KEY, EBONY } from "./materials";

/* 88-key layout (A0=21 → C8=108). Tweak dims here to resize the keys. */
const LOW = 21;
const HIGH = 108;
const WHITE_SET = new Set([0, 2, 4, 5, 7, 9, 11]);
const PITCH = 0.0234; // white-key spacing (m)
const WHITE = { w: 0.0212, h: 0.02, d: 0.145 };
const BLACK = { w: 0.011, h: 0.032, d: 0.092, dy: 0.012, dz: -0.03 };
const KEYS_Y = 0.205;
const KEYS_Z = 0.0; // pivot at the back of the keys; they extend toward +z
const PRESS = 0.06;
const GOLD = new THREE.Color("#D4AF37");

function buildKeys() {
  const whites: { midi: number; x: number }[] = [];
  for (let m = LOW; m <= HIGH; m++)
    if (WHITE_SET.has(m % 12)) whites.push({ midi: m, x: 0 });
  const n = whites.length;
  whites.forEach((k, i) => (k.x = (i - (n - 1) / 2) * PITCH));
  const xByMidi = new Map(whites.map((k) => [k.midi, k.x]));
  const blacks: { midi: number; x: number }[] = [];
  for (let m = LOW; m <= HIGH; m++)
    if (!WHITE_SET.has(m % 12))
      blacks.push({ midi: m, x: (xByMidi.get(m - 1) ?? 0) + PITCH / 2 });
  return { whites, blacks, halfW: ((n - 1) / 2) * PITCH };
}

export default function Keyboard({
  active, hover, press, playingRef,
}: {
  active: React.MutableRefObject<Set<number>>;
  hover: React.MutableRefObject<number | null>;
  press: (midi: number, sustain: boolean) => void;
  playingRef: React.MutableRefObject<boolean>;
}) {
  const { whites, blacks, halfW } = useMemo(buildKeys, []);
  const groupRefs = useRef<Map<number, THREE.Group>>(new Map());
  const matRefs = useRef<Map<number, THREE.MeshPhysicalMaterial>>(new Map());

  // gold "Cadence" fallboard branding (canvas texture — no external font fetch)
  const brand = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 128;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#cda94c";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = '600 44px "Playfair Display", Georgia, serif';
      const text = "Affordable Piano Tuning";
      ctx.fillText(text, 512, 70);
    }
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 8;
    return t;
  }, []);

  useFrame(() => {
    for (const [midi, g] of groupRefs.current) {
      const t = active.current.has(midi) ? PRESS : 0;
      g.rotation.x += (t - g.rotation.x) * 0.3;
    }
    const playing = playingRef.current;
    for (const [midi, m] of matRefs.current) {
      const want = active.current.has(midi)
        ? 1.4
        : playing && hover.current === midi ? 0.4 : 0;
      m.emissiveIntensity += (want - m.emissiveIntensity) * 0.25;
    }
  });

  const renderKey = (midi: number, x: number, black: boolean) => {
    const dims = black ? BLACK : WHITE;
    const gy = KEYS_Y + (black ? BLACK.dy : 0);
    const gz = KEYS_Z + (black ? BLACK.dz : 0);
    return (
      <group
        key={midi}
        position={[x, gy, gz]}
        ref={(el) => {
          if (el) groupRefs.current.set(midi, el);
        }}
      >
        <mesh
          position={[0, 0, dims.d / 2]}
          castShadow
          onPointerDown={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            press(midi, false);
          }}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            hover.current = midi;
          }}
          onPointerOut={() => {
            if (hover.current === midi) hover.current = null;
          }}
        >
          <boxGeometry args={[dims.w, dims.h, dims.d]} />
          <meshPhysicalMaterial
            ref={(m) => {
              if (m) matRefs.current.set(midi, m as THREE.MeshPhysicalMaterial);
            }}
            {...(black ? EBONY_KEY : IVORY)}
            emissive={GOLD}
            emissiveIntensity={0}
          />
        </mesh>
      </group>
    );
  };

  return (
    <group>
      {/* keybed */}
      <mesh position={[0, KEYS_Y - 0.022, 0.072]} receiveShadow>
        <boxGeometry args={[halfW * 2 + 0.16, 0.03, 0.18]} />
        <meshPhysicalMaterial {...EBONY} />
      </mesh>
      {/* key blocks (cheeks) */}
      {[-(halfW + 0.05), halfW + 0.05].map((x, i) => (
        <mesh key={i} position={[x, KEYS_Y + 0.012, 0.06]} castShadow>
          <boxGeometry args={[0.05, 0.06, 0.16]} />
          <meshPhysicalMaterial {...EBONY} />
        </mesh>
      ))}
      {/* fallboard + branding */}
      <mesh position={[0, KEYS_Y + 0.075, -0.02]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[halfW * 2 + 0.13, 0.12, 0.025]} />
        <meshPhysicalMaterial {...EBONY} />
      </mesh>
      <mesh position={[0, KEYS_Y + 0.082, -0.006]} rotation={[-0.12, 0, 0]}>
        <planeGeometry args={[0.62, 0.078]} />
        <meshBasicMaterial map={brand} transparent toneMapped={false} />
      </mesh>

      {whites.map((k) => renderKey(k.midi, k.x, false))}
      {blacks.map((k) => renderKey(k.midi, k.x, true))}
    </group>
  );
}
