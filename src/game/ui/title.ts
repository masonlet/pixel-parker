import { getLayout, drawTitle } from "./layout.ts";
import { type Button, drawButton, isHovered, isClicked } from "./button.ts";

export function drawTitleMenu(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
): { startClicked: boolean; settingsClicked: boolean } {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const { scale, gap, cx, cy, btnW, btnH } = getLayout(canvasW, canvasH);

  const titleY = cy - btnH * 1.5 - gap * 2;
  drawTitle(ctx, "Pixel Parker", cx, titleY, scale, 0.12);

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

  drawButton(ctx, startBtn, isHovered(startBtn));
  drawButton(ctx, settingsBtn, isHovered(settingsBtn));

  return {
    startClicked: isClicked(startBtn),
    settingsClicked: isClicked(settingsBtn),
  };
}
