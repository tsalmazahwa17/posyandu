export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_BYTES = 72;

export function getPasswordByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function validateNewPassword(value: string): string | null {
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Kata sandi minimal ${PASSWORD_MIN_LENGTH} karakter.`;
  }
  if (getPasswordByteLength(value) > PASSWORD_MAX_BYTES) {
    return `Kata sandi maksimal ${PASSWORD_MAX_BYTES} byte.`;
  }
  return null;
}

export function isPasswordWithinBcryptLimit(value: string): boolean {
  return getPasswordByteLength(value) <= PASSWORD_MAX_BYTES;
}
