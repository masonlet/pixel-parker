import type { OBB      } from "web-engine/physics/types.ts";
import { obbVsAabb     } from "web-engine/physics/collision.ts";
import { obbInsideAabb } from "web-engine/physics/overlap.ts";
import { vehicleObb    } from "./sensors.ts";
import type { Vehicle  } from "../vehicle/types.ts";
import { TILE, TILE_SIZE, type Level      } from "../level/types.ts";
import { getTile                          } from "../level/query.ts";
import { isParkedIn, DEFAULT_PARK_PADDING } from "../game/win.ts";

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
  vehicles: Vehicle[] = [],
  activeVehicle: Vehicle | undefined = undefined,
): void {
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  for (const s of level.sensors) {
    const subject = s.vehicle
      ? vehicles.find(v => v.type.name === s.vehicle)
      : activeVehicle;

    let color = "cyan";
    if (s.vehicle && s.vehicle === activeVehicle?.type.name) color = "white";

    if (subject) {
      if (s.kind === "parking_spot") {
        const obb = vehicleObb(subject);
        const aabb = { cx: s.x + s.w / 2, cy: s.y + s.h / 2, hw: s.w / 2, hh: s.h / 2 };
        if (isParkedIn(subject, s))
          color = "lime";
        else if (obbInsideAabb(obb, aabb, s.padding ?? DEFAULT_PARK_PADDING))
          color = "magenta";
        else if (obbVsAabb(obb, aabb))
          color = "yellow";
      } else if (subject.overlappingSensors.includes(s)) {
        color = "lime";
      }
    }

    ctx.strokeStyle = color;
    ctx.strokeRect(s.x - camX, s.y - camY, s.w, s.h);
  }
  ctx.setLineDash([]);
}
