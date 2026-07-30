import type { Tutor } from '../api/adminClient';

interface TutorListProps {
  tutors: Tutor[];
  onToggleStatus: (tutor: Tutor) => void;
  onViewSnippet: (tutorId: string) => void;
}

export function TutorList({ tutors, onToggleStatus, onViewSnippet }: TutorListProps) {
  if (tutors.length === 0) {
    return <p>Nenhum tutor cadastrado ainda.</p>;
  }

  return (
    <ul>
      {tutors.map((tutor) => (
        <li key={tutor.id}>
          <strong>{tutor.title}</strong> ({tutor.status})
          <button type="button" onClick={() => onToggleStatus(tutor)}>
            {tutor.status === 'active' ? 'Desativar' : 'Ativar'}
          </button>
          <button type="button" onClick={() => onViewSnippet(tutor.id)}>
            Ver snippet de embed
          </button>
        </li>
      ))}
    </ul>
  );
}
