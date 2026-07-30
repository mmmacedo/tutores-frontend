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
    return <p>Tutor não especificado.</p>;
  }

  return <ChatWidget tutorId={tutorId} />;
}
