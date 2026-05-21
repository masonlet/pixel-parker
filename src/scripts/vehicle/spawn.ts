import type { Vehicle, VehicleType } from "./types.ts";
import type { Level                } from "../level/types.ts";
import { createVehicle             } from "./render.ts";

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
