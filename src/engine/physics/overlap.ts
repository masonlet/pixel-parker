import type { OBB, AABB } from "./types.ts";
import { obbCorners } from "./geometry.ts";
import { obbVsAabb } from "./collision.ts";

export function overlappingRegions(obb: OBB, regions: AABB[]): AABB[] {
  const hits: AABB[] = [];
  for (const r of regions) if (obbVsAabb(obb, r)) hits.push(r);
  return hits;
}

export function obbInsideAabb(obb: OBB, aabb: AABB, padding = 0): boolean {
  const minX = aabb.x + padding;
  const minY = aabb.y + padding;
  const maxX = aabb.x + aabb.w - padding;
  const maxY = aabb.y + aabb.h - padding;
  if (maxX <= minX || maxY <= minY) return false;

  for (const c of obbCorners(obb)) {
    if (c.x < minX
     || c.x > maxX
     || c.y < minY
     || c.y > maxY
    ) return false;
  }
  return true;
}
