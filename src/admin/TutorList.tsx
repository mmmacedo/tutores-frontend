import type { Tutor } from '../api/adminClient';
import './admin.css';

interface TutorListProps {
  tutors: Tutor[];
  onToggleStatus: (tutor: Tutor) => void;
  onViewSnippet: (tutorId: string) => void;
  onEdit: (tutor: Tutor) => void;
}

export function TutorList({ tutors, onToggleStatus, onViewSnippet, onEdit }: TutorListProps) {
  if (tutors.length === 0) {
    return <p className="empty-row">Nenhum tutor cadastrado ainda.</p>;
  }

  return (
    <table className="roster">
      <caption className="sr-only">Tutores cadastrados</caption>
      <thead>
        <tr>
          <th scope="col">Título</th>
          <th scope="col">Status</th>
          <th scope="col">Ações</th>
        </tr>
      </thead>
      <tbody>
        {tutors.map((tutor) => (
          <tr key={tutor.id}>
            <td className="roster__title">{tutor.title}</td>
            <td>
              <span className="status-pill" data-status={tutor.status}>
                {tutor.status === 'active' ? 'Em operação' : 'Inativo'}
              </span>
            </td>
            <td className="roster__actions">
              <button type="button" onClick={() => onEdit(tutor)}>
                Editar
              </button>
              <button type="button" onClick={() => onToggleStatus(tutor)}>
                {tutor.status === 'active' ? 'Desativar' : 'Ativar'}
              </button>
              <button type="button" onClick={() => onViewSnippet(tutor.id)}>
                Ver snippet de embed
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
