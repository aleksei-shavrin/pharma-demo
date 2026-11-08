import { originMatchesPublicOrigin } from './origin';

describe('originMatchesPublicOrigin', () => {
  const publicOrigin = 'http://localhost:3080';

  it('accepts matching origin with port', () => {
    expect(
      originMatchesPublicOrigin({
        origin: 'http://localhost:3080',
        publicOrigin,
      }),
    ).toBe(true);
  });

  it('accepts DX loopback peer localhost↔127.0.0.1 with same protocol+port', () => {
    expect(
      originMatchesPublicOrigin({
        origin: 'http://127.0.0.1:3080',
        publicOrigin: 'http://localhost:3080',
      }),
    ).toBe(true);
    expect(
      originMatchesPublicOrigin({
        origin: 'http://localhost:3080',
        publicOrigin: 'http://127.0.0.1:3080',
      }),
    ).toBe(true);
  });

  it('rejects missing, null, foreign, dns-ending, and non-peer loopback', () => {
    expect(originMatchesPublicOrigin({ origin: null, publicOrigin })).toBe(
      false,
    );
    expect(originMatchesPublicOrigin({ origin: 'null', publicOrigin })).toBe(
      false,
    );
    expect(originMatchesPublicOrigin({ origin: undefined, publicOrigin })).toBe(
      false,
    );
    expect(
      originMatchesPublicOrigin({
        origin: 'http://localhost:9999',
        publicOrigin,
      }),
    ).toBe(false);
    expect(
      originMatchesPublicOrigin({
        origin: 'https://evil.example',
        publicOrigin,
      }),
    ).toBe(false);
    expect(
      originMatchesPublicOrigin({
        origin: 'http://evil.localhost:3080',
        publicOrigin,
      }),
    ).toBe(false);
    expect(
      originMatchesPublicOrigin({
        origin: 'http://127.0.0.2:3080',
        publicOrigin,
      }),
    ).toBe(false);
  });

  it('rejects http≠https even when host+port match', () => {
    expect(
      originMatchesPublicOrigin({
        origin: 'https://localhost:3080',
        publicOrigin: 'http://localhost:3080',
      }),
    ).toBe(false);
    expect(
      originMatchesPublicOrigin({
        origin: 'http://127.0.0.1:3080',
        publicOrigin: 'https://localhost:3080',
      }),
    ).toBe(false);
  });

  it('rejects loopback peer when ports differ', () => {
    expect(
      originMatchesPublicOrigin({
        origin: 'http://127.0.0.1:9999',
        publicOrigin: 'http://localhost:3080',
      }),
    ).toBe(false);
  });

  it('keeps non-loopback PUBLIC_ORIGIN strict (no 127 peer)', () => {
    expect(
      originMatchesPublicOrigin({
        origin: 'http://127.0.0.1:443',
        publicOrigin: 'https://demo.example.com',
      }),
    ).toBe(false);
    expect(
      originMatchesPublicOrigin({
        origin: 'https://demo.example.com',
        publicOrigin: 'https://demo.example.com',
      }),
    ).toBe(true);
  });
});
