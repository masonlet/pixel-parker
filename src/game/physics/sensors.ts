import type { OBB, AABB } from "../../engine/physics/types.ts";
import { overlappingRegions } from "../../engine/physics/overlap.ts";

import type { Sensor, Level } from "../level/types.ts";
import type { Vehicle } from "../vehicle/types.ts";

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
  const aabbs: AABB[] = level.sensors.map(s => ({ x: s.x, y: s.y, w: s.w, h: s.h }));
  const hits = overlappingRegions(obb, aabbs);
  return hits.map(hit => level.sensors[aabbs.indexOf(hit)]!);
}
