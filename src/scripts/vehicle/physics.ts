import { obbVsAabb, obbVsObb         } from "@starweb-libs/physics/collision.js";
import type { AABB, MTV, OBB         } from "@starweb-libs/physics/types.js";
import type { Vehicle                } from "./types.ts";
import { TILE, TILE_SIZE, type Level } from "../level/types.ts";
import { getTile                     } from "../level/query.ts";
import {
  VEHICLE_DAMAGE_SCALE,
  VEHICLE_DAMAGE_THRESHOLD,
  WALL_DAMAGE_SCALE,
  WALL_DAMAGE_THRESHOLD
} from "../game/constants.ts";

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
      const aabb: AABB = {
        cx: tx * TILE_SIZE + TILE_SIZE / 2, cy: ty * TILE_SIZE + TILE_SIZE / 2,
        hw: TILE_SIZE / 2, hh: TILE_SIZE / 2
      };
      const hit = obbVsAabb({ cx, cy, hw, hh, angle: v.body.angle }, aabb);
      if (hit) hits.push(hit);
    }
  }
  return hits;
}

export function vehicleObb(v: Vehicle): OBB {
  return {
    cx: v.body.position.x,
    cy: v.body.position.y,
    hw: v.body.w / 2,
    hh: v.body.h / 2,
    angle: v.body.angle,
  };
}

function resolveWalls(v: Vehicle, level: Level): number {
  let damage = 0;
  for (let pass = 0; pass < 4; pass++) {
    const hits = allWallHits(v, level);
    if (hits.length === 0) break;
    let pushX = 0, pushY = 0;
    for (const h of hits) { pushX += h.axis.x * h.depth; pushY += h.axis.y * h.depth; }
    v.body.position.x += pushX;
    v.body.position.y += pushY;
    for (const h of hits) {
      const vn = v.body.velocity.x * h.axis.x + v.body.velocity.y * h.axis.y;
      if (vn < 0) {
        const impact = -vn;
        if (impact > WALL_DAMAGE_THRESHOLD) damage += (impact - WALL_DAMAGE_THRESHOLD) * WALL_DAMAGE_SCALE;
        v.body.velocity.x -= h.axis.x * vn;
        v.body.velocity.y -= h.axis.y * vn;
      }
    }
  }
  return damage;
}

function resolvePair(a: Vehicle, b: Vehicle, mtv: MTV): number {
  if (!a.pushable && !b.pushable) return 0;

   if (!b.pushable) {
    a.body.position.x += mtv.axis.x * mtv.depth;
    a.body.position.y += mtv.axis.y * mtv.depth;
    const an = a.body.velocity.x * mtv.axis.x + a.body.velocity.y * mtv.axis.y;
    if (an < 0) {
      const impact = -an;
      a.body.velocity.x -= mtv.axis.x * an;
      a.body.velocity.y -= mtv.axis.y * an;
      if ((a.damageable || b.damageable) && impact > VEHICLE_DAMAGE_THRESHOLD)
        return (impact - VEHICLE_DAMAGE_THRESHOLD) * VEHICLE_DAMAGE_SCALE;
    }
    return 0;
  }

  if (!a.pushable) {
    b.body.position.x -= mtv.axis.x * mtv.depth;
    b.body.position.y -= mtv.axis.y * mtv.depth;
    const bn = b.body.velocity.x * mtv.axis.x + b.body.velocity.y * mtv.axis.y;
    if (bn > 0) {
      const impact = bn;
      b.body.velocity.x -= mtv.axis.x * bn;
      b.body.velocity.y -= mtv.axis.y * bn;
      if ((a.damageable || b.damageable) && impact > VEHICLE_DAMAGE_THRESHOLD)
        return (impact - VEHICLE_DAMAGE_THRESHOLD) * VEHICLE_DAMAGE_SCALE;
    }
    return 0;
  }

  const totalInv = 1 / a.body.mass + 1 / b.body.mass;
  const aShare = (1 / a.body.mass) / totalInv;
  const bShare = (1 / b.body.mass) / totalInv;

  a.body.position.x += mtv.axis.x * mtv.depth * aShare;
  a.body.position.y += mtv.axis.y * mtv.depth * aShare;
  b.body.position.x -= mtv.axis.x * mtv.depth * bShare;
  b.body.position.y -= mtv.axis.y * mtv.depth * bShare;

  let damage = 0;

  const an = a.body.velocity.x * mtv.axis.x + a.body.velocity.y * mtv.axis.y;
  const bn = b.body.velocity.x * mtv.axis.x + b.body.velocity.y * mtv.axis.y;
  const rel = an - bn;
  if (rel < 0) {
    const impact = -rel;
    if ((a.damageable || b.damageable) && impact > VEHICLE_DAMAGE_THRESHOLD)
      damage = (impact - VEHICLE_DAMAGE_THRESHOLD) * VEHICLE_DAMAGE_SCALE;
    const j = -rel / totalInv;
    a.body.velocity.x += mtv.axis.x * j / a.body.mass;
    a.body.velocity.y += mtv.axis.y * j / a.body.mass;
    b.body.velocity.x -= mtv.axis.x * j / b.body.mass;
    b.body.velocity.y -= mtv.axis.y * j / b.body.mass;
  }

  return damage;
}

export function moveVehicle(v: Vehicle, level: Level, dt: number): number {
  v.body.position.x += v.body.velocity.x * dt;
  v.body.position.y += v.body.velocity.y * dt;
  return resolveWalls(v, level);
}

export function resolveVehiclePairs(vehicles: Vehicle[]): number {
  let damage = 0;
  for (let pass = 0; pass < 4; pass++) {
    let anyHit = false;
    for (let i = 0; i < vehicles.length; i++) {
      for (let j = i + 1; j < vehicles.length; j++) {
        const a = vehicles[i]!;
        const b = vehicles[j]!;
        const mtv = obbVsObb(vehicleObb(a), vehicleObb(b));
        if (!mtv) continue;
        anyHit = true;
        damage += resolvePair(vehicles[i]!, vehicles[j]!, mtv);
      }
    }
    if (!anyHit) break;
  }
  return damage;
}
