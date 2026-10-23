import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostponeReviewModal } from '../../components/modals/ReviewModal';
import { db, resetDatabase } from '../../db/db';
import type { ReviewTask } from '../../db/types';

vi.mock('../../services/performance', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/performance')>();
  return {
    ...actual,
    postponeReviewToDate: vi.fn().mockResolvedValue(undefined),
  };
});

import { postponeReviewToDate } from '../../services/performance';

describe('PostponeReviewModal (Calendar view)', () => {
  beforeEach(async () => {
    await resetDatabase(db);
    vi.clearAllMocks();
  });

  const mockReview: ReviewTask = {
    id: 'rev-1',
    disciplineId: 'portugues',
    topicId: null,
    errorNoteId: null,
    title: 'Revisar Concordância Verbal',
    dueDate: '2026-10-20',
    intervalDays: 7,
    status: 'pendente',
    completedAt: null,
    createdAt: '2026-10-15T10:00:00Z',
  };

  it('renders visual calendar modal with month navigation, weekdays, and presets', () => {
    render(
      <PostponeReviewModal
        open={true}
        onClose={vi.fn()}
        review={mockReview}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Adiar Revisão')).toBeInTheDocument();
    expect(screen.getByText('Revisar Concordância Verbal')).toBeInTheDocument();
    expect(screen.getByText('+1 dia')).toBeInTheDocument();
    expect(screen.getByText('+3 dias')).toBeInTheDocument();
    expect(screen.getByText('+7 dias (1 sem)')).toBeInTheDocument();
    expect(screen.getByText('Seg')).toBeInTheDocument();
    expect(screen.getByText('Dom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^fechar$/i })).toBeInTheDocument();
  });

  it('updates target date when a preset is clicked and submits new date via calendar', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handlePostponed = vi.fn();

    render(
      <PostponeReviewModal
        open={true}
        onClose={handleClose}
        review={mockReview}
        onPostponed={handlePostponed}
      />
    );

    // Click preset +7 dias
    const preset7 = screen.getByRole('button', { name: /\+7 dias/i });
    await user.click(preset7);

    // Confirm button
    const confirmBtn = screen.getByRole('button', { name: /confirmar novo prazo/i });
    await user.click(confirmBtn);

    expect(postponeReviewToDate).toHaveBeenCalledTimes(1);
    expect(postponeReviewToDate).toHaveBeenCalledWith('rev-1', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
    expect(handlePostponed).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
