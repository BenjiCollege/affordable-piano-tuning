/* ------------------------------------------------------------------ *
 * Physically based material presets, spread onto the matching material
 * element. EBONY / IVORY / EBONY_KEY carry a clearcoat layer, so use
 * <meshPhysicalMaterial {...EBONY} />. The metal/wood presets have no
 * clearcoat → use <meshStandardMaterial {...BRASS} />.
 *
 * Tweak finishes here in one place. envMapIntensity scales how strongly
 * each surface reflects the studio environment.
 * ------------------------------------------------------------------ */

export const EBONY = {
  color: "#0a0a0c",
  roughness: 0.08,
  metalness: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.04,
  envMapIntensity: 1.7,
} as const;

export const EBONY_SOFT = {
  color: "#0c0c0e",
  roughness: 0.16,
  metalness: 0,
  clearcoat: 0.7,
  clearcoatRoughness: 0.12,
  envMapIntensity: 1.1,
} as const;

export const BRASS = {
  color: "#c9a227",
  metalness: 0.96,
  roughness: 0.22,
  envMapIntensity: 1.5,
} as const;

export const PLATE_GOLD = {
  color: "#241d10",
  metalness: 0.2,
  roughness: 0.62,
  envMapIntensity: 0.3,
} as const;

export const WOOD = {
  color: "#19150d",
  metalness: 0,
  roughness: 0.72,
  envMapIntensity: 0.2,
} as const;

export const STEEL = {
  color: "#d2ccbb",
  metalness: 0.95,
  roughness: 0.26,
  envMapIntensity: 1.2,
} as const;

export const COPPER = {
  color: "#b06a38",
  metalness: 0.9,
  roughness: 0.32,
  envMapIntensity: 1.1,
} as const;

export const IVORY = {
  color: "#f6f1e4",
  roughness: 0.28,
  metalness: 0,
  clearcoat: 0.4,
  clearcoatRoughness: 0.4,
  envMapIntensity: 0.7,
} as const;

export const EBONY_KEY = {
  color: "#16140f",
  roughness: 0.32,
  metalness: 0,
  clearcoat: 0.6,
  clearcoatRoughness: 0.2,
  envMapIntensity: 0.8,
} as const;
