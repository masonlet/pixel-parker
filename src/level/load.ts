import { TILE, TILE_SIZE, type Level, type TileId } from "./types.ts";

interface RawRect {
  x: number;
  y: number;
  w: number;
  h: number;
  tile: keyof typeof TILE;
}

interface RawSpawn {
  x: number;
  y: number;
}

interface RawLevel {
  width: number;
  height: number;
  fill: keyof typeof TILE;
  rects: RawRect[];
  spawns: RawSpawn[];
}

export function loadLevel(raw: RawLevel): Level {
  const tiles: TileId[] = new Array(raw.width * raw.height).fill(TILE[raw.fill]);

  for (const rect of raw.rects) {
    const tileId = TILE[rect.tile];
    for (let y = rect.y; y < rect.y + rect.h; y++){
      for (let x = rect.x; x < rect.x + rect.w; x++){
        if (x < 0 || y < 0 || x >= raw.width || y >= raw.height) continue;
        tiles[y * raw.width + x] = tileId;
      }
    }
  }

  return {
    width: raw.width,
    height: raw.height,
    tiles,
    spawns: raw.spawns.map(s => ({ x: s.x * TILE_SIZE, y: s.y * TILE_SIZE })),
  }
}
