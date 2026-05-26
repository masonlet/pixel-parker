import { obbInsideAabb      } from "web-engine/physics/overlap.ts";
import type { Sensor, Level } from "../level/types.ts";
import type { Vehicle       } from "../vehicle/types.ts";
import { vehicleObb         } from "../physics/sensors.ts";

export const DEFAULT_PARK_PADDING = 8;
export const STOPPED_THRESHOLD = 5;

export function isParkedIn(v: Vehicle, spot: Sensor): boolean {
  if (spot.kind !== "parking_spot") return false;

  const padding = spot.padding ?? DEFAULT_PARK_PADDING;
  const aabb = { cx: spot.x + spot.w / 2, cy: spot.y + spot.h / 2, hw: spot.w / 2, hh: spot.h / 2 };
  if (!obbInsideAabb(vehicleObb(v), aabb, padding)) return false;

  const speed = Math.hypot(v.body.velocity.x, v.body.velocity.y);
  return speed < STOPPED_THRESHOLD;
}

export function checkLevelWon(level: Level, vehicles: Vehicle[]): boolean {
  const spots = level.sensors.filter(s => s.kind === "parking_spot");
  if (spots.length === 0) return false;

  for (const v of vehicles) {
    const validSpots = spots.filter(s => !s.vehicle || s.vehicle === v.type.name);
    if (!validSpots.some(s => isParkedIn(v, s))) return false;
  }
  return true;
}
