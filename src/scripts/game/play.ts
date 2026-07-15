import { isDown, wasPressed } from "@starweb-libs/engine/input/keyboard.js";
import { createTweenManager } from "@starweb-libs/tween/manager.js";
import type { TweenTarget   } from "@starweb-libs/tween/types.js";
import { Audio              } from "@starweb-libs/audio/audio.js";
import { MAX_HEALTH                           } from "./constants.ts";
import type { PlayResult, PlayState           } from "./types.ts";
import { checkLevelWon, isParkedIn            } from "./win.ts";
import type { Sensor                          } from "../level/types.ts";
import type { Campaign                        } from "../campaign/types.ts";
import { sensorsOverlapping                   } from "../physics/sensors.ts";
import { drawWallAabbs, drawOBB, drawSensors  } from "../physics/debug.ts";
import { spawnCones, updateCones, renderCones } from "../physics/cones.ts";
import { drawLevel, drawSensorOverlays        } from "../level/render.ts";
import { spawnVehicles                        } from "../vehicle/spawn.ts";
import { drawVehicle                          } from "../vehicle/render.ts";
import {
  applyInput,
  moveVehicle,
  stepVehiclePhysics,
  resolveVehiclePairs
} from "../vehicle/physics.ts";

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

export function createPlayState(campaign: Campaign, audio: Audio): PlayState {
  const level = campaign.levels[0];
  if (!level) throw new Error("createPlayState: Campaign has no levels");

  const tweenManager = createTweenManager();
  const sensorAlphas = new Map<Sensor, TweenTarget>();
  const state: PlayState = {
    volState: { dragging: false, value: audio.volume },
    levels:       campaign.levels,
    levelIndex:   0,
    vehicleTypes: campaign.vehicleTypes,
    vehicles:     spawnVehicles(level, campaign.vehicleTypes),
    vehicleIndex: 0,
    cones:        spawnCones(level.cones),
    health:       MAX_HEALTH,
    debugMode:    false,
    tweenManager,
    sensorAlphas,
    parkedSensors:    new Set<Sensor>(),
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
  p.cones = spawnCones(level.cones);
  p.health = MAX_HEALTH;
  p.parkedSensors.clear();
  p.parkConfirmTimer = 0;
  initSensorTweens(p);
}

export function updatePlayState(p: PlayState, dt: number): PlayResult {
  if (wasPressed("Digit1")) return "won";
  if (wasPressed("Digit2")) {
    let next = (p.vehicleIndex + 1) % p.vehicles.length;
    while (!p.vehicles[next]!.selectable && next !== p.vehicleIndex) next = (next + 1) % p.vehicles.length;
    p.vehicleIndex = next;
  }
  if (wasPressed("Digit3")) p.debugMode = !p.debugMode;

  p.tweenManager.update(dt);

  const active = p.vehicles[p.vehicleIndex];
  if (!active) return "failed";

  const level = p.levels[p.levelIndex];
  if (!level) throw new Error(`updatePlayState: no level at index ${p.levelIndex}`);

  let throttle = 0;
  if (isDown("KeyW")) throttle += 1;
  if (isDown("KeyS")) throttle -= 1;

  let steer = 0;
  if (isDown("KeyA")) steer -= 1;
  if (isDown("KeyD")) steer += 1;

  for (const v of p.vehicles) {
    if (!v.driveable) continue;
    if (v === active) applyInput(v, throttle, steer);
    else applyInput(v, 0, 0);
    stepVehiclePhysics(v, dt);
    const damage = moveVehicle(v, level, dt);
    if (damage > 0) {
      p.health = Math.max(0, p.health - damage);
      console.log(`[damage] wall dmg: ${damage.toFixed(2)} hp: ${p.health.toFixed(1)}`);
      if (p.health <= 0) return "failed";
    }
  }

  const vvDamage = resolveVehiclePairs(p.vehicles);
  if (vvDamage > 0) {
    p.health = Math.max(0, p.health - vvDamage);
    console.log(`[damage] vehicle dmg: ${vvDamage.toFixed(2)} hp: ${p.health.toFixed(1)}`);
    if (p.health <= 0) return "failed";
  }

  const coneDamage = updateCones(p.cones, p.vehicles, level, dt);
  if (coneDamage > 0) {
    p.health = Math.max(0, p.health - coneDamage);
    console.log(`[damage] cone dmg: ${coneDamage.toFixed(2)} hp: ${p.health.toFixed(1)}`);
    if (p.health <= 0) return "failed";
  }
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
    if (p.parkConfirmTimer >= 850) return "won";
  } else p.parkConfirmTimer = 0;

  return "playing";
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
  renderCones(ctx, p.cones, camX, camY);
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

  const barW  = 60;
  const barH  = 8;
  const barX  = Math.floor(active.body.position.x - camX - barW / 2);
  const barY  = Math.floor(active.body.position.y - camY + active.type.sprite.height / 2 + 6);
  const ratio = p.health / MAX_HEALTH;

  ctx.fillStyle = "#333";
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = ratio > 0.5 ? "#0f0" : ratio > 0.25 ? "#ff0" : "#f00";
  ctx.fillRect(barX, barY, Math.floor(barW * ratio), barH);
}

export function resetPlayState(p: PlayState): void {
  const level = p.levels[p.levelIndex];
  if (!level) throw new Error(`resetPlayState: no level at index ${p.levelIndex}`);
  p.vehicles = spawnVehicles(level, p.vehicleTypes);
  p.vehicleIndex = 0;
  p.cones = spawnCones(level.cones);
  p.health = MAX_HEALTH;
  p.parkedSensors.clear();
  p.parkConfirmTimer = 0;
}
