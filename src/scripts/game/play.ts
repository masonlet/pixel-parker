import { createTweenManager } from "web-engine/tween/manager.ts";
import type { TweenTarget   } from "web-engine/tween/types.ts";
import { isDown, wasPressed } from "web-engine/input/keyboard.ts";
import type { Sensor        } from "../level/types.ts";
import type { PlayState } from "./types.ts";
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
import { drawLevel, drawSensorOverlays       } from "../level/render.ts";
import { checkLevelWon, isParkedIn           } from "./win.ts";

function initSensorTweens(p: PlayState): void {
  p.tweenManager.stopAll();
  p.sensorAlphas.clear();

  // Validated by createPlayState; add guard if exporting.
  for (const s of p.levels[p.levelIndex]!.sensors) {
    const vehicle = s.vehicle
      ? p.vehicles.find(v => v.type.name === s.vehicle)
      : undefined;
    const colour = s.colour ?? vehicle?.colour;
    if (!colour) continue;
    const target: TweenTarget = { alpha: 0.05 };
    p.sensorAlphas.set(s, target);
    p.tweenManager.add({
      targets: target,
      props: { alpha: { from: 0.05, to: 0.25 } },
      duration: 1200,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }
}

export function createPlayState(campaign: Campaign): PlayState {
  const level = campaign.levels[0];
  if (!level) throw new Error("createPlayState: Campaign has no levels");

  const tweenManager = createTweenManager();
  const sensorAlphas = new Map<Sensor, TweenTarget>();
  const state: PlayState = {
    levels: campaign.levels,
    levelIndex: 0,
    vehicleTypes: campaign.vehicleTypes,
    vehicles: spawnVehicles(level, campaign.vehicleTypes),
    vehicleIndex: 0,
    debugMode: false,
    tweenManager,
    sensorAlphas,
    parkedSensors: new Set<Sensor>(),
    parkConfirmTimer: 0
  }
  initSensorTweens(state);
  return state;
}

export function selectLevel(p: PlayState, index: number): void {
  const level = p.levels[index];
  if (!level) throw new Error(`selectLevel: no level at index ${index}`);

  p.levelIndex = index;
  p.vehicles = spawnVehicles(level, p.vehicleTypes);
  p.vehicleIndex = 0;
  p.parkedSensors.clear();
  p.parkConfirmTimer = 0;
  initSensorTweens(p);
}

export function updatePlayState(p: PlayState, dt: number): boolean {
  if (wasPressed("Digit1")) return true;
  if (wasPressed("Digit2")) p.vehicleIndex = (p.vehicleIndex + 1) % p.vehicles.length;
  if (wasPressed("Digit3")) p.debugMode = !p.debugMode;

  p.tweenManager.update(dt);

  const active = p.vehicles[p.vehicleIndex];
  if (!active) return false;

  const level = p.levels[p.levelIndex];
  if (!level) throw new Error(`updatePlayState: no level at index ${p.levelIndex}`);

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
    moveVehicle(v, level, dt);
  }
  resolveVehiclePairs(p.vehicles);
  for (const v of p.vehicles) v.overlappingSensors = sensorsOverlapping(v, level);

  p.parkedSensors.clear();
  for (const s of level.sensors) {
    if (s.kind !== "parking_spot") continue;
    if (s.vehicle) {
      const vehicle = p.vehicles.find(v => v.type.name === s.vehicle);
      if (vehicle && isParkedIn(vehicle, s)) p.parkedSensors.add(s);
    } else {
      if (p.vehicles.some(v => isParkedIn(v, s))) p.parkedSensors.add(s);
    }
  }

  if (checkLevelWon(level, p.vehicles)) {
    p.parkConfirmTimer += dt;
    if (p.parkConfirmTimer >= 850) return true;
  } else {
    p.parkConfirmTimer = 0;
  }
  return false;
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

  const level = p.levels[p.levelIndex];
  if (!level) throw new Error(`renderPlayState: no level at index ${p.levelIndex}`);

  drawLevel(ctx, level, camX, camY);
  for (const v of p.vehicles) drawVehicle(ctx, v, camX, camY);

  if (p.debugMode) {
    drawWallAabbs(ctx, level, camX, camY, canvasW, canvasH);
    for (const v of p.vehicles) {
      drawOBB(ctx, {
        cx: v.body.position.x,
        cy: v.body.position.y,
        hw: v.body.w / 2,
        hh: v.body.h / 2,
        angle: v.body.angle,
      }, camX, camY, v.colour);
    }
    drawSensors(ctx, level, camX, camY, p.vehicles, active);
  }

  drawSensorOverlays(ctx, level, p.sensorAlphas, p.parkedSensors, p.vehicles, camX, camY);
}

export function resetPlayState(p: PlayState): void {
  const level = p.levels[p.levelIndex];
  if (!level) throw new Error(`resetPlayState: no level at index ${p.levelIndex}`);
  p.vehicles = spawnVehicles(level, p.vehicleTypes);
  p.vehicleIndex = 0;
  p.parkedSensors.clear();
  p.parkConfirmTimer = 0;
}
