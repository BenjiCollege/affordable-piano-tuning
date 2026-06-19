"use client";

import { EBONY, BRASS } from "./materials";

/**
 * The lyre (pedal post + box) hanging below the keyboard, with three
 * polished brass pedals. Adjust positions to move the assembly.
 */
export default function Pedals() {
  return (
    <group position={[0, 0, 0.05]}>
      {/* lyre posts */}
      <mesh position={[0.07, -0.42, 0.0]} rotation={[0.18, 0, 0]} castShadow>
        <boxGeometry args={[0.03, 0.7, 0.03]} />
        <meshPhysicalMaterial {...EBONY} />
      </mesh>
      <mesh position={[-0.07, -0.42, 0.0]} rotation={[0.18, 0, 0]} castShadow>
        <boxGeometry args={[0.03, 0.7, 0.03]} />
        <meshPhysicalMaterial {...EBONY} />
      </mesh>
      {/* pedal box */}
      <mesh position={[0, -0.72, 0.14]} castShadow>
        <boxGeometry args={[0.26, 0.07, 0.16]} />
        <meshPhysicalMaterial {...EBONY} />
      </mesh>
      {/* three brass pedals */}
      {[-0.07, 0, 0.07].map((x, i) => (
        <mesh key={i} position={[x, -0.74, 0.25]} rotation={[0.16, 0, 0]} castShadow>
          <boxGeometry args={[0.045, 0.016, 0.13]} />
          <meshStandardMaterial {...BRASS} />
        </mesh>
      ))}
    </group>
  );
}
