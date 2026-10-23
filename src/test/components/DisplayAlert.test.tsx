import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert, Card } from '../../components/ui/Display';

describe('Alert component', () => {
  it('renders title and content', () => {
    render(
      <Alert tone="success" title="Sucesso!">
        Sessão excluída com sucesso!
      </Alert>
    );

    expect(screen.getByText('Sucesso!')).toBeInTheDocument();
    expect(screen.getByText('Sessão excluída com sucesso!')).toBeInTheDocument();
  });

  it('renders close button with X in top-right corner when onClose is provided and triggers callback on click', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Alert tone="success" title="Sucesso!" onClose={handleClose}>
        Sessão excluída com sucesso!
      </Alert>
    );

    const closeBtn = screen.getByRole('button', { name: /fechar mensagem/i });
    expect(closeBtn).toBeInTheDocument();

    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders close button with X and dismisses alert internally when onClose is not provided', async () => {
    const user = userEvent.setup();

    render(
      <Alert tone="info" title="Info">
        Apenas informativo
      </Alert>
    );

    const closeBtn = screen.getByRole('button', { name: /fechar mensagem/i });
    expect(closeBtn).toBeInTheDocument();

    await user.click(closeBtn);
    expect(screen.queryByText('Apenas informativo')).not.toBeInTheDocument();
  });

  it('persists dismissal in localStorage so alert stays dismissed on remount', async () => {
    const user = userEvent.setup();

    const { unmount } = render(
      <Alert tone="warning" title="Aviso importante" dismissKey="test-warning-key">
        Mensagem crítica
      </Alert>
    );

    expect(screen.getByText('Aviso importante')).toBeInTheDocument();
    const closeBtn = screen.getByRole('button', { name: /fechar mensagem/i });
    await user.click(closeBtn);
    expect(screen.queryByText('Aviso importante')).not.toBeInTheDocument();

    unmount();

    // Remounting with the same dismissKey should remain dismissed (as in tab switch / page reload)
    render(
      <Alert tone="warning" title="Aviso importante" dismissKey="test-warning-key">
        Mensagem crítica
      </Alert>
    );
    expect(screen.queryByText('Aviso importante')).not.toBeInTheDocument();
  });

  it('marks alert with once=true as seen so it does not reappear on remount/reload', () => {
    const { unmount } = render(
      <Alert tone="danger" title="Sobrecarga" dismissKey="test-once-key" once>
        Alerta de sobrecarga
      </Alert>
    );

    expect(screen.getByText('Sobrecarga')).toBeInTheDocument();

    unmount();

    // Re-rendering (as in page reload) should not display the alert again
    render(
      <Alert tone="danger" title="Sobrecarga" dismissKey="test-once-key" once>
        Alerta de sobrecarga
      </Alert>
    );

    expect(screen.queryByText('Sobrecarga')).not.toBeInTheDocument();
  });
});

describe('Card component with onClose', () => {
  it('renders close button with X in top-right corner when onClose is provided', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Card title="Detalhes" onClose={handleClose}>
        Conteúdo do card
      </Card>
    );

    const closeBtn = screen.getByRole('button', { name: /fechar/i });
    expect(closeBtn).toBeInTheDocument();

    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
