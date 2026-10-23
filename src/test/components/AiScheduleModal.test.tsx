import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AiScheduleModal } from '../../components/modals/AiScheduleModal';
import { db, ensureSeed } from '../../db/db';

describe('AiScheduleModal Component', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await ensureSeed(db);
  });

  it('renders modal with BNB TI specificities, 2h daily limit and Saturday questions', () => {
    render(
      <AiScheduleModal
        open={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        defaultStartDate="2026-10-12"
      />
    );

    // Title and AI badge
    expect(screen.getByText('Gerar Cronograma de 24 Semanas com IA')).toBeInTheDocument();
    expect(screen.getByText(/Geração Exclusiva por Inteligência Artificial/i)).toBeInTheDocument();

    // Specific rules displayed in modal
    expect(screen.getByText(/Foco em TI \(Maior Peso\):/i)).toBeInTheDocument();
    expect(screen.getByText(/2 Horas por Dia:/i)).toBeInTheDocument();
    expect(screen.getByText(/Sábados Exclusivos:/i)).toBeInTheDocument();
    expect(screen.getByText(/Domingos Livres:/i)).toBeInTheDocument();

    // Form controls
    expect(screen.getByLabelText(/Data de Início do Cronograma/i)).toHaveValue('12/10/2026');
    expect(screen.getByLabelText(/Motor de Inteligência Artificial/i)).toBeInTheDocument();
  });

  it('shows Gemini API key field only when Google Gemini AI is selected', async () => {
    const user = userEvent.setup();
    render(
      <AiScheduleModal
        open={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        defaultStartDate="2026-10-12"
      />
    );

    // Initially builtin -> no Gemini API Key field
    expect(screen.queryByLabelText(/Chave de API Gemini/i)).not.toBeInTheDocument();

    // Select Gemini
    const select = screen.getByLabelText(/Motor de Inteligência Artificial/i);
    await user.selectOptions(select, 'gemini');

    // Now Gemini API Key field is visible
    expect(screen.getByLabelText(/Chave de API Gemini/i)).toBeInTheDocument();
    expect(screen.getByText(/Obter chave gratuita no Google AI Studio/i)).toBeInTheDocument();
  });

  it('generates schedule using builtin AI engine and calls onSuccess', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <AiScheduleModal
        open={true}
        onClose={onClose}
        onSuccess={onSuccess}
        defaultStartDate="2026-10-12"
      />
    );

    const generateBtn = screen.getByRole('button', { name: /Gerar Cronograma com IA/i });
    await user.click(generateBtn);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.stringContaining('Cronograma de 24 semanas gerado com sucesso exclusivamente por IA')
      );
    });

    expect(onClose).toHaveBeenCalled();
  });
});
