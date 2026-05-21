import { tintImage    } from "web-engine/assets.ts";
import type { Vehicle } from "./types.ts";

export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  v: Vehicle,
  camX: number,
  camY: number
): void {
  const drawX = Math.floor(v.body.position.x - camX);
  const drawY = Math.floor(v.body.position.y - camY);

  const tinted = tintImage(v.type.bodySprite, `hsl(${v.hue}, 100%, 50%)`);

  ctx.save();
  ctx.translate(drawX, drawY);
  ctx.rotate(v.body.angle + Math.PI / 2);
  ctx.drawImage(v.type.sprite, -v.type.sprite.width / 2, -v.type.sprite.height / 2);
  ctx.drawImage(tinted, -tinted.width / 2, -tinted.height / 2);
  ctx.restore();
}
