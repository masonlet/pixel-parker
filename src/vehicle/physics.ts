import type { Vehicle } from "./types.ts";

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
