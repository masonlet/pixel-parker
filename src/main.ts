import "./style.css";

import { createGameCanvas } from "./canvas.ts";
import { startLoop } from "./update.ts";
import { isDown, wasPressed } from "./input.ts";
import { loadImage } from "./assets.ts";

import {
  createVehicle,
  drawVehicle,
  applyInput,
  moveVehicle
} from "./vehicle.ts";
import {
  makeCarType, 
  makeTruckType
} from "./vehicleTypes.ts";

import { type Level, drawLevel } from "./level.ts";
import { test1 } from "./levels/test1.ts";
import { test2 } from "./levels/test2.ts";

const { canvas, ctx } = createGameCanvas();

const levels = [test1, test2];
let levelIndex = 0;
let level = levels[levelIndex];
if (!level) throw new Error("Failed to get level(s)");

const carSprite = await loadImage("/img/vehicles/car.png");
const carBodySprite = await loadImage("/img/vehicles/car-body.png");
const carType = makeCarType(carSprite, carBodySprite);

const truckSprite = await loadImage("/img/vehicles/truck.png");
const truckBodySprite = await loadImage("/img/vehicles/truck-body.png");
const truckType = makeTruckType(truckSprite, truckBodySprite);

function spawnVehicles(lvl: Level) {
  const [carSpawn, truckSpawn] = lvl.spawns;
  if (!carSpawn || !truckSpawn) throw new Error("Levels needs at least 2 spawns");
   return [
    createVehicle(carType, carSpawn.x, carSpawn.y, 180),
    createVehicle(truckType, truckSpawn.x, truckSpawn.y, 30),
  ];
}
let vehicles = spawnVehicles(level);
let vehicleIndex = 0;

startLoop(
  (dt) => {
    if (wasPressed("KeyQ")) {
      levelIndex = (levelIndex + 1) % levels.length;
      level = levels[levelIndex]!;
      vehicles = spawnVehicles(level);
      vehicleIndex = 0;
    }
    if (wasPressed("KeyE")) vehicleIndex = (vehicleIndex + 1) % vehicles.length;

    const active = vehicles[vehicleIndex];
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
    const active = vehicles[vehicleIndex];
    if (!active) return;
    const camX = active.x - canvas.width / 2;
    const camY = active.y - canvas.height / 2;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLevel(ctx, level, camX, camY);
    for (const v of vehicles) drawVehicle(ctx, v, camX, camY);
  },
);
