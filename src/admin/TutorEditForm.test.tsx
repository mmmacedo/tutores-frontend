import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as adminClient from '../api/adminClient';
import type { Tutor } from '../api/adminClient';
import { TutorEditForm } from './TutorEditForm';

vi.mock('../api/adminClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/adminClient')>();
  return { ...actual, updateTutor: vi.fn() };
});

const mockedClient = vi.mocked(adminClient);

const tutor: Tutor = {
  id: 't1',
  title: 'Tutor de Matemática',
  status: 'active',
  instructions: 'Ajude com álgebra.',
  allowed_origins: ['https://a.example.com'],
  sources: [{ id: 's1', name: 'Apostila', type: 'url', url: 'https://ex.com/a.txt' }],
};

describe('TutorEditForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('pre-fills fields from the tutor and saves edited values', async () => {
    mockedClient.updateTutor.mockResolvedValue({ ...tutor, title: 'Tutor de Matemática II' });
    const onSaved = vi.fn();
    const user = userEvent.setup();

    render(<TutorEditForm token="tok" tutor={tutor} onSaved={onSaved} onCancel={vi.fn()} />);

    expect(screen.getByLabelText(/título/i)).toHaveValue('Tutor de Matemática');
    expect(screen.getByLabelText(/instruções/i)).toHaveValue('Ajude com álgebra.');
    expect(screen.getByLabelText(/origens permitidas/i)).toHaveValue('https://a.example.com');
    expect(screen.getByLabelText('Nome')).toHaveValue('Apostila');
    expect(screen.getByLabelText('URL')).toHaveValue('https://ex.com/a.txt');

    await user.clear(screen.getByLabelText(/título/i));
    await user.type(screen.getByLabelText(/título/i), 'Tutor de Matemática II');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(mockedClient.updateTutor).toHaveBeenCalledWith('tok', 't1', {
      title: 'Tutor de Matemática II',
      instructions: 'Ajude com álgebra.',
      allowed_origins: ['https://a.example.com'],
      sources: [{ name: 'Apostila', type: 'url', url: 'https://ex.com/a.txt' }],
    });
    expect(onSaved).toHaveBeenCalledWith({ ...tutor, title: 'Tutor de Matemática II' });
  });

  it('calls onCancel without saving when Cancelar is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(<TutorEditForm token="tok" tutor={tutor} onSaved={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onCancel).toHaveBeenCalled();
    expect(mockedClient.updateTutor).not.toHaveBeenCalled();
  });
});
