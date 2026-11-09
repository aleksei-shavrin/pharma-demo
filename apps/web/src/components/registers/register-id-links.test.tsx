/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { RegisterIdLinks } from './register-table';

afterEach(() => cleanup());

describe('RegisterIdLinks', () => {
  it('renders empty dash without links', () => {
    render(<RegisterIdLinks refs={[]} />);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(
      document.querySelector('[data-register-id-links="empty"]'),
    ).toBeTruthy();
  });

  it('links resolvable equipment/issue/risk/milestone with data-ref', () => {
    render(
      <RegisterIdLinks
        refs={[
          { type: 'equipment', id: 'EQ-HVAC-01' },
          { type: 'issue', id: 'ISS-001' },
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ]}
      />,
    );
    const eq = screen.getByRole('link', { name: 'EQ-HVAC-01' });
    expect(eq).toHaveAttribute('href', '/equipment/EQ-HVAC-01');
    expect(eq).toHaveAttribute('data-ref-type', 'equipment');
    expect(eq).toHaveAttribute('data-ref-id', 'EQ-HVAC-01');
    expect(eq).toHaveAttribute('data-ref-resolved', 'true');
    expect(screen.getByRole('link', { name: 'ISS-001' })).toHaveAttribute(
      'href',
      '/issues/ISS-001',
    );
    expect(screen.getByRole('link', { name: 'RISK-001' })).toHaveAttribute(
      'href',
      '/risks/RISK-001',
    );
    expect(screen.getByRole('link', { name: 'MS-PS' })).toHaveAttribute(
      'href',
      '/milestones/MS-PS',
    );
  });

  it('decision becomes list filter link; KT and empty stay muted text', () => {
    render(
      <RegisterIdLinks
        refs={[
          { type: 'decision', id: 'DEC-001' },
          { type: 'milestone', id: 'KT-IMP-01' },
          { type: 'equipment', id: '' },
        ]}
      />,
    );
    const dec = screen.getByRole('link', { name: 'DEC-001' });
    expect(dec).toHaveAttribute('href', '/decisions?q=DEC-001');
    expect(dec).toHaveAttribute('data-ref-type', 'decision');

    const kt = document.querySelector(
      '[data-ref-id="KT-IMP-01"][data-ref-resolved="false"]',
    );
    expect(kt).toBeTruthy();
    expect(kt?.tagName).toBe('SPAN');
    expect(screen.queryByRole('link', { name: 'KT-IMP-01' })).toBeNull();

    const empty = document.querySelector(
      '[data-ref-type="equipment"][data-ref-resolved="false"]',
    );
    expect(empty).toBeTruthy();
  });

  it('program/project/workstream/person use portfolio routes', () => {
    render(
      <RegisterIdLinks
        refs={[
          { type: 'program', id: 'PRG-01' },
          { type: 'project', id: 'AN-20' },
          { type: 'workstream', id: 'WS-HVAC' },
          { type: 'person', id: 'PER-01' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'PRG-01' })).toHaveAttribute(
      'href',
      '/programs/PRG-01',
    );
    expect(screen.getByRole('link', { name: 'AN-20' })).toHaveAttribute(
      'href',
      '/projects/AN-20',
    );
    expect(screen.getByRole('link', { name: 'WS-HVAC' })).toHaveAttribute(
      'href',
      '/workstreams/WS-HVAC',
    );
    expect(screen.getByRole('link', { name: 'PER-01' })).toHaveAttribute(
      'href',
      '/people/PER-01',
    );
  });
});
