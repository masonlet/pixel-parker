import type { TweenTarget } from "@starweb-libs/tween/types.js";
import { type Level, type Sensor, TILE, TILE_SIZE } from "./types.ts";
import type { Vehicle } from "../vehicle/types.ts";
import { getTile      } from "./query.ts";

export function drawLevel(
  ctx: CanvasRenderingContext2D,
  level: Level,
  camX: number,
  camY: number,
): void {
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const id = getTile(level, x, y);
      ctx.fillStyle = id === TILE.WALL
        ? "#444"
        : (x + y) % 2 === 0 ? "#222" : "#262626";
      ctx.fillRect(
        Math.floor(x * TILE_SIZE - camX),
        Math.floor(y * TILE_SIZE - camY),
        TILE_SIZE + 1, // +1 prevents gaps between adjacent tiles
        TILE_SIZE + 1, // +1 prevents gaps between adjacent tiles
      );
    }
  }
}

export function drawSensorOverlays(
  ctx: CanvasRenderingContext2D,
  level: Level,
  sensorAlphas: Map<Sensor, TweenTarget>,
  parkedSensors: Set<Sensor>,
  vehicles: Vehicle[],
  camX: number,
  camY: number,
): void {
  for (const s of level.sensors) {
    const vehicle = s.vehicle
      ? vehicles.find(v => v.type.name === s.vehicle)
      : undefined;

    const colour = s.colour ?? vehicle?.colour;
    if (!colour) continue;

    const target = sensorAlphas.get(s);
    if (!target) continue;

    const x = s.x - camX;
    const y = s.y - camY;
    const parked = parkedSensors.has(s);

    ctx.save();

    ctx.globalAlpha = parked ? 0.35 : (target.alpha ?? 0.05);
    ctx.fillStyle = parked ? "#00ff66" : colour;
    ctx.fillRect(x, y, s.w, s.h);

    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = parked ? "#00ff66" : colour;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, s.w, s.h);

    ctx.restore();
  }
}
