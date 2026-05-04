import { loadImage } from "../../engine/assets.ts";
import type { VehicleType, VehicleStats } from "./types.ts";
import { isObj, num, str, makeCollector } from "../utils/validate.ts";

import car from "../../assets/vehicles/car.json";
import truck from "../../assets/vehicles/truck.json";

function parseVehicleStats(data: unknown): VehicleStats {
  if (!isObj(data)) throw new Error("vehicle stats must be an object");
  const name = str(data, "name", "vehicle");
  const ctx = `vehicle ${name}`;

  const { errors, tryGet } = makeCollector();

  const stats = {
    name,
    spritePath: tryGet(() => str(data, "spritePath", ctx)),
    bodySpritePath: tryGet(() => str(data, "bodySpritePath", ctx)),
    w: tryGet(() => num(data, "w", ctx)),
    h: tryGet(() => num(data, "h", ctx)),
    turnSpeed: tryGet(() => num(data, "turnSpeed", ctx)),
    maxSpeed: tryGet(() => num(data, "maxSpeed", ctx)),
    maxReverseSpeed: tryGet(() => num(data, "maxReverseSpeed", ctx)),
    accel: tryGet(() => num(data, "accel", ctx)),
    friction: tryGet(() => num(data, "friction", ctx)),
    brakeForce: tryGet(() => num(data, "brakeForce", ctx)),
    gearShiftDelay: tryGet(() => num(data, "gearShiftDelay", ctx)),
    mass: tryGet(() => num(data, "mass", ctx)),
  }

  if (errors.length) throw new Error(
    `${ctx} failed validation:\n  ${errors.join("\n  ")}`
  );
  return stats as VehicleStats;
}

export const carStats = parseVehicleStats(car);
export const truckStats = parseVehicleStats(truck);

export async function loadVehicleType(stats: VehicleStats): Promise<VehicleType> {
  const [sprite, bodySprite] = await Promise.all([
    loadImage(`${import.meta.env.BASE_URL}${stats.spritePath}`),
    loadImage(`${import.meta.env.BASE_URL}${stats.bodySpritePath}`),
  ]);
  return { ...stats, sprite, bodySprite };
}
