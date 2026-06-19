"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { EBONY, BRASS } from "./materials";

/**
 * Three lathe-turned, tapered legs with polished brass casters.
 * Edit LEG_POSITIONS / the lathe profile to change stance and shape.
 */
const LEG_H = 0.63;
const LEG_POSITIONS: [number, number][] = [
  [-0.62, -0.06], // front bass
  [0.62, -0.06], // front treble
  [0.06, -2.45], // tail
];

export default function Legs() {
  const legGeo = useMemo(() => {
    const profile = [
      new THREE.Vector2(0.052, 0.0),
      new THREE.Vector2(0.058, 0.06),
      new THREE.Vector2(0.05, 0.16),
      new THREE.Vector2(0.042, 0.34),
      new THREE.Vector2(0.034, LEG_H - 0.05),
      new THREE.Vector2(0.03, LEG_H),
    ];
    return new THREE.LatheGeometry(profile, 20);
  }, []);

  return (
    <group>
      {LEG_POSITIONS.map(([x, z], i) => (
        <group key={i} position={[x, -0.085 - LEG_H, z]}>
          <mesh geometry={legGeo} castShadow>
            <meshPhysicalMaterial {...EBONY} />
          </mesh>
          {/* brass caster */}
          <mesh position={[0, -0.03, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
            <meshStandardMaterial {...BRASS} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
