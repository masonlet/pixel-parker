import type { Vec2, OBB, AABB } from "./types.ts";

export function obbCorners(o: OBB): Vec2[] {
  const cos = Math.cos(o.angle);
  const sin = Math.sin(o.angle);
  const ux = { x: cos, y: sin };
  const uy = { x: -sin, y: cos };
  return [
    { x: o.cx + ux.x * o.hw + uy.x * o.hh, y: o.cy + ux.y * o.hw + uy.y * o.hh },
    { x: o.cx - ux.x * o.hw + uy.x * o.hh, y: o.cy - ux.y * o.hw + uy.y * o.hh },
    { x: o.cx - ux.x * o.hw - uy.x * o.hh, y: o.cy - ux.y * o.hw - uy.y * o.hh },
    { x: o.cx + ux.x * o.hw - uy.x * o.hh, y: o.cy + ux.y * o.hw - uy.y * o.hh },
  ];
}

export function aabbCorners(a: AABB): Vec2[] {
  return [
    { x: a.x,         y: a.y },
    { x: a.x + a.w,   y: a.y },
    { x: a.x + a.w,   y: a.y + a.h },
    { x: a.x,         y: a.y + a.h },
  ];
}

export function project(corners: Vec2[], axis: Vec2): [number, number] {
  let min = Infinity, max = -Infinity;
  for (const c of corners) {
    const p = c.x * axis.x + c.y * axis.y;
    if (p < min) min = p;
    if (p > max) max = p;
  }
  return [min, max];
}
