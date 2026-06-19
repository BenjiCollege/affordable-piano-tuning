import type { CSSProperties } from "react";

/**
 * Convert a CSS declaration string ("position:relative;top:0") into a React
 * style object. Lets us reuse the design prototype's inline styles verbatim so
 * the visual output stays pixel-identical. Custom properties (--foo) are kept
 * as-is; everything else is camelCased.
 */
export function css(decls: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of decls.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop) continue;
    const key = prop.startsWith("--")
      ? prop
      : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[key] = val;
  }
  return out as CSSProperties;
}
