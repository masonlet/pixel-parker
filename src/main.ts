import "./style.css";
import {
  TILE, TILE_SIZE,
  type Level, drawLevel
} from "./level.ts";
import { startLoop } from "./update.ts";
import { createVehicle, drawVehicle } from "./vehicle.ts";
import { isDown } from "./input.ts";
import { loadImage } from "./assets.ts";
import { makeCarType } from "./vehicleTypes.ts";

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
const carType = makeCarType(carSprite, carBodySprite);
const car = createVehicle(
  carType,
  (level.width * TILE_SIZE) / 2,
  (level.height * TILE_SIZE) / 2,
  180,
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

    const speedRatio = Math.min(Math.abs(car.velocity) / car.type.maxSpeed, 1);
    car.angle += steer * car.type.turnSpeed * speedRatio * Math.sign(car.velocity) * dt;
    
    if (car.shiftTimer > 0) {
      car.shiftTimer -= dt;
      if (car.shiftTimer < 0) car.shiftTimer = 0;
    }

    if (throttle > 0) { // Forward
      if (car.velocity < 0) { // Braking
        car.velocity += car.type.brakeForce * dt;
        if (car.velocity >= 0) {
          car.velocity = 0;
          car.shiftTimer = car.type.gearShiftDelay;
        }
      } else if (car.shiftTimer > 0) {
        // Gear shifting delay
      } else { // Accelerating
        car.velocity += car.type.accel * dt;
        if (car.velocity > car.type.maxSpeed) car.velocity = car.type.maxSpeed;
      }
    } else if (throttle < 0) { // Reverse
      if (car.velocity > 0) { // Braking
        car.velocity -= car.type.brakeForce * dt;
        if (car.velocity <= 0) {
          car.velocity = 0;
          car.shiftTimer = car.type.gearShiftDelay;
        }
      } else if (car.shiftTimer > 0) {
        // Gear shifting delay
      } else { // Reversing
        car.velocity -= car.type.accel * dt;
        if (car.velocity < -car.type.maxReverseSpeed) car.velocity = -car.type.maxReverseSpeed;
      }
    } else { // Idle
      if (car.velocity > 0) { // De-accelerate
        car.velocity -= car.type.friction * dt;
        if (car.velocity < 0) car.velocity = 0;
      } else if (car.velocity < 0) { // Braking
        car.velocity += car.type.friction * dt;
        if (car.velocity > 0) car.velocity = 0;
      }
    }

    car.x += Math.cos(car.angle) * car.velocity * dt;
    car.y += Math.sin(car.angle) * car.velocity * dt;

    car.hue = (car.hue + 60 * dt) % 360;
  },
  () => {
    const camX = car.x - canvas.width / 2;
    const camY = car.y - canvas.height / 2;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLevel(ctx, level, camX, camY);
    drawVehicle(ctx, car, camX, camY);
  },
);
