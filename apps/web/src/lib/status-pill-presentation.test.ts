import { describe, expect, it } from 'vitest';
import {
  formatStatusPillHtml,
  statusPillPresentation,
} from './status-pill-presentation';

describe('statusPillPresentation parity', () => {
  it('milestone Red matches table StatusPill text/tone attrs', () => {
    const p = statusPillPresentation({
      family: 'rag',
      entity: 'milestone',
      value: 'Red',
    });
    expect(p.text).toBe('Веха критична');
    expect(p.tone).toBe('danger');
    expect(p.dataAttrs['data-status-pill']).toBe('rag');
    const html = formatStatusPillHtml({
      family: 'rag',
      entity: 'milestone',
      value: 'Red',
    });
    expect(html).toContain('data-status-pill="rag"');
    expect(html).toContain('Веха критична');
    expect(html).toContain('border-[var(--status-danger-border)]');
  });

  it('milestone Green badge is single-line (nowrap) for fixed 32px rows', () => {
    const p = statusPillPresentation({
      family: 'rag',
      entity: 'milestone',
      value: 'Green',
    });
    expect(p.text).toBe('Веха в норме');
    expect(p.className).toContain('whitespace-nowrap');
    expect(p.className).toContain('leading-none');
  });

  it('work / equipment / issue families stay nowrap with known tones', () => {
    expect(
      statusPillPresentation({ family: 'work', value: 'OnSchedule' }).className,
    ).toContain('whitespace-nowrap');
    expect(
      statusPillPresentation({ family: 'equipment', value: 'OnTrack' }).tone,
    ).toBe('ok');
    expect(
      statusPillPresentation({ family: 'equipment', value: 'Delayed' }).marker,
    ).toBe('◆');
    expect(
      statusPillPresentation({ family: 'issue', value: 'Open' }).marker,
    ).toBe('○');
    expect(
      statusPillPresentation({ family: 'issue', value: 'Mitigating' }).marker,
    ).toBe('◐');
    expect(
      statusPillPresentation({ family: 'issue', value: 'Closed' }).marker,
    ).toBe('●');
  });

  it('escapes hostile rag text never treated as known', () => {
    const html = formatStatusPillHtml({
      family: 'rag',
      entity: 'milestone',
      value: '"><img src=x>',
    });
    expect(html).toContain('Нет оценки');
    expect(html).not.toContain('<img');
    expect(html).toContain('data-status-unknown="true"');
  });
});
