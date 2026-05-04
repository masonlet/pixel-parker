import {
  type Level, type LevelVehicle,
  type TileId, TILE, TILE_SIZE,
  type SensorKind, type Sensor, SENSOR_KINDS
} from "./types.ts";
import { isObj, num, optNum, str, optStr, arr } from "../utils/validate.ts";

function isTileName(x: unknown): x is keyof typeof TILE {
  return typeof x === "string" && x in TILE;
}

function isSensorKind(x: unknown): x is SensorKind {
  return typeof x === "string" && (SENSOR_KINDS as readonly string[]).includes(x);
}

export function loadLevel(rawLevel: unknown): Level {
  if (!isObj(rawLevel)) throw new Error("Level: not an object");

  const width = num(rawLevel, "width", "Level");
  const height = num(rawLevel, "height", "Level");
  if (width <= 0) throw new Error("Level: width must be > 0");
  if (height <= 0) throw new Error("Level: height must be > 0");

  const fillRaw = rawLevel["fill"];
  if (!isTileName(fillRaw)) throw new Error(`Level: invalid fill "${fillRaw}"`);

  const rects = arr(rawLevel, "rects", "Level");
  const vehiclesRaw = arr(rawLevel, "vehicles", "Level");
  const sensorsRaw = arr(rawLevel, "sensors", "Level");

  const tiles: TileId[] = new Array(width * height).fill(TILE[fillRaw]);

  for (const [i, rect] of rects.entries()) {
    const ctx = `Level: rect ${i}`;

    if (!isObj(rect)) throw new Error(`${ctx} not an object`);
    const x = num(rect, "x", ctx);
    const y = num(rect, "y", ctx);
    const w = num(rect, "w", ctx);
    const h = num(rect, "h", ctx);
    const tileRaw = rect["tile"];
    if (!isTileName(tileRaw)) throw new Error(`${ctx}: invalid tile "${tileRaw}"`);

    const tileId = TILE[tileRaw];
    for (let ty = y; ty < y + h; ty++) {
      for (let tx = x; tx < x + w; tx++) {
        if (tx < 0 || ty < 0 || tx >= width || ty >= height) continue;
        tiles[ty * width + tx] = tileId;
      }
    }
  }

  const vehicles: LevelVehicle[] = vehiclesRaw.map((v, i) => {
    const ctx = `Level: vehicle ${i}`;
    if (!isObj(v)) throw new Error(`${ctx} not an object`);
    return {
      type: str(v, "type", ctx),
      x: num(v, "x", ctx) * TILE_SIZE,
      y: num(v, "y", ctx) * TILE_SIZE,
    };
  });

  const sensors: Sensor[] = sensorsRaw.map((s, i) => {
    const ctx = `Level: sensor ${i}`;
    if (!isObj(s)) throw new Error(`${ctx} not an object`);
    const kindRaw = s["kind"];
    if (!isSensorKind(kindRaw)) throw new Error(`${ctx}: invalid kind "${kindRaw}"`);
    const x = num(s, "x", ctx);
    const y = num(s, "y", ctx);
    const w = num(s, "w", ctx);
    const h = num(s, "h", ctx);

    const sensor: Sensor = {
      kind: kindRaw,
      x: x * TILE_SIZE,
      y: y * TILE_SIZE,
      w: w * TILE_SIZE,
      h: h * TILE_SIZE,
    };

    const vehicle = optStr(s, "vehicle", ctx);
    const padding = optNum(s, "padding", ctx);
    if (vehicle !== undefined) sensor.vehicle = vehicle;
    if (padding !== undefined) sensor.padding = padding * TILE_SIZE;
    
    return sensor;
  });

  return { width, height, tiles, vehicles, sensors };
}
