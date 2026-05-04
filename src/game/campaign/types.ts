import type { Level } from "../level/types.ts";
import type { VehicleType } from "../vehicle/types.ts";

/** Inline or file-referenced entry. */
export type CampaignEntry<T> = { data: T } | { path: string };

export interface CampaignData {
  /** Campaign display name */
  name: string;
  /** Vehicle types available in this campaign */
  vehicleTypes: CampaignEntry<unknown>[];
  /** Levels in play order */
  levels: CampaignEntry<unknown>[];
}

export interface Campaign {
  name: string;
  vehicleTypes: Record<string, VehicleType>;
  levels: Level[];
}
