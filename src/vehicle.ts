import { tintImage } from "./assets.ts";

export interface VehicleType {
  /** Identifier for this vehicle type */
  name: string;
  /** Base vehicle sprite */
  sprite: HTMLImageElement;
  /** Tintable overlay sprite */
  bodySprite: HTMLImageElement;
  /** Hitbox width in pixels. */
  w: number;
  /** Hitbox height in pixels. */
  h: number;
  /** Maximum turn rate in radians per second. */
  turnSpeed: number;
  /** Maximum forward speed in pixels per second. */
  maxSpeed: number;
  /** Maximum reverse speed in pixels per second. */
  maxReverseSpeed: number;
  /** Acceleration in pixels per second^2. */
  accel: number;
  /** Passive deceleration when no throttle in pixels per second^2. */
  friction: number;
  /** Braking force in pixels per second^2. */
  brakeForce: number;
  /** Delay in seconds before gear engages after braking to a stop. */
  gearShiftDelay: number;
}

export interface Vehicle {
  /** Vehicle config. */
  type: VehicleType;
  /** World-space X position in pixels. */
  x: number;
  /** World-space Y position in pixels. */
  y: number;
  /** Facing angle in radians. 0 = facing right */
  angle: number;
  /** Current forward velocity in pixels per second. */
  velocity: number;
  /** Seconds remaining on the gear-shift wait. */
  shiftTimer: number;
  /** Body colour hue in degrees, 0-360. */
  hue: number;
}

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
