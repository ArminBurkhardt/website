'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { Domain } from '@/content/types';

type LatticeHover = { domain: Domain | null; setDomain: (domain: Domain | null) => void };

const LatticeHoverContext = createContext<LatticeHover>({ domain: null, setDomain: () => {} });

export function LatticeProvider({ children }: { children: React.ReactNode }) {
  const [domain, setDomain] = useState<Domain | null>(null);
  const value = useMemo(() => ({ domain, setDomain }), [domain]);
  return <LatticeHoverContext.Provider value={value}>{children}</LatticeHoverContext.Provider>;
}

export function useLatticeHover() {
  return useContext(LatticeHoverContext);
}
