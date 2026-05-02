import type { Vehicle } from "./types.ts";
import { TILE, TILE_SIZE, getTile, type Level } from "../level.ts";
import { obbVsAabb } from "../physics/collision.ts";
import type { AABB, MTV } from "../physics/types.ts";

function signedForwardSpeed(v: Vehicle): number {
  return v.body.velocity.x * Math.cos(v.body.angle)
       + v.body.velocity.y * Math.sin(v.body.angle);
}

function forwardSpeed(v: Vehicle): number {
  return Math.abs(signedForwardSpeed(v));
}

export function applyInput(
  v: Vehicle,
  throttle: number,
  steer: number
): void {
  v.throttle = throttle;
  v.steer = steer;
}

export function stepVehiclePhysics(v: Vehicle, dt: number): void {
  // Steering
  const speedRatio = Math.min(forwardSpeed(v) / v.type.maxSpeed, 1);
  v.body.angle += v.steer * v.type.turnSpeed * speedRatio * Math.sign(signedForwardSpeed(v)) * dt;

  // Gear-shift timer
  if (v.shiftTimer > 0) {
    v.shiftTimer -= dt;
    if (v.shiftTimer < 0) v.shiftTimer = 0;
  }

  let speed = signedForwardSpeed(v);

  if (v.throttle > 0) { // Forward
    if (speed < 0) { // Braking
      speed += v.type.brakeForce * dt;
      if (speed >= 0) {
        speed = 0;
        v.shiftTimer = v.type.gearShiftDelay;
      }
    } else if (v.shiftTimer === 0) {
      speed = Math.min(speed + v.type.accel * dt, v.type.maxSpeed);
    }
  } else if (v.throttle < 0) { // Reverse
    if (speed > 0) { // Braking
      speed -= v.type.brakeForce * dt;
      if (speed <= 0) {
        speed = 0;
        v.shiftTimer = v.type.gearShiftDelay;
      }
    } else if (v.shiftTimer === 0) {
      speed = Math.max(speed - v.type.accel * dt, -v.type.maxReverseSpeed);
    }
  } else { // Idle
    if (speed > 0) speed = Math.max(speed - v.type.friction * dt, 0);
    else if (speed < 0) speed = Math.min(speed + v.type.friction * dt, 0);
  }

  v.body.velocity.x = Math.cos(v.body.angle) * speed;
  v.body.velocity.y = Math.sin(v.body.angle) * speed;
}

function allWallHits(v: Vehicle, level: Level): MTV[] {
  const cos = Math.cos(v.body.angle);
  const sin = Math.sin(v.body.angle);
  const hw = v.body.w / 2;
  const hh = v.body.h / 2;
  const cx = v.body.position.x;
  const cy = v.body.position.y;

  const ex = Math.abs(cos) * hw + Math.abs(sin) * hh;
  const ey = Math.abs(sin) * hw + Math.abs(cos) * hh;
  const minTX = Math.floor((cx - ex) / TILE_SIZE);
  const maxTX = Math.floor((cx + ex) / TILE_SIZE);
  const minTY = Math.floor((cy - ey) / TILE_SIZE);
  const maxTY = Math.floor((cy + ey) / TILE_SIZE);

  const hits: MTV[] = [];
  for (let ty = minTY; ty <= maxTY; ty++) {
    for (let tx = minTX; tx <= maxTX; tx++) {
      if (getTile(level, tx, ty) !== TILE.WALL) continue;
      const aabb: AABB = { x: tx * TILE_SIZE, y: ty * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE };
      const hit = obbVsAabb({ cx, cy, hw, hh, angle: v.body.angle }, aabb);
      if (hit) hits.push(hit);
    }
  }
  return hits;
}

export function moveVehicle(v: Vehicle, level: Level, dt: number): void {
  v.body.position.x += v.body.velocity.x * dt;
  v.body.position.y += v.body.velocity.y * dt;

  for (let pass = 0; pass < 4; pass++) {
    const hits = allWallHits(v, level);
    if (hits.length === 0) break;

    let pushX = 0, pushY = 0;
    for (const h of hits) {
      pushX += h.axis.x * h.depth;
      pushY += h.axis.y * h.depth;
    }
    v.body.position.x += pushX;
    v.body.position.y += pushY;

    for (const h of hits) {
      const vn = v.body.velocity.x * h.axis.x + v.body.velocity.y * h.axis.y;
      if (vn < 0) {
        v.body.velocity.x -= h.axis.x * vn;
        v.body.velocity.y -= h.axis.y * vn;
      }
    }
  }
}
