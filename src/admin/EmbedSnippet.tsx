import { useEffect, useState } from 'react';
import { getEmbedSnippet } from '../api/adminClient';

interface EmbedSnippetProps {
  token: string;
  tutorId: string;
}

export function EmbedSnippet({ token, tutorId }: EmbedSnippetProps) {
  const [snippet, setSnippet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sem setState síncrono aqui (react-hooks/set-state-in-effect) — o
    // componente é remontado por `key={tutorId}` no `AdminPage` quando o
    // tutor selecionado muda, então o estado inicial (`null`) já cobre o
    // "reset" sem precisar de um setState direto no corpo do efeito.
    let cancelled = false;
    getEmbedSnippet(token, tutorId)
      .then((result) => {
        if (!cancelled) setSnippet(result.snippet_html);
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível gerar o snippet.');
      });
    return () => {
      cancelled = true;
    };
  }, [token, tutorId]);

  if (error) return <p role="alert">{error}</p>;
  if (!snippet) return <p>Carregando snippet…</p>;

  return (
    <div>
      <h3>Snippet de integração</h3>
      <textarea readOnly value={snippet} rows={3} />
      <button type="button" onClick={() => void navigator.clipboard.writeText(snippet)}>
        Copiar
      </button>
    </div>
  );
}
