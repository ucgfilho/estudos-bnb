import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../App';
import { db, ensureSeed } from '../../db/db';
import { generateSchedule } from '../../services/schedule';
import { createSession } from '../../services/sessions';
import { startPlannedTimer } from '../../services/timer';
import { addDays, startOfWeek, todayKey } from '../../lib/dates';

describe('App Navigation and Screen Integration', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await ensureSeed();
    window.location.hash = '#/';
  });

  it('renders overview screen initially and loads 8 mandatory disciplines', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /visão geral/i })).toBeInTheDocument();
    });

    // Check sidebar navigation items
    expect(screen.getByRole('link', { name: /visão geral/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /calendário/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cronograma/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /estudar agora/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /questões/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /caderno de erros/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /revisões/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /simulados/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /disciplinas/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /relatórios/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /configurações/i })).toBeInTheDocument();

    const disciplines = await db.disciplines.toArray();
    expect(disciplines).toHaveLength(8);
  });

  it('can navigate to all 10 primary screens without error', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /visão geral/i })).toBeInTheDocument();
    });

    // 1. Calendário
    await user.click(screen.getByRole('link', { name: /calendário/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /calendário/i })).toBeInTheDocument();
    });

    // 2. Cronograma
    await user.click(screen.getByRole('link', { name: /cronograma/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /cronograma/i })).toBeInTheDocument();
    });

    // 3. Estudar agora
    await user.click(screen.getByRole('link', { name: /estudar agora/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /estudar agora/i })).toBeInTheDocument();
    });

    // 4. Questões
    await user.click(screen.getByRole('link', { name: /questões/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /banco de questões/i })).toBeInTheDocument();
    });

    // 5. Caderno de erros
    await user.click(screen.getByRole('link', { name: /caderno de erros/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /caderno de erros/i })).toBeInTheDocument();
    });

    // 6. Revisões
    await user.click(screen.getByRole('link', { name: /revisões/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /revisões espaçadas/i })).toBeInTheDocument();
    });

    // 7. Disciplinas
    await user.click(screen.getByRole('link', { name: /disciplinas/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /disciplinas e conteúdos/i })).toBeInTheDocument();
      expect(screen.getAllByText('Língua Portuguesa').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Lógica de Programação').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Arquitetura de Software').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Engenharia de Software').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Linguagens e Tecnologias de Programação').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Banco de Dados').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Computação em Nuvem').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Raciocínio Lógico e Quantitativo').length).toBeGreaterThanOrEqual(1);
    });

    // 8. Relatórios
    await user.click(screen.getByRole('link', { name: /relatórios/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /relatórios/i })).toBeInTheDocument();
    });

    // 9. Configurações
    await user.click(screen.getByRole('link', { name: /configurações/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /configurações/i })).toBeInTheDocument();
    });
  });

  it('automatically selects the current calendar week (Semana 2) when opening Cronograma', async () => {
    const today = todayKey();
    const previousWeekStart = addDays(startOfWeek(today), -7);
    await generateSchedule(previousWeekStart, today);

    window.location.hash = '#/cronograma';
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Semana 2 —/i)).toBeInTheDocument();
    });
  });

  it('updates document.title with elapsed time and discipline name during an active timer session', async () => {
    const session = await createSession({
      date: todayKey(),
      disciplineId: 'portugues',
      topicId: null,
      plannedStart: null,
      plannedMinutes: 60,
      objective: 'Ortografia',
      notes: '',
    });

    await startPlannedTimer(session.id);

    render(<App />);

    await waitFor(() => {
      expect(document.title).toMatch(/▶ 00:00:00 - Língua Portuguesa/);
    });
  });
});
