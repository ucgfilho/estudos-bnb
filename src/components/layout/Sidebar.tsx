import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CalendarClock,
  Timer,
  CheckSquare,
  AlertOctagon,
  RotateCcw,
  ClipboardList,
  BookMarked,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { IconButton } from '../ui/Button';
import { BnbLogo } from '../ui/BnbLogo';
import { useReviews, useErrorNotes, useActiveTimer, useToday } from '../../hooks/useData';
import { reviewBuckets } from '../../domain/metrics';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard },
  { to: '/calendario', label: 'Calendário', icon: Calendar },
  { to: '/cronograma', label: 'Cronograma', icon: CalendarClock },
  { to: '/estudar-agora', label: 'Estudar agora', icon: Timer },
  { to: '/questoes', label: 'Questões', icon: CheckSquare },
  { to: '/erros', label: 'Caderno de erros', icon: AlertOctagon },
  { to: '/revisoes', label: 'Revisões', icon: RotateCcw },
  { to: '/simulados', label: 'Simulados', icon: ClipboardList },
  { to: '/disciplinas', label: 'Disciplinas e conteúdos', icon: BookMarked },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const today = useToday();
  const reviews = useReviews();
  const errorNotes = useErrorNotes();
  const timer = useActiveTimer();

  const buckets = reviewBuckets(reviews, today);
  const pendingReviewsCount = buckets.overdue.length + buckets.today.length;
  const pendingErrorsCount = errorNotes.filter((e) => e.status === 'revisar').length;
  const isTimerRunning = Boolean(timer && timer.status === 'running');
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Navegação principal"
      >
        {/* Branding header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2.5">
            <BnbLogo className="size-8 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-fg truncate leading-tight">
                Estudos BNB
              </h1>
              <p className="text-[11px] font-medium text-fg-subtle truncate leading-none">
                Analista de Sistemas
              </p>
            </div>
          </div>
          <IconButton
            label="Fechar menu lateral"
            icon={<X className="size-4" />}
            onClick={onCloseMobile}
            className="lg:hidden"
            size="sm"
          />
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isReviews = item.to === '/revisoes';
            const isErrors = item.to === '/erros';
            const isStudy = item.to === '/estudar-agora';

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-soft text-primary'
                      : 'text-fg-muted hover:bg-surface-muted hover:text-fg'
                  )
                }
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate flex-1">{item.label}</span>

                {/* Live indicators */}
                {isStudy && isTimerRunning && (
                  <span
                    className="flex size-2 rounded-full bg-primary animate-ping"
                    title="Cronômetro em andamento"
                    aria-hidden="true"
                  />
                )}
                {isReviews && pendingReviewsCount > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none',
                      buckets.overdue.length > 0
                        ? 'bg-danger text-white'
                        : 'bg-warning text-canvas'
                    )}
                    title={`${pendingReviewsCount} revisão(ões) pendente(s)`}
                  >
                    {pendingReviewsCount}
                  </span>
                )}
                {isErrors && pendingErrorsCount > 0 && (
                  <span
                    className="rounded-full bg-surface-muted border border-border px-1.5 py-0.5 text-[10px] font-semibold text-fg-muted tabular-nums leading-none"
                    title={`${pendingErrorsCount} erro(s) a revisar`}
                  >
                    {pendingErrorsCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Target role reminder */}
        <div className="border-t border-border p-3 text-[11px] text-fg-subtle">
          <div className="font-semibold text-fg">Cargo Pretendido</div>
          <div>Analista de Sistemas — Desenvolvimento</div>
          <div className="mt-1 text-primary font-medium">Meta: 120 min/dia (840 min/sem)</div>
        </div>
      </aside>
    </>
  );
}
