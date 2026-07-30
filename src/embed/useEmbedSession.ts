import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, fetchEmbedToken, sendChatMessage } from '../api/client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type SessionStatus = 'connecting' | 'ready' | 'sending' | 'error';

/**
 * Sessão de chat do widget de embed: obtém o token de embed ao carregar
 * (o token é público, escopado ao tutor — ver backend/app/api/embed_routes.py)
 * e o renova uma vez, automaticamente, se uma mensagem falhar por token
 * expirado (401) — TTL curto "renovável" (CLAUDE.md raiz).
 */
export function useEmbedSession(tutorId: string) {
  const [status, setStatus] = useState<SessionStatus>('connecting');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tokenRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Só busca o token e guarda o resultado num ref — nenhum setState
  // síncrono aqui, pra não disparar cascata de render quando chamado a
  // partir do efeito de montagem abaixo (react-hooks/set-state-in-effect).
  const attemptConnect = useCallback(async (): Promise<void> => {
    const { embed_token } = await fetchEmbedToken(tutorId);
    tokenRef.current = embed_token;
  }, [tutorId]);

  useEffect(() => {
    let cancelled = false;
    attemptConnect()
      .then(() => {
        if (!cancelled) setStatus('ready');
      })
      .catch(() => {
        // Nunca vaza detalhe técnico ao usuário final (frontend/CLAUDE.md).
        if (!cancelled) {
          setStatus('error');
          setErrorMessage('Tutor indisponível no momento. Tente novamente mais tarde.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [attemptConnect]);

  const retryConnection = useCallback(() => {
    setStatus('connecting');
    setErrorMessage(null);
    attemptConnect()
      .then(() => setStatus('ready'))
      .catch(() => {
        setStatus('error');
        setErrorMessage('Tutor indisponível no momento. Tente novamente mais tarde.');
      });
  }, [attemptConnect]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !tokenRef.current) return;

      setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
      setStatus('sending');
      setErrorMessage(null);

      const attempt = async (): Promise<void> => {
        const result = await sendChatMessage(
          tutorId,
          tokenRef.current!,
          trimmed,
          sessionIdRef.current,
        );
        sessionIdRef.current = result.session_id;
        setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }]);
      };

      try {
        await attempt();
        setStatus('ready');
        return;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          try {
            const { embed_token } = await fetchEmbedToken(tutorId);
            tokenRef.current = embed_token;
            await attempt();
            setStatus('ready');
            return;
          } catch {
            // cai para o estado de erro genérico abaixo.
          }
        }
        setStatus('error');
        setErrorMessage('Não foi possível enviar sua mensagem. Tente novamente.');
      }
    },
    [tutorId],
  );

  return { status, messages, errorMessage, sendMessage, retryConnection };
}
