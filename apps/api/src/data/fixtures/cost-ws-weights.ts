/**
 * Deterministic Workstream money weights (basis points, Σ = 10_000).
 * Narrative DOC-PROD-026 §6: BLD/CLN early → HVAC recovery → UTL/PRD/PKG → QC/AUT late.
 * Not uniform; HVAC rises through recovery; S tracks CBS-ish closeout.
 */
import { WORKSTREAM_IDS, type WorkstreamId } from '../workstream-ids';
import type { PopulatedSnapshotId } from './types';

export type WsWeightBp = Readonly<Record<WorkstreamId, number>>;

const BP_TOTAL = 10_000;

function w(
  bld: number,
  cln: number,
  hvac: number,
  utl: number,
  prd: number,
  pkg: number,
  qc: number,
  aut: number,
): WsWeightBp {
  const row: WsWeightBp = {
    'WS-BLD': bld,
    'WS-CLN': cln,
    'WS-HVAC': hvac,
    'WS-UTL': utl,
    'WS-PRD': prd,
    'WS-PKG': pkg,
    'WS-QC': qc,
    'WS-AUT': aut,
  };
  const sum = WORKSTREAM_IDS.reduce((s, id) => s + row[id], 0);
  if (sum !== BP_TOTAL) {
    throw new Error(`WS weight sum ${sum} !== ${BP_TOTAL}`);
  }
  return row;
}

/** Actual spend mix — front-loaded civil → HVAC recovery → process closeout. */
export const WS_ACTUAL_WEIGHTS: Record<PopulatedSnapshotId, WsWeightBp> = {
  A: w(3200, 2400, 900, 1100, 800, 700, 500, 400),
  B: w(3000, 2300, 1100, 1150, 850, 750, 500, 350),
  C: w(2700, 2100, 1600, 1200, 850, 750, 500, 300),
  D: w(2400, 1900, 1900, 1250, 900, 800, 500, 350),
  E: w(2100, 1700, 2100, 1300, 1000, 900, 550, 350),
  F: w(2000, 1650, 2150, 1320, 1050, 920, 560, 350),
  G: w(1750, 1500, 2500, 1400, 1100, 900, 550, 300),
  H: w(1600, 1400, 2550, 1450, 1200, 900, 550, 350),
  I: w(1400, 1200, 2400, 1800, 1400, 900, 550, 350),
  J: w(1200, 1050, 2200, 1750, 1900, 950, 550, 400),
  K: w(1100, 950, 2050, 1700, 1950, 1200, 600, 450),
  L: w(1000, 900, 1950, 1650, 2000, 1150, 650, 700),
  M: w(950, 850, 1900, 1600, 2050, 1100, 700, 850),
  N: w(920, 830, 1880, 1580, 2070, 1100, 720, 900),
  O: w(880, 800, 1850, 1550, 2100, 1120, 750, 950),
  P: w(820, 750, 1750, 1500, 2150, 1180, 800, 1050),
  Q: w(800, 730, 1700, 1480, 2180, 1200, 820, 1090),
  R: w(780, 720, 1680, 1460, 2200, 1220, 840, 1100),
  // Closeout ≈ CBS share of 5.85B (scaled to bp).
  S: w(1453, 1265, 1504, 1607, 1880, 1179, 684, 428),
};

