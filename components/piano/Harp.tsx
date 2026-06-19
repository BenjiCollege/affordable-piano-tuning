"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { pianoShape } from "./footprint";
import { PLATE_GOLD } from "./materials";

/**
 * The golden cast-iron plate (harp) that sits over the soundboard, with a
 * few cutouts revealing the wood beneath. Sits just below the strings.
 * Adjust the ellipse holes to change where the soundboard shows through.
 */
export default function Harp() {
  const geo = useMemo(() => {
    const plate = pianoShape(0.85); // covers the soundboard so the interior reads dark
    const g = new THREE.ShapeGeometry(plate, 48);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  return (
    <mesh geometry={geo} position={[0, 0.1, 0]} receiveShadow>
      <meshStandardMaterial {...PLATE_GOLD} side={THREE.DoubleSide} />
    </mesh>
  );
}
