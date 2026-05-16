import { getLayout, drawTitle } from "./layout.ts";
import { getButtonState, drawButton } from "./button.ts";
import type { Button, WonMenuState, WonAction } from "./types.ts";

export function updateWonMenu(canvasW: number, canvasH: number, hasNext: boolean): WonMenuState {
  const { scale, gap, cx, cy, btnW, btnH } = getLayout(canvasW, canvasH);
  const btnCount = hasNext ? 3 : 2;
  const totalH = btnH * btnCount + gap * (btnCount - 1);
  const firstY = cy - totalH / 2;
  const titleY = firstY - btnH * 0.5 - gap * 2;

  const restartBtn: Button = { x: cx - btnW/2, y: firstY,                                w: btnW, h: btnH, label: "Restart" };
  const quitBtn:    Button = { x: cx - btnW/2, y: firstY + (btnH + gap) * (btnCount - 1), w: btnW, h: btnH, label: "Quit"    };

  const restart = { btn: restartBtn, state: getButtonState(restartBtn) };
  const quit    = { btn: quitBtn,    state: getButtonState(quitBtn)    };

  let next: WonMenuState["next"] = null;
  if (hasNext) {
    const nextBtn: Button = { x: cx - btnW/2, y: firstY + (btnH + gap), w: btnW, h: btnH, label: "Next" };
    next = { btn: nextBtn, state: getButtonState(nextBtn) };
  }

  let action: WonAction = null;
  if (next?.state.clicked)   action = "next";
  if (restart.state.clicked) action = "restart";
  if (quit.state.clicked)    action = "quit";

  return { cx, scale, titleY, restart, next, quit, action };
}

export function drawWonMenu(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  state: WonMenuState,
): void {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvasW, canvasH);
  drawTitle(ctx, "Level Complete!", state.cx, state.titleY, state.scale);
  drawButton(ctx, state.restart.btn, state.restart.state);
  if (state.next) drawButton(ctx, state.next.btn, state.next.state);
  drawButton(ctx, state.quit.btn, state.quit.state);
}
