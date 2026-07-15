import { isObj, str, optStr, arr, makeCollector, type Collector } from "@starweb-libs/engine/validate.js";
import type { Audio                                             } from "@starweb-libs/audio/audio.js";
import type { Campaign, CampaignData, CampaignAudio, CampaignEntry } from "./types.ts";
import type { Level                                                } from "../level/types.ts";
import { loadLevel                                                 } from "../level/load.ts";
import type { VehicleType                                          } from "../vehicle/types.ts";
import { loadVehicleType, parseVehicleStats                        } from "../vehicle/load.ts";

const BASE_PATH = "../../assets/campaigns/";
const campaignFiles = import.meta.glob("../../assets/campaigns/**/*.json", {
  eager: true,
  import: "default"
}) as Record<string, unknown>;

function resolveEntry(entry: unknown, basePath: string, ctx: string): unknown {
  if (!isObj(entry)) throw new Error(`${ctx}: entry must be an object`);

  const hasData = "data" in entry;
  const hasPath = "path" in entry;
  if ( hasData &&  hasPath) throw new Error(`${ctx}: entry has both "data" and "path"`);
  if (!hasData && !hasPath) throw new Error(`${ctx}: entry has neither "data" nor "path"`);
  if (hasData) return entry["data"];

  const path = entry["path"];
  if (typeof path !== "string") throw new Error(`${ctx}: entry "path" must be a string`);

  const fullKey = `${basePath}/${path}`;
  const data = campaignFiles[fullKey];
  if (data === undefined) throw new Error(`${ctx}: file "${path}" not found at ${fullKey}`);
  return data;
}

function parseCampaign(data: unknown): CampaignData {
  if (!isObj(data)) throw new Error("Campaign: not an object");
  return {
    name: str(data, "name", "Campaign"),
    vehicleTypes: arr(data, "vehicleTypes", "Campaign") as CampaignEntry<unknown>[],
    levels: arr(data, "levels", "Campaign") as CampaignEntry<unknown>[],
    audio: data["audio"] ?? {},
  };
}

async function loadVehicleTypes(
  entries: CampaignEntry<unknown>[],
  basePath: string,
  ctx: string,
  col: Collector
): Promise<Record<string, VehicleType>> {
  const stats = entries
    .map((entry, i) => col.tryGet(() => {
      const data = resolveEntry(entry, basePath, `${ctx}: vehicleTypes[${i}]`);
      return parseVehicleStats(data);
    }))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  const seen = new Set<string>();
  for (const s of stats) {
    if (seen.has(s.name)) col.errors.push(`${ctx}: duplicate vehicle name "${s.name}"`);
    seen.add(s.name);
  }

  const arr = await Promise.all(stats.map(loadVehicleType));
  const vehicleTypes: Record<string, VehicleType> = {};
  for (const vt of arr) vehicleTypes[vt.name] = vt;
  return vehicleTypes;
}

function loadLevels(
  entries: CampaignEntry<unknown>[],
  basePath: string,
  ctx: string,
  col: Collector
): Level[] {
  return entries
    .map((entry, i) => col.tryGet(() => {
      const data = resolveEntry(entry, basePath, `${ctx}: levels[${i}]`);
      return loadLevel(data);
    }))
    .filter((l): l is NonNullable<typeof l> => l !== undefined);
}

function validateVehicleRefs(
  levels: Level[],
  vehicleTypes: Record<string, VehicleType>,
  ctx: string,
  col: Collector
): void {
  const validNames = new Set(Object.keys(vehicleTypes));
  for (const [i, level] of levels.entries()) {
    const lctx = `${ctx}: level ${i}${level.name ? ` ("${level.name}")` : ""}`;
    for (const [vi, v] of level.vehicles.entries()) {
      if (!validNames.has(v.type))
        col.errors.push(`${lctx}: vehicle ${vi} type "${v.type}" not in roster`);
    }
    for (const [si, s] of level.sensors.entries()) {
      if (s.vehicle !== undefined && !validNames.has(s.vehicle))
        col.errors.push(`${lctx}: sensor ${si} vehicle "${s.vehicle}" not in roster`);
    }
  }
}

function parseCampaignAudio(data: unknown, ctx: string): CampaignAudio {
  const audio: CampaignAudio = {};
  if (!isObj(data)) return audio;
  const button = optStr(data, "button", `${ctx}: audio`);
  const win    = optStr(data, "win",    `${ctx}: audio`);
  if (button) audio.button = button;
  if (win)    audio.win    = win;
  return audio;
}

export async function loadCampaign(folder: string, audio: Audio): Promise<Campaign> {
  const basePath = `${BASE_PATH}${folder}`;
  const campaignKey = `${basePath}/campaign.json`;
  const raw = campaignFiles[campaignKey];
  if (raw === undefined) throw new Error(`Campaign "${folder}": campaign.json not found at ${campaignKey}`);

  const campaign = parseCampaign(raw);
  const ctx      = `Campaign "${campaign.name}"`;
  const col      = makeCollector();
  const vehicleTypes  = await loadVehicleTypes(campaign.vehicleTypes, basePath, ctx, col);
  const levels        = loadLevels(campaign.levels, basePath, ctx, col);
  validateVehicleRefs(levels, vehicleTypes, ctx, col);
  const campaignAudio = parseCampaignAudio(campaign.audio, ctx);

  if (col.errors.length) throw new Error(`${ctx} failed validation:\n  ${col.errors.join("\n  ")}`);

  if (campaignAudio.button) await audio.registerSound("button", campaignAudio.button);
  if (campaignAudio.win)    await audio.registerSound("win", campaignAudio.win);
  return { name: campaign.name, vehicleTypes, levels, audio: campaignAudio };
}
