export interface Vec2 {
  x: number;
  y: number;
}

export interface PhysicsBody {
  /** World-space position in pixels. */
  position: Vec2;
  /** Velocity in pixels per second. */
  velocity: Vec2;
  /** Facing angle in radians. 0 = facing right. */
  angle: number;
  /** Hitbox width in pixels. */
  w: number;
  /** Hitbox height in pixels. */
  h: number;
  /** Mass. */
  mass: number;
}

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
