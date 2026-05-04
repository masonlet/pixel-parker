import { clearFramePointer } from "./input/pointer.ts";

const TICK_RATE = 1 / 60;

export function startLoop(
  update: (dt: number) => void,
  render: () => void,
): void {
  let accumulator = 0;
  let lastTime = performance.now() / 1000;

  function frame(nowMs: number) {
    const now = nowMs / 1000;
    const elapsed = Math.min(now - lastTime, 0.25);
    lastTime = now;
    accumulator += elapsed;

    while (accumulator >= TICK_RATE) {
      update(TICK_RATE);
      accumulator -= TICK_RATE;
    }

    render();
    clearFramePointer();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