/** Committed obligation mix — leads Actual; HVAC/UTL/PRD commitment waves. */
export const WS_COMMITTED_WEIGHTS: Record<PopulatedSnapshotId, WsWeightBp> = {
  A: w(2500, 2000, 1400, 1500, 1100, 800, 400, 300),
  B: w(2300, 1900, 1550, 1550, 1150, 850, 400, 300),
  C: w(2100, 1750, 1850, 1600, 1200, 850, 400, 250),
  D: w(1900, 1600, 2000, 1650, 1300, 900, 400, 250),
  E: w(1700, 1450, 2150, 1700, 1400, 950, 400, 250),
  F: w(1650, 1400, 2180, 1720, 1420, 980, 400, 250),
  G: w(1450, 1250, 2400, 1800, 1500, 950, 400, 250),
  H: w(1350, 1150, 2450, 1850, 1550, 950, 400, 300),
  I: w(1200, 1000, 2300, 2100, 1700, 950, 450, 300),
  J: w(1050, 900, 2100, 2000, 2100, 1000, 500, 350),
  K: w(950, 850, 1950, 1900, 2150, 1250, 550, 400),
  L: w(900, 800, 1850, 1800, 2200, 1200, 600, 650),
  M: w(850, 750, 1800, 1750, 2250, 1150, 650, 800),
  N: w(840, 740, 1790, 1740, 2260, 1150, 660, 820),
  O: w(800, 720, 1750, 1700, 2300, 1180, 700, 850),
  P: w(760, 700, 1650, 1650, 2350, 1220, 750, 920),
  Q: w(750, 690, 1620, 1630, 2370, 1240, 770, 930),
  R: w(740, 680, 1600, 1620, 2380, 1260, 790, 930),
  S: w(1453, 1265, 1504, 1607, 1880, 1179, 684, 428),
};

/** ETC remaining mix — inverse of progress; late QC/AUT retain residual longer. */
export const WS_ETC_WEIGHTS: Record<PopulatedSnapshotId, WsWeightBp> = {
  A: w(1200, 1100, 1500, 1600, 1900, 1200, 800, 700),
  B: w(1150, 1050, 1550, 1600, 1920, 1200, 810, 720),
  C: w(1100, 1000, 1650, 1600, 1900, 1200, 820, 730),
  D: w(1000, 950, 1700, 1600, 1920, 1220, 830, 780),
  E: w(950, 900, 1750, 1580, 1930, 1230, 840, 820),
  F: w(940, 890, 1760, 1570, 1930, 1230, 850, 830),
  G: w(900, 850, 1800, 1550, 1920, 1220, 860, 900),
  H: w(880, 830, 1780, 1540, 1930, 1230, 880, 930),
  I: w(850, 800, 1700, 1600, 1950, 1250, 900, 950),
  J: w(820, 780, 1600, 1550, 2000, 1300, 950, 1000),
  K: w(800, 760, 1550, 1520, 2000, 1200, 1000, 1170),
  L: w(780, 740, 1500, 1500, 1980, 1180, 1050, 1270),
  M: w(760, 720, 1480, 1480, 1970, 1160, 1080, 1350),
  N: w(750, 710, 1470, 1470, 1960, 1150, 1100, 1390),
  O: w(740, 700, 1450, 1450, 1950, 1140, 1120, 1450),
  P: w(720, 690, 1400, 1420, 1980, 1160, 1150, 1480),
  Q: w(710, 680, 1380, 1410, 1990, 1170, 1160, 1500),
  R: w(700, 670, 1360, 1400, 2000, 1180, 1170, 1520),
  // ETC = 0 on S — unused, but keep valid bp for distribute safety.
  S: w(1453, 1265, 1504, 1607, 1880, 1179, 684, 428),
};

/**
 * Distribute integer RUB by basis-point weights; remainder to highest weights.
 */
export function distributeByWeights(
  totalRub: number,
  weights: WsWeightBp,
): Record<WorkstreamId, number> {
  if (!Number.isInteger(totalRub) || totalRub < 0) {
    throw new Error(
      `distribute total must be non-negative integer: ${totalRub}`,
    );
  }
  const out = {} as Record<WorkstreamId, number>;
  let allocated = 0;
  for (const id of WORKSTREAM_IDS) {
    const v = Math.floor((totalRub * weights[id]) / BP_TOTAL);
    out[id] = v;
    allocated += v;
  }
  let rem = totalRub - allocated;
  const order = [...WORKSTREAM_IDS].sort((a, b) => weights[b] - weights[a]);
  let i = 0;
  while (rem > 0) {
    out[order[i % order.length]] += 1;
    rem -= 1;
    i += 1;
  }
  return out;
}
