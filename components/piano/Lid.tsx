"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { pianoShape, PIANO } from "./footprint";
import { EBONY, EBONY_SOFT } from "./materials";

/**
 * The raised open lid, hinged along the spine (bass side) and propped up.
 * OPEN_ANGLE > 90° (≈1.57 rad) leans the lid back off the interior so the
 * full string bed is revealed (concert "full stick" look).
 */
const OPEN_ANGLE = 1.0; // radians (~57°, classic open grand)

export default function Lid() {
  const lidGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(pianoShape(0.99), {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 2,
      curveSegments: 64,
    });
    g.rotateX(-Math.PI / 2);
    g.translate(0.78, 0, 0); // move the spine edge to the local origin (hinge)
    return g;
  }, []);

  return (
    <group>
      {/* lid panel — pivots on the spine */}
      <group position={[-0.78, PIANO.rimHeight, 0]} rotation={[0, 0, OPEN_ANGLE]}>
        <mesh geometry={lidGeo} castShadow>
          <meshPhysicalMaterial {...EBONY} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* lid prop stick (thin, unobtrusive) */}
      <mesh position={[0.5, PIANO.rimHeight + 0.42, -0.5]} rotation={[0.05, 0, -0.26]}>
        <cylinderGeometry args={[0.009, 0.009, 0.95, 8]} />
        <meshPhysicalMaterial {...EBONY_SOFT} />
      </mesh>
    </group>
  );
}
