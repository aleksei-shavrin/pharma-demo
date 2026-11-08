import { originMatchesPublicOrigin } from './origin';

describe('originMatchesPublicOrigin branches', () => {
  it('rejects empty origin and non-http schemes', () => {
    expect(
      originMatchesPublicOrigin({
        origin: '   ',
        publicOrigin: 'http://localhost:3080',
      }),
    ).toBe(false);
    expect(
      originMatchesPublicOrigin({
        origin: 'ftp://localhost:3080',
        publicOrigin: 'http://localhost:3080',
      }),
    ).toBe(false);
    expect(
      originMatchesPublicOrigin({
        origin: 'not-a-url',
        publicOrigin: 'http://localhost:3080',
      }),
    ).toBe(false);
  });

  it('strips default ports when comparing', () => {
    expect(
      originMatchesPublicOrigin({
        origin: 'https://demo.example.com:443',
        publicOrigin: 'https://demo.example.com',
      }),
    ).toBe(true);
    expect(
      originMatchesPublicOrigin({
        origin: 'http://demo.example.com:80',
        publicOrigin: 'http://demo.example.com',
      }),
    ).toBe(true);
  });

  it('rejects protocol mismatch after default-port strip', () => {
    expect(
      originMatchesPublicOrigin({
        origin: 'http://demo.example.com:443',
        publicOrigin: 'https://demo.example.com',
      }),
    ).toBe(false);
  });
});
