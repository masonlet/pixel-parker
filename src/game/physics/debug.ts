import type { OBB } from "../../engine/physics/types.ts";

import { TILE, TILE_SIZE, type Level } from "../level/types.ts";
import { getTile } from "../level/query.ts";
import type { Sensor } from "../level/types.ts";
import { vehicleObb } from "./sensors.ts";
import type { Vehicle } from "../vehicle/types.ts";
import { obbInsideAabb } from "../../engine/physics/overlap.ts";

export function drawOBB(
  ctx: CanvasRenderingContext2D,
  obb: OBB,
  camX: number,
  camY: number,
  color: string = "lime",
): void {
  ctx.save();
  ctx.translate(obb.cx - camX, obb.cy - camY);
  ctx.rotate(obb.angle);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(-obb.hw, -obb.hh, obb.hw * 2, obb.hh * 2);
  ctx.restore();
}

export function drawWallAabbs(
  ctx: CanvasRenderingContext2D,
  level: Level,
  camX: number,
  camY: number,
  viewW: number,
  viewH: number,
): void {
  const minTX = Math.floor(camX / TILE_SIZE);
  const maxTX = Math.floor((camX + viewW) / TILE_SIZE);
  const minTY = Math.floor(camY / TILE_SIZE);
  const maxTY = Math.floor((camY + viewH) / TILE_SIZE);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  for (let ty = minTY; ty <= maxTY; ty++) {
    for (let tx = minTX; tx <= maxTX; tx++) {
      if (getTile(level, tx, ty) !== TILE.WALL) continue;
      ctx.strokeRect(tx * TILE_SIZE - camX, ty * TILE_SIZE - camY, TILE_SIZE, TILE_SIZE);
    }
  }
}

const DEFAULT_PARK_PADDING = 8;
const STOPPED_THRESHOLD = 5;

export function drawSensors(
  ctx: CanvasRenderingContext2D,
  level: Level,
  camX: number,
  camY: number,
  active: ReadonlySet<Sensor> = new Set(),
  activeVehicle: Vehicle | undefined = undefined,
): void {
  const activeType = activeVehicle?.type.name;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  for (const s of level.sensors) {
    const targeted = !s.vehicle || s.vehicle === activeType;
    const overlapping = active.has(s) && targeted;

    let color = "cyan";
    if (overlapping) {
      if (s.kind === "parking_spot" && activeVehicle) {
        const padding = s.padding ?? DEFAULT_PARK_PADDING;
        const aabb = { x: s.x, y: s.y, w: s.w, h: s.h };
        const contained = obbInsideAabb(vehicleObb(activeVehicle), aabb, padding);
        const stopped = Math.hypot(
          activeVehicle.body.velocity.x,
          activeVehicle.body.velocity.y,
        ) < STOPPED_THRESHOLD;
        color = contained ? (stopped ? "lime" : "magenta") : "yellow";
      } else {
        color = "lime";
      }
    }

    ctx.strokeStyle = color;
    ctx.strokeRect(s.x - camX, s.y - camY, s.w, s.h);
  }
  ctx.setLineDash([]);
}
