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
    <div className="chat-widget">
      <div className="chat-widget__messages">
        {messages.map((message, index) => (
          <div key={index} className={`chat-widget__message chat-widget__message--${message.role}`}>
            {message.content}
          </div>
        ))}
        {status === 'connecting' && messages.length === 0 && (
          <div className="chat-widget__status">Conectando ao tutor…</div>
        )}
      </div>

      {status === 'error' && (
        <div className="chat-widget__error">
          <span>{errorMessage ?? 'Tutor indisponível.'}</span>
          <button type="button" onClick={() => void retryConnection()}>
            Tentar novamente
          </button>
        </div>
      )}

      <div className="chat-widget__composer">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSend();
          }}
          placeholder="Digite sua mensagem…"
          disabled={status === 'connecting'}
        />
        <button type="button" onClick={handleSend} disabled={!canSend}>
          Enviar
        </button>
      </div>
    </div>
  );
}
