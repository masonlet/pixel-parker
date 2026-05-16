import { getLayout, drawTitle } from "./layout.ts";
import type { Button, WonAction } from "./types.ts";
import { drawButton, getButtonState } from "./button.ts";

export function drawWonMenu(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  hasNext: boolean,
): WonAction {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const { scale, gap, cx, cy, btnW, btnH } = getLayout(canvasW, canvasH);

  const btnCount = hasNext ? 3 : 2;
  const totalH = btnH * btnCount + gap * (btnCount - 1);
  const firstY = cy - totalH / 2;

  const titleY = firstY - btnH * 0.5 - gap * 2;
  drawTitle(ctx, "Level Complete!", cx, titleY, scale);

  const restartBtn: Button = { x: cx - btnW/2, y: firstY,                        w: btnW, h: btnH, label: "Restart" };
  const quitBtn:    Button = { x: cx - btnW/2, y: firstY + (btnH + gap) * (btnCount - 1), w: btnW, h: btnH, label: "Quit"    };

  const restartState = getButtonState(restartBtn);
  const quitState    = getButtonState(quitBtn);

  drawButton(ctx, restartBtn, restartState);
  if (hasNext) {
    const nextBtn: Button = { x: cx - btnW/2, y: firstY + (btnH + gap), w: btnW, h: btnH, label: "Next" };
    const nextState = getButtonState(nextBtn);
    drawButton(ctx, nextBtn, nextState);
    if (nextState.clicked) return "next";
  }
  drawButton(ctx, quitBtn, quitState);

  if (restartState.clicked) return "restart";
  if (quitState.clicked)    return "quit";
  return null;
}
