import "./style.css";

import { createGameCanvas } from "./canvas.ts";
import { startLoop } from "./update.ts";
import { isDown, wasPressed } from "./input.ts";
import { drawWallAabbs, drawOBB } from "./physics/debug.ts";

import { createVehicle, drawVehicle } from "./vehicle/render.ts";
import { applyInput, moveVehicle, stepVehiclePhysics } from "./vehicle/physics.ts";
import {
  carStats,
  truckStats,
  loadVehicleType
} from "./vehicle/presets.ts";

import { type Level, drawLevel } from "./level.ts";
import { test1 } from "./levels/test1.ts";
import { test2 } from "./levels/test2.ts";

const { canvas, ctx } = createGameCanvas();

const levels = [test1, test2];
let levelIndex = 0;
let level: Level = levels[levelIndex]!;
if (!level) throw new Error("Failed to get level(s)");

const carType = await loadVehicleType(carStats);
const truckType = await loadVehicleType(truckStats);

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

let debugMode = false;

startLoop(
  (dt) => {
    if (wasPressed("Digit1")) {
      levelIndex = (levelIndex + 1) % levels.length;
      level = levels[levelIndex]!;
      vehicles = spawnVehicles(level);
      vehicleIndex = 0;
    }
    if (wasPressed("Digit2")) vehicleIndex = (vehicleIndex + 1) % vehicles.length;
    if (wasPressed("Digit3")) debugMode = !debugMode;

    const active = vehicles[vehicleIndex];
    if (!active) return;

    let throttle = 0;
    if (isDown("KeyW")) throttle += 1;
    if (isDown("KeyS")) throttle -= 1;

    let steer = 0;
    if (isDown("KeyA")) steer -= 1;
    if (isDown("KeyD")) steer += 1;

    for (const v of vehicles) {
      if (v === active) applyInput(v, throttle, steer);
      else applyInput(v, 0, 0);
      stepVehiclePhysics(v, dt);
      moveVehicle(v, level, dt);
    }

    active.hue = (active.hue + 60 * dt) % 360;
  },
  () => {
    const active = vehicles[vehicleIndex];
    if (!active) return;
    const camX = active.body.position.x - canvas.width / 2;
    const camY = active.body.position.y - canvas.height / 2;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLevel(ctx, level, camX, camY);
    for (const v of vehicles) drawVehicle(ctx, v, camX, camY);
    if (debugMode) {
      drawWallAabbs(ctx, level, camX, camY, canvas.width, canvas.height);
      drawOBB(ctx, {
        cx: active.body.position.x,
        cy: active.body.position.y,
        hw: active.body.w / 2,
        hh: active.body.h / 2,
        angle: active.body.angle,
      }, camX, camY, `hsl(${active.hue}, 100%, 50%)`);
    }
  },
);
