import type { VehicleType } from "./vehicle.ts";

export function makeCarType(
  sprite: HTMLImageElement,
  bodySprite: HTMLImageElement
): VehicleType {
  return {
    name: "car",
    sprite,
    bodySprite,
    w: 24,
    h: 24,
    turnSpeed: 3,
    maxSpeed: 200,
    maxReverseSpeed: 100,
    accel: 300,
    friction: 150,
    brakeForce: 400,
    gearShiftDelay: 0.2,
  };
}
