'use client';

import { useEffect, useRef } from 'react';
import type { Dict } from '@/content/types';
import { DOMAINS } from '@/content/types';
import { buildLattice, pathToDomain, type LatticeLayout } from './layout';
import { advance, drawFrame, spawnParticle, MAX_PARTICLES, type Particle } from './draw';
import { scrollProgress, stepSpring, trackEnergy, type Spring } from './scroll';
import { useLatticeHover } from './LatticeContext';
import styles from './Lattice.module.css';

// The draw is a few hundred lines and dots; at 30fps the parallax reads as stepping rather
// than gliding, so the loop runs at display rate.
const FRAME_BUDGET = 1000 / 60;

export function Lattice({ dict }: { dict: Dict }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderRef = useRef<(() => void) | null>(null);
  const { domain } = useLatticeHover();
  const domainRef = useRef(domain);
  domainRef.current = domain;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let faint = '#8b8b93';
    let accent = '#fb4a6b';
    let opacity = 0.13;

    const readTokens = () => {
      const root = getComputedStyle(document.documentElement);
      faint = root.getPropertyValue('--lattice').trim() || faint;
      accent = root.getPropertyValue('--accent').trim() || accent;
      opacity = Number(root.getPropertyValue('--lattice-opacity')) || opacity;
    };

    let layout: LatticeLayout = { nodes: [], edges: [], columns: 0 };
    let particles: Particle[] = [];
    let dpr = 1;
    let frames = 0;
    let raf = 0;
    let last = 0;
    let accumulator = 0;

    const random = Math.random;

    // The scroll handler only records where we are; the animation frame does the spring, the
    // energy and the drawing, so scrolling never triggers work of its own.
    let targetProgress = 0;
    let spring: Spring = { value: 0, velocity: 0 };
    let energy = 0;
    let elapsed = 0;

    const readScroll = () => {
      targetProgress = scrollProgress(
        window.scrollY,
        document.documentElement.scrollHeight,
        window.innerHeight,
      );
    };

    const render = (delta: number) => {
      const highlight = domainRef.current
        ? pathToDomain(layout, domainRef.current)
        : new Set<string>();
      if (!reduced && delta > 0) {
        const previous = spring.value;
        spring = stepSpring(spring, targetProgress, delta);
        energy = trackEnergy(energy, spring.value - previous, delta);
        elapsed += delta;
        particles = advance(particles, layout, delta, random, energy);
        while (particles.length < MAX_PARTICLES && random() < 0.08) {
          particles.push(spawnParticle(layout, random));
        }
      }
      // Reduced motion parks the field at its midpoint with the drift switched off.
      const motion = reduced
        ? { progress: 0.5, time: 0, drift: 0 }
        : { progress: spring.value, time: elapsed, drift: 1 };
      drawFrame(ctx, layout, particles, { faint, accent, opacity, highlight, dpr, motion });
      frames += 1;
      canvas.setAttribute('data-frames', String(frames));
      canvas.setAttribute('data-parallax', spring.value.toFixed(3));
    };

    renderRef.current = () => render(0);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      layout = buildLattice(rect.width, rect.height);
      readScroll(); // a resize changes the page height, so the progress denominator moves too
      render(0);
    };

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const delta = last === 0 ? 16 : time - last;
      last = time;
      accumulator += delta;
      if (accumulator < FRAME_BUDGET) return;
      render(accumulator);
      accumulator = 0;
    };

    const start = () => {
      if (reduced || raf !== 0) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf !== 0) cancelAnimationFrame(raf);
      raf = 0;
    };

    // The canvas is fixed to the viewport, so it is always on screen - only a hidden tab
    // is worth pausing for.
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    // The theme toggle rewrites the tokens on <html>; re-read them and repaint.
    const themeObserver = new MutationObserver(() => {
      readTokens();
      render(0);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    readTokens();
    resize();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize, { passive: true });
    // Reduced motion keeps the lattice still, so there is nothing for scrolling to drive.
    if (!reduced) window.addEventListener('scroll', readScroll, { passive: true });
    start();

    return () => {
      stop();

      themeObserver.disconnect();
      clearTimeout(resizeTimer);
      renderRef.current = null;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', readScroll);
    };
  }, []);

  // Repaint on hover changes even while the animation loop is stopped.
  useEffect(() => {
    renderRef.current?.();
  }, [domain]);

  return (
    <div className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} data-testid="lattice" aria-hidden="true" />
      <p className={styles.labels} data-testid="lattice-labels">
        {dict.a11y.latticeAlt} {DOMAINS.map((key) => dict.domains[key]).join(' · ')}
      </p>
    </div>
  );
}
