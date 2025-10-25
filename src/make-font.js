// make-font.mjs
// Build a font with a dash (U+E000) and a single-stroke 45° chevron (U+E001).
// Usage: node make-font.mjs
// Deps:  npm i opentype.js
// Ensure package.json has: { "type": "module" }  OR name this file .mjs

import fs from "node:fs";
import opentype from "opentype.js";
import { makeNotdefGlyph, makeDashGlyph, makeChevronGlyph } from "./glyphs.js";

/* ===== tweakable parameters ===== */
const params = {
  fontFamily: "ArrowFont",
  styleName: "Regular",

  // Font metrics
  unitsPerEm: 1000,
  ascender: 800,
  descender: -200,

  // Visual geometry
  dashLength: 420, // dash body length
  strokeWidth: 75, // thickness used for both dash and chevron "stroke"
  gapAfterDash: 80, // spacing after dash

  triangleSize: 300, // S: baseline distance from back (x=0) to tip (x=S)
  angleDeg: 45, // chevron side angles relative to baseline

  // Output
  outputPath: "./src/arrow-font.otf",
};
/* ================================= */

const glyphs = [
  makeNotdefGlyph(params),
  makeDashGlyph(params), // U+E000
  makeChevronGlyph(params), // U+E001 (single-stroke chevron, 6-point polygon)
];

const font = new opentype.Font({
  familyName: params.fontFamily,
  styleName: params.styleName,
  unitsPerEm: params.unitsPerEm,
  ascender: params.ascender,
  descender: params.descender,
  glyphs,
});

const buffer = Buffer.from(font.toArrayBuffer());
fs.writeFileSync(params.outputPath, buffer);

console.log(`Wrote ${params.outputPath}
codepoints:
  U+E000  dash (stroke ${params.strokeWidth})
  U+E001  chevron '>' single-stroke at ${params.angleDeg}° (stroke ${params.strokeWidth})
`);
