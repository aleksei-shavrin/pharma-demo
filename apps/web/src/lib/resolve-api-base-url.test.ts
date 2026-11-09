import { describe, expect, it } from 'vitest';
import { joinApiUrl, resolveApiBaseUrl } from './resolve-api-base-url';

describe('resolveApiBaseUrl', () => {
  it('для пустого env возвращает локальный fallback npm web:dev', () => {
    expect(resolveApiBaseUrl(undefined)).toBe('http://localhost:3001');
    expect(resolveApiBaseUrl('')).toBe('http://localhost:3001');
    expect(resolveApiBaseUrl('   ')).toBe('http://localhost:3001');
  });

  it('сохраняет относительный server base /backend без trailing slash', () => {
    expect(resolveApiBaseUrl('/backend')).toBe('/backend');
    expect(resolveApiBaseUrl('/backend/')).toBe('/backend');
  });

  it('сохраняет абсолютный local ADR-0003 URL', () => {
    expect(resolveApiBaseUrl('http://api.localhost')).toBe('http://api.localhost');
  });
});

describe('joinApiUrl', () => {
  it('склеивает /backend и /health в /backend/health', () => {
    expect(joinApiUrl('/backend', '/health')).toBe('/backend/health');
  });

  it('сохраняет query в path', () => {
    expect(joinApiUrl('/backend', '/v1/projects/PRT-01/dashboard?snapshot=A')).toBe(
      '/backend/v1/projects/PRT-01/dashboard?snapshot=A',
    );
  });

  it('склеивает абсолютный base без двойного слэша', () => {
    expect(joinApiUrl('http://api.localhost/', '/health')).toBe(
      'http://api.localhost/health',
    );
  });
});
