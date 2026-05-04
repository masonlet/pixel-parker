import { type Button, drawButton, isHovered, isClicked } from "./button.ts";

export type WonAction = "restart" | "quit" | null;

export function drawWonMenu(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
): WonAction {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Level Complete!", canvasW / 2, canvasH / 2 - 120);

  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const restartBtn: Button = { x: cx - 100, y: cy - 15, w: 200, h: 50, label: "Restart" };
  const quitBtn: Button    = { x: cx - 100, y: cy + 55, w: 200, h: 50, label: "Quit" };

  drawButton(ctx, restartBtn, isHovered(restartBtn));
  drawButton(ctx, quitBtn, isHovered(quitBtn));

  if (isClicked(restartBtn)) return "restart";
  if (isClicked(quitBtn)) return "quit";
  return null;
}
