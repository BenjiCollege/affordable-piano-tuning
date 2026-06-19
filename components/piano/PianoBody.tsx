"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { pianoShape, pianoHole, PIANO } from "./footprint";
import { EBONY, EBONY_SOFT, WOOD } from "./materials";

/**
 * The case: a thick curved rim (wall) with beveled edges, a closed
 * underside, and a warm wood soundboard you see through the open lid.
 * Adjust PIANO.rimHeight / the inset scales to change wall thickness.
 */
export default function PianoBody() {
  const rimGeo = useMemo(() => {
    const shape = pianoShape(1);
    shape.holes.push(pianoHole(0.86)); // inner wall → constant-ish rim thickness
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: PIANO.rimHeight,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 4,
      curveSegments: 64,
    });
    g.rotateX(-Math.PI / 2);
    g.computeVertexNormals();
    return g;
  }, []);

  const baseGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(pianoShape(0.9), {
      depth: 0.085,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
      curveSegments: 64,
    });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  const soundboardGeo = useMemo(() => {
    const g = new THREE.ShapeGeometry(pianoShape(0.84), 64);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  return (
    <group>
      {/* underside / belly */}
      <mesh geometry={baseGeo} position={[0, -0.085, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial {...EBONY_SOFT} />
      </mesh>

      {/* warm wood soundboard (seen through the open lid) */}
      <mesh geometry={soundboardGeo} position={[0, 0.045, 0]} receiveShadow>
        <meshStandardMaterial {...WOOD} side={THREE.DoubleSide} />
      </mesh>

      {/* glossy curved rim */}
      <mesh geometry={rimGeo} castShadow receiveShadow>
        <meshPhysicalMaterial {...EBONY} />
      </mesh>
    </group>
  );
}
