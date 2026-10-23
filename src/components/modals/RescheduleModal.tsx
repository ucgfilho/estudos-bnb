import { useState, useEffect, type FormEvent } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Display';
import { Field } from '../ui/Form';
import { rescheduleSession } from '../../services/sessions';
import type { StudySession } from '../../db/types';
import { todayKey, formatDate } from '../../lib/dates';
import { errorMessage } from '../../lib/utils';
import { DateInput } from '../ui/DateInput';
import { TimeInput } from '../ui/TimeInput';

interface RescheduleModalProps {
  open: boolean;
  onClose: () => void;
  session: StudySession | null;
  onRescheduled?: (newSession: StudySession) => void;
}

export function RescheduleModal({ open, onClose, session, onRescheduled }: RescheduleModalProps) {
  const [date, setDate] = useState(todayKey());
  const [plannedStart, setPlannedStart] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      setDate(session.date < todayKey() ? todayKey() : session.date);
      setPlannedStart(session.plannedStart || '');
      setError(null);
    }
  }, [session, open]);

  if (!session) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const updated = await rescheduleSession(session.id, date, plannedStart.trim() || null);
      onRescheduled?.(updated);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Reagendar Sessão"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form="reschedule-form" loading={loading}>
            Reagendar
          </Button>
        </>
      }
    >
      <form id="reschedule-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert tone="danger" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <p className="text-sm text-fg-muted">
          Data atual: <strong className="text-fg">{formatDate(session.date)}</strong>
          {session.plannedStart && ` às ${session.plannedStart}`}.
          {session.actualSeconds > 0 && (
            <span className="block mt-1 text-xs text-warning">
              Esta sessão já possui tempo estudado registrado ({Math.round(session.actualSeconds / 60)} min). O histórico original será preservado e uma nova sessão será planejada para a nova data.
            </span>
          )}
        </p>

        <Field label="Nova data" required>
          <DateInput
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Field>

        <Field label="Horário previsto" hint="Opcional (HH:mm)">
          <TimeInput
            value={plannedStart}
            onChange={(e) => setPlannedStart(e.target.value)}
          />
        </Field>
      </form>
    </Dialog>
  );
}
