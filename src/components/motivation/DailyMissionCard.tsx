import { useMemo } from 'react';
import { CheckCircle2, Circle, Flame, Play } from 'lucide-react';
import { Card, DisciplineDot, ProgressBar } from '../ui/Display';
import { Button } from '../ui/Button';
import { ProgressRing } from './ProgressRing';
import { dailyProgress, nextPendingToday, progressFraming } from '../../domain/motivation';
import type { Discipline, QuestionLog, Settings, StudySession } from '../../db/types';
import { formatInteger, formatMinutes } from '../../lib/format';
import { cn } from '../../lib/utils';

interface DailyMissionCardProps {
  sessions: readonly StudySession[];
  logs: readonly QuestionLog[];
  settings: Settings | undefined;
  disciplines: readonly Discipline[];
  today: string;
  streak: number;
  onStartBlock: (sessionId: string) => void;
  onStudyNow: () => void;
  onOpenSettings: () => void;
}

const MAX_ITEMS = 5;

/**
 * "Missão de Hoje": concentra num só lugar o progresso do dia.
 * - Anel de tempo (goal-gradient) com enquadramento dinâmico da mensagem;
 * - Checklist dos blocos do cronograma (tarefas abertas ficam visíveis —
 *   efeito Zeigarnik — e cada marcação é uma pequena vitória);
 * - Um único próximo passo claro (reduz o atrito para começar).
 */
export function DailyMissionCard({ sessions, logs, settings, disciplines, today, streak, onStartBlock, onStudyNow, onOpenSettings }: DailyMissionCardProps) {
  const p = useMemo(() => dailyProgress(sessions, logs, settings, today), [sessions, logs, settings, today]);
  const next = useMemo(() => nextPendingToday(sessions, today), [sessions, today]);
  const discMap = useMemo(() => new Map(disciplines.map((d) => [d.id, d])), [disciplines]);

  const pct = Math.round(p.ratio * 100);
  const goalDone = p.ratio >= 1;
  const scheduleDone = p.scheduled.length > 0 && p.scheduledDone === p.scheduled.length;
  const pendingBlocks = p.scheduled.length - p.scheduledDone;
  const nameOf = (id: string) => discMap.get(id)?.name ?? (id === 'simulado' ? 'Simulado Geral BNB' : 'Disciplina');
  const colorOf = (id: string) => discMap.get(id)?.color ?? '#A6193C';

  return (
    <Card
      title="Missão de Hoje"
      description={progressFraming(p.studiedMinutes, p.goalMinutes)}
      actions={
        next ? (
          <Button variant="primary" size="sm" icon={<Play className="size-4" aria-hidden />} onClick={() => onStartBlock(next.id)}>
            Começar próximo bloco
          </Button>
        ) : (
          <Button variant={goalDone ? 'secondary' : 'primary'} size="sm" icon={<Play className="size-4" aria-hidden />} onClick={onStudyNow}>
            {goalDone ? 'Estudar mais' : 'Estudar agora'}
          </Button>
        )
      }
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr_1fr] md:items-center">
        {/* Anel de tempo */}
        <div className="flex items-center gap-4 md:flex-col md:gap-2">
          <ProgressRing value={p.studiedMinutes} max={p.goalMinutes} label="Tempo estudado hoje em relação à meta diária" size={116}>
            <div>
              <div className="text-2xl font-bold tabular-nums text-fg">{Math.min(pct, 999)}%</div>
              <div className="text-[11px] text-fg-subtle">{goalDone ? 'meta cumprida' : 'da meta'}</div>
            </div>
          </ProgressRing>
          <div className="text-sm md:text-center">
            <span className="font-semibold tabular-nums text-fg">{formatMinutes(p.studiedMinutes)}</span>
            <span className="text-fg-muted"> de {formatMinutes(p.goalMinutes)}</span>
          </div>
        </div>

        {/* Checklist do cronograma */}
        <div className="min-w-0 space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-fg-subtle uppercase">Cronograma de hoje</h3>
            {p.scheduled.length > 0 && (
              <span className={cn('text-xs font-medium tabular-nums', scheduleDone ? 'text-success' : 'text-fg-muted')}>
                {p.scheduledDone} de {p.scheduled.length} blocos
              </span>
            )}
          </div>
          {p.scheduled.length > 0 ? (
            <>
              <ProgressBar value={p.scheduledDone} max={p.scheduled.length} label="Blocos do cronograma de hoje concluídos" tone={scheduleDone ? 'success' : 'primary'} />
              <ul className="space-y-1">
                {p.scheduled.slice(0, MAX_ITEMS).map((s) => {
                  const done = s.status === 'concluida';
                  return (
                    <li key={s.id} className="flex items-center gap-2 text-sm">
                      {done ? (
                        <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                      ) : (
                        <Circle className="size-4 shrink-0 text-fg-subtle" aria-hidden />
                      )}
                      <DisciplineDot color={colorOf(s.disciplineId)} />
                      <span className={cn('min-w-0 flex-1 truncate', done ? 'text-fg-muted' : 'text-fg')}>{nameOf(s.disciplineId)}</span>
                      <span className="shrink-0 text-xs tabular-nums text-fg-subtle">
                        {done ? <span className="text-success">Concluído</span> : `${s.plannedMinutes} min`}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {p.scheduled.length > MAX_ITEMS && <p className="text-xs text-fg-subtle">+{p.scheduled.length - MAX_ITEMS} blocos</p>}
              {pendingBlocks > 0 && (
                <p className="text-xs text-fg-muted">
                  {pendingBlocks === 1 ? 'Falta 1 bloco para fechar o dia.' : `Faltam ${pendingBlocks} blocos para fechar o dia.`}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-fg-muted">Nenhum bloco planejado para hoje. Uma sessão avulsa também conta para a meta.</p>
          )}
        </div>

        {/* Questões e sequência */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-xs font-semibold tracking-wide text-fg-subtle uppercase">Questões hoje</h3>
              <span className="text-sm font-semibold tabular-nums text-fg">
                {formatInteger(p.questionsToday)}
                {p.questionGoal ? <span className="font-normal text-fg-muted"> / {formatInteger(p.questionGoal)}</span> : null}
              </span>
            </div>
            {p.questionGoal ? (
              <ProgressBar
                value={p.questionsToday}
                max={p.questionGoal}
                label="Questões resolvidas hoje em relação à meta diária"
                tone={p.questionsToday >= p.questionGoal ? 'success' : 'primary'}
                showOverflow
              />
            ) : (
              <button type="button" onClick={onOpenSettings} className="text-xs font-medium text-primary hover:underline">
                Definir meta diária de questões
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface-muted/50 px-3 py-2">
            <Flame className={cn('size-4 shrink-0', streak > 0 ? 'text-accent' : 'text-fg-subtle')} aria-hidden />
            <p className="text-sm text-fg">
              <span className="font-semibold tabular-nums">{streak}</span> {streak === 1 ? 'dia seguido' : 'dias seguidos'}
              <span className="block text-xs text-fg-muted">
                {p.studiedMinutes > 0 ? 'Sequência garantida hoje.' : streak > 0 ? 'Estude hoje para manter a sequência.' : 'Comece hoje uma nova sequência.'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
