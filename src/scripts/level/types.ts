export interface LevelVehicle {
  type: string;
  /** Center x in world pixels. */
  x:    number;
  /** Center y in world pixels. */
  y:    number;
  /** Flag to disable/enable this vehicles damage output. */
  damageable: boolean;
  /** Flag to disable/enable driving this vehicle. */
  driveable:  boolean;
  /** Flag to disable/enable switching to this vehicle. */
  selectable: boolean;
}

export interface LevelCone {
  /** Center x in world pixels. */
  x: number;
  /** Center y in world pixels. */
  y: number;
}

export interface Level {
  name?:    string;
  width:    number;
  height:   number;
  tiles:    TileId[];
  vehicles: LevelVehicle[];
  sensors:  Sensor[];
  cones:    LevelCone[];
}

export const TILE_SIZE = 32;

export type TileId = number;

export const TILE = {
  EMPTY: 0,
  WALL: 1,
} as const;

export const SENSOR_KINDS = ["parking_spot", "stop_sign"] as const;
export type SensorKind = (typeof SENSOR_KINDS)[number];

export interface Sensor {
  kind: SensorKind;
  /** Top-left x in world pixels. */
  x:    number;
  /** Top-left y in world pixels. */
  y:    number;
  /** Width in world pixels. */
  w:    number;
  /** Height in world pixels. */
  h:    number;
  /** Optional: restrict this sensor to a specific vehicle name. */
  vehicle?: string;
  /** Optional: require vehicle to be a certain distance from sides of sensor. */
  padding?: number;
  /** Optional: colour of the sensors overlay. Omit to render no overlay. */
  colour?:  string;
}
