import { loadImage } from "../../engine/assets.ts";
import type { VehicleType, VehicleStats } from "./types.ts";

import car from "../../assets/vehicles/car.json";
import truck from "../../assets/vehicles/truck.json";

function num(obj: Record<string, unknown>, key: string, name: string): number {
  const v = obj[key];
  if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(
    `vehicle ${name}: ${key} must be a finite number`
  );
  return v;
}

function parseVehicleStats(data: unknown): VehicleStats {
  if (!data || typeof data !== "object") throw new Error("vehicle stats must be an object");
  const obj = data as Record<string, unknown>;
  const name = obj['name'];
  if (typeof name !== "string" || name.length === 0) throw new Error(
    "vehicle: name must be a non-empty string"
  );
  return {
    name,
    w: num(obj, "w", name),
    h: num(obj, "h", name),
    turnSpeed: num(obj, "turnSpeed", name),
    maxSpeed: num(obj, "maxSpeed", name),
    maxReverseSpeed: num(obj, "maxReverseSpeed", name),
    accel: num(obj, "accel", name),
    friction: num(obj, "friction", name),
    brakeForce: num(obj, "brakeForce", name),
    gearShiftDelay: num(obj, "gearShiftDelay", name),
    mass: num(obj, "mass", name),
  };
}

export const carStats = parseVehicleStats(car);
export const truckStats = parseVehicleStats(truck);

export async function loadVehicleType(stats: VehicleStats): Promise<VehicleType> {
  const [sprite, bodySprite] = await Promise.all([
    loadImage(`${import.meta.env.BASE_URL}img/vehicles/${stats.name}.png`),
    loadImage(`${import.meta.env.BASE_URL}img/vehicles/${stats.name}-body.png`),
  ]);
  return { ...stats, sprite, bodySprite };
}
