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

  if (v.hue !== v.cachedHue) {
    v.cachedTint = tintImage(v.type.bodySprite, `hsl(${v.hue}, 100%, 50%)`);
    v.cachedHue = v.hue;
  }

  ctx.save();
  ctx.translate(drawX, drawY);
  ctx.rotate(v.body.angle + Math.PI / 2);
  ctx.drawImage(v.type.sprite, -v.type.sprite.width / 2, -v.type.sprite.height / 2);
  ctx.drawImage(v.cachedTint, -v.cachedTint.width / 2, -v.cachedTint.height / 2);
  ctx.restore();
}
