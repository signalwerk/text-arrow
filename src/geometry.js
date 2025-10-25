// src/geometry.js
import opentype from "opentype.js";

/** Build a closed polygon opentype.Path from [[x,y], ...] */
export function polygonPath(points) {
  const p = new opentype.Path();
  if (!points.length) return p;
  p.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) p.lineTo(points[i][0], points[i][1]);
  p.close();
  return p;
}

/** Normalize vector */
function norm([x, y]) {
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
}

/** Left normal (rotate by +90°) of a vector */
function leftNormal([x, y]) {
  return norm([-y, x]);
}

/** Intersection of two infinite lines: p1 + t*v1 and p2 + s*v2 */
function intersect(p1, v1, p2, v2) {
  const [x1, y1] = p1,
    [vx1, vy1] = v1;
  const [x2, y2] = p2,
    [vx2, vy2] = v2;
  const det = vx1 * vy2 - vy1 * vx2;
  if (Math.abs(det) < 1e-6) {
    // Nearly parallel—fallback to the joint point p1 as a safe default.
    return p1;
  }
  const t = ((x2 - x1) * vy2 - (y2 - y1) * vx2) / det;
  return [x1 + t * vx1, y1 + t * vy1];
}

/**
 * Create a single closed polygon (6 points) that outlines a V-shaped "chevron"
 * centerline with uniform stroke width and a mitered tip.
 *
 * Centerline points (in order):
 *   c0 = (0, +H)   -> c1 = (S, 0) -> c2 = (0, -H)
 * where H = tan(angle) * S (45° => H = S).
 *
 * The polygon points are ordered clockwise:
 *   [capTop_L, tip_miter_L, capBot_L, capBot_R, tip_miter_R, capTop_R]
 */
export function chevronStrokePolygon({
  triangleSize: S,
  angleDeg,
  strokeWidth,
}) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const H = Math.tan(angleRad) * S;
  const h = strokeWidth / 2;

  // Centerline points
  const c0 = [0, +H];
  const c1 = [S, 0];
  const c2 = [0, -H];

  // Segment directions and left normals
  const v01 = [c1[0] - c0[0], c1[1] - c0[1]];
  const v12 = [c2[0] - c1[0], c2[1] - c1[1]];
  const n01 = leftNormal(v01); // unit
  const n12 = leftNormal(v12); // unit

  // Butt caps at the back ends using the segment's normal
  const capTop_L = [c0[0] + n01[0] * h, c0[1] + n01[1] * h];
  const capTop_R = [c0[0] - n01[0] * h, c0[1] - n01[1] * h];
  const capBot_L = [c2[0] + n12[0] * h, c2[1] + n12[1] * h];
  const capBot_R = [c2[0] - n12[0] * h, c2[1] - n12[1] * h];

  // Build the two offset lines (same side) and intersect for miter points at the tip
  // Left side miter: offset both segments by +h along their left normals
  const tip_miter_L = intersect(
    [c0[0] + n01[0] * h, c0[1] + n01[1] * h],
    v01,
    [c1[0] + n12[0] * h, c1[1] + n12[1] * h],
    v12,
  );
  // Right side miter: offset both segments by -h along their left normals
  const tip_miter_R = intersect(
    [c0[0] - n01[0] * h, c0[1] - n01[1] * h],
    v01,
    [c1[0] - n12[0] * h, c1[1] - n12[1] * h],
    v12,
  );

  // Clockwise polygon: 6 points
  return [capTop_L, tip_miter_L, capBot_L, capBot_R, tip_miter_R, capTop_R];
}

/** Convenience: convert chevron polygon to an opentype.Path */
export function chevronStrokePath(opts) {
  const pts = chevronStrokePolygon(opts);
  return polygonPath(pts);
}
