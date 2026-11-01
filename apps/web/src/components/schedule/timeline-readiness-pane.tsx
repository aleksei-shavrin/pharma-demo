/**
 * Honest Split secondary pane — reserved for future timeline/Gantt renderer.
 * Does not paint fake bars or control-point markers.
 */
export function TimelineReadinessPane() {
  return (
    <aside
      aria-label="Область временной шкалы"
      className="flex min-h-[12rem] flex-col justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-sunken)] px-4 py-6"
    >
      <p className="text-sm font-medium text-[var(--text)]">Временная шкала</p>
      <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
        Временная шкала будет доступна в следующей версии представления. Сейчас
        контрольные точки доступны в таблице.
      </p>
    </aside>
  );
}
