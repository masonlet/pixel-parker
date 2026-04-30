import type { VehicleType } from "./types.ts";

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

export function makeTruckType (
  sprite: HTMLImageElement,
  bodySprite: HTMLImageElement
): VehicleType {
  return {
    name: "truck",
    sprite,
    bodySprite,
    w: 32,
    h: 48,
    turnSpeed: 1.8,
    maxSpeed: 140,
    maxReverseSpeed: 60,
    accel: 150,
    friction: 100,
    brakeForce: 280,
    gearShiftDelay: 0.4
  }
}
