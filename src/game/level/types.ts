export interface Level {
  width: number;
  height: number;
  tiles: TileId[];
  spawns: Array<{ x: number; y: number }>;
  sensors: Sensor[];
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
  x: number;
  /** Top-left y in world pixels. */
  y: number;
  /** Width in world pixels. */
  w: number;
  /** Height in world pixels. */
  h: number;
}
