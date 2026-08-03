'use client';

import { useEffect, useRef } from 'react';
import type { Dict } from '@/content/types';
import { DOMAINS } from '@/content/types';
import { buildLattice, pathToDomain, type LatticeLayout } from './layout';
import { advance, drawFrame, spawnParticle, MAX_PARTICLES, type Particle } from './draw';
import { useLatticeHover } from './LatticeContext';
import styles from './Lattice.module.css';

const FRAME_BUDGET = 1000 / 30;

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

    const render = (delta: number) => {
      const highlight = domainRef.current
        ? pathToDomain(layout, domainRef.current)
        : new Set<string>();
      if (!reduced && delta > 0) {
        particles = advance(particles, layout, delta, random);
        while (particles.length < MAX_PARTICLES && random() < 0.08) {
          particles.push(spawnParticle(layout, random));
        }
      }
      drawFrame(ctx, layout, particles, { faint, accent, opacity, highlight, dpr });
      frames += 1;
      canvas.setAttribute('data-frames', String(frames));
    };

    renderRef.current = () => render(0);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      layout = buildLattice(rect.width, rect.height);
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

    return () => {
      stop();

      themeObserver.disconnect();
      clearTimeout(resizeTimer);
      renderRef.current = null;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
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
