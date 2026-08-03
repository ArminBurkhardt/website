import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scrollProgress, stepSpring, trackEnergy, projectNode, type Spring } from './scroll.ts';
import { buildLattice, type LatticeNode } from './layout.ts';

const still = { progress: 0, time: 0, drift: 0 };
const node = (depth: number, y = 400): LatticeNode => ({
  id: `n`,
  x: 600,
  y,
  column: 0,
  domain: null,
  depth,
  phase: 0,
});

/** Runs the spring to rest, returning how many frames it took. */
function settle(target: number, spring: Spring = { value: 0, velocity: 0 }) {
  let frames = 0;
  while (spring.velocity !== 0 || spring.value !== target) {
    spring = stepSpring(spring, target, 16.667);
    frames += 1;
    if (frames > 10_000) break;
  }
  return { frames, spring };
}

test('progress runs from 0 at the top to 1 at the bottom', () => {
  assert.equal(scrollProgress(0, 3000, 800), 0);
  assert.equal(scrollProgress(2200, 3000, 800), 1);
  assert.equal(scrollProgress(1100, 3000, 800), 0.5);
});

test('progress clamps rather than overshooting on rubber-band scroll', () => {
  assert.equal(scrollProgress(-200, 3000, 800), 0);
  assert.equal(scrollProgress(9999, 3000, 800), 1);
});

test('a page shorter than the viewport reports no progress', () => {
  assert.equal(scrollProgress(0, 600, 800), 0);
});

test('the spring comes to rest exactly on its target', () => {
  const { frames, spring } = settle(1);
  assert.equal(spring.value, 1);
  assert.equal(spring.velocity, 0);
  assert.ok(frames < 600, `took ${frames} frames to settle`);
});

test('the spring glides rather than snapping', () => {
  // Jumping most of the way on the first frame is what made the old easing read as cheap.
  const first = stepSpring({ value: 0, velocity: 0 }, 1, 16.667);
  assert.ok(first.value > 0 && first.value < 0.1);
  assert.ok(settle(1).frames > 30);
});

test('the spring overshoots slightly, so motion follows through', () => {
  let spring: Spring = { value: 0, velocity: 0 };
  let peak = 0;
  for (let frame = 0; frame < 400; frame += 1) {
    spring = stepSpring(spring, 1, 16.667);
    peak = Math.max(peak, spring.value);
  }
  assert.ok(peak > 1, `expected follow-through past the target, peaked at ${peak}`);
  assert.ok(peak < 1.15, `overshoot must stay subtle, peaked at ${peak}`);
});

test('a long dropped frame cannot fling the spring past its target', () => {
  const stepped = stepSpring({ value: 0, velocity: 0 }, 1, 5000);
  assert.ok(stepped.value >= 0 && stepped.value <= 1, `landed at ${stepped.value}`);
});

test('scrolling injects energy and settling bleeds it away', () => {
  const moving = trackEnergy(0, 0.01, 16.667);
  assert.ok(moving > 0);
  assert.ok(trackEnergy(moving, 0, 16.667) < moving);
});

test('energy never exceeds full, however hard the page is flung', () => {
  assert.equal(trackEnergy(1, 5, 16.667), 1);
});

test('energy decays to nothing once scrolling stops', () => {
  let energy = 1;
  for (let frame = 0; frame < 400; frame += 1) energy = trackEnergy(energy, 0, 16.667);
  assert.ok(energy < 0.01, `energy lingered at ${energy}`);
});

test('near nodes travel further than far ones - this is the parallax', () => {
  const travel = (sample: LatticeNode) =>
    Math.abs(
      projectNode(sample, { ...still, progress: 1 }, 1200, 800).y -
        projectNode(sample, { ...still, progress: 0 }, 1200, 800).y,
    );
  assert.ok(travel(node(1)) > travel(node(0)) * 2, 'depth must visibly separate the planes');
});

test('the field rises as the page descends', () => {
  const sample = node(0.5);
  const top = projectNode(sample, { ...still, progress: 0 }, 1200, 800);
  const bottom = projectNode(sample, { ...still, progress: 1 }, 1200, 800);
  assert.ok(bottom.y < top.y);
});

test('idle drift moves the field even with the page held still', () => {
  const sample = node(0.8);
  const at = (time: number) => projectNode(sample, { progress: 0, time, drift: 1 }, 1200, 800);
  const start = at(0);
  const later = at(4000);
  assert.ok(Math.abs(later.x - start.x) > 0.5 || Math.abs(later.y - start.y) > 0.5);
});

test('drift 0 holds the field perfectly still', () => {
  const sample = node(0.8);
  const a = projectNode(sample, { progress: 0.5, time: 0, drift: 0 }, 1200, 800);
  const b = projectNode(sample, { progress: 0.5, time: 9999, drift: 0 }, 1200, 800);
  assert.deepEqual(a, b);
});

// The whole range of motion has to stay inside the empty margin buildLattice leaves above
// and below the nodes, or scrolling would expose a bare band at one edge of the canvas.
test('no node leaves the viewport at any point in the scroll', () => {
  const width = 1200;
  const height = 800;
  const layout = buildLattice(width, height);
  for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
    for (const time of [0, 1500, 3000, 4500, 6000]) {
      for (const sample of layout.nodes) {
        const { y } = projectNode(sample, { progress, time, drift: 1 }, width, height);
        assert.ok(y >= 0 && y <= height, `${sample.id} at ${progress}/${time} sits at ${y}`);
      }
    }
  }
});
