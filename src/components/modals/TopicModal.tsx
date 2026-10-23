import { useState, useEffect, type FormEvent } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Display';
import { Field, Input, Select, Textarea } from '../ui/Form';
import { createTopic, updateTopic, type TopicInput } from '../../services/topics';
import { TOPIC_STATUS_LABELS, type Topic, type TopicStatus } from '../../db/types';
import { errorMessage } from '../../lib/utils';

interface TopicModalProps {
  open: boolean;
  onClose: () => void;
  disciplineId: string;
  parentTopicId?: string | null;
  topicToEdit?: Topic | null;
  onSaved?: (topic: Topic) => void;
}

export function TopicModal({
  open,
  onClose,
  disciplineId,
  parentTopicId = null,
  topicToEdit,
  onSaved,
}: TopicModalProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<TopicStatus>('nao-iniciado');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (topicToEdit) {
      setTitle(topicToEdit.title);
      setStatus(topicToEdit.status);
      setNotes(topicToEdit.notes);
    } else {
      setTitle('');
      setStatus('nao-iniciado');
      setNotes('');
    }
    setError(null);
  }, [open, topicToEdit]);

  const isSubtopic = Boolean(parentTopicId || topicToEdit?.parentTopicId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Informe o título.');
      return;
    }

    const input: TopicInput = {
      title: title.trim(),
      status,
      notes: notes.trim(),
    };

    setLoading(true);
    try {
      if (topicToEdit) {
        await updateTopic(topicToEdit.id, input);
      } else {
        const created = await createTopic(disciplineId, parentTopicId, input);
        onSaved?.(created);
      }
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
      title={
        topicToEdit
          ? `Editar ${isSubtopic ? 'Subtópico' : 'Tópico'}`
          : `Novo ${isSubtopic ? 'Subtópico' : 'Tópico'}`
      }
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form="topic-form" loading={loading}>
            {topicToEdit ? 'Salvar' : 'Criar'}
          </Button>
        </>
      }
    >
      <form id="topic-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert tone="danger" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Field label={isSubtopic ? 'Título do Subtópico' : 'Título do Tópico'} required>
          <Input
            type="text"
            placeholder={isSubtopic ? 'Ex: Herança e Polimorfismo' : 'Ex: Programação Orientada a Objetos'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </Field>

        <Field label="Status de estudo">
          <Select value={status} onChange={(e) => setStatus(e.target.value as TopicStatus)}>
            {(Object.keys(TOPIC_STATUS_LABELS) as TopicStatus[]).map((st) => (
              <option key={st} value={st}>
                {TOPIC_STATUS_LABELS[st]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Anotações / Dicas">
          <Textarea
            rows={2}
            placeholder="Observações importantes, referências de estudo..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </form>
    </Dialog>
  );
}
