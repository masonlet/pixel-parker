import type { Vehicle } from "./types.ts";

export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  v: Vehicle,
  camX: number,
  camY: number
): void {
  const drawX = Math.floor(v.body.position.x - camX);
  const drawY = Math.floor(v.body.position.y - camY);

  ctx.save();
  ctx.translate(drawX, drawY);
  ctx.rotate(v.body.angle + Math.PI / 2);
  ctx.drawImage(v.type.sprite, -v.type.sprite.width / 2, -v.type.sprite.height / 2);
  ctx.drawImage(v.tint, -v.tint.width / 2, -v.tint.height / 2);
  ctx.restore();
}
