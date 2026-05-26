import type { OBB, AABB     } from "web-engine/physics/types.ts";
import { overlappingRegions } from "web-engine/physics/overlap.ts";
import type { Sensor, Level } from "../level/types.ts";
import type { Vehicle       } from "../vehicle/types.ts";

export function vehicleObb(v: Vehicle): OBB {
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
  const aabbs: AABB[] = level.sensors.map(s => ({
    cx: s.x + s.w / 2, cy: s.y + s.h / 2, hw: s.w / 2, hh: s.h / 2
  }));
  const hits = new Set(overlappingRegions(obb, aabbs));
  return level.sensors.filter((_, i) => hits.has(aabbs[i]!));
}
