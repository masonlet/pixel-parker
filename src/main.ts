import "./style.css";
import {
  TILE, TILE_SIZE,
  type Level, drawLevel
} from "./level.ts";
import { startLoop } from "./update.ts";
import { createVehicle, drawVehicle } from "./vehicle.ts";
import { isDown } from "./input.ts";
import { loadImage } from "./assets.ts";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctxOrNull = canvas.getContext("2d");
if (!ctxOrNull) throw new Error("2D canvas context not found");
const ctx = ctxOrNull;
ctx.imageSmoothingEnabled = false;

const levelW = 40;
const levelH = 30;
const level: Level = {
  width: levelW,
  height: levelH,
  tiles: Array.from({ length: levelW * levelH }, (_, i) => {
    const x = i % levelW;
    const y = Math.floor(i / levelW);
    const isBorder = x === 0 || y === 0 || x === levelW - 1 || y === levelH - 1;
    return isBorder ? TILE.WALL : TILE.EMPTY;
  }),
};

const carSprite = await loadImage("/img/vehicles/car.png");
const carBodySprite = await loadImage("/img/vehicles/car-body.png");

const vehicle = createVehicle(
  (level.width * TILE_SIZE) / 2,
  (level.height * TILE_SIZE) / 2,
  24, 24,
  carSprite,
  carBodySprite,
  180,
  3,
  200,
  100,
  300,
  150,
  400,
  0.2
);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

startLoop(
  (dt) => {
    let throttle = 0;
    if (isDown("KeyW")) throttle += 1;
    if (isDown("KeyS")) throttle -= 1;

    let steer = 0;
    if (isDown("KeyA")) steer -= 1;
    if (isDown("KeyD")) steer += 1;

    const speedRatio = Math.min(Math.abs(vehicle.velocity) / vehicle.maxSpeed, 1);
    vehicle.angle += steer * vehicle.turnSpeed * speedRatio * Math.sign(vehicle.velocity) * dt;
    
    if (vehicle.shiftTimer > 0) {
      vehicle.shiftTimer -= dt;
      if (vehicle.shiftTimer < 0) vehicle.shiftTimer = 0;
    }

    if (throttle > 0) { // Forward
      if (vehicle.velocity < 0) { // Braking
        vehicle.velocity += vehicle.brakeForce * dt;
        if (vehicle.velocity >= 0) {
          vehicle.velocity = 0;
          vehicle.shiftTimer = vehicle.gearShiftDelay;
        }
      } else if (vehicle.shiftTimer > 0) {
        // Gear shifting delay
      } else { // Accelerating
        vehicle.velocity += vehicle.accel * dt;
        if (vehicle.velocity > vehicle.maxSpeed) vehicle.velocity = vehicle.maxSpeed;
      }
    } else if (throttle < 0) { // Reverse
      if (vehicle.velocity > 0) { // Braking
        vehicle.velocity -= vehicle.brakeForce * dt;
        if (vehicle.velocity <= 0) {
          vehicle.velocity = 0;
          vehicle.shiftTimer = vehicle.gearShiftDelay;
        }
      } else if (vehicle.shiftTimer > 0) {
        // Gear shifting delay
      } else { // Reversing
        vehicle.velocity -= vehicle.accel * dt;
        if (vehicle.velocity < -vehicle.maxReverseSpeed) vehicle.velocity = -vehicle.maxReverseSpeed;
      }
    } else { // Idle
      if (vehicle.velocity > 0) { // De-accelerate
        vehicle.velocity -= vehicle.friction * dt;
        if (vehicle.velocity < 0) vehicle.velocity = 0;
      } else if (vehicle.velocity < 0) { // Braking
        vehicle.velocity += vehicle.friction * dt;
        if (vehicle.velocity > 0) vehicle.velocity = 0;
      }
    }

    vehicle.x += Math.cos(vehicle.angle) * vehicle.velocity * dt;
    vehicle.y += Math.sin(vehicle.angle) * vehicle.velocity * dt;

    vehicle.hue = (vehicle.hue + 60 * dt) % 360;
  },
  () => {
    const camX = vehicle.x - canvas.width / 2;
    const camY = vehicle.y - canvas.height / 2;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLevel(ctx, level, camX, camY);
    drawVehicle(ctx, vehicle, camX, camY);
  },
);
