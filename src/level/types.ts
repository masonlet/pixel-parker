export const TILE_SIZE = 32;

export type TileId = number;

export const TILE = {
  EMPTY: 0,
  WALL: 1,
} as const;

export interface Level {
  width: number;
  height: number;
  tiles: TileId[];
  spawns: Array<{ x: number; y: number }>;
}
