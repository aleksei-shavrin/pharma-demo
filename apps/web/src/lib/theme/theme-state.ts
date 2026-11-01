export type ThemeMode = 'light' | 'dark';

export function oppositeTheme(mode: ThemeMode): ThemeMode {
  return mode === 'light' ? 'dark' : 'light';
}
