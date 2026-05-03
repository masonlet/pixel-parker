import type { PhysicsBody } from "./types.ts";

export function createBody(params: {
  x: number;
  y: number;
  w: number;
  h: number;
  mass: number;
  angle?: number;
}): PhysicsBody {
 return {
    position: { x: params.x, y: params.y },
    velocity: { x: 0, y: 0 },
    angle: params.angle ?? 0,
    w: params.w,
    h: params.h,
    mass: params.mass,
  };
}
