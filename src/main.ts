import "./style.css";
import {
  TILE, TILE_SIZE,
  type Level, drawLevel
} from "./level.ts";
import { startLoop } from "./update.ts";
import { createVehicle, drawVehicle, applyInput, moveVehicle } from "./vehicle.ts";
import { isDown, wasPressed } from "./input.ts";
import { loadImage } from "./assets.ts";
import {
  makeCarType, 
  makeTruckType
} from "./vehicleTypes.ts";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctxOrNull = canvas.getContext("2d");
if (!ctxOrNull) throw new Error("2D canvas context not found");
const ctx = ctxOrNull;
ctx.imageSmoothingEnabled = false;

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

const carSprite = await loadImage("/img/vehicles/car.png");
const carBodySprite = await loadImage("/img/vehicles/car-body.png");
const carType = makeCarType(carSprite, carBodySprite);

const truckSprite = await loadImage("/img/vehicles/truck.png");
const truckBodySprite = await loadImage("/img/vehicles/truck-body.png");
const truckType = makeTruckType(truckSprite, truckBodySprite);

const centerX = (level.width * TILE_SIZE) / 2;
const centerY = (level.height * TILE_SIZE) / 2

const vehicles = [
  createVehicle(carType, centerX - 80, centerY, 180),
  createVehicle(truckType, centerX + 80, centerY, 30),
];
let activeIndex = 0;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

startLoop(
  (dt) => {
    if (wasPressed("KeyE")) activeIndex = (activeIndex + 1) % vehicles.length;

    const active = vehicles[activeIndex];
    if (!active) return;

    let throttle = 0;
    if (isDown("KeyW")) throttle += 1;
    if (isDown("KeyS")) throttle -= 1;

    let steer = 0;
    if (isDown("KeyA")) steer -= 1;
    if (isDown("KeyD")) steer += 1;

    for (const v of vehicles) {
      if (v === active) applyInput(v, throttle, steer, dt);
      else applyInput(v, 0, 0, dt);
      moveVehicle(v, dt);
    }
    
    active.hue = (active.hue + 60 * dt) % 360;
  },
  () => {
    const active = vehicles[activeIndex];
    if (!active) return;
    const camX = active.x - canvas.width / 2;
    const camY = active.y - canvas.height / 2;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLevel(ctx, level, camX, camY);
    for (const v of vehicles) drawVehicle(ctx, v, camX, camY);
  },
);
