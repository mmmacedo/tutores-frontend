import { useState } from 'react';
import type { FormEvent } from 'react';
import { login } from '../api/adminClient';

interface LoginFormProps {
  onLoggedIn: (token: string) => void;
}

export function LoginForm({ onLoggedIn }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const token = await login(username, password);
      onLoggedIn(token);
    } catch {
      setError('Usuário ou senha inválidos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <h1>Painel admin</h1>
      <label>
        Usuário
        <input value={username} onChange={(event) => setUsername(event.target.value)} required />
      </label>
      <label>
        Senha
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      <button type="submit" disabled={submitting}>
        Entrar
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
