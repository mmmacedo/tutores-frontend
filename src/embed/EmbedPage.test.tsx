import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as client from '../api/client';
import { EmbedPage } from './EmbedPage';

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/client')>();
  return { ...actual, fetchEmbedToken: vi.fn(), sendChatMessage: vi.fn() };
});

const mockedClient = vi.mocked(client);

describe('EmbedPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('extracts tutorId from the route and renders the chat widget', async () => {
    mockedClient.fetchEmbedToken.mockResolvedValue({
      embed_token: 'tok',
      tutor_id: 'abc-123',
      expires_in_minutes: 15,
    });

    render(
      <MemoryRouter initialEntries={['/embed/abc-123']}>
        <Routes>
          <Route path="/embed/:tutorId" element={<EmbedPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByPlaceholderText(/digite sua mensagem/i);
    expect(mockedClient.fetchEmbedToken).toHaveBeenCalledWith('abc-123');
  });
});
