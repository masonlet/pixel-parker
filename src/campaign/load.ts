import { registerSound } from "web-engine/audio.ts";

import type { Campaign, CampaignData, CampaignAudio, CampaignEntry } from "./types.ts";

import type { Level } from "../level/types.ts";
import { loadLevel } from "../level/load.ts";

import type { VehicleType } from "../vehicle/types.ts";
import { loadVehicleType, parseVehicleStats } from "../vehicle/load.ts";

import { isObj, str, optStr, arr, makeCollector } from "../utils/validate.ts";

const campaignFiles = import.meta.glob("../assets/campaigns/*/**/*.json", {
  eager: true,
  import: "default"
}) as Record<string, unknown>;

function resolveEntry(entry: unknown, basePath: string, ctx: string): unknown {
  if (!isObj(entry)) throw new Error(`${ctx}: entry must be an object`);

  const hasData = "data" in entry;
  const hasPath = "path" in entry;
  if (hasData && hasPath) throw new Error(`${ctx}: entry has both "data" and "path"`);
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

export async function loadCampaign(folder: string): Promise<Campaign> {
  const basePath = `../assets/campaigns/${folder}`;
  const campaignKey = `${basePath}/campaign.json`;
  const raw = campaignFiles[campaignKey];
  if (raw === undefined) throw new Error(`Campaign "${folder}": campaign.json not found at ${campaignKey}`);

  const campaign = parseCampaign(raw);
  const ctx = `Campaign "${campaign.name}"`;
  const { errors, tryGet } = makeCollector();

  // Resolve and parse vehicle types
  const stats = campaign.vehicleTypes
    .map((entry, i) => tryGet(() => {
      const data = resolveEntry(entry, basePath, `${ctx}: vehicleTypes[${i}]`);
      return parseVehicleStats(data);
    }))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  // Check name uniqueness
  const seen = new Set<string>();
  for (const s of stats) {
    if (seen.has(s.name)) errors.push(`${ctx}: duplicate vehicle name "${s.name}"`);
    seen.add(s.name);
  }

  // Load sprites
  const vehicleTypeArr = await Promise.all(stats.map(loadVehicleType));
  const vehicleTypes: Record<string, VehicleType> = {};
  for (const vt of vehicleTypeArr) vehicleTypes[vt.name] = vt;

  // Resolve and parse levels
  const levels: Level[] = campaign.levels
    .map((entry, i) => tryGet(() => {
      const data = resolveEntry(entry, basePath, `${ctx}: levels[${i}]`);
      return loadLevel(data);
    }))
    .filter((l): l is NonNullable<typeof l> => l !== undefined);

  // Cross-validate vehicle references
  const validNames = new Set(Object.keys(vehicleTypes));
  for (const [i, level] of levels.entries()) {
    const lctx = `${ctx}: level ${i}${level.name ? ` ("${level.name}")` : ""}`;
    for (const [vi, v] of level.vehicles.entries()) {
      if (!validNames.has(v.type)) errors.push(`${lctx}: vehicle ${vi} type "${v.type}" not in roster`);
    }
    for (const [si, s] of level.sensors.entries()) {
      if (s.vehicle !== undefined && !validNames.has(s.vehicle)) {
        errors.push(`${lctx}: sensor ${si} vehicle "${s.vehicle}" not in roster`);
      }
    }
  }

  const audio: CampaignAudio = {};
  if (isObj(campaign.audio)) {
    const a = campaign.audio;
    const button = optStr(a, "button", `${ctx}: audio`);
    const win = optStr(a, "win", `${ctx}: audio`);
    if (button) audio.button = button;
    if (win) audio.win = win;
  }

  if (errors.length) throw new Error(`${ctx} failed validation:\n  ${errors.join("\n  ")}`);

  if (audio.button) await registerSound("button", audio.button);
  if (audio.win)    await registerSound("win", audio.win);
  return { name: campaign.name, vehicleTypes, levels, audio };
}
