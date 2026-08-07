// EventUtils.ts
export function scheduleEvent(delaySec: number, callback: () => void): number {
  return setTimeout(() => {
    callback();
  }, delaySec * 1000) as unknown as number; // browser returns number
}

export function cancelEvent(timerId: number | null | undefined) {
  if (timerId != null) {
    clearTimeout(timerId);
  }
}