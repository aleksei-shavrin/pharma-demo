/**
 * DOC-PROD-021 static identity catalog (E2).
 * Status/RAG/forecast vary per snapshot — see snapshot-states + build-snapshot.
 */
import type { WorkstreamId } from '../workstream-ids';
import type { DecisionType } from './types';
import type { SnapshotId } from './types';

export const PROJECT = {
  id: 'PRJ-01',
  name: 'Строительство фармацевтического завода',
  baselineProductionStart: '2027-09-15',
} as const;

export const EQUIPMENT_CATALOG = {
  'EQ-BLD-02': {
    name: 'Комплект технических дверей и шлюзов оболочки',
    workstream: 'WS-BLD' as WorkstreamId,
    critical: false,
    baselineDelivery: '2027-02-01',
  },
  'EQ-CLN-01': {
    name: 'Панели чистых помещений',
    workstream: 'WS-CLN' as WorkstreamId,
    critical: true,
    baselineDelivery: '2027-03-15',
  },
  'EQ-CLN-02': {
    name: 'Шлюзы и передаточные окна',
    workstream: 'WS-CLN' as WorkstreamId,
    critical: false,
    baselineDelivery: '2027-03-20',
  },
  'EQ-CLN-03': {
    name: 'Комплект мебели и оснащения чистых зон',
    workstream: 'WS-CLN' as WorkstreamId,
    critical: false,
    baselineDelivery: '2027-04-01',
  },
  'EQ-HVAC-01': {
    name: 'Приточная установка AHU (long-lead)',
    workstream: 'WS-HVAC' as WorkstreamId,
    critical: true,
    baselineDelivery: '2027-05-15',
  },
  'EQ-HVAC-02': {
    name: 'Вторичная AHU / рециркуляция',
    workstream: 'WS-HVAC' as WorkstreamId,
    critical: true,
    baselineDelivery: '2027-05-20',
  },
  'EQ-HVAC-03': {
    name: 'Шкафы автоматики HVAC',
    workstream: 'WS-HVAC' as WorkstreamId,
    critical: false,
    baselineDelivery: '2027-06-01',
  },
  'EQ-UTL-01': {
    name: 'Установка получения PW',
    workstream: 'WS-UTL' as WorkstreamId,
    critical: true,
    baselineDelivery: '2027-05-10',
  },
  'EQ-UTL-02': {
    name: 'Дистиллятор WFI',
    workstream: 'WS-UTL' as WorkstreamId,
    critical: true,
    baselineDelivery: '2027-05-20',
  },
  'EQ-UTL-03': {
    name: 'Генератор чистого пара',
    workstream: 'WS-UTL' as WorkstreamId,
    critical: true,
    baselineDelivery: '2027-05-25',
  },
  'EQ-UTL-04': {
    name: 'ИБП / резервное питание',
    workstream: 'WS-UTL' as WorkstreamId,
    critical: true,
    baselineDelivery: '2027-04-01',
  },
  'EQ-UTL-05': {
    name: 'Компримированный воздух / газы',
    workstream: 'WS-UTL' as WorkstreamId,
    critical: false,
    baselineDelivery: '2027-05-05',
  },
  'EQ-PRD-01': {
    name: 'Реакторный блок / процессные ёмкости',
    workstream: 'WS-PRD' as WorkstreamId,
    critical: true,
    baselineDelivery: '2027-06-01',
  },
  'EQ-PRD-02': {
    name: 'Станция CIP/SIP',
    workstream: 'WS-PRD' as WorkstreamId,
    critical: true,
    baselineDelivery: '2027-06-10',
  },
  'EQ-PRD-03': {
    name: 'Система буферной подготовки',
    workstream: 'WS-PRD' as WorkstreamId,
    critical: false,
    baselineDelivery: '2027-06-15',
  },
  'EQ-PKG-01': {
    name: 'Линия первичной упаковки',
    workstream: 'WS-PKG' as WorkstreamId,
    critical: true,
    baselineDelivery: '2027-06-20',
  },
  'EQ-PKG-02': {
    name: 'Картонажная линия',
    workstream: 'WS-PKG' as WorkstreamId,
    critical: false,
    baselineDelivery: '2027-07-01',
  },
  'EQ-PKG-03': {
    name: 'Сериализация / агрегация',
    workstream: 'WS-PKG' as WorkstreamId,
    critical: true,
    baselineDelivery: '2027-07-05',
  },
  'EQ-QC-01': {
    name: 'ВЭЖХ (HPLC)',
    workstream: 'WS-QC' as WorkstreamId,
    critical: true,
    baselineDelivery: '2027-05-15',
  },
  'EQ-QC-02': {
    name: 'Климатические камеры стабильности',
    workstream: 'WS-QC' as WorkstreamId,
    critical: false,
    baselineDelivery: '2027-05-20',
  },
  'EQ-QC-03': {
    name: 'Инкубаторы микробиологии',
    workstream: 'WS-QC' as WorkstreamId,
    critical: true,
    baselineDelivery: '2027-05-25',
  },
  'EQ-AUT-01': {
    name: 'Центральный BMS',
    workstream: 'WS-AUT' as WorkstreamId,
    critical: true,
    baselineDelivery: '2027-06-01',
  },
  'EQ-AUT-02': {
    name: 'Система мониторинга EMS',
    workstream: 'WS-AUT' as WorkstreamId,
    critical: true,
    baselineDelivery: '2027-06-10',
  },
} as const;

