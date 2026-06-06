import {
  type Level, type LevelVehicle, type LevelCone,
  type TileId, TILE, TILE_SIZE,
  type SensorKind, type Sensor, SENSOR_KINDS
} from "./types.ts";
import { isObj, optBool, num, optNum, str, optStr, arr, makeCollector } from "../utils/validate.ts";

function isTileName(x: unknown): x is keyof typeof TILE {
  return typeof x === "string" && x in TILE;
}

function isSensorKind(x: unknown): x is SensorKind {
  return typeof x === "string" && (SENSOR_KINDS as readonly string[]).includes(x);
}

export function loadLevel(rawLevel: unknown): Level {
  if (!isObj(rawLevel)) throw new Error("Level: not an object");

  const name = optStr(rawLevel, "name", "Level");

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

  const { errors, tryGet } = makeCollector();

  for (const [i, rect] of rects.entries()) {
    const ctx = `Level: rect ${i}`;

    if (!isObj(rect)) { errors.push(`${ctx} not an object`); continue; }
    const x = tryGet(() => num(rect, "x", ctx));
    const y = tryGet(() => num(rect, "y", ctx));
    const w = tryGet(() => num(rect, "w", ctx));
    const h = tryGet(() => num(rect, "h", ctx));
    const tileRaw = rect["tile"];
    if (!isTileName(tileRaw)) {
      errors.push(`${ctx}: invalid tile "${tileRaw}"`);
      continue;
    }
    if (x === undefined || y === undefined
     || w === undefined || h === undefined
    ) continue;

    const tileId = TILE[tileRaw];
    for (let ty = y; ty < y + h; ty++) {
      for (let tx = x; tx < x + w; tx++) {
        if (tx < 0 || ty < 0 || tx >= width || ty >= height) continue;
        tiles[ty * width + tx] = tileId;
      }
    }
  }

  const vehicles: LevelVehicle[] = [];
  for (const [i, v] of vehiclesRaw.entries()) {
    const ctx = `Level: vehicle ${i}`;
    if (!isObj(v)) { errors.push(`${ctx} not an object`); continue; }
    const type = tryGet(() => str(v, "type", ctx));
    const x = tryGet(() => num(v, "x", ctx));
    const y = tryGet(() => num(v, "y", ctx));
    if (type === undefined || x === undefined || y === undefined) continue;
    const damageable   = tryGet(() => optBool(v, "damageable",   ctx)) ?? true;
    const moveable     = tryGet(() => optBool(v, "moveable",     ctx)) ?? true;
    const controllable = tryGet(() => optBool(v, "controllable", ctx)) ?? true;
    vehicles.push({ type, x: x * TILE_SIZE, y: y * TILE_SIZE, damageable, moveable, controllable });
  }

  const sensors: Sensor[] = [];
  for (const [i, s] of sensorsRaw.entries()) {
    const ctx = `Level: sensor ${i}`;
    if (!isObj(s)) {
      errors.push(`${ctx} not an object`);
      continue;
    }

    const kindRaw = s["kind"];
    if (!isSensorKind(kindRaw)) {
      errors.push(`${ctx}: invalid kind "${kindRaw}"`);
      continue;
    }

    const x = tryGet(() => num(s, "x", ctx));
    const y = tryGet(() => num(s, "y", ctx));
    const w = tryGet(() => num(s, "w", ctx));
    const h = tryGet(() => num(s, "h", ctx));
    if (x === undefined || y === undefined || w === undefined || h === undefined) continue;

    const vehicle = tryGet(() => optStr(s, "vehicle", ctx));
    const padding = tryGet(() => optNum(s, "padding", ctx));
    const colour  = tryGet(() => optStr(s, "colour",  ctx));

    const sensor: Sensor = {
      kind: kindRaw,
      x: x * TILE_SIZE, y: y * TILE_SIZE, w: w * TILE_SIZE, h: h * TILE_SIZE,
    };
    if (vehicle !== undefined) sensor.vehicle = vehicle;
    if (padding !== undefined) sensor.padding = padding * TILE_SIZE;
    if (colour  !== undefined) sensor.colour = colour;
    sensors.push(sensor);
  }

  const cones: LevelCone[] = [];
  const conesRaw = rawLevel["cones"];
  if (Array.isArray(conesRaw)) {
    for (const [i, c] of conesRaw.entries()) {
      const ctx = `Level: cone ${i}`;
      if (!isObj(c)) { errors.push(`${ctx} not an object`); continue; }
      const x = tryGet(() => num(c, "x", ctx));
      const y = tryGet(() => num(c, "y", ctx));
      if (x === undefined || y === undefined) continue;
      cones.push({ x: x * TILE_SIZE, y: y * TILE_SIZE });
    }
  }

  if (errors.length) throw new Error(
    `Level failed validation:\n  ${errors.join("\n  ")}`
  );

  const level: Level = { width, height, tiles, vehicles, sensors, cones };
  if (name !== undefined) level.name = name;
  return level;
}
