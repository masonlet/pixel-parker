import { isMuted, setMuted, getVolume, setVolume } from "web-engine/audio/mixer.ts";

import { getLayout, drawTitle } from "./layout.ts";
import { type Button, drawButton, isHovered, isClicked } from "./button.ts";
import { type Slider, drawSlider, sliderValue } from "./slider.ts";

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
  drawButton(ctx, muteBtn, isHovered(muteBtn));
  if (isClicked(muteBtn)) setMuted(!isMuted());

  const volSlider: Slider = {
    x: cx - btnW / 2,
    y: cy + btnH / 2 + gap,
    w: btnW,
    h: btnH,
    label: "Volume",
  };
  drawSlider(ctx, volSlider, getVolume());
  const newVol = sliderValue(volSlider);
  if (newVol !== null) setVolume(newVol);

  const backBtn: Button = {
    x: cx - btnW / 2,
    y: canvasH - btnH - gap * 2,
    w: btnW, h: btnH,
    label: "Back"
  };
  drawButton(ctx, backBtn, isHovered(backBtn));

  return { backClicked: isClicked(backBtn) };
}
