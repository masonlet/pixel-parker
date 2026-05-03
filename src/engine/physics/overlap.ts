import type { OBB, AABB } from "./types.ts";
import { obbVsAabb } from "./collision.ts";

export function overlappingRegions(obb: OBB, regions: AABB[]): AABB[] {
  const hits: AABB[] = [];
  for (const r of regions) if (obbVsAabb(obb, r)) hits.push(r);
  return hits;
}
