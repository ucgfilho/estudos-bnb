import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Monitor,
  Settings as SettingsIcon,
  Timer as TimerIcon,
  CalendarDays,
} from 'lucide-react';
import { IconButton } from '../ui/Button';
import { Badge } from '../ui/Display';
import { SearchModal } from './SearchModal';
import { useSettings, useActiveTimer, useNow } from '../../hooks/useData';
import { updateSettings } from '../../services/settings';
import { todayKey, formatLongDate } from '../../lib/dates';
import { daysUntil } from '../../domain/metrics';
import { elapsedSeconds } from '../../domain/timer';
import { formatClock } from '../../lib/format';
import { BnbLogo } from '../ui/BnbLogo';
import type { ThemePreference } from '../../db/types';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const settings = useSettings();
  const timer = useActiveTimer();
  const now = useNow(1000, Boolean(timer && timer.status === 'running'));
  const today = todayKey(now);
  const navigate = useNavigate();

  const themePreference = settings?.theme;

  // Apply theme class to documentElement
  useEffect(() => {
    if (!themePreference) return;
    const isDark =
      themePreference === 'dark' ||
      (themePreference === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themePreference]);

  // Global keyboard shortcut: Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA')) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cycleTheme = async () => {
    const next: Record<ThemePreference, ThemePreference> = {
      light: 'dark',
      dark: 'system',
      system: 'light',
    };
    const current = settings?.theme ?? 'system';
    await updateSettings({ theme: next[current] });
  };

  const themeIcon = {
    light: <Sun className="size-4" />,
    dark: <Moon className="size-4" />,
    system: <Monitor className="size-4" />,
  }[settings?.theme ?? 'system'];

  const examDaysLeft = daysUntil(settings?.examDate ?? null, today);

  const timerSeconds = timer ? elapsedSeconds(timer, now) : 0;

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <IconButton
            label="Abrir menu de navegação"
            icon={<Menu className="size-5" />}
            onClick={onToggleMobileMenu}
            className="lg:hidden"
          />

          <BnbLogo className="size-7 shrink-0 lg:hidden" />

          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-fg-subtle hidden sm:inline" />
            <span className="text-xs sm:text-sm font-medium text-fg capitalize">
              {formatLongDate(today)}
            </span>
          </div>

          {examDaysLeft !== null && (
            <Badge
              tone={examDaysLeft <= 14 ? 'danger' : examDaysLeft <= 30 ? 'warning' : 'primary'}
              className="hidden md:inline-flex"
            >
              {examDaysLeft > 0
                ? `${examDaysLeft} dias até a prova`
                : examDaysLeft === 0
                ? 'Dia da prova hoje!'
                : `Prova realizada há ${Math.abs(examDaysLeft)} dias`}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {timer && (
            <button
              type="button"
              onClick={() => navigate('/estudar-agora')}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary transition-colors hover:brightness-95 animate-pulse"
              title="Sessão de estudo em andamento — Clique para abrir o cronômetro"
            >
              <TimerIcon className="size-3.5" />
              <span>{timer.status === 'paused' ? 'Pausado' : 'Estudando'}</span>
              <span className="tabular-nums font-mono">{formatClock(timerSeconds)}</span>
            </button>
          )}

          <IconButton
            label="Buscar conteúdo (Ctrl+K ou /)"
            icon={<Search className="size-4" />}
            onClick={() => setSearchOpen(true)}
          />

          <IconButton
            label={`Alterar tema (atual: ${settings?.theme ?? 'sistema'})`}
            icon={themeIcon}
            onClick={cycleTheme}
          />

          <Link to="/configuracoes">
            <IconButton label="Configurações" icon={<SettingsIcon className="size-4" />} />
          </Link>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
