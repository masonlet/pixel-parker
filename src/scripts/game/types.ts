import type { TweenManager, TweenTarget } from "web-engine/tween/types.ts";
import type { Level, Sensor        } from "../level/types.ts";
import type { Vehicle, VehicleType } from "../vehicle/types.ts";
import type {
  TitleMenuState,
  SettingsMenuState,
  LevelSelectState,
  PauseMenuState,
  WonMenuState
} from "../ui/types.ts";

export interface PlayState {
  levels: Level[];
  levelIndex: number;
  level: Level;
  vehicleTypes: Record<string, VehicleType>;
  vehicles: Vehicle[];
  vehicleIndex: number;
  debugMode: boolean;
  tweenManager: TweenManager;
  sensorAlphas: Map<Sensor,TweenTarget>;
  parkedSensors: Set<Sensor>;
}

export type FrameState = | { game: "menu-title";    ui: TitleMenuState    | null }
                         | { game: "menu-settings"; ui: SettingsMenuState | null }
                         | { game: "menu-levels";   ui: LevelSelectState  | null }
                         | { game: "level-playing"; ui: null                     }
                         | { game: "level-paused";  ui: PauseMenuState    | null }
                         | { game: "level-won";     ui: WonMenuState      | null }
