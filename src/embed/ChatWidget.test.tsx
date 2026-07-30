import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as client from '../api/client';
import { ChatWidget } from './ChatWidget';

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/client')>();
  return { ...actual, fetchEmbedToken: vi.fn(), sendChatMessage: vi.fn() };
});

const mockedClient = vi.mocked(client);

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('sends a message on Enter and shows the reply', async () => {
    mockedClient.fetchEmbedToken.mockResolvedValue({
      embed_token: 'tok',
      tutor_id: 't1',
      expires_in_minutes: 15,
    });
    mockedClient.sendChatMessage.mockResolvedValue({ session_id: 's1', reply: 'Oi! Tudo bem?' });

    const user = userEvent.setup();
    render(<ChatWidget tutorId="t1" />);

    const input = await screen.findByPlaceholderText(/digite sua mensagem/i);
    await user.type(input, 'Olá{Enter}');

    expect(await screen.findByText('Oi! Tudo bem?')).toBeInTheDocument();
    expect(screen.getByText('Olá')).toBeInTheDocument();
  });

  it('shows a generic error with a retry button when the tutor is unreachable', async () => {
    mockedClient.fetchEmbedToken.mockRejectedValue(new Error('stack trace interno'));

    render(<ChatWidget tutorId="t1" />);

    expect(await screen.findByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
    expect(screen.queryByText(/stack trace interno/)).not.toBeInTheDocument();
  });

  it('disables the send button while the input is empty', async () => {
    mockedClient.fetchEmbedToken.mockResolvedValue({
      embed_token: 'tok',
      tutor_id: 't1',
      expires_in_minutes: 15,
    });

    render(<ChatWidget tutorId="t1" />);

    const sendButton = await screen.findByRole('button', { name: /enviar/i });
    expect(sendButton).toBeDisabled();
  });
});
