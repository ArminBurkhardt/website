import type { LatticeLayout, LatticeNode } from './layout';

export const MAX_PARTICLES = 14;
export const ACCENT_SHARE = 0.125;
const BASE_SPEED = 0.00022; // progress per millisecond

export type Particle = { edgeId: string; t: number; speed: number; accent: boolean };

export type DrawOptions = {
  faint: string;
  accent: string;
  opacity: number;
  highlight: Set<string>;
  dpr: number;
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

  const byId = new Map(layout.nodes.map((node) => [node.id, node]));

  ctx.lineWidth = 1;
  for (const edge of layout.edges) {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) continue;
    const lit = options.highlight.has(edge.id);
    ctx.strokeStyle = lit ? options.accent : options.faint;
    ctx.globalAlpha = Math.min(1, options.opacity * (lit ? 3.2 : 1));
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  ctx.globalAlpha = Math.min(1, options.opacity * 2.4);
  for (const node of layout.nodes) {
    ctx.fillStyle = options.faint;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.domain ? 3 : 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const particle of particles) {
    const edge = layout.edges.find((candidate) => candidate.id === particle.edgeId);
    const from = edge ? byId.get(edge.from) : undefined;
    const to = edge ? byId.get(edge.to) : undefined;
    if (!from || !to) continue;
    const point = interpolate(from, to, particle.t);
    ctx.globalAlpha = Math.min(1, options.opacity * (particle.accent ? 6 : 4));
    ctx.fillStyle = particle.accent ? options.accent : options.faint;
    ctx.beginPath();
    ctx.arc(point.x, point.y, particle.accent ? 2.6 : 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function interpolate(from: LatticeNode, to: LatticeNode, t: number) {
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}
