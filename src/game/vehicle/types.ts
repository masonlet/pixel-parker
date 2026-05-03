import type { PhysicsBody } from "../../engine/physics/types.ts";
import type { Sensor } from "../level/types.ts";

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
  /** Mass in arbitrary units. Higher = harder to push. */
  mass: number;
}

export interface Vehicle {
  /** Vehicle config. */
  type: VehicleType;
  /** Vehicle body. */
  body: PhysicsBody;
  /** Driver throttle: -1 (reverse), 0, 1 (forward). */
  throttle: number;
  /** Driver steer: -1 (left), 0, 1 (right). */
  steer: number;
  /** Seconds remaining on the gear-shift wait. */
  shiftTimer: number;
  /** Body colour hue in degrees, 0-360. */
  hue: number;
  /** Sensors this vehicle is touching */
  overlappingSensors: Sensor[];
}
