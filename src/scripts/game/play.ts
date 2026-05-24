import { isDown, wasPressed } from "web-engine/input/keyboard.ts";
import type { PlayState } from "./types.ts";
import { checkLevelWon  } from "./win.ts";
import { drawLevel      } from "../level/render.ts";
import type { Campaign  } from "../campaign/types.ts";
import { spawnVehicles  } from "../vehicle/spawn.ts";
import { drawVehicle    } from "../vehicle/render.ts";
import {
  applyInput,
  moveVehicle,
  stepVehiclePhysics,
  resolveVehiclePairs
} from "../vehicle/physics.ts";
import { sensorsOverlapping                  } from "../physics/sensors.ts";
import { drawWallAabbs, drawOBB, drawSensors } from "../physics/debug.ts";

export function createPlayState(campaign: Campaign): PlayState {
  return {
    levels: campaign.levels,
    levelIndex: 0,
    level: campaign.levels[0]!,
    vehicleTypes: campaign.vehicleTypes,
    vehicles: spawnVehicles(campaign.levels[0]!, campaign.vehicleTypes),
    vehicleIndex: 0,
    debugMode: false,
  };
}

export function selectLevel(p: PlayState, index: number): void {
  p.levelIndex = index;
  p.level = p.levels[index]!;
  p.vehicles = spawnVehicles(p.level, p.vehicleTypes);
  p.vehicleIndex = 0;
}

export function updatePlayState(p: PlayState, dt: number): boolean {
  if (wasPressed("Digit1")) return true;
  if (wasPressed("Digit2")) p.vehicleIndex = (p.vehicleIndex + 1) % p.vehicles.length;
  if (wasPressed("Digit3")) p.debugMode = !p.debugMode;

  const active = p.vehicles[p.vehicleIndex];
  if (!active) return false;

  let throttle = 0;
  if (isDown("KeyW")) throttle += 1;
  if (isDown("KeyS")) throttle -= 1;

  let steer = 0;
  if (isDown("KeyA")) steer -= 1;
  if (isDown("KeyD")) steer += 1;

  const dtSec = dt / 1000;
  for (const v of p.vehicles) {
    if (v === active) applyInput(v, throttle, steer);
    else applyInput(v, 0, 0);
    stepVehiclePhysics(v, dtSec);
    moveVehicle(v, p.level, dtSec);
  }
  resolveVehiclePairs(p.vehicles);
  for (const v of p.vehicles) v.overlappingSensors = sensorsOverlapping(v, p.level);
  active.hue = (active.hue + 60 * dtSec) % 360;

  return checkLevelWon(p.level, p.vehicles);
}

export function renderPlayState(
  ctx: CanvasRenderingContext2D,
  p: PlayState,
  canvasW: number,
  canvasH: number,
): void {
  const active = p.vehicles[p.vehicleIndex];
  if (!active) return;

  const camX = active.body.position.x - canvasW / 2;
  const camY = active.body.position.y - canvasH / 2;

  drawLevel(ctx, p.level, camX, camY);
  for (const v of p.vehicles) drawVehicle(ctx, v, camX, camY);

  if (p.debugMode) {
    drawWallAabbs(ctx, p.level, camX, camY, canvasW, canvasH);
    for (const v of p.vehicles) {
      drawOBB(ctx, {
        cx: v.body.position.x,
        cy: v.body.position.y,
        hw: v.body.w / 2,
        hh: v.body.h / 2,
        angle: v.body.angle,
      }, camX, camY, `hsl(${v.hue}, 100%, 50%)`);
    }
    drawSensors(ctx, p.level, camX, camY, p.vehicles, active);
  }
}

export function resetPlayState(p: PlayState): void {
  p.vehicles = spawnVehicles(p.level, p.vehicleTypes);
  p.vehicleIndex = 0;
}
