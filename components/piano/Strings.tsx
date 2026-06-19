"use client";

import { useMemo } from "react";
import { STEEL, COPPER } from "./materials";

/**
 * Strings running front-to-back over the harp. Thickness and material
 * grade from the bass side (thick, copper-wound, left) to the treble
 * (thin, bright steel, right). Increase COUNT for denser stringing.
 */
const COUNT = 64;

export default function Strings() {
  const strings = useMemo(() => {
    const arr: {
      x: number; z: number; len: number; r: number; bass: boolean;
    }[] = [];
    for (let i = 0; i < COUNT; i++) {
      const t = i / (COUNT - 1); // 0 = bass (left), 1 = treble (right)
      const x = -0.64 + t * 1.26;
      // bass strings are longer; treble shorter (bentside curves in)
      const back = -2.75 + (x > 0 ? x * 0.95 : -x * 0.12);
      const front = -0.34;
      arr.push({
        x,
        z: (front + back) / 2,
        len: front - back,
        r: 0.012 - t * 0.0066, // thick bass → thin treble
        bass: t < 0.3,
      });
    }
    return arr;
  }, []);

  return (
    <group position={[0, 0.125, 0]}>
      {strings.map((s, i) => (
        <mesh key={i} position={[s.x, 0, s.z]} castShadow>
          <boxGeometry args={[s.r, s.r, s.len]} />
          <meshStandardMaterial {...(s.bass ? COPPER : STEEL)} />
        </mesh>
      ))}
    </group>
  );
}
