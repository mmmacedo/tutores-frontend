import { useState } from 'react';
import type { FormEvent } from 'react';
import { login } from '../api/adminClient';
import './admin.css';

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
    <main className="gate">
      <form className="gate__panel" onSubmit={(event) => void handleSubmit(event)}>
        <h1>Painel admin</h1>
        <label className="field">
          Usuário
          <input value={username} onChange={(event) => setUsername(event.target.value)} required />
        </label>
        <label className="field">
          Senha
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit" className="button" disabled={submitting}>
          Entrar
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
    </main>
  );
}
