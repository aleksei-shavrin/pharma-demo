import type {
  NotificationSeverity,
  NotificationTaxonomy,
} from '../../contracts/dto/notification.dto';
import type { SnapshotId } from '../../snapshot/snapshot-id';
import { SNAPSHOT_IDS } from '../../snapshot/snapshot-id';

export type NotificationEntityRefFixture = {
  type:
    | 'equipment'
    | 'issue'
    | 'risk'
    | 'milestone'
    | 'decision'
    | 'workstream'
    | 'person';
  id: string;
};

export type NotificationFixture = {
  id: string;
  snapshotId: SnapshotId;
  severity: NotificationSeverity;
  taxonomy: NotificationTaxonomy;
  titleRu: string;
  bodyRu: string | null;
  href: string | null;
  entityRefs: NotificationEntityRefFixture[];
};

const SEVERITY_RANK: Record<NotificationSeverity, number> = {
  critical: 0,
  attention: 1,
  info: 2,
};

const TAXONOMY_RANK: Record<NotificationTaxonomy, number> = {
  critical_risk: 0,
  milestone: 1,
  issue: 2,
  cost: 3,
  decision: 4,
  recovery: 5,
  readiness: 6,
};

function hrefFor(refs: NotificationEntityRefFixture[]): string | null {
  for (const ref of refs) {
    switch (ref.type) {
      case 'equipment':
        return `/equipment/${ref.id}`;
      case 'issue':
        return `/issues/${ref.id}`;
      case 'risk':
        return `/risks/${ref.id}`;
      case 'milestone':
        return `/milestones/${ref.id}`;
      case 'person':
        return `/people/${ref.id}`;
      case 'workstream':
        return `/workstreams/${ref.id}`;
      case 'decision':
        break;
      default:
        break;
    }
  }
  return null;
}

type Draft = {
  n: number;
  severity: NotificationSeverity;
  taxonomy: NotificationTaxonomy;
  titleRu: string;
  bodyRu?: string | null;
  refs?: NotificationEntityRefFixture[];
};

function build(snapshotId: SnapshotId, drafts: Draft[]): NotificationFixture[] {
  return drafts.map((d) => {
    const refs = d.refs ?? [];
    const id = `NTF-${snapshotId}-${String(d.n).padStart(3, '0')}`;
    return {
      id,
      snapshotId,
      severity: d.severity,
      taxonomy: d.taxonomy,
      titleRu: d.titleRu,
      bodyRu: d.bodyRu === undefined ? null : d.bodyRu,
      href: hrefFor(refs),
      entityRefs: refs,
    };
  });
}

/**
 * Fixture-authored director notifications (DOC-PROD-024 / DOC-UX-022).
 * Not a generic snapshot diff. Soft entityRefs only — not BA-015 edges.
 */
