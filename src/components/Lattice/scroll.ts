import type { LatticeNode } from './layout';

/** Vertical travel of a node at the very edge of the field over a full page scroll. */
const SWAY_RANGE = 0.08; // fraction of viewport height

/** Idle drift: a slow wander so the lattice breathes when nothing is scrolling. */
const DRIFT_RADIUS = 3.5; // css pixels at full depth
const DRIFT_SPEED = 0.00022; // radians per millisecond

/** Spring driving the rendered progress towards the real scroll position. */
const STIFFNESS = 0.00009;
const DAMPING = 0.014;
/** A dropped frame must not integrate one huge step and fling the spring. */
const MAX_STEP = 32;
const REST = 0.0002;

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

/**
 * Places a node on screen for the current motion state.
 *
 * Scrolling only lifts the outer columns, and the two sides move opposite ways, so the field
 * tilts slowly about its centre. Nothing pans or zooms: the middle of the canvas - the part
 * sitting behind the text - stays put, and the long edges into it merely change their slope.
 */
export function projectNode(
  node: LatticeNode,
  motion: Motion,
  width: number,
  height: number,
): Projected {
  const centreX = width / 2;

  // Squared, so the sway is confined to the rim instead of bleeding towards the middle.
  const rim = centreX > 0 ? clamp(Math.abs(node.x - centreX) / centreX, 0, 1) : 0;
  const side = node.x < centreX ? -1 : 1;
  const offsetY = side * (motion.progress - 0.5) * rim * rim * SWAY_RANGE * height;

  // Two frequencies that do not divide evenly, so the wander never visibly repeats.
  const amplitude = DRIFT_RADIUS * (0.35 + node.depth) * motion.drift;
  const driftX = Math.sin(motion.time * DRIFT_SPEED + node.phase) * amplitude;
  const driftY = Math.cos(motion.time * DRIFT_SPEED * 0.73 + node.phase) * amplitude;

  return { x: node.x + driftX, y: node.y + offsetY + driftY, depth: node.depth };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
