import type { OBB, AABB     } from "starweb-physics/types.js";
import { overlappingRegions } from "starweb-physics/overlap.js";
import type { Sensor, Level } from "../level/types.ts";
import type { Vehicle       } from "../vehicle/types.ts";
import { vehicleObb         } from "../vehicle/physics.ts";

export function sensorsOverlapping(v: Vehicle, level: Level): Sensor[] {
  const obb = vehicleObb(v);
  const aabbs: AABB[] = level.sensors.map(s => ({
    cx: s.x + s.w / 2, cy: s.y + s.h / 2, hw: s.w / 2, hh: s.h / 2
  }));
  const hits = new Set(overlappingRegions(obb, aabbs));
  return level.sensors.filter((_, i) => hits.has(aabbs[i]!));
}
