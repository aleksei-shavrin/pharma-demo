import { passwordMatches } from './password';

describe('passwordMatches', () => {
  it('returns false for empty hash without throwing', async () => {
    await expect(passwordMatches('x', '')).resolves.toBe(false);
  });

  it('returns false for malformed hash (catch path)', async () => {
    await expect(passwordMatches('x', 'not-a-bcrypt-hash')).resolves.toBe(
      false,
    );
  });
});