export type EquipmentId = keyof typeof EQUIPMENT_CATALOG;

export const MILESTONE_CATALOG = {
  'MS-BLD-ENCL': {
    name: 'Оболочка здания закрыта',
    workstream: 'WS-BLD' as WorkstreamId,
    baselineDate: '2027-02-28',
  },
  'MS-CLN-RDY': {
    name: 'Чистые помещения готовы к HVAC',
    workstream: 'WS-CLN' as WorkstreamId,
    baselineDate: '2027-04-30',
  },
  'MS-HVAC-IQ': {
    name: 'Демо-гейт готовности HVAC (IQ)',
    workstream: 'WS-HVAC' as WorkstreamId,
    baselineDate: '2027-06-15',
  },
  'MS-UTL-PW': {
    name: 'PW доступна для использования',
    workstream: 'WS-UTL' as WorkstreamId,
    baselineDate: '2027-06-20',
  },
  'MS-UTL-WFI': {
    name: 'WFI доступна для использования',
    workstream: 'WS-UTL' as WorkstreamId,
    baselineDate: '2027-07-01',
  },
  'MS-PRD-INST': {
    name: 'Технологическое оборудование смонтировано',
    workstream: 'WS-PRD' as WorkstreamId,
    baselineDate: '2027-07-15',
  },
  'MS-PKG-FAT': {
    name: 'FAT упаковочной линии принят',
    workstream: 'WS-PKG' as WorkstreamId,
    baselineDate: '2027-07-20',
  },
  'MS-PKG-SAT': {
    name: 'SAT упаковочной линии принят',
    workstream: 'WS-PKG' as WorkstreamId,
    baselineDate: '2027-08-10',
  },
  'MS-QC-RDY': {
    name: 'QC-лаборатория готова к работе',
    workstream: 'WS-QC' as WorkstreamId,
    baselineDate: '2027-07-10',
  },
  'MS-AUT-BMS': {
    name: 'BMS введён в эксплуатацию',
    workstream: 'WS-AUT' as WorkstreamId,
    baselineDate: '2027-07-25',
  },
  'MS-COM-IQ': {
    name: 'Общий демо-гейт готовности (IQ)',
    workstream: 'WS-AUT' as WorkstreamId,
    baselineDate: '2027-08-05',
  },
  'MS-COM-OQ': {
    name: 'Общий демо-гейт готовности (OQ)',
    workstream: 'WS-AUT' as WorkstreamId,
    baselineDate: '2027-08-15',
  },
  'MS-COM-PQ': {
    name: 'Общий демо-гейт готовности (PQ)',
    workstream: 'WS-AUT' as WorkstreamId,
    baselineDate: '2027-08-25',
  },
  'MS-PS': {
    name: 'Готовность к старту производства',
    workstream: null,
    baselineDate: '2027-09-15',
  },
} as const;

export type MilestoneId = keyof typeof MILESTONE_CATALOG;

