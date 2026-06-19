import * as THREE from "three";

/* ------------------------------------------------------------------ *
 * Grand-piano top-down outline (Steinway Model D proportions).
 *
 * Units are meters. Adjust PIANO.* to rescale the whole instrument.
 * The outline is centered on x, with the keyboard (front) at z = 0 and
 * the tail sweeping toward -z. The treble side (+x) is the curved
 * "bentside"; the bass side (-x) is the straighter spine.
 *
 * To reshape the body, edit OUTLINE below — the single source of truth
 * every part (rim, lid, harp, soundboard) is derived from.
 * ------------------------------------------------------------------ */

export const PIANO = {
  length: 2.74, // front-to-back (Model D ≈ 274 cm)
  width: 1.56, // widest point (Model D ≈ 156 cm)
  rimHeight: 0.3, // height of the wooden rim wall
  caseY: 0.0, // case sits with its underside at y = 0 (legs go below)
};

// Centroid used when scaling the outline inward (for rim hole / plate / lid).
// NOTE: shape-space y maps to world -z after rotateX(-90°), so the body must
// use POSITIVE y here for its tail to sit behind the keyboard (world -z).
const CENTER = new THREE.Vector2(0.02, 1.45);

// Smooth straight (spine) points + spline (bentside + tail) control points.
const FRONT_L = new THREE.Vector2(-0.78, 0);
const FRONT_R = new THREE.Vector2(0.78, 0);
const BENTSIDE: THREE.Vector2[] = [
  new THREE.Vector2(0.85, 0.5),
  new THREE.Vector2(0.9, 1.1),
  new THREE.Vector2(0.88, 1.78),
  new THREE.Vector2(0.78, 2.32),
  new THREE.Vector2(0.6, 2.72),
  new THREE.Vector2(0.34, 2.9),
  new THREE.Vector2(0.04, 3.0),
  new THREE.Vector2(-0.28, 3.0),
  new THREE.Vector2(-0.57, 2.9),
  new THREE.Vector2(-0.76, 2.66),
];
const SPINE: THREE.Vector2[] = [
  new THREE.Vector2(-0.82, 2.0),
  new THREE.Vector2(-0.82, 1.1),
  new THREE.Vector2(-0.8, 0.44),
];

function s(v: THREE.Vector2, scale: number): THREE.Vector2 {
  return new THREE.Vector2(
    CENTER.x + (v.x - CENTER.x) * scale,
    CENTER.y + (v.y - CENTER.y) * scale
  );
}

/** Closed grand-piano Shape. `scale < 1` shrinks it inward (constant-ish inset). */
export function pianoShape(scale = 1): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(s(FRONT_L, scale).x, s(FRONT_L, scale).y);
  shape.lineTo(s(FRONT_R, scale).x, s(FRONT_R, scale).y);
  shape.splineThru(BENTSIDE.map((p) => s(p, scale)));
  SPINE.forEach((p) => {
    const q = s(p, scale);
    shape.lineTo(q.x, q.y);
  });
  shape.lineTo(s(FRONT_L, scale).x, s(FRONT_L, scale).y);
  return shape;
}

/** Same outline as an open Path (for use as an extrude hole). */
export function pianoHole(scale: number): THREE.Path {
  const path = new THREE.Path();
  path.moveTo(s(FRONT_L, scale).x, s(FRONT_L, scale).y);
  path.lineTo(s(FRONT_R, scale).x, s(FRONT_R, scale).y);
  path.splineThru(BENTSIDE.map((p) => s(p, scale)));
  SPINE.forEach((p) => {
    const q = s(p, scale);
    path.lineTo(q.x, q.y);
  });
  path.lineTo(s(FRONT_L, scale).x, s(FRONT_L, scale).y);
  return path;
}
