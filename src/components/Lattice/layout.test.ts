import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLattice, pathToDomain, LATTICE_COLUMNS } from './layout.ts';
import { DOMAINS } from '../../content/types.ts';

test('layout is deterministic for the same inputs', () => {
  const a = buildLattice(1200, 800);
  const b = buildLattice(1200, 800);
  assert.deepEqual(a, b);
});

test('a different seed produces a different layout', () => {
  const a = buildLattice(1200, 800, 1);
  const b = buildLattice(1200, 800, 2);
  assert.notDeepEqual(a.nodes, b.nodes);
});

test('nodes stay inside the canvas bounds', () => {
  const { nodes } = buildLattice(1000, 600);
  for (const node of nodes) {
    assert.ok(node.x >= 0 && node.x <= 1000, `x out of bounds: ${node.x}`);
    assert.ok(node.y >= 0 && node.y <= 600, `y out of bounds: ${node.y}`);
  }
});

test('the final column holds exactly one terminal per domain', () => {
  const { nodes } = buildLattice(1200, 800);
  const terminals = nodes.filter((node) => node.column === LATTICE_COLUMNS - 1);
  assert.equal(terminals.length, DOMAINS.length);
  assert.deepEqual(
    terminals.map((node) => node.domain),
    [...DOMAINS],
  );
});

test('only terminals carry a domain', () => {
  const { nodes } = buildLattice(1200, 800);
  for (const node of nodes) {
    if (node.column !== LATTICE_COLUMNS - 1) assert.equal(node.domain, null);
  }
});

test('every edge connects adjacent columns forward', () => {
  const { nodes, edges } = buildLattice(1200, 800);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const edge of edges) {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    assert.ok(from && to, `dangling edge ${edge.id}`);
    assert.equal(to.column - from.column, 1);
  }
});

test('every terminal is reachable from the first column', () => {
  const layout = buildLattice(1200, 800);
  for (const domain of DOMAINS) {
    const path = pathToDomain(layout, domain);
    assert.ok(path.size > 0, `no path to ${domain}`);
    for (const edgeId of path) {
      assert.ok(layout.edges.some((edge) => edge.id === edgeId), `unknown edge ${edgeId}`);
    }
  }
});

test('edge ids are unique', () => {
  const { edges } = buildLattice(1200, 800);
  const ids = edges.map((edge) => edge.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('degenerate sizes do not throw', () => {
  assert.doesNotThrow(() => buildLattice(0, 0));
  assert.doesNotThrow(() => buildLattice(320, 480));
});
