import { type Button, drawButton, isHovered, isClicked } from "./button.ts";

export function drawTitleMenu(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
): { startClicked: boolean; settingsClicked: boolean } {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const scale = Math.min(canvasW, canvasH);
  const gap = scale * 0.03;
  const cx = canvasW / 2;
  const cy = canvasH / 2;

  const btnW = scale * 0.4;
  const btnH = scale * 0.1;
  const startBtn: Button = {
    x: cx - btnW / 2,
    y: cy - btnH / 2,
    w: btnW, h: btnH,
    label: "START"
  };
  const settingsBtn: Button = {
    x: cx - btnW / 2,
    y: cy + btnH / 2 + gap,
    w: btnW, h: btnH,
    label: "SETTINGS"
  };

  const titleY = cy - btnH * 1.5 - gap * 2;
  const titleSize = Math.floor(scale * 0.12);
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${titleSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Pixel Parker", cx, titleY);

  drawButton(ctx, startBtn, isHovered(startBtn));
  drawButton(ctx, settingsBtn, isHovered(settingsBtn));

  return {
    startClicked: isClicked(startBtn),
    settingsClicked: isClicked(settingsBtn),
  };
}
