import type { OBB } from "./types.ts";
import { TILE, TILE_SIZE, type Level } from "../level/types.ts";
import { getTile } from "../level/query.ts";
import type { Sensor } from "../level/types.ts";

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

export function drawSensors(
  ctx: CanvasRenderingContext2D,
  level: Level,
  camX: number,
  camY: number,
  active: ReadonlySet<Sensor> = new Set(),
): void {
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  for (const s of level.sensors) {
    ctx.strokeStyle = active.has(s) ? "lime" : "cyan";
    ctx.strokeRect(s.x - camX, s.y - camY, s.w, s.h);
  }
  ctx.setLineDash([]);
}
