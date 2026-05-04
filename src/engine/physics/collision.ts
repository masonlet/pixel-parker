import type { Vec2, OBB, AABB, MTV } from "./types.ts";
import { obbCorners, aabbCorners, project } from "./geometry.ts";

export function obbVsAabb(obb: OBB, aabb: AABB): MTV | null {
  const cos = Math.cos(obb.angle);
  const sin = Math.sin(obb.angle);
  const ux: Vec2 = { x: cos, y: sin };
  const uy: Vec2 = { x: -sin, y: cos };
  const wx: Vec2 = { x: 1, y: 0 };
  const wy: Vec2 = { x: 0, y: 1 };

  const obbCs = obbCorners(obb);
  const aabbCs = aabbCorners(aabb);
  const axes: Vec2[] = [ux, uy, wx, wy];

  let minDepth = Infinity;
  let minAxis: Vec2 = { x: 0, y: 0 };

 for (const axis of axes) {
    const [aMin, aMax] = project(obbCs, axis);
    const [bMin, bMax] = project(aabbCs, axis);
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

export function obbVsObb(a: OBB, b: OBB): MTV | null {
  const aCos = Math.cos(a.angle), aSin = Math.sin(a.angle);
  const bCos = Math.cos(b.angle), bSin = Math.sin(b.angle);
  const aux: Vec2 = { x: aCos, y: aSin };
  const auy: Vec2 = { x: -aSin, y: aCos };
  const bux: Vec2 = { x: bCos, y: bSin };
  const buy: Vec2 = { x: -bSin, y: bCos };

  const aCorners = obbCorners(a);
  const bCorners = obbCorners(b);
  const axes: Vec2[] = [aux, auy, bux, buy];

  let minDepth = Infinity;
  let minAxis: Vec2 = { x: 0, y: 0 };

  for (const axis of axes) {
    const [aMin, aMax] = project(aCorners, axis);
    const [bMin, bMax] = project(bCorners, axis);
    const overlap = Math.min(aMax, bMax) - Math.max(aMin, bMin);
    if (overlap <= 0) return null;

    if (overlap < minDepth) {
      minDepth = overlap;
      const dir = (a.cx - b.cx) * axis.x + (a.cy - b.cy) * axis.y;
      minAxis = dir < 0 ? { x: -axis.x, y: -axis.y } : axis;
    }
  }
  return { axis: minAxis, depth: minDepth };
}
