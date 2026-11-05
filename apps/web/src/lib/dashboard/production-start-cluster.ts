import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import type { ProductionStartBand } from './executive-timeline';

/**
 * Presentation-only PS cluster state (R2-U1-R8/R9).
 * Does not change Domain / API / BR-004 / BR-007.
 */
export type ProductionStartClusterState = 'baseline' | 'forecast' | 'actual';

/** How delta should be painted: active delay vs historical achieved variance. */
export type ProductionStartDeltaTone = 'none' | 'active' | 'historical';

export type ProductionStartClusterModel = {
  state: ProductionStartClusterState;
  title: string;
  /** Primary body line under the title. */
  lineRu: string;
  /** Delta / «По плану» emphasis line; empty when coincident uses line only. */
  deltaRu: string;
  deltaTone: ProductionStartDeltaTone;
  baselineDate: string;
  currentDate: string;
  baselineRatio: number;
  currentRatio: number;
  coincident: boolean;
  deltaDays: number;
  midRatio: number;
};

/**
 * Build consolidated Production Start annotation copy.
 * Snapshot S (achieved) → «факт» + historical delta tone;
 * delayed → «прогноз» + active delta tone;
 * on-plan → «По плану» (no connector, no +0).
 */
export function resolveProductionStartCluster(
  band: ProductionStartBand,
  opts: { snapshotId: string; achieved: boolean },
): ProductionStartClusterModel {
  const baselineDate = band.baselineDate;
  const currentDate = band.forecastDate;
  const midRatio = (band.baselineRatio + band.forecastRatio) / 2;

  if (band.coincident) {
    return {
      state: 'baseline',
      title: 'Запуск производства',
      lineRu: `По плану · ${formatDateRu(baselineDate)}`,
      deltaRu: '',
      deltaTone: 'none',
      baselineDate,
      currentDate,
      baselineRatio: band.baselineRatio,
      currentRatio: band.forecastRatio,
      coincident: true,
      deltaDays: 0,
      midRatio: band.baselineRatio,
    };
  }

  if (opts.achieved || opts.snapshotId === 'S') {
    return {
      state: 'actual',
      title: 'Запуск производства',
      lineRu: `План ${formatDateRu(baselineDate)} → факт ${formatDateRu(currentDate)}`,
      deltaRu: formatDeltaDays(band.deltaDays),
      deltaTone: 'historical',
      baselineDate,
      currentDate,
      baselineRatio: band.baselineRatio,
      currentRatio: band.forecastRatio,
      coincident: false,
      deltaDays: band.deltaDays,
      midRatio,
    };
  }

  return {
    state: 'forecast',
    title: 'Запуск производства',
    lineRu: `План ${formatDateRu(baselineDate)} → прогноз ${formatDateRu(currentDate)}`,
    deltaRu: formatDeltaDays(band.deltaDays),
    deltaTone: 'active',
    baselineDate,
    currentDate,
    baselineRatio: band.baselineRatio,
    currentRatio: band.forecastRatio,
    coincident: false,
    deltaDays: band.deltaDays,
    midRatio,
  };
}
