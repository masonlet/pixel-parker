import { getLayout, drawTitle } from "./layout.ts";
import { type Button, drawButton, isHovered, isClicked } from "./button.ts";

export type WonAction = "restart" | "quit" | null;

export function drawWonMenu(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
): WonAction {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const { scale, gap, cx, cy, btnW, btnH } = getLayout(canvasW, canvasH);

  const totalH = btnH * 2 + gap;
  const firstY = cy - totalH / 2;

  const titleY = firstY - btnH * 0.5 - gap * 2;
  drawTitle(ctx, "Level Complete!", cx, titleY, scale);

  const restartBtn: Button = { x: cx - btnW/2, y: firstY,                w: btnW, h: btnH, label: "Restart" };
  const quitBtn:    Button = { x: cx - btnW/2, y: firstY + (btnH + gap), w: btnW, h: btnH, label: "Quit"    };

  drawButton(ctx, restartBtn, isHovered(restartBtn));
  drawButton(ctx, quitBtn, isHovered(quitBtn));

  if (isClicked(restartBtn)) return "restart";
  if (isClicked(quitBtn))    return "quit";
  return null;
}
