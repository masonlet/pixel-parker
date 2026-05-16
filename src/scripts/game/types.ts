import type { Level } from "../level/types.ts";
import type { Vehicle, VehicleType } from "../vehicle/types.ts";

export interface PlayState {
  levels: Level[];
  levelIndex: number;
  level: Level;
  vehicleTypes: Record<string, VehicleType>;
  vehicles: Vehicle[];
  vehicleIndex: number;
  debugMode: boolean;
}

export type GameState = "menu-title"
                      | "menu-settings"
                      | "menu-levels"
                      | "level-playing"
                      | "level-paused"
                      | "level-won";
