import "./style.css";

import { createGameCanvas } from "./engine/canvas.ts";
import { startLoop } from "./engine/update.ts";

import type { GameState } from "./game/state.ts";

import { initKeyboard, isDown, wasPressed } from "./engine/input/keyboard.ts";
import { initMouse } from "./engine/input/mouse.ts";

import { drawTitleMenu } from "./game/ui/title.ts";
import { drawSettingsMenu } from "./game/ui/settings.ts";
import { drawPauseMenu } from "./game/ui/pause.ts";

import { type Level } from "./game/level/types.ts";
import { loadLevel } from "./game/level/load.ts";
import { drawLevel } from "./game/level/render.ts";

import { drawWallAabbs, drawOBB, drawSensors } from "./game/physics/debug.ts";
import { sensorsOverlapping } from "./game/physics/sensors.ts";
import type { Sensor } from "./game/level/types.ts";

import { createVehicle, drawVehicle } from "./game/vehicle/render.ts";
import { applyInput, moveVehicle, stepVehiclePhysics, resolveVehiclePairs } from "./game/vehicle/physics.ts";
import {
  carStats,
  truckStats,
  loadVehicleType
} from "./game/vehicle/presets.ts";

import test1 from "./game/levels/test1.json";
import test2 from "./game/levels/test2.json";
import test3 from "./game/levels/test3.json";

const { canvas, ctx } = createGameCanvas();
let state = "title" as GameState;

const levels = [loadLevel(test1), loadLevel(test2), loadLevel(test3)];
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

initKeyboard();
initMouse(canvas);

startLoop(
  (dt) => {
    if (wasPressed("Escape")) {
      if (state === "playing") state = "paused";
      else if (state === "paused") state = "playing";
    }

    if (state !== "playing") return;

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
    resolveVehiclePairs(vehicles);
    for (const v of vehicles) v.overlappingSensors = sensorsOverlapping(v, level);
    active.hue = (active.hue + 60 * dt) % 360;
  },
  () => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (state === "title") {
      const { startClicked, settingsClicked } = drawTitleMenu(ctx, canvas.width, canvas.height);
      if (startClicked) state = "playing";
      if (settingsClicked) state = "settings";
      return;
    }

    if (state === "settings") {
      const { backClicked } = drawSettingsMenu(ctx, canvas.width, canvas.height);
      if (backClicked) state = "title";
      return;
    }

    if (state === "playing" || state === "paused") {
      const active = vehicles[vehicleIndex];
      if (!active) return;

      const camX = active.body.position.x - canvas.width / 2;
      const camY = active.body.position.y - canvas.height / 2;

      drawLevel(ctx, level, camX, camY);
      for (const v of vehicles) drawVehicle(ctx, v, camX, camY);

      if (debugMode) {
        drawWallAabbs(ctx, level, camX, camY, canvas.width, canvas.height);

        for (const v of vehicles) {
          drawOBB(ctx, {
            cx: v.body.position.x,
            cy: v.body.position.y,
            hw: v.body.w / 2,
            hh: v.body.h / 2,
            angle: v.body.angle,
          }, camX, camY, `hsl(${v.hue}, 100%, 50%)`);
        }

        const activeSensors = new Set<Sensor>(active.overlappingSensors);
        drawSensors(ctx, level, camX, camY, activeSensors);
      }
    }

    if (state === "paused") {
      const action = drawPauseMenu(ctx, canvas.width, canvas.height);
      if (action === "resume") state = "playing";
      if (action === "restart") {
        vehicles = spawnVehicles(level);
        vehicleIndex = 0;
        state = "playing";
      }
      if (action === "quit") state = "title";
    }
  },
);
