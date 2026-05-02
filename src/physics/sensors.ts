import type { Sensor } from "../level/types.ts";
import type { Level } from "../level/types.ts";
import type { Vehicle } from "../vehicle/types.ts";
import { obbVsAabb } from "./collision.ts";
import type { OBB, AABB } from "./types.ts";

function vehicleObb(v: Vehicle): OBB {
  return {
    cx: v.body.position.x,
    cy: v.body.position.y,
    hw: v.body.w / 2,
    hh: v.body.h / 2,
    angle: v.body.angle,
  };
}

export function sensorsOverlapping(v: Vehicle, level: Level): Sensor[] {
  const obb = vehicleObb(v);
  const hits: Sensor[] = [];
  for (const s of level.sensors) {
    const aabb: AABB = { x: s.x, y: s.y, w: s.w, h: s.h };
    if (obbVsAabb(obb, aabb)) hits.push(s);
  }
  return hits;
}
