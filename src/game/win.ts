import type { Vehicle } from "./vehicle/types.ts";
import type { Sensor, Level } from "./level/types.ts";
import { obbInsideAabb } from "../engine/physics/overlap.ts";
import { vehicleObb } from "./physics/sensors.ts";

export const DEFAULT_PARK_PADDING = 8;
export const STOPPED_THRESHOLD = 5;

export function isParkedIn(v: Vehicle, spot: Sensor): boolean {
  if (spot.kind !== "parking_spot") return false;

  const padding = spot.padding ?? DEFAULT_PARK_PADDING;
  const aabb = { x: spot.x, y: spot.y, w: spot.w, h: spot.h };
  if (!obbInsideAabb(vehicleObb(v), aabb, padding)) return false;

  const speed = Math.hypot(v.body.velocity.x, v.body.velocity.y);
  return speed < STOPPED_THRESHOLD;
}

export function checkLevelWon(level: Level, vehicles: Vehicle[]): boolean {
  const targetedSpots = level.sensors.filter(
    s => s.kind === "parking_spot" && s.vehicle,
  );
  if (targetedSpots.length === 0) return false;

  for (const s of targetedSpots) {
    const target = vehicles.find(v => v.type.name === s.vehicle);
    if (!target || !isParkedIn(target, s)) return false;
  }
  return true;
}
