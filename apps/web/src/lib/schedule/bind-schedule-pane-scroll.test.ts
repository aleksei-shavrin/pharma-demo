import { describe, expect, it } from 'vitest';
import { bindSchedulePaneScroll } from './bind-schedule-pane-scroll';

function scroller() {
  let scrollTop = 0;
  const listeners = new Set<() => void>();
  return {
    get scrollTop() {
      return scrollTop;
    },
    set scrollTop(value: number) {
      scrollTop = value;
    },
    addEventListener(_type: 'scroll', listener: () => void) {
      listeners.add(listener);
    },
    removeEventListener(_type: 'scroll', listener: () => void) {
      listeners.delete(listener);
    },
    emit() {
      for (const listener of listeners) listener();
    },
  };
}

describe('bindSchedulePaneScroll', () => {
  it('переносит прокрутку списка на шкалу и не зацикливается', () => {
    const list = scroller();
    const chart = scroller();
    const release = bindSchedulePaneScroll(list, chart);

    list.scrollTop = 144;
    list.emit();

    expect(chart.scrollTop).toBe(144);
    release();
    list.scrollTop = 200;
    list.emit();
    expect(chart.scrollTop).toBe(144);
  });
});
