import { useState } from 'react';
import type { FormEvent } from 'react';
import { updateTutor } from '../api/adminClient';
import type { Tutor } from '../api/adminClient';

interface TutorEditFormProps {
  token: string;
  tutor: Tutor;
  onSaved: (tutor: Tutor) => void;
  onCancel: () => void;
}

export function TutorEditForm({ token, tutor, onSaved, onCancel }: TutorEditFormProps) {
  const firstSource = tutor.sources[0];
  const [title, setTitle] = useState(tutor.title);
  const [instructions, setInstructions] = useState(tutor.instructions);
  const [allowedOrigins, setAllowedOrigins] = useState(tutor.allowed_origins.join(', '));
  const [sourceName, setSourceName] = useState(firstSource?.name ?? '');
  const [sourceUrl, setSourceUrl] = useState(firstSource?.url ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const editedSource =
        sourceName.trim() && sourceUrl.trim()
          ? [{ name: sourceName.trim(), type: 'url' as const, url: sourceUrl.trim() }]
          : [];
      const saved = await updateTutor(token, tutor.id, {
        title,
        instructions,
        allowed_origins: allowedOrigins
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
        sources: [...editedSource, ...tutor.sources.slice(1)],
      });
      onSaved(saved);
    } catch {
      setError('Não foi possível salvar as alterações. Verifique os campos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <h2>Editar tutor</h2>
      <label>
        Título
        <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>
        Instruções
        <textarea
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          required
        />
      </label>
      <label>
        Origens permitidas (separadas por vírgula)
        <input
          value={allowedOrigins}
          onChange={(event) => setAllowedOrigins(event.target.value)}
          placeholder="https://cliente.example.com"
        />
      </label>
      <fieldset>
        <legend>Fonte principal (URL)</legend>
        <label>
          Nome
          <input value={sourceName} onChange={(event) => setSourceName(event.target.value)} />
        </label>
        <label>
          URL
          <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} />
        </label>
      </fieldset>
      <button type="submit" disabled={submitting}>
        Salvar
      </button>
      <button type="button" onClick={onCancel} disabled={submitting}>
        Cancelar
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
