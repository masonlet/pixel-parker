import {
  isObj,
  optBool,
  num, optNum,
  str, optStr,
  arr,
  makeCollector, type Collector
} from "@starweb-libs/engine/validate.js";
import {
  type Level, type LevelVehicle, type LevelCone,
  type TileId, TILE, TILE_SIZE,
  type SensorKind, type Sensor, SENSOR_KINDS
} from "./types.ts";

function isTileName(x: unknown): x is keyof typeof TILE {
  return typeof x === "string" && x in TILE;
}

function isSensorKind(x: unknown): x is SensorKind {
  return typeof x === "string" && (SENSOR_KINDS as readonly string[]).includes(x);
}

function parseTiles(
  rects: unknown[],
  width: number,
  height: number,
  fill: TileId,
  col: Collector
): TileId[] {
  const tiles: TileId[] = new Array(width * height).fill(fill);
  for (const [i, rect] of rects.entries()) {
    const ctx = `Level: rect ${i}`;

    if (!isObj(rect)) { col.errors.push(`${ctx} not an object`); continue; }
    const x = col.tryGet(() => num(rect, "x", ctx));
    const y = col.tryGet(() => num(rect, "y", ctx));
    const w = col.tryGet(() => num(rect, "w", ctx));
    const h = col.tryGet(() => num(rect, "h", ctx));
    const tileRaw = rect["tile"];
    if (!isTileName(tileRaw)) {
      col.errors.push(`${ctx}: invalid tile "${tileRaw}"`);
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
  return tiles;
}

function parseVehicles(raw: unknown[], col: Collector): LevelVehicle[] {
  const vehicles: LevelVehicle[] = [];
  for (const [i, v] of raw.entries()) {
    const ctx = `Level: vehicle ${i}`;
    if (!isObj(v)) { col.errors.push(`${ctx} not an object`); continue; }
    const type = col.tryGet(() => str(v, "type", ctx));
    const x =    col.tryGet(() => num(v, "x", ctx));
    const y =    col.tryGet(() => num(v, "y", ctx));
    if (type === undefined || x === undefined || y === undefined) continue;
    const damageable = col.tryGet(() => optBool(v, "damageable", ctx)) ?? true;
    const driveable  = col.tryGet(() => optBool(v, "driveable",  ctx)) ?? true;
    const selectable = col.tryGet(() => optBool(v, "selectable", ctx)) ?? driveable;
    const pushable   = col.tryGet(() => optBool(v, "pushable",   ctx)) ?? true;
    vehicles.push({
      type,
      x: x * TILE_SIZE, y: y * TILE_SIZE,
      damageable, driveable, selectable, pushable
    });
  }
  return vehicles;
}

function parseSensors(raw: unknown[], col: Collector): Sensor[] {
  const sensors: Sensor[] = [];
  for (const [i, s] of raw.entries()) {
    const ctx = `Level: sensor ${i}`;
    if (!isObj(s)) {
      col.errors.push(`${ctx} not an object`);
      continue;
    }

    const kindRaw = s["kind"];
    if (!isSensorKind(kindRaw)) {
      col.errors.push(`${ctx}: invalid kind "${kindRaw}"`);
      continue;
    }

    const x = col.tryGet(() => num(s, "x", ctx));
    const y = col.tryGet(() => num(s, "y", ctx));
    const w = col.tryGet(() => num(s, "w", ctx));
    const h = col.tryGet(() => num(s, "h", ctx));
    if (x === undefined || y === undefined || w === undefined || h === undefined) continue;

    const vehicle = col.tryGet(() => optStr(s, "vehicle", ctx));
    const padding = col.tryGet(() => optNum(s, "padding", ctx));
    const colour  = col.tryGet(() => optStr(s, "colour",  ctx));

    const sensor: Sensor = {
      kind: kindRaw,
      x: x * TILE_SIZE, y: y * TILE_SIZE, w: w * TILE_SIZE, h: h * TILE_SIZE,
    };
    if (vehicle !== undefined) sensor.vehicle = vehicle;
    if (padding !== undefined) sensor.padding = padding * TILE_SIZE;
    if (colour  !== undefined) sensor.colour = colour;
    sensors.push(sensor);
  }
  return sensors;
}

function parseCones(raw: unknown, col: Collector): LevelCone[] {
  const cones: LevelCone[] = [];
  if (Array.isArray(raw)) {
    for (const [i, c] of raw.entries()) {
      const ctx = `Level: cone ${i}`;
      if (!isObj(c)) { col.errors.push(`${ctx} not an object`); continue; }
      const x = col.tryGet(() => num(c, "x", ctx));
      const y = col.tryGet(() => num(c, "y", ctx));
      if (x === undefined || y === undefined) continue;
      cones.push({ x: x * TILE_SIZE, y: y * TILE_SIZE });
    }
  }
  return cones;
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

  const col      = makeCollector();
  const tiles    = parseTiles(arr(rawLevel, "rects", "Level"), width, height, TILE[fillRaw], col);
  const vehicles = parseVehicles(arr(rawLevel, "vehicles", "Level"), col);
  const sensors  = parseSensors(arr(rawLevel, "sensors", "Level"), col);
  const cones    = parseCones(rawLevel["cones"], col);

  if (col.errors.length) throw new Error(
    `Level failed validation:\n  ${col.errors.join("\n  ")}`
  );

  const level: Level = { width, height, tiles, vehicles, sensors, cones };
  if (name !== undefined) level.name = name;
  return level;
}
