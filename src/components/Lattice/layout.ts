import { DOMAINS, type Domain } from '../../content/types';

export const LATTICE_COLUMNS = 5;
const DEFAULT_SEED = 20260803;

export type LatticeNode = {
  id: string;
  x: number;
  y: number;
  column: number;
  domain: Domain | null;
};
export type LatticeEdge = { id: string; from: string; to: string };
export type LatticeLayout = { nodes: LatticeNode[]; edges: LatticeEdge[]; columns: number };

/** mulberry32 - small, fast, and reproducible across runs. */
function rng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COLUMN_SIZES = [3, 5, 5, 4, DOMAINS.length];

export function buildLattice(width: number, height: number, seed = DEFAULT_SEED): LatticeLayout {
  const random = rng(seed);
  const nodes: LatticeNode[] = [];
  const edges: LatticeEdge[] = [];
  const marginX = width * 0.08;
  const usableWidth = Math.max(0, width - marginX * 2);

  for (let column = 0; column < LATTICE_COLUMNS; column += 1) {
    const count = COLUMN_SIZES[column] ?? 4;
    const x = marginX + (usableWidth * column) / Math.max(1, LATTICE_COLUMNS - 1);
    for (let row = 0; row < count; row += 1) {
      const spread = height * 0.72;
      const top = (height - spread) / 2;
      const step = spread / Math.max(1, count - 1);
      const jitterY = (random() - 0.5) * step * 0.35;
      const jitterX = (random() - 0.5) * usableWidth * 0.02;
      const isTerminal = column === LATTICE_COLUMNS - 1;
      nodes.push({
        id: `n${column}-${row}`,
        x: clamp(x + jitterX, 0, width),
        y: clamp(count === 1 ? height / 2 : top + step * row + jitterY, 0, height),
        column,
        domain: isTerminal ? (DOMAINS[row] ?? null) : null,
      });
    }
  }

  for (let column = 0; column < LATTICE_COLUMNS - 1; column += 1) {
    const from = nodes.filter((node) => node.column === column);
    const to = nodes.filter((node) => node.column === column + 1);
    for (const source of from) {
      for (const target of pickTargets(source, to, random)) {
        edges.push({ id: `${source.id}>${target.id}`, from: source.id, to: target.id });
      }
    }
  }

  ensureReachable(nodes, edges);
  return { nodes, edges, columns: LATTICE_COLUMNS };
}

function pickTargets(source: LatticeNode, candidates: LatticeNode[], random: () => number) {
  const sorted = [...candidates].sort(
    (a, b) => Math.abs(a.y - source.y) - Math.abs(b.y - source.y),
  );
  const count = 1 + Math.floor(random() * 2); // sparse: one or two forward edges
  return sorted.slice(0, Math.min(count, sorted.length));
}

/** Guarantee every node in every column beyond the first has at least one incoming edge. */
function ensureReachable(nodes: LatticeNode[], edges: LatticeEdge[]) {
  for (let column = 1; column < LATTICE_COLUMNS; column += 1) {
    const previous = nodes.filter((node) => node.column === column - 1);
    if (previous.length === 0) continue;
    for (const node of nodes.filter((candidate) => candidate.column === column)) {
      if (edges.some((edge) => edge.to === node.id)) continue;
      const nearest = previous.reduce((best, candidate) =>
        Math.abs(candidate.y - node.y) < Math.abs(best.y - node.y) ? candidate : best,
      );
      edges.push({ id: `${nearest.id}>${node.id}`, from: nearest.id, to: node.id });
    }
  }
}

/** Walks backwards from a domain terminal to column 0, returning the edge ids on that path. */
export function pathToDomain(layout: LatticeLayout, domain: Domain): Set<string> {
  const terminal = layout.nodes.find((node) => node.domain === domain);
  const path = new Set<string>();
  if (!terminal) return path;

  let current = terminal.id;
  for (let column = LATTICE_COLUMNS - 1; column > 0; column -= 1) {
    const incoming = layout.edges.find((edge) => edge.to === current);
    if (!incoming) break;
    path.add(incoming.id);
    current = incoming.from;
  }
  return path;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
