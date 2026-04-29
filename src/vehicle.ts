export interface Vehicle {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Pixels per second. */
  speed: number;
}

export function createVehicle(x: number, y: number): Vehicle {
  return { x, y, w: 24, h: 24, speed: 200 };
}

export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  v: Vehicle,
  camX: number,
  camY: number,
): void {
  ctx.fillStyle = "#c44";
  ctx.fillRect(
    Math.floor(v.x - v.w / 2 - camX),
    Math.floor(v.y - v.h / 2 - camY),
    v.w,
    v.h,
  );
}
