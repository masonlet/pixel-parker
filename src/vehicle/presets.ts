import { loadImage } from "../assets.ts";
import type { VehicleType } from "./types.ts";

export type VehicleStats = Omit<VehicleType, "sprite" | "bodySprite">;

export const carStats: VehicleStats = {
  name: "car",
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

export const truckStats: VehicleStats = {
  name: "truck",
  w: 32,
  h: 48,
  turnSpeed: 1.8,
  maxSpeed: 140,
  maxReverseSpeed: 60,
  accel: 150,
  friction: 100,
  brakeForce: 280,
  gearShiftDelay: 0.4,
};

export async function loadVehicleType(stats: VehicleStats): Promise<VehicleType> {
  const sprite = await loadImage(`/img/vehicles/${stats.name}.png`);
  const bodySprite = await loadImage(`/img/vehicles/${stats.name}-body.png`);
  return { ...stats, sprite, bodySprite };
}
