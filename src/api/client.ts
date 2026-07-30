const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(`Requisição falhou com status ${response.status}`, response.status);
  }
  return (await response.json()) as T;
}

export interface EmbedTokenResponse {
  embed_token: string;
  tutor_id: string;
  expires_in_minutes: number;
}

export async function fetchEmbedToken(tutorId: string): Promise<EmbedTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/embed/tutors/${tutorId}/token`, {
    method: 'POST',
  });
  return parseJsonOrThrow<EmbedTokenResponse>(response);
}

export interface ChatMessageResponse {
  session_id: string;
  reply: string;
}

export async function sendChatMessage(
  tutorId: string,
  embedToken: string,
  message: string,
  sessionId: string | null,
): Promise<ChatMessageResponse> {
  const response = await fetch(`${API_BASE_URL}/chat/${tutorId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${embedToken}`,
    },
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  return parseJsonOrThrow<ChatMessageResponse>(response);
}
