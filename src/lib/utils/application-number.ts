/**
 * Application numbers look like `FA26-000123`: the exam code followed by a
 * zero-padded per-exam sequence. The sequence is issued server-side inside
 * the enrollment transaction, so numbers are unique and never client-supplied.
 */
export const APPLICATION_NUMBER_PATTERN = /^[A-Z0-9]{2,10}-\d{6,}$/;

export function formatApplicationNumber(examCode: string, sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error(`Invalid application sequence: ${sequence}`);
  }
  return `${examCode.toUpperCase()}-${String(sequence).padStart(6, "0")}`;
}

export function looksLikeApplicationNumber(value: string): boolean {
  return /^[A-Z0-9]{2,10}-\d+$/i.test(value.trim());
}
