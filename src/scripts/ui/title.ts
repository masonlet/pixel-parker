import { getLayout, drawTitle } from "./layout.ts";
import { getButtonState, drawButton } from "./button.ts";
import type { Button, TitleMenuState } from "./types.ts";

export function updateTitleMenu(canvasW: number, canvasH: number): TitleMenuState {
  const { scale, gap, cx, cy, btnW, btnH } = getLayout(canvasW, canvasH);
  const titleY = cy - btnH * 1.5 - gap * 2;

  const startBtn:    Button = { x: cx - btnW/2, y: cy - btnH/2,       w: btnW, h: btnH, label: "START"    };
  const settingsBtn: Button = { x: cx - btnW/2, y: cy + btnH/2 + gap, w: btnW, h: btnH, label: "SETTINGS" };

  return {
    cx, scale, titleY,
    start:    { btn: startBtn,    state: getButtonState(startBtn)    },
    settings: { btn: settingsBtn, state: getButtonState(settingsBtn) },
  };
}

export function drawTitleMenu(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  state: TitleMenuState,
): void {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasW, canvasH);
  drawTitle(ctx, "Pixel Parker", state.cx, state.titleY, state.scale, 0.12);
  drawButton(ctx, state.start.btn,    state.start.state);
  drawButton(ctx, state.settings.btn, state.settings.state);
}
