import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CelebrationLayer } from '../motivation/CelebrationLayer';
import { useActiveTimer } from '../../hooks/useData';
import { elapsedSeconds } from '../../domain/timer';
import { formatClock } from '../../lib/format';

const BASE_TITLE = 'Estudos BNB — Analista de Sistemas';

/**
 * Tique a cada segundo a partir de um Web Worker: timers da thread principal
 * são limitados pelo navegador em abas em segundo plano; os de workers não.
 */
function useWorkerTick(enabled: boolean): number {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    setTick(Date.now());
    const url = URL.createObjectURL(
      new Blob(['setInterval(() => postMessage(0), 1000)'], { type: 'text/javascript' }),
    );
    const worker = new Worker(url);
    worker.onmessage = () => setTick(Date.now());
    return () => {
      worker.terminate();
      URL.revokeObjectURL(url);
    };
  }, [enabled]);
  return tick;
}

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeTimer = useActiveTimer();
  const now = useWorkerTick(Boolean(activeTimer && activeTimer.status === 'running'));

  // Mostra o tempo do cronômetro no rótulo da aba do navegador.
  useEffect(() => {
    if (!activeTimer) {
      document.title = BASE_TITLE;
      return;
    }
    const clock = formatClock(elapsedSeconds(activeTimer, now));
    document.title = `${activeTimer.status === 'running' ? '▶' : '⏸'} ${clock} — Estudos BNB`;
  }, [activeTimer, now]);

  useEffect(() => () => {
    document.title = BASE_TITLE;
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas text-fg">
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 focus:outline-hidden" tabIndex={-1}>
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <CelebrationLayer />
    </div>
  );
}