export const ISSUE_CATALOG = {
  'ISS-001': {
    title: 'Прогноз сдвига поставки long-lead AHU',
    workstream: 'WS-HVAC' as WorkstreamId,
    equipmentId: 'EQ-HVAC-01' as EquipmentId,
    milestoneId: 'MS-PS' as MilestoneId,
    owner: 'SH-PM-01',
    first: 'C' as SnapshotId,
  },
  'ISS-HVAC-02': {
    title: 'Неполный комплект документации поставки AHU',
    workstream: 'WS-HVAC' as WorkstreamId,
    equipmentId: 'EQ-HVAC-01' as EquipmentId,
    milestoneId: 'MS-HVAC-IQ' as MilestoneId,
    owner: 'SH-ENG-01',
    first: 'D' as SnapshotId,
  },
  'ISS-CLN-01': {
    title: 'Отставание монтажа панелей чистых зон',
    workstream: 'WS-CLN' as WorkstreamId,
    equipmentId: 'EQ-CLN-01' as EquipmentId,
    milestoneId: 'MS-CLN-RDY' as MilestoneId,
    owner: 'SH-ENG-01',
    first: 'D' as SnapshotId,
  },
  'ISS-UTL-01': {
    title: 'Прогноз сдвига поставки дистиллятора WFI',
    workstream: 'WS-UTL' as WorkstreamId,
    equipmentId: 'EQ-UTL-02' as EquipmentId,
    milestoneId: 'MS-UTL-WFI' as MilestoneId,
    owner: 'SH-ENG-01',
    first: 'E' as SnapshotId,
  },
  'ISS-UTL-02': {
    title: 'Дефицит мощности ИБП на критических нагрузках',
    workstream: 'WS-UTL' as WorkstreamId,
    equipmentId: 'EQ-UTL-04' as EquipmentId,
    milestoneId: null,
    owner: 'SH-ENG-01',
    first: 'E' as SnapshotId,
  },
  'ISS-PRD-01': {
    title: 'Несогласованность интерфейсов CIP с реакторным блоком',
    workstream: 'WS-PRD' as WorkstreamId,
    equipmentId: 'EQ-PRD-02' as EquipmentId,
    milestoneId: 'MS-PRD-INST' as MilestoneId,
    owner: 'SH-ENG-01',
    first: 'E' as SnapshotId,
  },
  'ISS-PKG-01': {
    title: 'Прогноз срыва срока FAT первичной упаковки',
    workstream: 'WS-PKG' as WorkstreamId,
    equipmentId: 'EQ-PKG-01' as EquipmentId,
    milestoneId: 'MS-PKG-SAT' as MilestoneId,
    owner: 'SH-PKG-01',
    first: 'B' as SnapshotId,
  },
  'ISS-PKG-02': {
    title: 'Отставание сериализации от графика интеграции',
    workstream: 'WS-PKG' as WorkstreamId,
    equipmentId: 'EQ-PKG-03' as EquipmentId,
    milestoneId: 'MS-PKG-SAT' as MilestoneId,
    owner: 'SH-PKG-01',
    first: 'E' as SnapshotId,
  },
  'ISS-QC-01': {
    title: 'Прогноз поздней поставки HPLC',
    workstream: 'WS-QC' as WorkstreamId,
    equipmentId: 'EQ-QC-01' as EquipmentId,
    milestoneId: 'MS-QC-RDY' as MilestoneId,
    owner: 'SH-QC-01',
    first: 'E' as SnapshotId,
  },
  'ISS-AUT-01': {
    title: 'Конфликт точек интеграции BMS / EMS',
    workstream: 'WS-AUT' as WorkstreamId,
    equipmentId: 'EQ-AUT-01' as EquipmentId,
    milestoneId: 'MS-AUT-BMS' as MilestoneId,
    owner: 'SH-ENG-01',
    first: 'E' as SnapshotId,
  },
  'ISS-BLD-01': {
    title: 'Замечания по комплектности технических дверей оболочки',
    workstream: 'WS-BLD' as WorkstreamId,
    equipmentId: 'EQ-BLD-02' as EquipmentId,
    milestoneId: 'MS-BLD-ENCL' as MilestoneId,
    owner: 'SH-ENG-01',
    first: 'B' as SnapshotId,
  },
} as const;

