import type { Vehicle, VehicleType } from "./types.ts";
import type { Level                } from "../level/types.ts";
import { createBody                } from "web-engine/physics/body.ts";

function createVehicle(
  type: VehicleType,
  x: number,
  y: number,
  hue: number
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
    hue,
    overlappingSensors: []
  };
}

export function spawnVehicles(
  level: Level,
  vehicleTypes: Record<string, VehicleType>,
): Vehicle[] {
  return level.vehicles.map((lv, i) => {
    const type = vehicleTypes[lv.type];
    if (!type) throw new Error(`Level: unknown vehicle type "${lv.type}"`);
    return createVehicle(type, lv.x, lv.y, i * 60);
  });
}
