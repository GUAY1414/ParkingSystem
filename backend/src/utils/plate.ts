export function normalizePlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
}

export function randomReference(prefix = "SESSION") {
  const bytes = new Uint8Array(18);
  globalThis.crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${prefix}-${suffix}`;
}
