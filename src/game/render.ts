import type { PlayState } from "./types.ts";

import { drawLevel } from "../level/render.ts";

import { drawWallAabbs, drawOBB, drawSensors } from "../physics/debug.ts";

import { drawVehicle } from "../vehicle/render.ts";

export function renderPlay(
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

