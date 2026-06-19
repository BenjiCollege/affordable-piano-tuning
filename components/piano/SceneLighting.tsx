"use client";

import {
  Environment,
  Lightformer,
  ContactShadows,
  MeshReflectorMaterial,
} from "@react-three/drei";

/**
 * Cinematic stage lighting:
 *  - Environment built from soft "studio softbox" Lightformers (no external
 *    HDRI fetch) → realistic streaked reflections on the black lacquer.
 *  - A key + rim directional pair for crisp speculars and shape.
 *  - A subtle reflective floor + contact shadow to ground the instrument.
 *
 * FLOOR_Y sits just under the casters. Lower `mixStrength` / `opacity`
 * for a more restrained reflection; raise resolution for crisper mirror.
 */
const FLOOR_Y = -0.77;

export default function SceneLighting({ reflections = true }: { reflections?: boolean }) {
  return (
    <>
      <Environment resolution={256}>
        <Lightformer intensity={3.0} position={[0, 5, -3]} scale={[12, 6, 1]} />
        <Lightformer intensity={2.0} position={[-6, 3, 3]} scale={[2.5, 8, 1]} />
        <Lightformer intensity={2.0} position={[6, 3, 3]} scale={[2.5, 8, 1]} />
        <Lightformer intensity={1.4} position={[0, 1.5, 7]} scale={[9, 4, 1]} color="#fff3e0" />
        <Lightformer intensity={0.9} position={[0, -2, -5]} scale={[9, 5, 1]} color="#93a6c9" />
      </Environment>

      <ambientLight intensity={0.1} />
      <spotLight
        position={[3.5, 6, 4]}
        angle={0.6}
        penumbra={0.9}
        intensity={1.1}
      />
      <directionalLight position={[-5, 4, -2]} intensity={0.3} color="#bcd0ff" />

      {/* reflective stage floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, -1.2]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        {reflections ? (
          <MeshReflectorMaterial
            resolution={256}
            mixBlur={1}
            mixStrength={0.5}
            blur={[400, 120]}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.2}
            color="#070708"
            metalness={0.55}
            roughness={0.85}
          />
        ) : (
          <meshStandardMaterial color="#070708" roughness={0.9} metalness={0.2} />
        )}
      </mesh>

      <ContactShadows
        position={[0, FLOOR_Y + 0.002, -1.2]}
        scale={6}
        blur={2.4}
        opacity={0.6}
        far={2}
        resolution={512}
        color="#000000"
      />
    </>
  );
}
