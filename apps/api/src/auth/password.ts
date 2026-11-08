import bcrypt from 'bcryptjs';

/**
 * Always compare via bcrypt (including unknown username path) for timing parity.
 * Never log password or hash values.
 */
export async function passwordMatches(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  if (passwordHash.length === 0) {
    return false;
  }

  try {
    return await bcrypt.compare(password, passwordHash);
  } catch (error) {
    const name = error instanceof Error ? error.name : 'unknown';
    console.error(`[auth] Failed to compare password hash: ${name}`);
    return false;
  }
}
