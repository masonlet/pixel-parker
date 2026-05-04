import {
  type Level, type LevelVehicle,
  type TileId, TILE, TILE_SIZE,
  type SensorKind, type Sensor, SENSOR_KINDS
} from "./types.ts";

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isTileName(x: unknown): x is keyof typeof TILE {
  return typeof x === "string" && x in TILE;
}

function isSensorKind(x: unknown): x is SensorKind {
  return typeof x === "string" && (SENSOR_KINDS as readonly string[]).includes(x);
}

export function loadLevel(rawLevel: unknown): Level {
  if (!isObj(rawLevel)) throw new Error("Level: not an object");

  const { width, height, fill, rects, vehicles, sensors } = rawLevel;

  if (typeof width !== "number" || width <= 0)   throw new Error("Level: invalid width");
  if (typeof height !== "number" || height <= 0) throw new Error("Level: invalid height");
  if (!isTileName(fill))      throw new Error(`Level: invalid fill "${fill}"`);
  if (!Array.isArray(rects))  throw new Error("Level: rects must be an array");
  if (!Array.isArray(vehicles)) throw new Error("Level: vehicles must be an array");
  if (!Array.isArray(sensors)) throw new Error("Level: sensors must be an array");

  const tiles: TileId[] = new Array(width * height).fill(TILE[fill]);

  for (const [i, rect] of rects.entries()) {
    if (!isObj(rect)) throw new Error(`Level: rect ${i} not an object`);

    const { x, y, w, h, tile } = rect;
    if (typeof x !== "number" || typeof y !== "number" ||
        typeof w !== "number" || typeof h !== "number"
    ) throw new Error(`Level: rect ${i} has non-number x/y/w/h`);

    if (!isTileName(tile)) throw new Error(`Level: rect ${i} invalid tile "${tile}"`);

    const tileId = TILE[tile];
    for (let ty = y; ty < y + h; ty++) {
      for (let tx = x; tx < x + w; tx++) {
        if (tx < 0 || ty < 0 || tx >= width || ty >= height) continue;
        tiles[ty * width + tx] = tileId;
      }
    }
  }

  const parsedVehicles: LevelVehicle[] = vehicles.map((v, i) => {
    if (!isObj(v)) throw new Error(`Level: vehicle ${i} not an object`);
    const { type, x, y } = v;
    if (typeof type !== "string") throw new Error(`Level: vehicle ${i} has non-string type`);
    if (typeof x !== "number" || typeof y !== "number")
      throw new Error(`Level: vehicle ${i} has non-number x/y`);
    return { type, x: x * TILE_SIZE, y: y * TILE_SIZE };
  });

  const parsedSensors: Sensor[] = sensors.map((s, i) => {
    if (!isObj(s)) throw new Error(`Level: sensor ${i} not an object`);
    const { kind, x, y, w, h, vehicle, padding } = s;
    if (!isSensorKind(kind)) throw new Error(`Level: sensor ${i} invalid kind "${kind}"`);
    if (typeof x !== "number" || typeof y !== "number" ||
        typeof w !== "number" || typeof h !== "number"
    ) throw new Error(`Level: sensor ${i} has non-number x/y/w/h`);
    if (vehicle !== undefined && typeof vehicle !== "string")
      throw new Error(`Level: sensor ${i} vehicle must be a string if present`);
    if (padding !== undefined && (typeof padding !== "number" || padding < 0))
      throw new Error(`Level: sensor ${i} padding must be a positive number`);

    const sensor: Sensor = {
      kind,
      x: x * TILE_SIZE,
      y: y * TILE_SIZE,
      w: w * TILE_SIZE,
      h: h * TILE_SIZE,
    };
    if (vehicle !== undefined) sensor.vehicle = vehicle;
    if (padding !== undefined) sensor.padding = padding * TILE_SIZE;
    return sensor;
  });

  return { width, height, tiles, vehicles: parsedVehicles, sensors: parsedSensors };
}
