import { HazardPoint, Point } from "./types";

/**
 * Simple, dependency-free routing for the map's coordinate space (0-100).
 * Not real street routing — it walks a straight line from start to end and,
 * for any hazard circle that line would pass through, inserts a detour
 * waypoint that skirts the circle's edge (plus a safety margin). Good
 * enough for a demo map; swap for a real routing API if street-level
 * accuracy is ever needed.
 */

const SAFETY_MARGIN = 4; // extra clearance beyond the hazard radius

function closestPointOnSegment(p: Point, a: Point, b: Point): { point: Point; dist: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const point = { x: a.x + t * dx, y: a.y + t * dy };
  const dist = Math.hypot(p.x - point.x, p.y - point.y);
  return { point, dist };
}

export function computeSafeRoute(
  start: Point,
  end: Point,
  hazards: HazardPoint[]
): Point[] {
  let path: Point[] = [start, end];

  for (const hazard of hazards) {
    const clearance = hazard.radius + SAFETY_MARGIN;

    // Find the first segment in the current path this hazard intersects.
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const { point: closest, dist } = closestPointOnSegment(hazard, a, b);

      if (dist < clearance) {
        // Push the closest point outward, away from the hazard center,
        // to just outside the clearance ring.
        let vx = closest.x - hazard.x;
        let vy = closest.y - hazard.y;
        let vlen = Math.hypot(vx, vy);
        if (vlen < 0.001) {
          // Segment passes through the exact center — pick a perpendicular.
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const segLen = Math.hypot(dx, dy) || 1;
          vx = -dy / segLen;
          vy = dx / segLen;
          vlen = 1;
        }
        const ux = vx / vlen;
        const uy = vy / vlen;
        const waypoint: Point = {
          x: hazard.x + ux * clearance,
          y: hazard.y + uy * clearance,
        };
        path.splice(i + 1, 0, waypoint);
        break; // move on to the next hazard against the updated path
      }
    }
  }

  return path;
}

export function toPolylinePoints(path: Point[]): string {
  return path.map((p) => `${p.x},${p.y}`).join(" ");
}
