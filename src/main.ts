import "./style.css";
import {
  TILE, TILE_SIZE,
  type Level, drawLevel
} from "./level.ts";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctxOrNull = canvas.getContext("2d");
if (!ctxOrNull) throw new Error("2D canvas context not found");
const ctx = ctxOrNull;


const levelW = 40;
const levelH = 30;
const level: Level = {
  width: levelW,
  height: levelH,
  tiles: Array.from({ length: levelW * levelH }, (_, i) => {
    const x = i % levelW;
    const y = Math.floor(i / levelW);
    const isBorder = x === 0 || y === 0 || x === levelW - 1 || y === levelH - 1;
    return isBorder ? TILE.WALL : TILE.EMPTY;
  }),
};

function resize() {
  canvas.width = level.width * TILE_SIZE;
  canvas.height = level.height * TILE_SIZE;
}
window.addEventListener("resize", resize);
resize();

function frame(_t: number) {
  drawLevel(ctx, level);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
