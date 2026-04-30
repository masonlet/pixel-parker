export interface Vehicle {
  x: number, y: number;
  w: number, h: number;
  sprite: HTMLImageElement;
  /** Pixels per second. */
  speed: number;
  /** Radians. 0 = facing right */
  angle: number;
  /** Radians per second. */
  turnSpeed: number;
}

export function createVehicle(
  x: number, y: number,
  w: number, h: number,
  sprite: HTMLImageElement,
  speed: number,
  turnSpeed: number
): Vehicle {
  return {
    x, y,
    w, h,
    sprite,
    speed,
    angle: -Math.PI / 2,
    turnSpeed
  };
}

export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  v: Vehicle,
  camX: number,
  camY: number,
): void {
  const drawX = Math.floor(v.x - camX);
  const drawY = Math.floor(v.y - camY);

  ctx.save();
  ctx.translate(drawX, drawY);
  ctx.rotate(v.angle + Math.PI / 2);
  ctx.drawImage(
    v.sprite,
    -v.sprite.width / 2,
    -v.sprite.height / 2,
  );
  ctx.restore();
}
