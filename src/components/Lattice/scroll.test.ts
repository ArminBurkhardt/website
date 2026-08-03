import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scrollProgress, stepSpring, projectNode, type Spring } from './scroll.ts';
import { buildLattice, type LatticeNode } from './layout.ts';

const WIDTH = 1200;
const HEIGHT = 800;
const still = { progress: 0, time: 0, drift: 0 };
const node = (x: number, depth = 0.5): LatticeNode => ({
  id: `n`,
  x,
  y: 400,
  column: 0,
  domain: null,
  depth,
  phase: 0,
});

/** How far a node at `x` travels vertically across a full page scroll. */
function travel(x: number) {
  const sample = node(x);
  const top = projectNode(sample, { ...still, progress: 0 }, WIDTH, HEIGHT);
  const bottom = projectNode(sample, { ...still, progress: 1 }, WIDTH, HEIGHT);
  return bottom.y - top.y;
}

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

test('scrolling lifts the outer columns and leaves the middle alone', () => {
  assert.ok(Math.abs(travel(WIDTH * 0.08)) > 20, 'the rim has to actually move');
  assert.ok(Math.abs(travel(WIDTH / 2)) < 0.5, 'the middle is where the text sits');
  // Falls off quickly, so the sway stays a rim effect rather than a whole-field pan.
  assert.ok(Math.abs(travel(WIDTH * 0.29)) < Math.abs(travel(WIDTH * 0.08)) / 3);
});

test('the two sides sway opposite ways, so the field tilts about its centre', () => {
  const left = travel(WIDTH * 0.08);
  const right = travel(WIDTH * 0.92);
  assert.ok(left * right < 0, `expected opposing travel, got ${left} and ${right}`);
  assert.ok(Math.abs(left + right) < 0.001, 'the tilt has to stay symmetric');
});

test('scrolling never pans or zooms the field', () => {
  const sample = node(WIDTH * 0.08);
  const top = projectNode(sample, { ...still, progress: 0 }, WIDTH, HEIGHT);
  const bottom = projectNode(sample, { ...still, progress: 1 }, WIDTH, HEIGHT);
  assert.equal(top.x, sample.x);
  assert.equal(bottom.x, sample.x);
});

test('idle drift moves the field even with the page held still', () => {
  const sample = node(WIDTH * 0.08, 0.8);
  const at = (time: number) => projectNode(sample, { progress: 0, time, drift: 1 }, WIDTH, HEIGHT);
  const start = at(0);
  const later = at(4000);
  assert.ok(Math.abs(later.x - start.x) > 0.5 || Math.abs(later.y - start.y) > 0.5);
});

test('drift 0 holds the field perfectly still', () => {
  const sample = node(WIDTH * 0.08, 0.8);
  const a = projectNode(sample, { progress: 0.5, time: 0, drift: 0 }, WIDTH, HEIGHT);
  const b = projectNode(sample, { progress: 0.5, time: 9999, drift: 0 }, WIDTH, HEIGHT);
  assert.deepEqual(a, b);
});

// The whole range of motion has to stay inside the empty margin buildLattice leaves above
// and below the nodes, or scrolling would expose a bare band at one edge of the canvas.
test('no node leaves the viewport at any point in the scroll', () => {
  const layout = buildLattice(WIDTH, HEIGHT);
  for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
    for (const time of [0, 1500, 3000, 4500, 6000]) {
      for (const sample of layout.nodes) {
        const { y } = projectNode(sample, { progress, time, drift: 1 }, WIDTH, HEIGHT);
        assert.ok(y >= 0 && y <= HEIGHT, `${sample.id} at ${progress}/${time} sits at ${y}`);
      }
    }
  }
});
