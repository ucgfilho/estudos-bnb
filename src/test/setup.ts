import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';

// Polyfill scrollTo and resize observer if needed in tests
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
  if (!window.matchMedia) {
    window.matchMedia = (query: string) => ({
      // Movimento reduzido nos testes: animações de saída não atrasam a desmontagem.
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }
  if (!('ResizeObserver' in window)) {
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
}
