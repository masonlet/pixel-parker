import { getLayout, drawTitle } from "./layout.ts";
import type { Button, PauseAction } from "./types.ts";
import { drawButton, getButtonState } from "./button.ts";

export function drawPauseMenu(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
): PauseAction {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const { scale, gap, cx, cy, btnW, btnH } = getLayout(canvasW, canvasH);

  const totalH = btnH * 3 + gap * 2;
  const firstY = cy - totalH / 2;

  const titleY = firstY - btnH * 0.5 - gap * 2;
  drawTitle(ctx, "Paused", cx, titleY, scale);

  const resumeBtn:  Button = { x: cx - btnW/2, y: firstY,                    w: btnW, h: btnH, label: "Resume"  };
  const restartBtn: Button = { x: cx - btnW/2, y: firstY + (btnH + gap),     w: btnW, h: btnH, label: "Restart" };
  const quitBtn:    Button = { x: cx - btnW/2, y: firstY + (btnH + gap) * 2, w: btnW, h: btnH, label: "Quit"    };

  const resumeState  = getButtonState(resumeBtn);
  const restartState = getButtonState(restartBtn);
  const quitState    = getButtonState(quitBtn);

  drawButton(ctx, resumeBtn,  resumeState);
  drawButton(ctx, restartBtn, restartState);
  drawButton(ctx, quitBtn,    quitState);

  if (resumeState.clicked)  return "resume";
  if (restartState.clicked) return "restart";
  if (quitState.clicked)    return "quit";
  return null;
}
