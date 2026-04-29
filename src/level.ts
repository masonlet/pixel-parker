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
}

export function getTile(level: Level, x: number, y: number): TileId {
  return level.tiles[y * level.width + x] ?? TILE.EMPTY;
}

export function drawLevel(ctx: CanvasRenderingContext2D, level: Level): void {
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const id = getTile(level, x, y);
      ctx.fillStyle = id === TILE.WALL ? "#444" : "#222";
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
}
