import type { CircleBody, AABB                       } from "@starweb-libs/physics/types.js";
import { circleVsAabb, circleVsCircle, circleVsObb   } from "@starweb-libs/physics/collision.js";
import { CONE_DAMAGE_SCALE, CONE_DAMAGE_THRESHOLD    } from "../game/constants.ts";
import { TILE, TILE_SIZE, type Level, type LevelCone } from "../level/types.ts";
import { getTile                                     } from "../level/query.ts";
import type { Vehicle                                } from "../vehicle/types.ts";
import { vehicleObb                                  } from "../vehicle/physics.ts";

export const CONE_RADIUS   = 8;    // px
export const CONE_FRICTION = 120;  // px/s²
export const CONE_MASS     = 20;

export function spawnCones(cones: LevelCone[]): CircleBody[] {
  return cones.map(lc => ({
    cx: lc.x, cy: lc.y,
    r:  CONE_RADIUS,
    vx: 0, vy: 0,
    mass: CONE_MASS,
  }));
}

function resolveConeWalls(cone: CircleBody, level: Level): void {
  const minTX = Math.floor((cone.cx - cone.r) / TILE_SIZE);
  const maxTX = Math.floor((cone.cx + cone.r) / TILE_SIZE);
  const minTY = Math.floor((cone.cy - cone.r) / TILE_SIZE);
  const maxTY = Math.floor((cone.cy + cone.r) / TILE_SIZE);

  for (let ty = minTY; ty <= maxTY; ty++) {
    for (let tx = minTX; tx <= maxTX; tx++) {
      if (getTile(level, tx, ty) !== TILE.WALL) continue;
      const aabb: AABB = {
        cx: tx * TILE_SIZE + TILE_SIZE / 2,
        cy: ty * TILE_SIZE + TILE_SIZE / 2,
        hw: TILE_SIZE / 2,
        hh: TILE_SIZE / 2,
      };
      const mtv = circleVsAabb(cone, aabb);
      if (!mtv) continue;
      cone.cx += mtv.axis.x * mtv.depth;
      cone.cy += mtv.axis.y * mtv.depth;
      const dot = cone.vx * mtv.axis.x + cone.vy * mtv.axis.y;
      if (dot < 0) {
        cone.vx -= 2 * dot * mtv.axis.x;
        cone.vy -= 2 * dot * mtv.axis.y;
      }
    }
  }
}

export function updateCones(
  cones:    CircleBody[],
  vehicles: Vehicle[],
  level:    Level,
  dt:       number,
): number {
  // Move + friction + wall resolution
  for (const cone of cones) {
    cone.cx += cone.vx * dt;
    cone.cy += cone.vy * dt;
    const speed = Math.hypot(cone.vx, cone.vy);
    if (speed > 0) {
      const decel = Math.min(speed, CONE_FRICTION * dt);
      cone.vx -= (cone.vx / speed) * decel;
      cone.vy -= (cone.vy / speed) * decel;
    }
    resolveConeWalls(cone, level);
  }

  let damage = 0;

  // Vehicle vs cone
  for (const v of vehicles) {
    const obb = vehicleObb(v);
    for (const cone of cones) {
      const mtv = circleVsObb(cone, obb);
      if (!mtv) continue;
      const totalMass = cone.mass + v.body.mass;
      cone.cx           += mtv.axis.x * mtv.depth * (v.body.mass / totalMass);
      cone.cy           += mtv.axis.y * mtv.depth * (v.body.mass / totalMass);
      v.body.position.x -= mtv.axis.x * mtv.depth * (cone.mass   / totalMass);
      v.body.position.y -= mtv.axis.y * mtv.depth * (cone.mass   / totalMass);
      const an  = cone.vx           * mtv.axis.x + cone.vy           * mtv.axis.y;
      const bn  = v.body.velocity.x * mtv.axis.x + v.body.velocity.y * mtv.axis.y;
      const rel = an - bn;
      if (rel < 0) {
        const impact = -rel;
        if (impact > CONE_DAMAGE_THRESHOLD) damage += (impact - CONE_DAMAGE_THRESHOLD) * CONE_DAMAGE_SCALE;
        const j = -rel / (1 / cone.mass + 1 / v.body.mass);
        cone.vx           += mtv.axis.x * j / cone.mass;
        cone.vy           += mtv.axis.y * j / cone.mass;
        v.body.velocity.x -= mtv.axis.x * j / v.body.mass;
        v.body.velocity.y -= mtv.axis.y * j / v.body.mass;
      }
    }
  }

  // Cone vs cone
  for (let i = 0; i < cones.length; i++) {
    const a = cones[i]!;
    for (let j = i + 1; j < cones.length; j++) {
      const b   = cones[j]!;
      const mtv = circleVsCircle(a, b);
      if (!mtv) continue;
      const totalMass = a.mass + b.mass;
      a.cx -= mtv.axis.x * mtv.depth * (b.mass / totalMass);
      a.cy -= mtv.axis.y * mtv.depth * (b.mass / totalMass);
      b.cx += mtv.axis.x * mtv.depth * (a.mass / totalMass);
      b.cy += mtv.axis.y * mtv.depth * (a.mass / totalMass);
      const dot = (a.vx - b.vx) * mtv.axis.x + (a.vy - b.vy) * mtv.axis.y;
      if (dot > 0) {
        const impulse = (2 * dot) / totalMass;
        a.vx -= impulse * b.mass * mtv.axis.x;
        a.vy -= impulse * b.mass * mtv.axis.y;
        b.vx += impulse * a.mass * mtv.axis.x;
        b.vy += impulse * a.mass * mtv.axis.y;
      }
    }
  }

  // Final wall re-correction
  for (const cone of cones) resolveConeWalls(cone, level);

  return damage;
}

export function renderCones(
  ctx:   CanvasRenderingContext2D,
  cones: CircleBody[],
  camX:  number,
  camY:  number,
): void {
  ctx.beginPath();
  for (const c of cones) {
    ctx.moveTo(c.cx - camX + c.r, c.cy - camY);
    ctx.arc(c.cx - camX, c.cy - camY, c.r, 0, Math.PI * 2);
  }
  ctx.fillStyle   = "#f60";
  ctx.fill();
  ctx.strokeStyle = "#c40";
  ctx.lineWidth   = 2;
  ctx.stroke();
}
