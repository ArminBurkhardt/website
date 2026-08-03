import type { LatticeNode } from './layout';

/** Pan of a mid-depth node over a full page scroll, as a fraction of viewport height. */
const PAN_RANGE = 0.1;
/** A far node pans FAR_PAN of that, a near node NEAR_PAN of it - this is the parallax. */
const FAR_PAN = 0.5;
const NEAR_PAN = 1.5;
/** How much the field grows between the top and the bottom of the page. */
const SCALE_RANGE = 0.06;

/** Idle drift: a slow wander so the lattice breathes when nothing is scrolling. */
const DRIFT_RADIUS = 3.5; // css pixels at full depth
const DRIFT_SPEED = 0.00022; // radians per millisecond

/** Spring driving the rendered progress towards the real scroll position. */
const STIFFNESS = 0.00009;
const DAMPING = 0.014;
/** A dropped frame must not integrate one huge step and fling the spring. */
const MAX_STEP = 32;
const REST = 0.0002;

/** Scroll energy: how hard the particles surge while the page is moving. */
const ENERGY_GAIN = 55;
const ENERGY_DECAY = 0.0015; // per millisecond

export type Spring = { value: number; velocity: number };
export type Motion = {
  progress: number;
  /** Milliseconds since the canvas started, driving the idle drift. */
  time: number;
  /** Scales the idle drift - 0 holds the lattice perfectly still. */
  drift: number;
};
export type Projected = { x: number; y: number; depth: number };

/** Where we are down the page, 0 at the top and 1 at the bottom. */
export function scrollProgress(scrollY: number, scrollHeight: number, viewportHeight: number) {
  const scrollable = scrollHeight - viewportHeight;
  if (scrollable <= 0) return 0; // a page that does not scroll has no progress to report
  return clamp(scrollY / scrollable, 0, 1);
}

/**
 * Underdamped spring, so the lattice keeps gliding for a beat after the scroll stops and
 * eases back rather than halting on the spot. Integrated explicitly against a clamped step.
 */
export function stepSpring(spring: Spring, target: number, delta: number): Spring {
  const step = Math.min(delta, MAX_STEP);
  const acceleration = (target - spring.value) * STIFFNESS - spring.velocity * DAMPING;
  const velocity = spring.velocity + acceleration * step;
  const value = spring.value + velocity * step;
  if (Math.abs(target - value) < REST && Math.abs(velocity) < REST) {
    return { value: target, velocity: 0 };
  }
  return { value, velocity };
}

/** Scrolling injects energy, which bleeds away once the page settles. */
export function trackEnergy(current: number, progressDelta: number, delta: number) {
  const decayed = current * Math.exp(-ENERGY_DECAY * delta);
  return clamp(decayed + Math.abs(progressDelta) * ENERGY_GAIN, 0, 1);
}

/**
 * Places a node on screen for the current motion state.
 *
 * The parallax lives here rather than in a canvas transform: every node is displaced by an
 * amount set by its own depth, so near nodes travel further than far ones and the field
 * reads as having volume instead of being one flat plane that slides.
 */
export function projectNode(
  node: LatticeNode,
  motion: Motion,
  width: number,
  height: number,
): Projected {
  const centreX = width / 2;
  const centreY = height / 2;

  const pan = FAR_PAN + node.depth * (NEAR_PAN - FAR_PAN);
  const offsetY = (0.5 - motion.progress) * PAN_RANGE * height * pan;
  const scale = 1 + motion.progress * SCALE_RANGE * (0.5 + node.depth);

  // Two frequencies that do not divide evenly, so the wander never visibly repeats.
  const amplitude = DRIFT_RADIUS * (0.35 + node.depth) * motion.drift;
  const driftX = Math.sin(motion.time * DRIFT_SPEED + node.phase) * amplitude;
  const driftY = Math.cos(motion.time * DRIFT_SPEED * 0.73 + node.phase) * amplitude;

  return {
    x: centreX + (node.x - centreX) * scale + driftX,
    y: centreY + (node.y - centreY) * scale + offsetY + driftY,
    depth: node.depth,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
