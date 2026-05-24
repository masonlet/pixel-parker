import type { Vehicle, VehicleType } from "./types.ts";
import type { Level                } from "../level/types.ts";
import { createBody                } from "web-engine/physics/body.ts";
import { tintImage } from "web-engine/assets.ts";

function randomColour(): string {
  return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
}

function createVehicle(
  type: VehicleType,
  x: number,
  y: number,
  colour: string
): Vehicle {
  return {
    type,
    body: createBody({
      x,
      y,
      w: type.w,
      h: type.h,
      mass: type.mass,
      angle: -Math.PI / 2,
    }),
    throttle: 0,
    steer: 0,
    shiftTimer: 0,
    colour,
    tint: tintImage(type.bodySprite, colour),
    overlappingSensors: []
  };
}

export function spawnVehicles(
  level: Level,
  vehicleTypes: Record<string, VehicleType>,
): Vehicle[] {
  return level.vehicles.map((lv) => {
    const type = vehicleTypes[lv.type];
    if (!type) throw new Error(`Level: unknown vehicle type "${lv.type}"`);
    return createVehicle(type, lv.x, lv.y, type.colour ?? randomColour());
  });
}
