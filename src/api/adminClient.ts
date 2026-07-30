import { ApiError } from './client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(`Requisição falhou com status ${response.status}`, response.status);
  }
  return (await response.json()) as T;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function login(username: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await parseJsonOrThrow<{ access_token: string }>(response);
  return data.access_token;
}

export interface Source {
  id?: string;
  name: string;
  type: 'url' | 'text';
  url?: string | null;
  content?: string | null;
}

export interface Tutor {
  id: string;
  title: string;
  status: 'active' | 'inactive';
  instructions: string;
  allowed_origins: string[];
  sources: Source[];
}

export async function listTutors(token: string): Promise<Tutor[]> {
  const response = await fetch(`${API_BASE_URL}/admin/tutors?include_inactive=true`, {
    headers: authHeaders(token),
  });
  return parseJsonOrThrow<Tutor[]>(response);
}

export interface CreateTutorInput {
  title: string;
  instructions: string;
  allowed_origins: string[];
  sources: Source[];
}

export async function createTutor(token: string, payload: CreateTutorInput): Promise<Tutor> {
  const response = await fetch(`${API_BASE_URL}/admin/tutors`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<Tutor>(response);
}

export async function setTutorStatus(
  token: string,
  tutorId: string,
  status: 'active' | 'inactive',
): Promise<Tutor> {
  const response = await fetch(`${API_BASE_URL}/admin/tutors/${tutorId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  return parseJsonOrThrow<Tutor>(response);
}

export interface UpdateTutorInput {
  title: string;
  instructions: string;
  allowed_origins: string[];
  sources: Source[];
}

export async function updateTutor(
  token: string,
  tutorId: string,
  payload: UpdateTutorInput,
): Promise<Tutor> {
  const response = await fetch(`${API_BASE_URL}/admin/tutors/${tutorId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<Tutor>(response);
}

export interface EmbedSnippet {
  tutor_id: string;
  iframe_src: string;
  snippet_html: string;
}

export async function getEmbedSnippet(token: string, tutorId: string): Promise<EmbedSnippet> {
  const response = await fetch(`${API_BASE_URL}/embed/tutors/${tutorId}/snippet`, {
    headers: authHeaders(token),
  });
  return parseJsonOrThrow<EmbedSnippet>(response);
}
