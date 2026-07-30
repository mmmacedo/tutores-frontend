import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchEmbedToken, sendChatMessage } from './client';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  globalThis.fetch = fn as unknown as typeof fetch;
  return fn;
}

describe('fetchEmbedToken', () => {
  it('returns the parsed token payload on success', async () => {
    mockFetch(200, { embed_token: 'tok', tutor_id: 't1', expires_in_minutes: 15 });

    const result = await fetchEmbedToken('t1');

    expect(result).toEqual({ embed_token: 'tok', tutor_id: 't1', expires_in_minutes: 15 });
  });

  it('throws ApiError carrying the response status on failure', async () => {
    mockFetch(404, { detail: 'Tutor não encontrado.' });

    await expect(fetchEmbedToken('unknown')).rejects.toMatchObject({ status: 404 });
  });
});

describe('sendChatMessage', () => {
  it('sends the embed token as a bearer header and returns the reply', async () => {
    const fetchMock = mockFetch(200, { session_id: 's1', reply: 'oi' });

    const result = await sendChatMessage('t1', 'tok', 'oi', null);

    expect(result).toEqual({ session_id: 's1', reply: 'oi' });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/chat/t1/messages'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer tok' }),
      }),
    );
  });

  it('throws ApiError with status 401 on an expired token', async () => {
    mockFetch(401, { detail: 'Token de embed inválido ou expirado.' });

    await expect(sendChatMessage('t1', 'expirado', 'oi', null)).rejects.toMatchObject({
      status: 401,
    });
  });
});
