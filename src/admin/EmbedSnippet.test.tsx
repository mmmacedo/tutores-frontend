import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as adminClient from '../api/adminClient';
import { EmbedSnippet } from './EmbedSnippet';

vi.mock('../api/adminClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/adminClient')>();
  return { ...actual, getEmbedSnippet: vi.fn() };
});

const mockedClient = vi.mocked(adminClient);

describe('EmbedSnippet', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches and displays the snippet html', async () => {
    mockedClient.getEmbedSnippet.mockResolvedValue({
      tutor_id: 't1',
      iframe_src: 'http://localhost:5173/embed/t1',
      snippet_html: '<iframe src="http://localhost:5173/embed/t1"></iframe>',
    });

    render(<EmbedSnippet token="tok" tutorId="t1" />);

    expect(
      await screen.findByDisplayValue('<iframe src="http://localhost:5173/embed/t1"></iframe>'),
    ).toBeInTheDocument();
  });

  it('copies the snippet to the clipboard when the button is clicked', async () => {
    mockedClient.getEmbedSnippet.mockResolvedValue({
      tutor_id: 't1',
      iframe_src: 'http://localhost:5173/embed/t1',
      snippet_html: '<iframe src="..."></iframe>',
    });
    const user = userEvent.setup();
    // user-event provisiona seu próprio stub de navigator.clipboard no
    // setup() — espionar só depois disso, senão o nosso mock é substituído.
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    render(<EmbedSnippet token="tok" tutorId="t1" />);
    await screen.findByRole('button', { name: /copiar/i });
    await user.click(screen.getByRole('button', { name: /copiar/i }));

    expect(writeTextSpy).toHaveBeenCalledWith('<iframe src="..."></iframe>');
  });

  it('shows a generic error when the snippet cannot be loaded', async () => {
    mockedClient.getEmbedSnippet.mockRejectedValue(new Error('boom'));

    render(<EmbedSnippet token="tok" tutorId="t1" />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível gerar/i);
  });
});
