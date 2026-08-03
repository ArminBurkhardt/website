'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_THEME } from '@/config/site';

export type Theme = 'dark' | 'light';

function readTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'light' || attr === 'dark' ? attr : DEFAULT_THEME;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* storage unavailable — the attribute still applies for this session */
      }
      return next;
    });
  }, []);

  return { theme, toggle, mounted };
}
