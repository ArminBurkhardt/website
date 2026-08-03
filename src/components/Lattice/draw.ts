import type { LatticeLayout } from './layout';
import { projectNode, type Motion, type Projected } from './scroll';

export const MAX_PARTICLES = 14;
export const ACCENT_SHARE = 0.125;
const BASE_SPEED = 0.00022; // progress per millisecond
/** Multiplier on particle speed at full scroll energy. */
const ENERGY_BOOST = 2.5;

export type Particle = { edgeId: string; t: number; speed: number; accent: boolean };

export type DrawOptions = {
  faint: string;
  accent: string;
  opacity: number;
  highlight: Set<string>;
  dpr: number;
  motion: Motion;
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

/** Scrolling drives the particles harder; `energy` runs 0 (settled) to 1 (flinging). */
export function advance(
  particles: Particle[],
  layout: LatticeLayout,
  delta: number,
  random: () => number,
  energy = 0,
): Particle[] {
  const next: Particle[] = [];
  const surge = 1 + energy * ENERGY_BOOST;
  for (const particle of particles) {
    const t = particle.t + particle.speed * surge * delta;
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

  for (const node of layout.nodes) {
    const point = byId.get(node.id);
    if (!point) continue;
    ctx.globalAlpha = Math.min(1, options.opacity * 2.4 * depthFade(point.depth));
    ctx.fillStyle = options.faint;
    ctx.beginPath();
    ctx.arc(point.x, point.y, (node.domain ? 3 : 1.8) * depthSize(point.depth), 0, Math.PI * 2);
    ctx.fill();
  }

  for (const particle of particles) {
    const edge = layout.edges.find((candidate) => candidate.id === particle.edgeId);
    const from = edge ? byId.get(edge.from) : undefined;
    const to = edge ? byId.get(edge.to) : undefined;
    if (!from || !to) continue;
    const point = interpolate(from, to, particle.t);
    const depth = (from.depth + to.depth) / 2;
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
