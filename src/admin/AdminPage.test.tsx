import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as adminClient from '../api/adminClient';
import { AdminPage } from './AdminPage';

vi.mock('../api/adminClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/adminClient')>();
  return {
    ...actual,
    login: vi.fn(),
    listTutors: vi.fn(),
    createTutor: vi.fn(),
    setTutorStatus: vi.fn(),
    updateTutor: vi.fn(),
  };
});

const mockedClient = vi.mocked(adminClient);

describe('AdminPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows the login form when there is no token yet', () => {
    render(<AdminPage />);
    expect(screen.getByRole('heading', { name: /painel admin/i })).toBeInTheDocument();
  });

  it('loads and shows the tutor list after a successful login', async () => {
    mockedClient.login.mockResolvedValue('jwt-token');
    mockedClient.listTutors.mockResolvedValue([
      {
        id: 't1',
        title: 'Tutor de Matemática',
        status: 'active',
        instructions: 'x',
        allowed_origins: [],
        sources: [],
      },
    ]);
    const user = userEvent.setup();

    render(<AdminPage />);
    await user.type(screen.getByLabelText(/usuário/i), 'admin');
    await user.type(screen.getByLabelText(/senha/i), 'segredo');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText('Tutor de Matemática')).toBeInTheDocument();
    expect(mockedClient.listTutors).toHaveBeenCalledWith('jwt-token');
  });

  it('opens the edit form for a tutor and refreshes the list after saving', async () => {
    const tutor = {
      id: 't1',
      title: 'Tutor de Matemática',
      status: 'active' as const,
      instructions: 'x',
      allowed_origins: [],
      sources: [],
    };
    mockedClient.login.mockResolvedValue('jwt-token');
    mockedClient.listTutors.mockResolvedValue([tutor]);
    mockedClient.updateTutor.mockResolvedValue({ ...tutor, title: 'Tutor Editado' });
    const user = userEvent.setup();

    render(<AdminPage />);
    await user.type(screen.getByLabelText(/usuário/i), 'admin');
    await user.type(screen.getByLabelText(/senha/i), 'segredo');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    await screen.findByText('Tutor de Matemática');

    await user.click(screen.getByRole('button', { name: /^editar$/i }));
    expect(screen.getByRole('heading', { name: /editar tutor/i })).toBeInTheDocument();

    mockedClient.listTutors.mockResolvedValue([{ ...tutor, title: 'Tutor Editado' }]);
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(mockedClient.updateTutor).toHaveBeenCalledWith('jwt-token', 't1', {
      title: 'Tutor de Matemática',
      instructions: 'x',
      allowed_origins: [],
      sources: [],
    });
    expect(await screen.findByText('Tutor Editado')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /editar tutor/i })).not.toBeInTheDocument();
  });
});
