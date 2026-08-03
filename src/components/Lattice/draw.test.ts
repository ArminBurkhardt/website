import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLattice } from './layout.ts';
import { advance, spawnParticle, MAX_PARTICLES, ACCENT_SHARE } from './draw.ts';

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
