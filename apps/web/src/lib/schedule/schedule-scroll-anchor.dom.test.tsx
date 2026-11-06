/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import {
  captureRowAnchor,
  restoreRowAnchor,
  restoreScrollLeft,
} from './schedule-scroll-anchor';

function mountViewport(): HTMLDivElement {
  const viewport = document.createElement('div');
  viewport.style.height = '100px';
  viewport.style.overflow = 'auto';
  Object.defineProperty(viewport, 'clientHeight', { value: 100 });
  const inner = document.createElement('div');
  inner.style.height = '300px';
  for (const key of ['project_group:AN-08', 'work:8.2.1']) {
    const row = document.createElement('div');
    row.setAttribute('data-schedule-row', key);
    row.style.height = '32px';
    inner.appendChild(row);
  }
  viewport.appendChild(inner);
  document.body.appendChild(viewport);
  return viewport;
}

describe('восстановление строки и горизонтали таблицы', () => {
  it('запоминает ключ верхней строки и возвращает scrollLeft в диапазон', () => {
    const viewport = mountViewport();
    const rows = [...viewport.querySelectorAll<HTMLElement>('[data-schedule-row]')];
    rows[0].getBoundingClientRect = () =>
      ({ top: 0, bottom: 32, height: 32, left: 0, right: 0, width: 0, x: 0, y: 0, toJSON() {} });
    viewport.getBoundingClientRect = () =>
      ({ top: 10, bottom: 110, height: 100, left: 0, right: 0, width: 0, x: 0, y: 10, toJSON() {} });
    const captured = captureRowAnchor(viewport);
    expect(captured.rowKey).toBe('project_group:AN-08');
    expect(captured.rowOffsetPx).toBe(-10);

    Object.defineProperty(viewport, 'scrollWidth', { value: 800 });
    Object.defineProperty(viewport, 'clientWidth', { value: 400 });
    restoreScrollLeft(viewport, 900);
    expect(viewport.scrollLeft).toBe(400);
    viewport.remove();
  });

  it('сдвигает scrollTop так, чтобы строка села на прежнее смещение', () => {
    const viewport = mountViewport();
    const row = viewport.querySelector<HTMLElement>('[data-schedule-row="work:8.2.1"]')!;
    viewport.getBoundingClientRect = () =>
      ({ top: 0, bottom: 100, height: 100, left: 0, right: 0, width: 0, x: 0, y: 0, toJSON() {} });
    row.getBoundingClientRect = () =>
      ({ top: 64, bottom: 96, height: 32, left: 0, right: 0, width: 0, x: 0, y: 64, toJSON() {} });
    Object.defineProperty(viewport, 'scrollHeight', { value: 400 });
    viewport.scrollTop = 20;
    restoreRowAnchor(viewport, 'work:8.2.1', 0);
    expect(viewport.scrollTop).toBe(84);
    viewport.remove();
  });
});
