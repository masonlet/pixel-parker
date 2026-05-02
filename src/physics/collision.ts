import type { Vec2, OBB, AABB, MTV } from "./types.ts";

export function obbVsAabb(obb: OBB, aabb: AABB): MTV | null {
  const cos = Math.cos(obb.angle);
  const sin = Math.sin(obb.angle);
  const ux: Vec2 = { x: cos, y: sin };
  const uy: Vec2 = { x: -sin, y: cos };

  const obbCorners: Vec2[] = [
    { x: obb.cx + ux.x * obb.hw + uy.x * obb.hh, y: obb.cy + ux.y * obb.hw + uy.y * obb.hh },
    { x: obb.cx - ux.x * obb.hw + uy.x * obb.hh, y: obb.cy - ux.y * obb.hw + uy.y * obb.hh },
    { x: obb.cx - ux.x * obb.hw - uy.x * obb.hh, y: obb.cy - ux.y * obb.hw - uy.y * obb.hh },
    { x: obb.cx + ux.x * obb.hw - uy.x * obb.hh, y: obb.cy + ux.y * obb.hw - uy.y * obb.hh },
  ];
  const aabbCorners: Vec2[] = [
    { x: aabb.x,          y: aabb.y },
    { x: aabb.x + aabb.w, y: aabb.y },
    { x: aabb.x + aabb.w, y: aabb.y + aabb.h },
    { x: aabb.x,          y: aabb.y + aabb.h },
  ];

  const axes: Vec2[] = [ux, uy, { x: 1, y: 0 }, { x: 0, y: 1 }];

  let minDepth = Infinity;
  let minAxis: Vec2 = { x: 0, y: 0 };

  for (const axis of axes) {
    let aMin = Infinity, aMax = -Infinity;
    for (const c of obbCorners) {
      const p = c.x * axis.x + c.y * axis.y;
      if (p < aMin) aMin = p;
      if (p > aMax) aMax = p;
    }
    let bMin = Infinity, bMax = -Infinity;
    for (const c of aabbCorners) {
      const p = c.x * axis.x + c.y * axis.y;
      if (p < bMin) bMin = p;
      if (p > bMax) bMax = p;
    }
    const overlap = Math.min(aMax, bMax) - Math.max(aMin, bMin);
    if (overlap <= 0) return null;

    if (overlap < minDepth) {
      minDepth = overlap;
      const aabbCx = aabb.x + aabb.w / 2;
      const aabbCy = aabb.y + aabb.h / 2;
      const dir = (obb.cx - aabbCx) * axis.x + (obb.cy - aabbCy) * axis.y;
      minAxis = dir < 0 ? { x: -axis.x, y: -axis.y } : axis;
    }
  }
  return { axis: minAxis, depth: minDepth };
}
