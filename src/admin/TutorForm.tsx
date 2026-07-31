import { useState } from 'react';
import type { FormEvent } from 'react';
import { createTutor } from '../api/adminClient';
import type { Tutor } from '../api/adminClient';
import './admin.css';

interface TutorFormProps {
  token: string;
  onCreated: (tutor: Tutor) => void;
}

export function TutorForm({ token, onCreated }: TutorFormProps) {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [allowedOrigins, setAllowedOrigins] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const tutor = await createTutor(token, {
        title,
        instructions,
        allowed_origins: allowedOrigins
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
        sources:
          sourceName.trim() && sourceUrl.trim()
            ? [{ name: sourceName.trim(), type: 'url', url: sourceUrl.trim() }]
            : [],
      });
      onCreated(tutor);
      setTitle('');
      setInstructions('');
      setAllowedOrigins('');
      setSourceName('');
      setSourceUrl('');
    } catch {
      setError('Não foi possível criar o tutor. Verifique os campos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <h2 id="new-tutor-heading">Novo tutor</h2>
      <label className="field">
        Título
        <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label className="field">
        Instruções
        <textarea
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          required
        />
      </label>
      <label className="field">
        Origens permitidas (separadas por vírgula)
        <input
          value={allowedOrigins}
          onChange={(event) => setAllowedOrigins(event.target.value)}
          placeholder="https://cliente.example.com"
        />
      </label>
      <fieldset className="source-fieldset">
        <legend>Fonte opcional (URL)</legend>
        <label className="field">
          Nome
          <input value={sourceName} onChange={(event) => setSourceName(event.target.value)} />
        </label>
        <label className="field">
          URL
          <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} />
        </label>
      </fieldset>
      <button type="submit" className="button" disabled={submitting}>
        Criar tutor
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
