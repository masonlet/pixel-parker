import { tintImage } from "../assets.ts";
import type { Vehicle, VehicleType } from "./types.ts";

export function createVehicle(
  type: VehicleType,
  x: number,
  y: number,
  hue: number
): Vehicle {
  return {
    type,
    x,
    y,
    angle: -Math.PI / 2,
    velocity: 0,
    shiftTimer: 0,
    hue
  };
}

export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  v: Vehicle,
  camX: number,
  camY: number
): void {
  const drawX = Math.floor(v.x - camX);
  const drawY = Math.floor(v.y - camY);

  const tinted = tintImage(v.type.bodySprite, `hsl(${v.hue}, 100%, 50%)`);

  ctx.save();
  ctx.translate(drawX, drawY);
  ctx.rotate(v.angle + Math.PI / 2);
  ctx.drawImage(v.type.sprite, -v.type.sprite.width / 2, -v.type.sprite.height / 2);
  ctx.drawImage(tinted, -tinted.width / 2, -tinted.height / 2);
  ctx.restore();
}
