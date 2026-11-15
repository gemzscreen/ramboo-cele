// Countdown with pause. The clock is injected (`now` returns milliseconds) so
// the harness can drive it; the app passes Date.now. Time spent paused does
// not count.
export function createTimer({ limitSec, now = () => Date.now() }) {
  let startedAt = null;   // start of the current running stretch
  let banked = 0;         // ms accumulated in earlier stretches

  const elapsedMs = () => banked + (startedAt === null ? 0 : now() - startedAt);

  return {
    start() { if (startedAt === null) startedAt = now(); },
    pause() { if (startedAt !== null) { banked += now() - startedAt; startedAt = null; } },
    get running() { return startedAt !== null; },
    elapsedSec: () => Math.min(limitSec, elapsedMs() / 1000),
    remainingSec: () => Math.max(0, limitSec - elapsedMs() / 1000),
    expired: () => elapsedMs() / 1000 >= limitSec,
    limitSec,
  };
}

// 754 -> "12:34"; 3725 -> "1:02:05". Rounds up, so the display reaches 0:00
// only when the time is really gone.
export function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}
