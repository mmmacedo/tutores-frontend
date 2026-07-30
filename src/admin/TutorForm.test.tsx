import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as adminClient from '../api/adminClient';
import { TutorForm } from './TutorForm';

vi.mock('../api/adminClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/adminClient')>();
  return { ...actual, createTutor: vi.fn() };
});

const mockedClient = vi.mocked(adminClient);

describe('TutorForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates a tutor with parsed allowed origins and no source when left blank', async () => {
    mockedClient.createTutor.mockResolvedValue({
      id: 't1',
      title: 'Tutor',
      status: 'active',
      instructions: 'x',
      allowed_origins: [],
      sources: [],
    });
    const onCreated = vi.fn();
    const user = userEvent.setup();

    render(<TutorForm token="tok" onCreated={onCreated} />);

    await user.type(screen.getByLabelText(/título/i), 'Tutor de Matemática');
    await user.type(screen.getByLabelText(/instruções/i), 'Ajude com álgebra.');
    await user.type(
      screen.getByLabelText(/origens permitidas/i),
      'https://a.example.com, https://b.example.com',
    );
    await user.click(screen.getByRole('button', { name: /criar tutor/i }));

    expect(mockedClient.createTutor).toHaveBeenCalledWith('tok', {
      title: 'Tutor de Matemática',
      instructions: 'Ajude com álgebra.',
      allowed_origins: ['https://a.example.com', 'https://b.example.com'],
      sources: [],
    });
    expect(onCreated).toHaveBeenCalled();
  });

  it('includes a single URL source when both source fields are filled', async () => {
    mockedClient.createTutor.mockResolvedValue({
      id: 't1',
      title: 'Tutor',
      status: 'active',
      instructions: 'x',
      allowed_origins: [],
      sources: [],
    });
    const user = userEvent.setup();

    render(<TutorForm token="tok" onCreated={vi.fn()} />);

    await user.type(screen.getByLabelText(/título/i), 'Tutor');
    await user.type(screen.getByLabelText(/instruções/i), 'Instrua.');
    await user.type(screen.getByLabelText('Nome'), 'Apostila');
    await user.type(screen.getByLabelText('URL'), 'https://ex.com/a.txt');
    await user.click(screen.getByRole('button', { name: /criar tutor/i }));

    expect(mockedClient.createTutor).toHaveBeenCalledWith(
      'tok',
      expect.objectContaining({
        sources: [{ name: 'Apostila', type: 'url', url: 'https://ex.com/a.txt' }],
      }),
    );
  });
});
