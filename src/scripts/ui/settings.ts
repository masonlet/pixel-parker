import { isMuted, setMuted, getVolume, setVolume } from "web-engine/audio/mixer.ts";
import type { Button, Slider, SliderState, SettingsMenuState } from "./types.ts";
import { getLayout, drawTitle } from "./layout.ts";
import { drawButton, getButtonState } from "./button.ts";
import { drawSlider, updateSlider } from "./slider.ts";

let volState: SliderState = { dragging: false, value: getVolume() };

export function updateSettingsMenu(canvasW: number, canvasH: number): SettingsMenuState {
  const { scale, gap, cx, cy, btnW, btnH } = getLayout(canvasW, canvasH);
  const titleY = scale * 0.15;

  const muteBtn: Button = {
    x: cx - btnW / 2, y: cy - btnH / 2,
    w: btnW, h: btnH,
    label: isMuted() ? "Unmute" : "Mute",
  };

  const backBtn: Button = {
    x: cx - btnW / 2, y: canvasH - btnH - gap * 2,
    w: btnW, h: btnH,
    label: "Back"
  };

  const volSlider: Slider = {
    x: cx - btnW/2, y: cy + btnH/2 + gap,
    w: btnW, h: btnH,
    label: "Volume",
  };

  const mute = { btn: muteBtn, state: getButtonState(muteBtn) };
  const back = { btn: backBtn, state: getButtonState(backBtn) };

  volState = updateSlider(volSlider, volState);

  if (mute.state.clicked) setMuted(!isMuted());
  setVolume(volState.value);

  return { cx, scale, titleY, mute, back, vol: { slider: volSlider, state: volState }, muted: isMuted() };
}

export function drawSettingsMenu(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  state: SettingsMenuState,
): void {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasW, canvasH);
  drawTitle(ctx, "Settings", state.cx, state.titleY, state.scale);
  drawButton(ctx, state.mute.btn, state.mute.state);
  drawSlider(ctx, state.vol.slider, state.vol.state.value);
  drawButton(ctx, state.back.btn, state.back.state);
}
