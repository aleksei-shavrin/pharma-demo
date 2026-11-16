import { describe, expect, it } from 'vitest';
import { resolveDocsBaseUrl } from './resolve-docs-base-url';

describe('resolveDocsBaseUrl', () => {
  it('для пустого env возвращает Compose-канон /docs/', () => {
    expect(resolveDocsBaseUrl(undefined)).toBe('/docs/');
    expect(resolveDocsBaseUrl('')).toBe('/docs/');
    expect(resolveDocsBaseUrl('   ')).toBe('/docs/');
  });

  it('нормализует prefix /portal без и с trailing slash', () => {
    expect(resolveDocsBaseUrl('/portal')).toBe('/portal/');
    expect(resolveDocsBaseUrl('/portal/')).toBe('/portal/');
  });

  it('добавляет leading slash если забыли', () => {
    expect(resolveDocsBaseUrl('docs')).toBe('/docs/');
  });
});
