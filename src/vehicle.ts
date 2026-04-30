import { tintImage } from "./assets.ts";

export interface Vehicle {
  x: number, y: number;
  w: number, h: number;
  /** Vehicles sprite. */
  sprite: HTMLImageElement;
  /** Vehicles body sprite. */
  bodySprite: HTMLImageElement;
  /** Vehicles colour hue. */
  hue: number;
  /** Radians. 0 = facing right */
  angle: number;
  /** Radians per second. */
  turnSpeed: number;
  /** Current forward velocity, pixels per second. */
  velocity: number;
  /** Maximum forward speed, pixels per second. */
  maxSpeed: number;
  /** Maximum reverse speed, pixels per second. */
  maxReverseSpeed: number;
  /** Pixels per second. */
  accel: number;
  /** Pixels per second — decay applied when no throttle. */
  friction: number;
  /** Pixels per second — applied when actively braking. */
  brakeForce: number;
  /** Seconds to wait when shifting between forward and reverse. */
  gearShiftDelay: number;
  /** Seconds remaining on the current gear-shift wait. */
  shiftTimer: number;
}

export function createVehicle(
  x: number, y: number,
  w: number, h: number,
  sprite: HTMLImageElement,
  bodySprite: HTMLImageElement,
  hue: number,
  turnSpeed: number,
  maxSpeed: number,
  maxReverseSpeed: number,
  accel: number,
  friction: number,
  brakeForce: number,
  gearShiftDelay: number,
): Vehicle {
  return {
    x, y,
    w, h,
    sprite, bodySprite,
    hue,
    angle: -Math.PI / 2,
    turnSpeed,
    velocity: 0,
    maxSpeed,
    maxReverseSpeed,
    accel,
    friction,
    brakeForce,
    gearShiftDelay,
    shiftTimer: 0
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

  const tinted = tintImage(v.bodySprite, `hsl(${v.hue}, 100%, 50%)`);

  ctx.save();
  ctx.translate(drawX, drawY);
  ctx.rotate(v.angle + Math.PI / 2);
  ctx.drawImage(v.sprite, -v.sprite.width / 2, -v.sprite.height / 2);
  ctx.drawImage(tinted, -tinted.width / 2, -tinted.height / 2);
  ctx.restore();
}