const BY_SNAPSHOT: Record<SnapshotId, NotificationFixture[]> = {
  A: build('A', []),
  B: build('B', [
    {
      n: 1,
      severity: 'attention',
      taxonomy: 'issue',
      titleRu: 'Локальное внимание по строительству и упаковке',
      bodyRu:
        'На снимке B появились отклонения WS-BLD и WS-PKG без влияния на Production Start.',
      refs: [
        { type: 'workstream', id: 'WS-BLD' },
        { type: 'workstream', id: 'WS-PKG' },
      ],
    },
    {
      n: 2,
      severity: 'info',
      taxonomy: 'milestone',
      titleRu: 'Production Start без сдвига',
      bodyRu: 'Базовый срок 15.09.2027 сохраняется.',
      refs: [{ type: 'milestone', id: 'MS-PS' }],
    },
  ]),
  C: build('C', [
    {
      n: 1,
      severity: 'critical',
      taxonomy: 'critical_risk',
      titleRu: 'Критический риск срыва Production Start',
      bodyRu:
        'RISK-001 открыт: прогноз Production Start сдвинут на +21 день из‑за AHU с длительным сроком поставки.',
      refs: [
        { type: 'risk', id: 'RISK-001' },
        { type: 'milestone', id: 'MS-PS' },
      ],
    },
    {
      n: 2,
      severity: 'critical',
      taxonomy: 'milestone',
      titleRu: 'Production Start: прогноз +21 день',
      bodyRu:
        'Базовый срок 15.09.2027 → прогноз 06.10.2027. Драйвер: EQ-HVAC-01.',
      refs: [
        { type: 'milestone', id: 'MS-PS' },
        { type: 'equipment', id: 'EQ-HVAC-01' },
      ],
    },
    {
      n: 3,
      severity: 'critical',
      taxonomy: 'issue',
      titleRu: 'ISS-001: сдвиг поставки AHU с длительным сроком',
      bodyRu: 'Открытая проблема по критическому оборудованию HVAC.',
      refs: [
        { type: 'issue', id: 'ISS-001' },
        { type: 'equipment', id: 'EQ-HVAC-01' },
      ],
    },
    {
      n: 4,
      severity: 'attention',
      taxonomy: 'issue',
      titleRu: 'WS-HVAC переведён в Красный',
      bodyRu: 'Управленческое внимание сосредоточено на HVAC-контуре.',
      refs: [{ type: 'workstream', id: 'WS-HVAC' }],
    },
    {
      n: 5,
      severity: 'attention',
      taxonomy: 'cost',
      titleRu: 'Рост прогнозной стоимости на фоне срыва HVAC',
      bodyRu:
        'EAC повышен относительно BAC; детализация — в контроле стоимости.',
      refs: [{ type: 'workstream', id: 'WS-HVAC' }],
    },
  ]),
  D: build('D', [
    {
      n: 1,
      severity: 'critical',
      taxonomy: 'critical_risk',
      titleRu: 'Каскад давления после срыва HVAC',
      bodyRu:
        'Production Start остаётся +21; добавляется давление по чистым зонам.',
      refs: [
        { type: 'risk', id: 'RISK-001' },
        { type: 'workstream', id: 'WS-CLN' },
      ],
    },
    {
      n: 2,
      severity: 'attention',
      taxonomy: 'issue',
      titleRu: 'Отставание монтажа чистых зон',
      bodyRu: 'ISS-CLN-01 требует внимания ведущего направления.',
      refs: [{ type: 'issue', id: 'ISS-CLN-01' }],
    },
    {
      n: 3,
      severity: 'attention',
      taxonomy: 'issue',
      titleRu: 'Документация поставки AHU неполная',
      bodyRu: 'ISS-HVAC-02 усиливает риск критического пути.',
      refs: [{ type: 'issue', id: 'ISS-HVAC-02' }],
    },
  ]),
  E: build('E', [
    {
      n: 1,
      severity: 'critical',
      taxonomy: 'critical_risk',
      titleRu:
        'Параллельное давление по инженерным системам, QC и производству',
      bodyRu: 'Мультиконтурное давление при сохранении PS +21.',
      refs: [{ type: 'risk', id: 'RISK-001' }],
    },
    {
      n: 2,
      severity: 'attention',
      taxonomy: 'issue',
      titleRu: 'Прогноз сдвига дистиллятора WFI',
      bodyRu: 'ISS-UTL-01 на контуре инженерных систем.',
      refs: [{ type: 'issue', id: 'ISS-UTL-01' }],
    },
    {
      n: 3,
      severity: 'attention',
      taxonomy: 'issue',
      titleRu: 'Прогноз поздней поставки HPLC',
      bodyRu: 'ISS-QC-01 влияет на готовность лаборатории.',
      refs: [{ type: 'issue', id: 'ISS-QC-01' }],
    },
    {
      n: 4,
      severity: 'attention',
      taxonomy: 'cost',
      titleRu: 'Рост обязательств по нескольким направлениям',
      bodyRu: 'Контроль стоимости фиксирует расширение принятых обязательств.',
      refs: [{ type: 'workstream', id: 'WS-UTL' }],
    },
  ]),
  F: build('F', [
    {
      n: 1,
      severity: 'critical',
      taxonomy: 'critical_risk',
      titleRu: 'Production Start всё ещё +21 после решений',
      bodyRu:
        'Зарегистрированные управленческие решения не меняют прогноз автоматически.',
      refs: [
        { type: 'risk', id: 'RISK-001' },
        { type: 'milestone', id: 'MS-PS' },
      ],
    },
    {
      n: 2,
      severity: 'attention',
      taxonomy: 'decision',
      titleRu: 'Зафиксированы управленческие решения',
      bodyRu:
        'Решение зарегистрировано; это не означает автоматическое устранение задержки графика или стоимости.',
      refs: [{ type: 'decision', id: 'DEC-001' }],
    },
    {
      n: 3,
      severity: 'attention',
      taxonomy: 'decision',
      titleRu: 'Решение по контуру WFI',
      bodyRu:
        'Параллельный ввод PW и сжатый монтаж WFI согласованы как управленческая запись, без авто-восстановления прогноза.',
      refs: [{ type: 'decision', id: 'DEC-UTL-01' }],
    },
    {
      n: 4,
      severity: 'info',
      taxonomy: 'recovery',
      titleRu: 'Ожидание фактического эффекта от мер',
      bodyRu:
        'Прогноз HVAC и Production Start остаётся +21 до явного восстановления на поздних снимках.',
      refs: [{ type: 'equipment', id: 'EQ-HVAC-01' }],
    },
  ]),
  G: build('G', [
    {
      n: 1,
      severity: 'critical',
      taxonomy: 'critical_risk',
      titleRu: 'Остаточный риск: PS +14',
      bodyRu: 'Частичное улучшение до +14; RISK-001 остаётся критическим.',
      refs: [
        { type: 'risk', id: 'RISK-001' },
        { type: 'milestone', id: 'MS-PS' },
      ],
    },
    {
      n: 2,
      severity: 'attention',
      taxonomy: 'recovery',
      titleRu: 'Частичное восстановление HVAC-контура',
      bodyRu:
        'Отклонение HVAC снижено до +14 дней; полный возврат к базовому сроку не достигнут.',
      refs: [{ type: 'equipment', id: 'EQ-HVAC-01' }],
    },
    {
      n: 3,
      severity: 'attention',
      taxonomy: 'decision',
      titleRu: 'Принят сдвиг SAT упаковки',
      bodyRu:
        'Принятие сдвига даты зафиксировано; не следует трактовать это как автоматическое закрытие риска упаковки.',
      refs: [{ type: 'decision', id: 'DEC-PKG-01' }],
    },
    {
      n: 4,
      severity: 'info',
      taxonomy: 'issue',
      titleRu: 'Упаковка стабилизирована на жёлтом статусе',
      bodyRu: 'Остаточное внимание WS-PKG без нового критического драйвера PS.',
      refs: [{ type: 'workstream', id: 'WS-PKG' }],
    },
  ]),
  H: build('H', [
    {
      n: 1,
      severity: 'critical',
      taxonomy: 'critical_risk',
      titleRu:
        'Остаточные HVAC и Production Start +14; растёт давление автоматизации',
      bodyRu: 'Параллельно усиливается контур автоматизации.',
      refs: [
        { type: 'risk', id: 'RISK-001' },
        { type: 'workstream', id: 'WS-AUT' },
      ],
    },
    {
      n: 2,
      severity: 'attention',
      taxonomy: 'issue',
      titleRu: 'Конфликт точек интеграции BMS / EMS',
      bodyRu: 'ISS-AUT-01 требует фиксации интерфейсов.',
      refs: [{ type: 'issue', id: 'ISS-AUT-01' }],
    },
    {
      n: 3,
      severity: 'attention',
      taxonomy: 'decision',
      titleRu: 'Фиксация точек BMS/EMS подтверждена',
      bodyRu:
        'Управленческая запись по интеграции; прогноз PS не меняется автоматически.',
      refs: [{ type: 'decision', id: 'DEC-AUT-01' }],
    },
    {
      n: 4,
      severity: 'attention',
      taxonomy: 'cost',
      titleRu: 'Рост обязательств автоматизации на фоне остаточного HVAC',
      bodyRu: 'Стоимостной сигнал соответствует DOC-PROD-026.',
      refs: [{ type: 'workstream', id: 'WS-AUT' }],
    },
  ]),
  I: build('I', [
    {
      n: 1,
      severity: 'critical',
      taxonomy: 'critical_risk',
      titleRu: 'Production Start +14 при восстановлении инженерных систем',
      bodyRu:
        'Инженерные системы улучшаются; драйвер HVAC и Production Start остаётся +14.',
      refs: [{ type: 'milestone', id: 'MS-PS' }],
    },
    {
      n: 2,
      severity: 'attention',
      taxonomy: 'recovery',
      titleRu: 'Восстановление контура WFI / PW',
      bodyRu: 'Контур инженерных систем улучшается по сценарию снимка.',
      refs: [{ type: 'workstream', id: 'WS-UTL' }],
    },
    {
      n: 3,
      severity: 'attention',
      taxonomy: 'issue',
      titleRu: 'Давление интерфейсов автоматизации (BMS/EMS)',
      bodyRu: 'Подготовка интеграции усиливает внимание к автоматизации.',
      refs: [{ type: 'workstream', id: 'WS-AUT' }],
    },
  ]),
  J: build('J', [
    {
      n: 1,
      severity: 'critical',
      taxonomy: 'milestone',
      titleRu: 'Волна монтажа производства; PS всё ещё +14',
      bodyRu:
        'Пик монтажных работ производства не меняет драйвер Production Start.',
      refs: [
        { type: 'workstream', id: 'WS-PRD' },
        { type: 'milestone', id: 'MS-PS' },
      ],
    },
    {
      n: 2,
      severity: 'attention',
      taxonomy: 'issue',
      titleRu: 'Сдвиг монтажа линии фильтрации',
      bodyRu: 'ISS-PRD-02 на критическом контуре производства.',
      refs: [{ type: 'issue', id: 'ISS-PRD-02' }],
    },
    {
      n: 3,
      severity: 'attention',
      taxonomy: 'cost',
      titleRu: 'Скачок принятых обязательств по производству',
      bodyRu: 'Фактические затраты отстают; EAC остаётся повышенным.',
      refs: [{ type: 'workstream', id: 'WS-PRD' }],
    },
  ]),
  K: build('K', [
    {
      n: 1,
      severity: 'critical',
      taxonomy: 'milestone',
      titleRu: 'Операционный прогресс HVAC; PS всё ещё +14',
      bodyRu:
        'Вторичные улучшения не меняют утверждённое отклонение EQ-HVAC-01 и Production Start.',
      refs: [
        { type: 'equipment', id: 'EQ-HVAC-01' },
        { type: 'milestone', id: 'MS-PS' },
      ],
    },
    {
      n: 2,
      severity: 'attention',
      taxonomy: 'recovery',
      titleRu: 'Сериализация упаковки закрыта',
      bodyRu:
        'Остаточный контур упаковки закрыт в сценарии; Production Start не восстановлен.',
      refs: [{ type: 'workstream', id: 'WS-PKG' }],
    },
    {
      n: 3,
      severity: 'info',
      taxonomy: 'readiness',
      titleRu: 'Честность остаточного PS +14',
      bodyRu: 'Не трактовать операционный прогресс как закрытие RISK-001.',
      refs: [{ type: 'risk', id: 'RISK-001' }],
    },
  ]),
  L: build('L', [
    {
      n: 1,
      severity: 'critical',
      taxonomy: 'critical_risk',
      titleRu: 'Критическое давление BMS/EMS',
      bodyRu:
        'Автоматизация в красном статусе; интеграция под давлением при Production Start +14.',
      refs: [{ type: 'workstream', id: 'WS-AUT' }],
    },
    {
      n: 2,
      severity: 'attention',
      taxonomy: 'issue',
      titleRu: 'Неполный набор точек EMS для чистых зон',
      bodyRu: 'ISS-AUT-03 требует усиления покрытия.',
      refs: [{ type: 'issue', id: 'ISS-AUT-03' }],
    },
    {
      n: 3,
      severity: 'attention',
      taxonomy: 'cost',
      titleRu: 'Рост стоимостной экспозиции по автоматизации',
      bodyRu:
        'Использование резерва проекта продолжается согласно стоимостной истории.',
      refs: [{ type: 'workstream', id: 'WS-AUT' }],
    },
  ]),
  M: build('M', [
    {
      n: 1,
      severity: 'critical',
      taxonomy: 'readiness',
      titleRu: 'Давление на демо-гейт готовности (IQ)',
      bodyRu: 'ISS-COM-01: готовность IQ под управленческим вниманием.',
      refs: [{ type: 'issue', id: 'ISS-COM-01' }],
    },
    {
      n: 2,
      severity: 'attention',
      taxonomy: 'milestone',
      titleRu: 'Production Start остаётся +14',
      bodyRu:
        'Фокус смещается к пусконаладке; драйвер Production Start не снят.',
      refs: [{ type: 'milestone', id: 'MS-PS' }],
    },
    {
      n: 3,
      severity: 'info',
      taxonomy: 'readiness',
      titleRu: 'Мультиконтурная зона жёлтого статуса',
      bodyRu: 'Внимание распределено; HVAC больше не единственный фокус.',
      refs: [{ type: 'workstream', id: 'WS-HVAC' }],
    },
  ]),
  N: build('N', [
    {
      n: 1,
      severity: 'attention',
      taxonomy: 'decision',
      titleRu: 'Решения пусконаладки зафиксированы',
      bodyRu:
        'Новые управленческие решения не меняют прогноз HVAC, Production Start и EAC автоматически.',
      refs: [{ type: 'decision', id: 'DEC-COM-01' }],
    },
    {
      n: 2,
      severity: 'critical',
      taxonomy: 'milestone',
      titleRu: 'Прогноз PS без изменения после решений',
      bodyRu: 'Production Start остаётся +14 — честность правила BR-006.',
      refs: [{ type: 'milestone', id: 'MS-PS' }],
    },
    {
      n: 3,
      severity: 'info',
      taxonomy: 'readiness',
      titleRu:
        'Проблемы переведены в статус «В работе по снижению» там, где это задано сценарием',
      bodyRu:
        'Состояние проблемы не равно автоматическому зелёному статусу риска.',
      refs: [{ type: 'risk', id: 'RISK-001' }],
    },
  ]),
  O: build('O', [
    {
      n: 1,
      severity: 'critical',
      taxonomy: 'recovery',
      titleRu: 'Явное восстановление сценария: HVAC и Production Start → +7',
      bodyRu:
        'Одновременное состояние сценария: отклонение EQ-HVAC-01 = +7 и прогноз Production Start 22.09.2027. Это не автоматический эффект управленческого решения.',
      refs: [
        { type: 'equipment', id: 'EQ-HVAC-01' },
        { type: 'milestone', id: 'MS-PS' },
      ],
    },
    {
      n: 2,
      severity: 'attention',
      taxonomy: 'critical_risk',
      titleRu: 'RISK-001 ещё не в зелёном статусе',
      bodyRu:
        'Восстановление прогноза не закрывает риск автоматически (BR-007).',
      refs: [{ type: 'risk', id: 'RISK-001' }],
    },
    {
      n: 3,
      severity: 'attention',
      taxonomy: 'readiness',
      titleRu: 'Начинается волна OQ-готовности',
      bodyRu:
        'Общий статус проекта остаётся красным до поздней фазы завершения.',
      refs: [{ type: 'issue', id: 'ISS-COM-02' }],
    },
    {
      n: 4,
      severity: 'info',
      taxonomy: 'cost',
      titleRu: 'Улучшение графика без «магического» EAC',
      bodyRu: 'Стоимостной прогноз не обнуляется вместе с Δ=+7.',
      refs: [{ type: 'workstream', id: 'WS-HVAC' }],
    },
  ]),
  P: build('P', [
    {
      n: 1,
      severity: 'critical',
      taxonomy: 'readiness',
      titleRu: 'Финальная готовность: общий статус красный',
      bodyRu: 'RISK-001 ещё красный ⇒ MS-PS не зелёный (BR-007).',
      refs: [
        { type: 'risk', id: 'RISK-001' },
        { type: 'milestone', id: 'MS-PS' },
      ],
    },
    {
      n: 2,
      severity: 'attention',
      taxonomy: 'issue',
      titleRu: 'Давление на демо-гейт PQ',
      bodyRu: 'ISS-COM-03 и остаточное внимание к автоматизации и QC.',
      refs: [{ type: 'issue', id: 'ISS-COM-03' }],
    },
    {
      n: 3,
      severity: 'info',
      taxonomy: 'cost',
      titleRu: 'Сжатие ETC перед стартом',
      bodyRu: 'Неопределённость стоимости снижается; история VAC сохраняется.',
      refs: [{ type: 'workstream', id: 'WS-HVAC' }],
    },
  ]),
  Q: build('Q', [
    {
      n: 1,
      severity: 'critical',
      taxonomy: 'milestone',
      titleRu: 'Базовая дата Production Start прошла без запуска',
      bodyRu:
        'Дата снимка — 15.09.2027; фактический старт не достигнут. Прогноз остаётся 22.09.2027. Общий статус жёлтый.',
      refs: [{ type: 'milestone', id: 'MS-PS' }],
    },
    {
      n: 2,
      severity: 'attention',
      taxonomy: 'readiness',
      titleRu: 'Критическая цепочка больше не красная, старт ещё впереди',
      bodyRu:
        'Контролируемая готовность и остаточное внимание до решения Go/No-Go.',
      refs: [{ type: 'risk', id: 'RISK-001' }],
    },
    {
      n: 3,
      severity: 'info',
      taxonomy: 'recovery',
      titleRu: 'Прогноз PS удерживается на +7',
      bodyRu:
        'Честность: базовая дата пройдена, но запуск производства ещё не достигнут.',
      refs: [{ type: 'milestone', id: 'MS-PS' }],
    },
  ]),
  R: build('R', [
    {
      n: 1,
      severity: 'attention',
      taxonomy: 'decision',
      titleRu: 'Go / No-Go: условное решение зафиксировано',
      bodyRu:
        'Управленческая запись готовности; закрытие проблемы не переводит риск в зелёный статус автоматически.',
      refs: [{ type: 'decision', id: 'DEC-GO-01' }],
    },
    {
      n: 2,
      severity: 'attention',
      taxonomy: 'issue',
      titleRu: 'ISS-001 закрыт (состояние задано сценарием)',
      bodyRu:
        'Закрытая проблема не означает автоматический зелёный статус для RISK-001.',
      refs: [
        { type: 'issue', id: 'ISS-001' },
        { type: 'risk', id: 'RISK-001' },
      ],
    },
    {
      n: 3,
      severity: 'info',
      taxonomy: 'readiness',
      titleRu: 'Общий статус жёлтый до фактического старта',
      bodyRu: 'Зелёный статус проекта ожидается только на снимке S.',
      refs: [{ type: 'milestone', id: 'MS-PS' }],
    },
  ]),
  S: build('S', [
    {
      n: 1,
      severity: 'info',
      taxonomy: 'readiness',
      titleRu: 'Production Start достигнут 22.09.2027',
      bodyRu:
        'Фактический старт совпадает с прогнозом; MS-PS зелёный; общий статус зелёный.',
      refs: [{ type: 'milestone', id: 'MS-PS' }],
    },
    {
      n: 2,
      severity: 'info',
      taxonomy: 'critical_risk',
      titleRu: 'RISK-001 переведён в зелёный статус',
      bodyRu: 'Риск снят состоянием сценария вместе со стартом производства.',
      refs: [{ type: 'risk', id: 'RISK-001' }],
    },
    {
      n: 3,
      severity: 'info',
      taxonomy: 'cost',
      titleRu: 'Финальная стоимостная история',
      bodyRu:
        'Фактические затраты = EAC; ETC = 0; VAC −80 млн ₽ согласно DOC-PROD-026.',
      refs: [{ type: 'workstream', id: 'WS-HVAC' }],
    },
    {
      n: 4,
      severity: 'info',
      taxonomy: 'recovery',
      titleRu: 'Драйвер HVAC возвращён в статус «По плану»',
      bodyRu:
        'Историческое отклонение срока +7 дней сохранено; дата снимка не означает факт поставки.',
      refs: [{ type: 'equipment', id: 'EQ-HVAC-01' }],
    },
  ]),
};

export function compareNotificationPriority(
  a: NotificationFixture,
  b: NotificationFixture,
): number {
  const bySev = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
  if (bySev !== 0) return bySev;
  const byTax = TAXONOMY_RANK[a.taxonomy] - TAXONOMY_RANK[b.taxonomy];
  if (byTax !== 0) return byTax;
  return a.id.localeCompare(b.id);
}

export function notificationsForSnapshot(
  snapshotId: SnapshotId,
): NotificationFixture[] {
  const items = BY_SNAPSHOT[snapshotId] ?? [];
  return [...items].sort(compareNotificationPriority);
}

export function allNotificationFixtures(): NotificationFixture[] {
  return SNAPSHOT_IDS.flatMap((id) => notificationsForSnapshot(id));
}

export const NOTIFICATION_POPUP_PREF_DEFAULT = true;