export type IssueId = keyof typeof ISSUE_CATALOG;

export const RISK_CATALOG = {
  'RISK-001': {
    title: 'Срыв окна монтажа HVAC → сдвиг старта производства',
    workstream: 'WS-HVAC' as WorkstreamId,
    equipmentId: 'EQ-HVAC-01' as EquipmentId | null,
    milestoneId: 'MS-PS' as MilestoneId | null,
    issueId: 'ISS-001' as IssueId | null,
    first: 'A' as SnapshotId,
  },
  'RISK-HVAC-02': {
    title: 'Доп. задержка демо-гейта HVAC (IQ) из-за документации',
    workstream: 'WS-HVAC' as WorkstreamId,
    equipmentId: 'EQ-HVAC-01' as EquipmentId | null,
    milestoneId: 'MS-HVAC-IQ' as MilestoneId | null,
    issueId: 'ISS-HVAC-02' as IssueId | null,
    first: 'A' as SnapshotId,
  },
  'RISK-CLN-01': {
    title: 'Неготовность чистых зон к пуску HVAC',
    workstream: 'WS-CLN' as WorkstreamId,
    equipmentId: 'EQ-CLN-01' as EquipmentId | null,
    milestoneId: 'MS-CLN-RDY' as MilestoneId | null,
    issueId: 'ISS-CLN-01' as IssueId | null,
    first: 'A' as SnapshotId,
  },
  'RISK-UTL-01': {
    title: 'Недоступность WFI к технологическим прогонам',
    workstream: 'WS-UTL' as WorkstreamId,
    equipmentId: 'EQ-UTL-02' as EquipmentId | null,
    milestoneId: 'MS-UTL-WFI' as MilestoneId | null,
    issueId: 'ISS-UTL-01' as IssueId | null,
    first: 'A' as SnapshotId,
  },
  'RISK-UTL-02': {
    title: 'Риск простоя критических нагрузок без ИБП',
    workstream: 'WS-UTL' as WorkstreamId,
    equipmentId: 'EQ-UTL-04' as EquipmentId | null,
    milestoneId: null,
    issueId: 'ISS-UTL-02' as IssueId | null,
    first: 'A' as SnapshotId,
  },
  'RISK-PRD-01': {
    title: 'Сдвиг монтажа процессного оборудования',
    workstream: 'WS-PRD' as WorkstreamId,
    equipmentId: 'EQ-PRD-01' as EquipmentId | null,
    milestoneId: 'MS-PRD-INST' as MilestoneId | null,
    issueId: 'ISS-PRD-01' as IssueId | null,
    first: 'A' as SnapshotId,
  },
  'RISK-PKG-01': {
    title: 'Срыв SAT упаковки',
    workstream: 'WS-PKG' as WorkstreamId,
    equipmentId: 'EQ-PKG-01' as EquipmentId | null,
    milestoneId: 'MS-PKG-SAT' as MilestoneId | null,
    issueId: 'ISS-PKG-01' as IssueId | null,
    first: 'A' as SnapshotId,
  },
  'RISK-PKG-02': {
    title: 'Неготовность сериализации к релизу',
    workstream: 'WS-PKG' as WorkstreamId,
    equipmentId: 'EQ-PKG-03' as EquipmentId | null,
    milestoneId: 'MS-PKG-SAT' as MilestoneId | null,
    issueId: 'ISS-PKG-02' as IssueId | null,
    first: 'A' as SnapshotId,
  },
  'RISK-QC-01': {
    title: 'Задержка готовности QC к поддержке запуска',
    workstream: 'WS-QC' as WorkstreamId,
    equipmentId: 'EQ-QC-01' as EquipmentId | null,
    milestoneId: 'MS-QC-RDY' as MilestoneId | null,
    issueId: 'ISS-QC-01' as IssueId | null,
    first: 'A' as SnapshotId,
  },
  'RISK-AUT-01': {
    title: 'Неготовность BMS к мониторингу зон',
    workstream: 'WS-AUT' as WorkstreamId,
    equipmentId: 'EQ-AUT-01' as EquipmentId | null,
    milestoneId: 'MS-AUT-BMS' as MilestoneId | null,
    issueId: 'ISS-AUT-01' as IssueId | null,
    first: 'A' as SnapshotId,
  },
  'RISK-BLD-01': {
    title: 'Локальный риск по готовности оболочки здания',
    workstream: 'WS-BLD' as WorkstreamId,
    equipmentId: 'EQ-BLD-02' as EquipmentId | null,
    milestoneId: 'MS-BLD-ENCL' as MilestoneId | null,
    issueId: 'ISS-BLD-01' as IssueId | null,
    first: 'A' as SnapshotId,
  },
  /** Approved orphan Red Risk exception (no causal Issue). */
  'RISK-COM-01': {
    title: 'Накопительный риск срыва общего демо-гейта (IQ)',
    workstream: 'WS-AUT' as WorkstreamId,
    equipmentId: null,
    milestoneId: 'MS-COM-IQ' as MilestoneId | null,
    issueId: null,
    first: 'E' as SnapshotId,
  },
} as const;

