import { TILE, TILE_SIZE, type Level, type TileId } from "./types.ts";

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isTileName(x: unknown): x is keyof typeof TILE {
  return typeof x === "string" && x in TILE;
}

export function loadLevel(rawLevel: unknown): Level {
  if (!isObj(rawLevel)) throw new Error("Level: not an object");

  const { width, height, fill, rects, spawns } = rawLevel;

  if (typeof width !== "number" || width <= 0)   throw new Error("Level: invalid width");
  if (typeof height !== "number" || height <= 0) throw new Error("Level: invalid height");
  if (!isTileName(fill))      throw new Error(`Level: invalid fill "${fill}"`);
  if (!Array.isArray(rects))  throw new Error("Level: rects must be an array");
  if (!Array.isArray(spawns)) throw new Error("Level: spawns must be an array");

  const tiles: TileId[] = new Array(width * height).fill(TILE[fill]);

  for (const [i, rect] of rects.entries()) {
    if (!isObj(rect)) throw new Error(`Level: rect ${i} not an object`);

    const { x, y, w, h, tile } = rect;
    if (typeof x !== "number" || typeof y !== "number" ||
        typeof w !== "number" || typeof h !== "number"
    ) throw new Error(`Level: rect ${i} has non-number x/y/w/h`);

    if (!isTileName(tile)) throw new Error(`Level: rect ${i} invalid tile "${tile}"`);

    const tileId = TILE[tile];
    for (let ty = y; ty < y + h; ty++) {
      for (let tx = x; tx < x + w; tx++) {
        if (tx < 0 || ty < 0 || tx >= width || ty >= height) continue;
        tiles[ty * width + tx] = tileId;
      }
    }
  }

  const parsedSpawns = spawns.map((s, i) => {
    if (!isObj(s) || typeof s['x'] !== "number" || typeof s['y'] !== "number")
      throw new Error(`Level: spawn ${i} invalid`);

    return { x: s['x'] * TILE_SIZE, y: s['y'] * TILE_SIZE };
  });

  return { width, height, tiles, spawns: parsedSpawns };
}
