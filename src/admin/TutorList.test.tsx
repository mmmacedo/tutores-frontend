import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Tutor } from '../api/adminClient';
import { TutorList } from './TutorList';

const tutor: Tutor = {
  id: 't1',
  title: 'Tutor de Matemática',
  status: 'active',
  instructions: 'x',
  allowed_origins: [],
  sources: [],
};

describe('TutorList', () => {
  it('shows a placeholder when there are no tutors', () => {
    render(
      <TutorList tutors={[]} onToggleStatus={vi.fn()} onViewSnippet={vi.fn()} onEdit={vi.fn()} />,
    );
    expect(screen.getByText(/nenhum tutor cadastrado/i)).toBeInTheDocument();
  });

  it('lists tutors and fires callbacks on button clicks', async () => {
    const onToggleStatus = vi.fn();
    const onViewSnippet = vi.fn();
    const onEdit = vi.fn();
    const user = userEvent.setup();

    render(
      <TutorList
        tutors={[tutor]}
        onToggleStatus={onToggleStatus}
        onViewSnippet={onViewSnippet}
        onEdit={onEdit}
      />,
    );

    expect(screen.getByText('Tutor de Matemática')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^editar$/i }));
    expect(onEdit).toHaveBeenCalledWith(tutor);

    await user.click(screen.getByRole('button', { name: /desativar/i }));
    expect(onToggleStatus).toHaveBeenCalledWith(tutor);

    await user.click(screen.getByRole('button', { name: /ver snippet/i }));
    expect(onViewSnippet).toHaveBeenCalledWith('t1');
  });
});