export type RiskId = keyof typeof RISK_CATALOG;

export const DECISION_CATALOG = {
  'DEC-001': {
    note: 'Утвердить ускоренную логистику AHU и резервный монтажный слот',
    type: 'PrioritizeRecovery' as DecisionType,
    projectId: 'PRJ-01',
    milestoneId: 'MS-PS' as MilestoneId,
    ownerRole: 'SH-DIR-01',
    dueDate: '2027-05-15',
    first: 'F' as SnapshotId,
  },
  'DEC-UTL-01': {
    note: 'Согласовать параллельный ввод PW и сжатый монтаж WFI',
    type: 'PrioritizeRecovery' as DecisionType,
    projectId: 'PRJ-01',
    milestoneId: 'MS-UTL-WFI' as MilestoneId,
    ownerRole: 'SH-ENG-01',
    dueDate: '2027-05-20',
    first: 'F' as SnapshotId,
  },
  'DEC-CLN-01': {
    note: 'Усилить бригаду монтажа чистых зон (две смены)',
    type: 'PrioritizeRecovery' as DecisionType,
    projectId: 'PRJ-01',
    milestoneId: 'MS-CLN-RDY' as MilestoneId,
    ownerRole: 'SH-ENG-01',
    dueDate: '2027-04-30',
    first: 'F' as SnapshotId,
  },
  'DEC-PKG-01': {
    note: 'Зафиксировать принятие текущего прогноза SAT с оговорками по сериализации',
    type: 'AcceptDateSlip' as DecisionType,
    projectId: 'PRJ-01',
    milestoneId: 'MS-PKG-SAT' as MilestoneId,
    ownerRole: 'SH-PKG-01',
    dueDate: null,
    first: 'G' as SnapshotId,
  },
  'DEC-QC-01': {
    note: 'Временно использовать контрактную лабораторию для HPLC',
    type: 'PrioritizeRecovery' as DecisionType,
    projectId: 'PRJ-01',
    milestoneId: 'MS-QC-RDY' as MilestoneId,
    ownerRole: 'SH-QC-01',
    dueDate: '2027-06-01',
    first: 'G' as SnapshotId,
  },
  'DEC-AUT-01': {
    note: 'Зафиксировать freeze точек интеграции BMS/EMS',
    type: 'PrioritizeRecovery' as DecisionType,
    projectId: 'PRJ-01',
    milestoneId: 'MS-AUT-BMS' as MilestoneId,
    ownerRole: 'SH-ENG-01',
    dueDate: '2027-06-15',
    first: 'H' as SnapshotId,
  },
} as const;

export type DecisionId = keyof typeof DECISION_CATALOG;

export const EQUIPMENT_IDS = Object.keys(EQUIPMENT_CATALOG) as EquipmentId[];
export const MILESTONE_IDS = Object.keys(MILESTONE_CATALOG) as MilestoneId[];
export const ISSUE_IDS = Object.keys(ISSUE_CATALOG) as IssueId[];
export const RISK_IDS = Object.keys(RISK_CATALOG) as RiskId[];
export const DECISION_IDS = Object.keys(DECISION_CATALOG) as DecisionId[];
