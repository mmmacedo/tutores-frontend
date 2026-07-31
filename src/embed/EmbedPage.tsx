import { useParams } from 'react-router-dom';
import { ChatWidget } from './ChatWidget';

/**
 * Única rota carregada dentro do `<iframe>` de embed (frontend/CLAUDE.md).
 * Wrapper fino: só extrai `tutorId` da URL — toda a lógica de sessão/chat
 * já vive em `useEmbedSession`/`ChatWidget` (Etapa 8).
 */
export function EmbedPage() {
  const { tutorId } = useParams<{ tutorId: string }>();

  if (!tutorId) {
    return (
      <main className="board" aria-label="Chat com o tutor">
        <p className="board__status">Tutor não especificado.</p>
      </main>
    );
  }

  return <ChatWidget tutorId={tutorId} />;
}
