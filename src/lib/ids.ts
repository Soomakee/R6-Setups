export function uid(prefix = 'id'): string {
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : undefined
  if (cryptoObj && 'randomUUID' in cryptoObj) {
    return `${prefix}_${cryptoObj.randomUUID()}`
  }
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}
