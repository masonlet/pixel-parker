import {
  TILE,
  TILE_SIZE,
  type Level
} from "../level/types.ts";

const w = 40;
const h = 30;

export const test1: Level = {
  width: w,
  height: h,
  tiles: Array.from({ length: w * h }, (_, i) => {
    const x = i % w;
    const y = Math.floor(i / w);
    const isBorder = x === 0 || y === 0 || x === w - 1 || y === h - 1;
    return isBorder ? TILE.WALL : TILE.EMPTY;
  }),
  spawns: [
    { x: ((w / 2) - 2.5) * TILE_SIZE, y: (h / 2) * TILE_SIZE },
    { x: ((w / 2) + 2.5) * TILE_SIZE, y: (h / 2) * TILE_SIZE },
  ],
}
