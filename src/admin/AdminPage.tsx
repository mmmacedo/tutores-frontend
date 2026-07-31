import { useCallback, useEffect, useState } from 'react';
import { listTutors, setTutorStatus } from '../api/adminClient';
import type { Tutor } from '../api/adminClient';
import { EmbedSnippet } from './EmbedSnippet';
import { LoginForm } from './LoginForm';
import { TutorEditForm } from './TutorEditForm';
import { TutorForm } from './TutorForm';
import { TutorList } from './TutorList';
import './admin.css';

/**
 * JWT admin guardado só em memória (useState), nunca em localStorage —
 * evita persistir um token sensível exposto a XSS; custo aceito: perde
 * o login ao dar F5 (trade-off documentado, ver .ai/steps/09.md).
 */
export function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshTutors = useCallback(async (currentToken: string) => {
    try {
      const list = await listTutors(currentToken);
      setTutors(list);
      setLoadError(null);
    } catch {
      setLoadError('Não foi possível carregar os tutores.');
    }
  }, []);

  useEffect(() => {
    // Chamada direta (não via refreshTutors) com .then/.catch no próprio
    // efeito — refreshTutors tem setState logo após o await, mas o
    // react-hooks/set-state-in-effect sinaliza qualquer setState alcançável
    // a partir do corpo do efeito, independente de vir depois de um await.
    if (!token) return;
    let cancelled = false;
    listTutors(token)
      .then((list) => {
        if (!cancelled) {
          setTutors(list);
          setLoadError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError('Não foi possível carregar os tutores.');
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return <LoginForm onLoggedIn={setToken} />;
  }

  const activeCount = tutors.filter((tutor) => tutor.status === 'active').length;

  return (
    <div className="console">
      <header className="console__header">
        <p className="console__brand">
          Plataforma de <strong>Tutores</strong>
        </p>
      </header>
      <main className="console__main">
        <div className="console__title-row">
          <h1>Tutores</h1>
          {tutors.length > 0 && (
            <p className="console__summary">
              {activeCount} de {tutors.length} em operação
            </p>
          )}
        </div>
        {loadError && <p role="alert">{loadError}</p>}

        <section className="panel" aria-labelledby="new-tutor-heading">
          <TutorForm token={token} onCreated={() => void refreshTutors(token)} />
        </section>

        {editingTutor && (
          <section className="panel panel--amendment" aria-labelledby="edit-tutor-heading">
            <TutorEditForm
              key={editingTutor.id}
              token={token}
              tutor={editingTutor}
              onSaved={() => {
                setEditingTutor(null);
                void refreshTutors(token);
              }}
              onCancel={() => setEditingTutor(null)}
            />
          </section>
        )}

        <section aria-labelledby="tutor-roster-heading">
          <h2 id="tutor-roster-heading" className="sr-only">
            Lista de tutores
          </h2>
          <TutorList
            tutors={tutors}
            onToggleStatus={(tutor) => {
              void setTutorStatus(
                token,
                tutor.id,
                tutor.status === 'active' ? 'inactive' : 'active',
              ).then(() => refreshTutors(token));
            }}
            onViewSnippet={setSelectedTutorId}
            onEdit={setEditingTutor}
          />
        </section>

        {selectedTutorId && (
          <section className="panel" aria-labelledby="snippet-heading">
            <EmbedSnippet key={selectedTutorId} token={token} tutorId={selectedTutorId} />
          </section>
        )}
      </main>
    </div>
  );
}
