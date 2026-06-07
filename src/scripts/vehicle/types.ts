import type { RectBody } from "starweb-physics/types.js";
import type { Sensor   } from "../level/types.ts";

export interface VehicleStats {
  /** Identifier for this vehicle type */
  name: string;

  /** Base vehicle sprite path */
  spritePath:     string;
  /** Tintable overlay sprite path */
  bodySpritePath: string;
  /** Optional fixed colour. If omitted, a random colour is assigned on spawn. */
  colour?:        string;

  /** Mass in arbitrary units. Higher = harder to push. */
  mass: number;
  /** Hitbox width in pixels. */
  w:    number;
  /** Hitbox height in pixels. */
  h:    number;

  /** Delay in seconds before gear engages after braking to a stop. */
  gearShiftDelay:  number;

  /** Acceleration in pixels per second^2. */
  accel:           number;
  /** Passive deceleration when no throttle in pixels per second^2. */
  friction:        number;
  /** Braking force in pixels per second^2. */
  brakeForce:      number;
  /** Maximum forward speed in pixels per second. */
  maxSpeed:        number;
  /** Maximum reverse speed in pixels per second. */
  maxReverseSpeed: number;
  /** Maximum turn rate in radians per second. */
  turnSpeed:       number;
}

export interface VehicleType extends VehicleStats {
  /** Base vehicle sprite */
  sprite: HTMLImageElement;
  /** Tintable overlay sprite */
  bodySprite: HTMLImageElement;
}

export interface Vehicle {
  /** Vehicle config. */
  type: VehicleType;
  /** Vehicle body. */
  body: RectBody;

  /** Driver throttle: -1 (reverse), 0, 1 (forward). */
  throttle:  number;
  /** Driver steer: -1 (left), 0, 1 (right). */
  steer:     number;
  /** Seconds remaining on the gear-shift wait. */
  shiftTimer: number;

  /** Body colour as hex string. */
  colour: string;
  /** Body tint canvas. */
  tint: HTMLCanvasElement;

  /** Sensors this vehicle is touching */
  overlappingSensors: Sensor[];

  /** Flag to disable/enable this vehicles damage output. */
  damageable: boolean;
  /** Flag to disable/enable driving this vehicle. */
  driveable:  boolean;
  /** Flag to disable/enable switching to this vehicle. */
  selectable: boolean;
}
