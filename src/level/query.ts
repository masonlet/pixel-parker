import { type Level, type TileId, TILE } from "./types.ts";

export function getTile(level: Level, x: number, y: number): TileId {
  if (x < 0 || y < 0 || x >= level.width || y >= level.height) return TILE.EMPTY;
  return level.tiles[y * level.width + x] ?? TILE.EMPTY;
}
