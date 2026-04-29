import "./style.css";
import {
  TILE, TILE_SIZE,
  type Level, drawLevel
} from "./level.ts";
import { startLoop } from "./update.ts";
import { createVehicle, drawVehicle } from "./vehicle.ts";
import { isDown } from "./input.ts";

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
const vehicle = createVehicle(
  (level.width * TILE_SIZE) / 2,
  (level.height * TILE_SIZE) / 2,
);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

startLoop(
  (dt) => {
    let dx = 0;
    let dy = 0;
    if (isDown("KeyW")) dy -= 1;
    if (isDown("KeyS")) dy += 1;
    if (isDown("KeyA")) dx -= 1;
    if (isDown("KeyD")) dx += 1;

    if (dx !== 0 && dy !== 0) {
      const inv = 1 / Math.sqrt(2);
      dx *= inv;
      dy *= inv;
    }

    vehicle.x += dx * vehicle.speed * dt;
    vehicle.y += dy * vehicle.speed * dt;
  },
  () => {
    const camX = vehicle.x - canvas.width / 2;
    const camY = vehicle.y - canvas.height / 2;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLevel(ctx, level, camX, camY);
    drawVehicle(ctx, vehicle, camX, camY);
  },
);
