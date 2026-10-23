import { useEffect, useState } from 'react';

/** Animações só rodam quando o navegador suporta e o usuário não pediu movimento reduzido. */
export function canAnimate(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Mantém o elemento montado durante a animação de saída.
 * `render` indica se deve ser renderizado; `state` ('open' | 'closed') alimenta o data-state.
 */
export function usePresence(open: boolean, exitMs = 160) {
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open || !mounted) return;
    const t = setTimeout(() => setMounted(false), canAnimate() ? exitMs : 0);
    return () => clearTimeout(t);
  }, [open, mounted, exitMs]);

  return { render: open || (mounted && canAnimate()), state: open ? ('open' as const) : ('closed' as const) };
}
