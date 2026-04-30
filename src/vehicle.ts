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

export function applyInput(
  v: Vehicle,
  throttle: number,
  steer: number,
  dt: number
): void {
  const speedRatio = Math.min(Math.abs(v.velocity) / v.type.maxSpeed, 1);
  v.angle += steer * v.type.turnSpeed * speedRatio * Math.sign(v.velocity) * dt;
  
  if (v.shiftTimer > 0) {
    v.shiftTimer -= dt;
    if (v.shiftTimer < 0) v.shiftTimer = 0;
  }

  if (throttle > 0) { // Forward
    if (v.velocity < 0) { // Braking
      v.velocity += v.type.brakeForce * dt;
      if (v.velocity >= 0) {
        v.velocity = 0;
        v.shiftTimer = v.type.gearShiftDelay;
      }
    } else if (v.shiftTimer > 0) {
      // Gear shifting delay
    } else { // Accelerating
      v.velocity += v.type.accel * dt;
      if (v.velocity > v.type.maxSpeed) v.velocity = v.type.maxSpeed;
    }
  } else if (throttle < 0) { // Reverse
    if (v.velocity > 0) { // Braking
      v.velocity -= v.type.brakeForce * dt;
      if (v.velocity <= 0) {
        v.velocity = 0;
        v.shiftTimer = v.type.gearShiftDelay;
      }
    } else if (v.shiftTimer > 0) {
      // Gear shifting delay
    } else { // Reversing
      v.velocity -= v.type.accel * dt;
      if (v.velocity < -v.type.maxReverseSpeed) v.velocity = -v.type.maxReverseSpeed;
    }
  } else { // Idle
    if (v.velocity > 0) { // De-accelerate
      v.velocity -= v.type.friction * dt;
      if (v.velocity < 0) v.velocity = 0;
    } else if (v.velocity < 0) { // Braking
      v.velocity += v.type.friction * dt;
      if (v.velocity > 0) v.velocity = 0;
    }
  }
}

export function moveVehicle(v: Vehicle, dt: number): void {
  v.x += Math.cos(v.angle) * v.velocity * dt;
  v.y += Math.sin(v.angle) * v.velocity * dt;
}
