import type { CircleBody                } from "@starweb-libs/physics/types.js";
import type { TweenManager, TweenTarget } from "@starweb-libs/tween/types.js";
import type { SliderState               } from "@starweb-libs/ui/types.js";
import type { Level, Sensor             } from "../level/types.ts";
import type { Vehicle, VehicleType      } from "../vehicle/types.ts";
import type {
  TitleMenuState,
  SettingsMenuState,
  LevelSelectState,
  PauseMenuState,
  CompleteMenuState,
  FailedMenuState
} from "../ui/types.ts";

export interface PlayState {
  volState:         SliderState;
  levels:           Level[];
  levelIndex:       number;
  vehicleTypes:     Record<string, VehicleType>;
  vehicles:         Vehicle[];
  vehicleIndex:     number;
  cones:            CircleBody[];
  health:           number;
  debugMode:        boolean;
  tweenManager:     TweenManager;
  sensorAlphas:     Map<Sensor,TweenTarget>;
  parkedSensors:    Set<Sensor>;
  parkConfirmTimer: number;
}

export type PlayResult = "playing" | "won" | "failed";

export type FrameState = | { game: "menu-title";     ui: TitleMenuState    | null }
                         | { game: "menu-settings";  ui: SettingsMenuState | null }
                         | { game: "menu-levels";    ui: LevelSelectState  | null }
                         | { game: "level-playing";  ui: null                     }
                         | { game: "level-paused";   ui: PauseMenuState    | null }
                         | { game: "level-complete"; ui: CompleteMenuState | null }
                         | { game: "level-failed";   ui: FailedMenuState   | null }
