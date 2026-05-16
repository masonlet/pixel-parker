import { isMuted, setMuted, getVolume, setVolume } from "web-engine/audio/mixer.ts";

import { getLayout, drawTitle } from "./layout.ts";
import { drawButton, getButtonState } from "./button.ts";
import { drawSlider, updateSlider } from "./slider.ts";
import type { Button, Slider, SliderState } from "./types.ts";

const volSlider: Slider = {
  x: 0, y: 0,
  w: 0, h: 0,
  label: "Volume",
};

let volState: SliderState = { dragging: false, value: getVolume() };

export function drawSettingsMenu(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
): { backClicked: boolean } {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const { scale, gap, cx, cy, btnW, btnH } = getLayout(canvasW, canvasH);

  const titleY = scale * 0.15;
  drawTitle(ctx, "Settings", cx, titleY, scale);

  const muteBtn: Button = {
    x: cx - btnW / 2,
    y: cy - btnH / 2,
    w: btnW, h: btnH,
    label: isMuted() ? "Unmute" : "Mute",
  };
  const muteState = getButtonState(muteBtn);
  drawButton(ctx, muteBtn, muteState);
  if (muteState.clicked) setMuted(!isMuted());

  volSlider.x = cx - btnW / 2;
  volSlider.y = cy + btnH / 2 + gap;
  volSlider.w = btnW;
  volSlider.h = btnH;

  volState = updateSlider(volSlider, volState);
  if (volState.dragging) setVolume(volState.value);
  drawSlider(ctx, volSlider, volState.value);

  const backBtn: Button = {
    x: cx - btnW / 2,
    y: canvasH - btnH - gap * 2,
    w: btnW, h: btnH,
    label: "Back"
  };
  const backState = getButtonState(backBtn);
  drawButton(ctx, backBtn, backState);

  return { backClicked: backState.clicked };
}
