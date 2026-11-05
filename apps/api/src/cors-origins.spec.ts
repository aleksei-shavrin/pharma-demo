import { resolveCorsOrigins } from './cors-origins';

describe('resolveCorsOrigins', () => {
  it('включает WEB_ORIGIN серверного demo-host', () => {
    const origins = resolveCorsOrigins({
      WEB_ORIGIN: 'http://127.0.0.1:8080',
    });
    expect(origins).toContain('http://127.0.0.1:8080');
    expect(origins).toContain('http://localhost');
  });

  it('добавляет CORS_EXTRA_ORIGINS из CSV', () => {
    const origins = resolveCorsOrigins({
      WEB_ORIGIN: 'http://localhost:3000',
      CORS_EXTRA_ORIGINS: 'http://10.0.0.5:8080, https://demo.example',
    });
    expect(origins).toContain('http://10.0.0.5:8080');
    expect(origins).toContain('https://demo.example');
  });
});
