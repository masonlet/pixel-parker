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

export function drawLevel(
  ctx: CanvasRenderingContext2D,
  level: Level,
  camX: number,
  camY: number,
): void {
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const id = getTile(level, x, y);
      ctx.fillStyle = id === TILE.WALL
        ? "#444"
        : (x + y) % 2 === 0 ? "#222" : "#262626";
      ctx.fillRect(
        Math.floor(x * TILE_SIZE - camX),
        Math.floor(y * TILE_SIZE - camY),
        TILE_SIZE + 1, // +1 prevents gaps between adjacent tiles
        TILE_SIZE + 1, // +1 prevents gaps between adjacent tiles
      );
    }
  }
}
