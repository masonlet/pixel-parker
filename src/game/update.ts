import { isDown, wasPressed } from "web-engine/input/keyboard.ts";

import type { PlayState } from "./types.ts";

import { checkLevelWon } from "./win.ts";

import { spawnVehicles } from "../vehicle/spawn.ts";

import { sensorsOverlapping } from "../physics/sensors.ts";

import {
  applyInput,
  moveVehicle,
  stepVehiclePhysics,
  resolveVehiclePairs
} from "../vehicle/physics.ts";

export function updatePlay(p: PlayState, dt: number): boolean {
  if (wasPressed("Digit1")) {
    p.levelIndex = (p.levelIndex + 1) % p.levels.length;
    p.level = p.levels[p.levelIndex]!;
    p.vehicles = spawnVehicles(p.level, p.vehicleTypes);
    p.vehicleIndex = 0;
  }
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

  for (const v of p.vehicles) {
    if (v === active) applyInput(v, throttle, steer);
    else applyInput(v, 0, 0);
    stepVehiclePhysics(v, dt);
    moveVehicle(v, p.level, dt);
  }
  resolveVehiclePairs(p.vehicles);
  for (const v of p.vehicles) v.overlappingSensors = sensorsOverlapping(v, p.level);
  active.hue = (active.hue + 60 * dt) % 360;

  return checkLevelWon(p.level, p.vehicles);
}
