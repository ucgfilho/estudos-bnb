import { useEffect, useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CelebrationLayer } from '../motivation/CelebrationLayer';
import { useActiveTimer, useDisciplines } from '../../hooks/useData';
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
    if (typeof Worker === 'undefined') {
      const id = window.setInterval(() => setTick(Date.now()), 1000);
      return () => window.clearInterval(id);
    }
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
  const disciplines = useDisciplines();
  const now = useWorkerTick(Boolean(activeTimer && activeTimer.status === 'running'));

  const discMap = useMemo(() => new Map(disciplines.map((d) => [d.id, d])), [disciplines]);

  // Mostra o tempo do cronômetro no rótulo da aba do navegador: tempo decorrido - "nome da disciplina"
  useEffect(() => {
    if (!activeTimer) {
      document.title = BASE_TITLE;
      return;
    }
    const clock = formatClock(elapsedSeconds(activeTimer, now));
    const disc = discMap.get(activeTimer.disciplineId);
    const disciplineName =
      disc?.name ??
      (activeTimer.disciplineId === 'simulado'
        ? 'Simulado Geral BNB'
        : activeTimer.disciplineId || 'Estudos BNB');
    const statusIcon = activeTimer.status === 'running' ? '▶' : '⏸';
    document.title = `${statusIcon} ${clock} - ${disciplineName}`;
  }, [activeTimer, now, discMap]);

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
