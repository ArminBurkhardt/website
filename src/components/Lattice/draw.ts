import type { LatticeLayout } from './layout';
import { projectNode, type Motion, type Projected } from './scroll';

export const MAX_PARTICLES = 20;
export const ACCENT_SHARE = 0.125;
const BASE_SPEED = 0.00022; // progress per millisecond

export type Particle = { edgeId: string; t: number; speed: number; accent: boolean };
export type CursorPoint = { x: number; y: number };

export type DrawOptions = {
  faint: string;
  accent: string;
  opacity: number;
  highlight: Set<string>;
  dpr: number;
  motion: Motion;
  cursor?: CursorPoint | null;
  cursorLineCount?: number;
};

export function spawnParticle(layout: LatticeLayout, random: () => number): Particle {
  const starts = layout.edges.filter((edge) =>
    layout.nodes.some((node) => node.id === edge.from && node.column === 0),
  );
  const pool = starts.length > 0 ? starts : layout.edges;
  const edge = pool[Math.floor(random() * pool.length) % pool.length];
  return {
    edgeId: edge?.id ?? '',
    t: 0,
    speed: BASE_SPEED * (0.6 + random() * 0.8),
    accent: random() < ACCENT_SHARE,
  };
}

export function advance(
  particles: Particle[],
  layout: LatticeLayout,
  delta: number,
  random: () => number,
): Particle[] {
  const next: Particle[] = [];
  for (const particle of particles) {
    const t = particle.t + particle.speed * delta;
    if (t < 1) {
      next.push({ ...particle, t });
      continue;
    }
    const edge = layout.edges.find((candidate) => candidate.id === particle.edgeId);
    const onward = edge ? layout.edges.filter((candidate) => candidate.from === edge.to) : [];
    if (onward.length === 0) continue; // reached a terminal - retire it
    const chosen = onward[Math.floor(random() * onward.length) % onward.length];
    if (chosen) next.push({ ...particle, edgeId: chosen.id, t: t - 1 });
  }
  return next.slice(0, MAX_PARTICLES);
}

export type CursorTarget = { x: number; y: number; depth: number };

/** Points farther than this from the cursor never get a line, however few are nearby. */
export const CURSOR_LINE_RANGE = 140;

/**
 * Of a set of candidate points within range, returns whichever sit closest to the cursor
 * right now. Called fresh every frame against live positions - including moving particles -
 * so a fast-moving cursor never drags a line to a point that has since drifted away,
 * stretching it across the field.
 */
export function nearestCursorTargets(
  candidates: CursorTarget[],
  cursor: CursorPoint,
  count: number,
): CursorTarget[] {
  const maxDistanceSq = CURSOR_LINE_RANGE * CURSOR_LINE_RANGE;
  const inRange = candidates.filter((point) => distanceSq(point, cursor) <= maxDistanceSq);
  return inRange
    .sort((a, b) => distanceSq(a, cursor) - distanceSq(b, cursor))
    .slice(0, Math.min(count, inRange.length));
}

function distanceSq(point: { x: number; y: number }, cursor: CursorPoint) {
  const dx = point.x - cursor.x;
  const dy = point.y - cursor.y;
  return dx * dx + dy * dy;
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  layout: LatticeLayout,
  particles: Particle[],
  options: DrawOptions,
) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.scale(options.dpr, options.dpr);

  // Project once per frame, in css pixels - the space the layout was built in. Every later
  // pass reads these positions, so edges and particles cannot drift out of step with nodes.
  const cssWidth = width / options.dpr;
  const cssHeight = height / options.dpr;
  const byId = new Map(
    layout.nodes.map((node) => [node.id, projectNode(node, options.motion, cssWidth, cssHeight)]),
  );

  for (const edge of layout.edges) {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) continue;
    const lit = options.highlight.has(edge.id);
    const depth = (from.depth + to.depth) / 2;
    ctx.strokeStyle = lit ? options.accent : options.faint;
    ctx.globalAlpha = Math.min(1, options.opacity * (lit ? 3.2 : depthFade(depth)));
    ctx.lineWidth = 0.75 + depth * 0.6;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  // Every moving dot's current position, so the cursor lines below can reach for a particle
  // that has drifted closer than any static node without recomputing this per line.
  const particlePoints = particles
    .map((particle) => {
      const edge = layout.edges.find((candidate) => candidate.id === particle.edgeId);
      const from = edge ? byId.get(edge.from) : undefined;
      const to = edge ? byId.get(edge.to) : undefined;
      if (!from || !to) return null;
      return { particle, point: interpolate(from, to, particle.t), depth: (from.depth + to.depth) / 2 };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (options.cursor && options.cursorLineCount) {
    const nodeTargets: CursorTarget[] = layout.nodes
      .map((node) => byId.get(node.id))
      .filter((point): point is Projected => !!point)
      .map((point) => ({ x: point.x, y: point.y, depth: point.depth }));
    const particleTargets: CursorTarget[] = particlePoints.map(({ point, depth }) => ({
      x: point.x,
      y: point.y,
      depth,
    }));
    const targets = nearestCursorTargets(
      [...nodeTargets, ...particleTargets],
      options.cursor,
      options.cursorLineCount,
    );
    for (const target of targets) {
      ctx.strokeStyle = options.faint;
      ctx.globalAlpha = Math.min(1, options.opacity * 0.8 * depthFade(target.depth));
      ctx.lineWidth = 0.75 + target.depth * 0.6;
      ctx.beginPath();
      ctx.moveTo(target.x, target.y);
      ctx.lineTo(options.cursor.x, options.cursor.y);
      ctx.stroke();
    }
  }

  for (const node of layout.nodes) {
    const point = byId.get(node.id);
    if (!point) continue;
    ctx.globalAlpha = Math.min(1, options.opacity * 2.4 * depthFade(point.depth));
    ctx.fillStyle = options.faint;
    ctx.beginPath();
    ctx.arc(point.x, point.y, (node.domain ? 3 : 1.8) * depthSize(point.depth), 0, Math.PI * 2);
    ctx.fill();
  }

  for (const { particle, point, depth } of particlePoints) {
    ctx.globalAlpha = Math.min(1, options.opacity * (particle.accent ? 6 : 4) * depthFade(depth));
    ctx.fillStyle = particle.accent ? options.accent : options.faint;
    ctx.beginPath();
    ctx.arc(point.x, point.y, (particle.accent ? 2.6 : 2) * depthSize(depth), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Distance haze - far nodes read fainter, which is what sells the depth. */
function depthFade(depth: number) {
  return 0.55 + depth * 0.65;
}

function depthSize(depth: number) {
  return 0.7 + depth * 0.6;
}

function interpolate(from: Projected, to: Projected, t: number) {
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}
