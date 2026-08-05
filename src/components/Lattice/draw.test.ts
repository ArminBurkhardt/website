import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLattice } from './layout.ts';
import {
  advance,
  spawnParticle,
  nearestCursorTargets,
  MAX_PARTICLES,
  ACCENT_SHARE,
  CURSOR_LINE_RANGE,
} from './draw.ts';

const layout = buildLattice(1200, 800);
const random = () => 0.5;

test('a spawned particle sits on a real edge at the start of it', () => {
  const particle = spawnParticle(layout, random);
  assert.ok(layout.edges.some((edge) => edge.id === particle.edgeId));
  assert.equal(particle.t, 0);
  assert.ok(particle.speed > 0);
});

test('advancing moves a particle forward along its edge', () => {
  const particle = spawnParticle(layout, random);
  const [moved] = advance([particle], layout, 16, random);
  assert.ok(moved);
  assert.ok(moved.t > particle.t || moved.edgeId !== particle.edgeId);
});

test('a particle that runs off the last column is removed', () => {
  const terminalEdge = layout.edges.find((edge) =>
    layout.nodes.some((node) => node.id === edge.to && node.domain !== null),
  );
  assert.ok(terminalEdge);
  const finished = [{ edgeId: terminalEdge.id, t: 0.99, speed: 0.5, accent: false }];
  assert.equal(advance(finished, layout, 100, random).length, 0);
});

test('particle count never exceeds the cap', () => {
  let particles = Array.from({ length: MAX_PARTICLES + 10 }, () => spawnParticle(layout, random));
  particles = advance(particles, layout, 16, random);
  assert.ok(particles.length <= MAX_PARTICLES);
});

test('accent share stays a small minority', () => {
  assert.ok(ACCENT_SHARE > 0 && ACCENT_SHARE <= 0.2);
});

test('nearest cursor targets respects the requested count', () => {
  const cursor = { x: 0, y: 0 };
  const candidates = [
    { x: 10, y: 0, depth: 0.5 },
    { x: 20, y: 0, depth: 0.5 },
    { x: 30, y: 0, depth: 0.5 },
  ];
  const targets = nearestCursorTargets(candidates, cursor, 2);
  assert.equal(targets.length, 2);
});

test('nearest cursor targets never exceeds the number of in-range candidates', () => {
  const cursor = { x: 0, y: 0 };
  const candidates = [{ x: 10, y: 0, depth: 0.5 }];
  const targets = nearestCursorTargets(candidates, cursor, 999);
  assert.equal(targets.length, 1);
});

test('nearest cursor targets picks the actually-closest points, not just any points', () => {
  const cursor = { x: 0, y: 0 };
  const near = { x: 5, y: 0, depth: 0.5 };
  const mid = { x: 20, y: 0, depth: 0.5 };
  const far = { x: 60, y: 0, depth: 0.5 };
  const targets = nearestCursorTargets([far, mid, near], cursor, 2);
  assert.deepEqual(targets, [near, mid]);
});

test('nearest cursor targets excludes points beyond the connection range', () => {
  const cursor = { x: 0, y: 0 };
  const near = { x: 10, y: 0, depth: 0.5 };
  const beyondRange = { x: CURSOR_LINE_RANGE + 50, y: 0, depth: 0.5 };
  const targets = nearestCursorTargets([near, beyondRange], cursor, 2);
  assert.deepEqual(targets, [near]);
});

test('nearest cursor targets picks a particle over a farther out-of-range static node', () => {
  const cursor = { x: 0, y: 0 };
  const farNode = { x: 1000, y: 1000, depth: 0.5 };
  const nearParticle = { x: 1, y: 1, depth: 0.5 };
  const targets = nearestCursorTargets([farNode, nearParticle], cursor, 1);
  assert.deepEqual(targets, [nearParticle]);
});
