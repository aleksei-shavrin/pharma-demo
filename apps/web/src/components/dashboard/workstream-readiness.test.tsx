/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DashboardOverview } from '@/lib/api-client';
import { WorkstreamStatusMatrix } from './workstream-readiness';

const data = {
  programs: [
    { id: 'PRG-RED', name: 'Critical program', status: 'Red' },
    { id: 'PRG-YEL', name: 'Watch program', status: 'Yellow' },
    { id: 'PRG-OK', name: 'Healthy program', status: 'Green' },
  ],
} as DashboardOverview;

describe('WorkstreamStatusMatrix', () => {
  it('renders direct Links with persistent RAG surfaces and no nested anchors', () => {
    render(<WorkstreamStatusMatrix data={data} />);
    const red = screen.getByRole('link', { name: /Critical program/i });
    expect(red).toHaveAttribute('href', '/programs/PRG-RED');
    expect(red).toHaveAttribute('data-rag-surface', 'persistent');
    expect(red.className).toMatch(/status-danger-bg/);
    const yellow = screen.getByRole('link', { name: /Watch program/i });
    expect(yellow).toHaveAttribute('data-program-status', 'Yellow');
    expect(yellow.className).toMatch(/status-warn-bg/);
    expect(document.querySelectorAll('a a').length).toBe(0);
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });
});
