import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as adminClient from '../api/adminClient';
import { LoginForm } from './LoginForm';

vi.mock('../api/adminClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/adminClient')>();
  return { ...actual, login: vi.fn() };
});

const mockedClient = vi.mocked(adminClient);

describe('LoginForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls onLoggedIn with the token on successful login', async () => {
    mockedClient.login.mockResolvedValue('jwt-token');
    const onLoggedIn = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onLoggedIn={onLoggedIn} />);

    await user.type(screen.getByLabelText(/usuário/i), 'admin');
    await user.type(screen.getByLabelText(/senha/i), 'segredo');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(mockedClient.login).toHaveBeenCalledWith('admin', 'segredo');
    expect(onLoggedIn).toHaveBeenCalledWith('jwt-token');
  });

  it('shows a generic error on invalid credentials', async () => {
    mockedClient.login.mockRejectedValue(new Error('401'));
    const user = userEvent.setup();

    render(<LoginForm onLoggedIn={vi.fn()} />);

    await user.type(screen.getByLabelText(/usuário/i), 'admin');
    await user.type(screen.getByLabelText(/senha/i), 'errada');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/usuário ou senha inválidos/i);
  });
});
