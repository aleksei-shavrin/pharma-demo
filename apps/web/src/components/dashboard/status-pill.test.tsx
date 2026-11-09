/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { StatusPill } from './status-pill';

afterEach(() => cleanup());

describe('StatusPill unknown-safe', () => {
  it('project known values keep meaning tones', () => {
    render(<StatusPill family="project" value="Green" />);
    expect(screen.getByText('В норме')).toBeInTheDocument();
    cleanup();
    render(<StatusPill family="project" value="Yellow" />);
    expect(screen.getByText('Требует внимания')).toBeInTheDocument();
    cleanup();
    render(<StatusPill family="project" value="Red" />);
    expect(screen.getByText('Критично')).toBeInTheDocument();
  });

  it('project unknown/null → Нет оценки + data-status-unknown', () => {
    render(<StatusPill family="project" value={null} />);
    const pill = screen.getByText('Нет оценки').closest('[data-status-pill]');
    expect(pill).toHaveAttribute('data-status-unknown', 'true');
    cleanup();
    render(<StatusPill family="project" value="Nope" />);
    expect(screen.getByText('Нет оценки')).toBeInTheDocument();
  });

  it('rag Amber/Yellow warn; unknown not critical', () => {
    render(<StatusPill family="rag" entity="risk" value="Amber" />);
    expect(screen.getByText('Риск требует внимания')).toBeInTheDocument();
    cleanup();
    render(<StatusPill family="rag" entity="milestone" value={undefined} />);
    const pill = screen.getByText('Нет оценки').closest('[data-status-pill]');
    expect(pill).toHaveAttribute('data-status-unknown', 'true');
  });
});
