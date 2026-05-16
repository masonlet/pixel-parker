import { getLayout, drawTitle } from "./layout.ts";
import type { Button } from "./types.ts";
import { drawButton, getButtonState } from "./button.ts";

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

  const startState = getButtonState(startBtn);
  const settingsState = getButtonState(settingsBtn);

  drawButton(ctx, startBtn, startState);
  drawButton(ctx, settingsBtn, settingsState);

  return {
    startClicked: startState.clicked,
    settingsClicked: settingsState.clicked,
  };
}
