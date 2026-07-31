import { useState } from 'react';
import { useEmbedSession } from './useEmbedSession';
import './ChatWidget.css';

interface ChatWidgetProps {
  tutorId: string;
}

/**
 * Único componente renderizado dentro do `<iframe>` de embed (ver
 * frontend/CLAUDE.md). Sem `<form>` para o chat (restrição do projeto):
 * input controlado + envio via botão ou Enter.
 */
export function ChatWidget({ tutorId }: ChatWidgetProps) {
  const { status, messages, errorMessage, sendMessage, retryConnection } = useEmbedSession(tutorId);
  const [draft, setDraft] = useState('');

  const canSend = draft.trim().length > 0 && status !== 'connecting' && status !== 'sending';

  const handleSend = () => {
    if (!canSend) return;
    void sendMessage(draft);
    setDraft('');
  };

  return (
    <section className="board" aria-label="Chat com o tutor">
      <header className="board__header">
        <span className="board__lamp" data-state={status} aria-hidden="true" />
        <p className="board__route">Tutor</p>
      </header>

      <ul className="board__rows" aria-live="polite">
        {messages.map((message, index) => (
          <li key={index} className={`board__row board__row--${message.role}`}>
            <p className="board__row-text">{message.content}</p>
          </li>
        ))}
        {status === 'connecting' && messages.length === 0 && (
          <li className="board__status" aria-hidden="false">
            Conectando ao tutor…
          </li>
        )}
      </ul>

      {status === 'error' && (
        <div className="board__alert" role="alert">
          <span>{errorMessage ?? 'Tutor indisponível.'}</span>
          <button
            type="button"
            className="board__alert-retry"
            onClick={() => void retryConnection()}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="board__composer">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSend();
          }}
          placeholder="Digite sua mensagem…"
          aria-label="Mensagem"
          disabled={status === 'connecting'}
        />
        <button type="button" onClick={handleSend} disabled={!canSend}>
          Enviar
        </button>
      </div>
    </section>
  );
}
