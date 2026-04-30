import {
  TILE,
  TILE_SIZE,
  type Level
} from "../level.ts";

const w = 20;
const h = 30;

export const test2: Level = {
  width: w,
  height: h,
  tiles: Array.from({ length: w * h }, (_, i) => {
    const x = i % w;
    const y = Math.floor(i / w);
    const isBorder = x === 0 || y === 0 || x === w - 1 || y === h - 1;
    const isInteriorWall = x >= 5 && x <= 8 && y >= 5 && y <= 6;
    return (isBorder || isInteriorWall) ? TILE.WALL : TILE.EMPTY;
  }),
  spawns: [
    { x: ((w / 2) - 2.5) * TILE_SIZE, y: (h / 2) * TILE_SIZE },
    { x: ((w / 2) + 2.5) * TILE_SIZE, y: (h / 2) * TILE_SIZE },
  ],
}
