export interface VehicleFlags {
  /** Whether this vehicle takes and deals collision damage. */
  damageable: boolean;
  /** Whether this vehicle responds to physics and input. */
  driveable:  boolean;
  /** Whether this vehicle can be switched to. */
  selectable: boolean;
}

export interface LevelVehicle extends VehicleFlags {
  type: string;
  /** Center x in world pixels. */
  x:    number;
  /** Center y in world pixels. */
  y:    number;
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
