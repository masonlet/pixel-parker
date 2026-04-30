export interface Vehicle {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Pixels per second. */
  speed: number;
  sprite: HTMLImageElement;
}

export function createVehicle(
  x: number,
  y: number,
  sprite: HTMLImageElement,
): Vehicle {
  return { x, y, w: 24, h: 24, speed: 200, sprite };
}

export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  v: Vehicle,
  camX: number,
  camY: number,
): void {
  ctx.drawImage(
    v.sprite,
    Math.floor(v.x - v.sprite.width / 2 - camX),
    Math.floor(v.y - v.sprite.height / 2 - camY),
  );
}
