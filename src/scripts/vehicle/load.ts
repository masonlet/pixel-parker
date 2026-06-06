import { loadImage } from "starweb-engine/assets.js";
import type { VehicleType, VehicleStats         } from "./types.ts";
import { isObj, num, str, optStr, makeCollector } from "../utils/validate.ts";

export function parseVehicleStats(data: unknown): VehicleStats {
  if (!isObj(data)) throw new Error("vehicle stats must be an object");
  const name = str(data, "name", "vehicle");
  const ctx = `vehicle ${name}`;

  const { errors, tryGet } = makeCollector();

  const stats = {
    name,
    spritePath:      tryGet(() => str(data, "spritePath",      ctx)),
    bodySpritePath:  tryGet(() => str(data, "bodySpritePath",  ctx)),
    colour:          tryGet(() => optStr(data, "colour",       ctx)),
    mass:            tryGet(() => num(data, "mass",            ctx)),
    w:               tryGet(() => num(data, "w",               ctx)),
    h:               tryGet(() => num(data, "h",               ctx)),
    // s -> ms
    gearShiftDelay:  tryGet(() => num(data, "gearShiftDelay",  ctx) * 1000),
    // px/s^2 -> px/ms^2
    accel:           tryGet(() => num(data, "accel",           ctx) / 1_000_000),
    friction:        tryGet(() => num(data, "friction",        ctx) / 1_000_000),
    brakeForce:      tryGet(() => num(data, "brakeForce",      ctx) / 1_000_000),
    // px/s -> px/ms
    maxSpeed:        tryGet(() => num(data, "maxSpeed",        ctx) / 1000),
    maxReverseSpeed: tryGet(() => num(data, "maxReverseSpeed", ctx) / 1000),
    // rad/s -> rad/ms
    turnSpeed:       tryGet(() => num(data, "turnSpeed",       ctx) / 1000),
  }

  if (errors.length) throw new Error(
    `${ctx} failed validation:\n  ${errors.join("\n  ")}`
  );
  return stats as VehicleStats;
}

export async function loadVehicleType(stats: VehicleStats): Promise<VehicleType> {
  const [sprite, bodySprite] = await Promise.all([
    loadImage(`${import.meta.env.BASE_URL}${stats.spritePath}`),
    loadImage(`${import.meta.env.BASE_URL}${stats.bodySpritePath}`),
  ]);
  return { ...stats, sprite, bodySprite };
}
