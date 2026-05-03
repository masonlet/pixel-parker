import { type Button, drawButton, isHovered, isClicked } from "./button.ts";

export function drawSettingsMenu(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
): { backClicked: boolean } {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Settings", canvasW / 2, 120);

  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText("PLACEHOLDER", canvasW / 2, canvasH / 2);

  const backBtn: Button = { x: canvasW / 2 - 100, y: canvasH - 100, w: 200, h: 50, label: "Back" };
  drawButton(ctx, backBtn, isHovered(backBtn));

  return { backClicked: isClicked(backBtn) };
}
