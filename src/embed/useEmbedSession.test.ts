import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as client from '../api/client';
import { useEmbedSession } from './useEmbedSession';

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/client')>();
  return { ...actual, fetchEmbedToken: vi.fn(), sendChatMessage: vi.fn() };
});

const mockedClient = vi.mocked(client);

describe('useEmbedSession', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches an embed token on mount and becomes ready', async () => {
    mockedClient.fetchEmbedToken.mockResolvedValue({
      embed_token: 'tok',
      tutor_id: 't1',
      expires_in_minutes: 15,
    });

    const { result } = renderHook(() => useEmbedSession('t1'));

    expect(result.current.status).toBe('connecting');
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });

  it('sets an error status with a safe message when the token fetch fails', async () => {
    mockedClient.fetchEmbedToken.mockRejectedValue(new Error('detalhe técnico interno'));

    const { result } = renderHook(() => useEmbedSession('t1'));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.errorMessage).not.toMatch(/detalhe técnico interno/);
  });

  it('sends a message and appends the reply once ready', async () => {
    mockedClient.fetchEmbedToken.mockResolvedValue({
      embed_token: 'tok',
      tutor_id: 't1',
      expires_in_minutes: 15,
    });
    mockedClient.sendChatMessage.mockResolvedValue({ session_id: 's1', reply: 'oi, tudo bem?' });

    const { result } = renderHook(() => useEmbedSession('t1'));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => {
      await result.current.sendMessage('oi');
    });

    expect(result.current.messages).toEqual([
      { role: 'user', content: 'oi' },
      { role: 'assistant', content: 'oi, tudo bem?' },
    ]);
    expect(result.current.status).toBe('ready');
  });

  it('refreshes the token once on a 401 and retries the send', async () => {
    mockedClient.fetchEmbedToken
      .mockResolvedValueOnce({ embed_token: 'old', tutor_id: 't1', expires_in_minutes: 15 })
      .mockResolvedValueOnce({ embed_token: 'new', tutor_id: 't1', expires_in_minutes: 15 });
    mockedClient.sendChatMessage
      .mockRejectedValueOnce(new client.ApiError('expirado', 401))
      .mockResolvedValueOnce({ session_id: 's1', reply: 'oi de novo' });

    const { result } = renderHook(() => useEmbedSession('t1'));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => {
      await result.current.sendMessage('oi');
    });

    expect(mockedClient.sendChatMessage).toHaveBeenCalledTimes(2);
    expect(result.current.messages.at(-1)).toEqual({ role: 'assistant', content: 'oi de novo' });
    expect(result.current.status).toBe('ready');
  });

  it('sets error status when the retry after token refresh also fails', async () => {
    mockedClient.fetchEmbedToken
      .mockResolvedValueOnce({ embed_token: 'old', tutor_id: 't1', expires_in_minutes: 15 })
      .mockResolvedValueOnce({ embed_token: 'new', tutor_id: 't1', expires_in_minutes: 15 });
    mockedClient.sendChatMessage
      .mockRejectedValueOnce(new client.ApiError('expirado', 401))
      .mockRejectedValueOnce(new client.ApiError('ainda expirado', 401));

    const { result } = renderHook(() => useEmbedSession('t1'));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => {
      await result.current.sendMessage('oi');
    });

    expect(result.current.status).toBe('error');
  });
});
