import {
  TILE,
  TILE_SIZE,
  type Level
} from "../level.ts";

const w = 40;
const h = 40;

export const test3: Level = {
  width: w,
  height: h,
  tiles: Array.from({ length: w * h }, (_, i) => {
    const x = i % w;
    const y = Math.floor(i / w);

    const isBorder = x === 0 || y === 0 || x === w - 1 || y === h - 1;

    const isPocketBottom = y === 14 && x >= 7 && x <= 14;
    const isPocketLeft = x === 7 && y >= 8 && y <= 14;
    const isPocketRight = x === 14 && y >= 8 && y <= 14;

    const isCorridorTop = y === 19 && x >= 17 && x <= 30;
    const isCorridorBottom = y === 24 && x >= 17 && x <= 30;

    const isPillar = x === 27 && y === 29;

    return (
      isBorder ||
      isPocketBottom || isPocketLeft || isPocketRight ||
      isCorridorTop || isCorridorBottom ||
      isPillar
    ) ? TILE.WALL : TILE.EMPTY;
  }),
  spawns: [
    { x: 20 * TILE_SIZE, y: 30 * TILE_SIZE },
    { x: 23 * TILE_SIZE, y: 30 * TILE_SIZE },
  ],
}
