import { type Button, drawButton, isHovered, isClicked } from "./button.ts";

export function drawTitleMenu(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
): { startClicked: boolean; settingsClicked: boolean } {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 64px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Pixel Parker", canvasW / 2, canvasH / 2 - 120);

  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const startBtn: Button  = { x: cx - 100, y: cy - 20, w: 200, h: 50, label: "START" };
  const settingsBtn: Button = { x: cx - 100, y: cy + 50, w: 200, h: 50, label: "SETTINGS" };

  drawButton(ctx, startBtn, isHovered(startBtn));
  drawButton(ctx, settingsBtn, isHovered(settingsBtn));

  return {
    startClicked: isClicked(startBtn),
    settingsClicked: isClicked(settingsBtn),
  };
}
