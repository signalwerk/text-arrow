// src/glyphs.js
import opentype from "opentype.js";
import { polygonPath, chevronStrokePath } from "./geometry.js";

/** .notdef box (required) */
export function makeNotdefGlyph({ ascender, descender, unitsPerEm }) {
  const size = unitsPerEm * 0.7;
  const margin = unitsPerEm * 0.15;
  const yBottom = descender + (ascender - descender - size) / 2;
  const xLeft = margin;
  const box = polygonPath([
    [xLeft, yBottom],
    [xLeft + size, yBottom],
    [xLeft + size, yBottom + size],
    [xLeft, yBottom + size],
  ]);
  return new opentype.Glyph({
    name: ".notdef",
    unicode: 0,
    advanceWidth: unitsPerEm * 0.6,
    path: box,
  });
}

/** U+E000: solid dash centered on baseline */
export function makeDashGlyph({
  unicode = 0xe000,
  dashLength,
  strokeWidth,
  gapAfterDash,
}) {
  const halfH = strokeWidth / 2;
  const rect = polygonPath([
    [0, -halfH],
    [dashLength, -halfH],
    [dashLength, +halfH],
    [0, +halfH],
  ]);
  return new opentype.Glyph({
    name: "pua_dash",
    unicode,
    advanceWidth: dashLength + gapAfterDash,
    path: rect,
  });
}

/** U+E001: single-stroke chevron (6-point polygon outline with mitered tip) */
export function makeChevronGlyph({
  unicode = 0xe001,
  triangleSize, // S along baseline to tip
  angleDeg, // 45 for your case
  strokeWidth,
  gapAfterDash,
}) {
  const path = chevronStrokePath({ triangleSize, angleDeg, strokeWidth });

  // Advance width: align back edge at x=0, tip near x=S, plus a little following gap
  return new opentype.Glyph({
    name: `pua_chevron_${angleDeg}`,
    unicode,
    advanceWidth: triangleSize + gapAfterDash,
    path,
  });
}
