/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import type {
  ScheduleMilestoneItem,
  ScheduleWorkItem,
} from '@/lib/api-client';
import {
  isScheduleControlPoint,
  isScheduleWork,
  scheduleCoveredDates,
  scheduleDateColumnLabels,
  scheduleRowDates,
  scheduleSortDate,
} from './schedule-item-dates';

const work: ScheduleWorkItem = {
  kind: 'work',
  id: 'WK-01',
  name: 'Монтаж',
  startDate: '2027-06-01',
  endDate: '2027-06-10',
  status: 'OnSchedule',
};

const milestone: ScheduleMilestoneItem = {
  kind: 'milestone',
  id: 'MS-PS',
  name: 'Ready',
  workstream: null,
  rag: 'Green',
  baselineDate: '2027-09-15',
  forecastDate: '2027-09-20',
  dateVariance: {
    baselineDate: '2027-09-15',
    forecastDate: '2027-09-20',
    deltaDays: 5,
  },
};

describe('schedule-item-dates', () => {
  it('различает работы и контрольные точки', () => {
    expect(isScheduleWork(work)).toBe(true);
    expect(isScheduleControlPoint(work)).toBe(false);
    expect(isScheduleWork(milestone)).toBe(false);
    expect(isScheduleControlPoint(milestone)).toBe(true);
  });

  it('дата сортировки: startDate у работы, forecastDate у точки', () => {
    expect(scheduleSortDate(work)).toBe('2027-06-01');
    expect(scheduleSortDate(milestone)).toBe('2027-09-20');
  });

  it('покрытые даты: начало/окончание или база/прогноз', () => {
    expect(scheduleCoveredDates(work)).toEqual(['2027-06-01', '2027-06-10']);
    expect(scheduleCoveredDates(milestone)).toEqual([
      '2027-09-15',
      '2027-09-20',
    ]);
  });

  it('значения колонок дат по виду строки', () => {
    expect(scheduleRowDates(work)).toEqual({
      first: '2027-06-01',
      second: '2027-06-10',
    });
    expect(scheduleRowDates(milestone)).toEqual({
      first: '2027-09-15',
      second: '2027-09-20',
    });
  });

  it('заголовки дат расширяются только при наличии работ', () => {
    const base = { first: 'База', second: 'Прогноз' };
    expect(scheduleDateColumnLabels([milestone], base)).toBe(base);
    expect(scheduleDateColumnLabels([milestone, work], base)).toEqual({
      first: 'База / Начало',
      second: 'Прогноз / Окончание',
    });
  });
});
