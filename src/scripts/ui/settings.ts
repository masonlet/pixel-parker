import type { Audio                 } from "starweb-audio/audio.js";
import type { Button, Slider, SliderState, SettingsMenuState } from "./types.ts";
import type { FrameState            } from "../game/types.ts";
import { transition                 } from "../game/transition.ts";
import { getLayout, drawTitle       } from "./layout.ts";
import { getButtonState, drawButton } from "./button.ts";
import { updateSlider, drawSlider   } from "./slider.ts";

let volState: SliderState | null = null;

export function handleSettingsFrame(w: number, h: number, audio: Audio): FrameState {
  const { scale, gap, cx, cy, btnW, btnH } = getLayout(w, h);
  const titleY = scale * 0.15;

  const muteBtn:   Button = { x: cx - btnW/2, y: cy - btnH/2,       w: btnW, h: btnH, label: audio.muted ? "Unmute" : "Mute" };
  const backBtn:   Button = { x: cx - btnW/2, y: h - btnH - gap*2,  w: btnW, h: btnH, label: "Back" };
  const volSlider: Slider = { x: cx - btnW/2, y: cy + btnH/2 + gap, w: btnW, h: btnH, label: "Volume" };

  const mute = { btn: muteBtn, state: getButtonState(muteBtn) };
  const back = { btn: backBtn, state: getButtonState(backBtn) };

  if (!volState) volState = { dragging: false, value: audio.volume };
  volState = updateSlider(volSlider, volState);

  if (mute.state.clicked) audio.setMuted(!audio.muted);
  audio.setVolume(volState.value);

  const ui = { cx, scale, titleY, mute, back, vol: { slider: volSlider, state: volState }, muted: audio.muted };

  if (ui.back.state.clicked) return transition({ game: "menu-title", ui: null }, audio);
  return { game: "menu-settings", ui };
}

export function renderSettingsFrame(ctx: CanvasRenderingContext2D, ui: SettingsMenuState | null): void {
  if (!ui) return;
  drawTitle(ctx, "Settings", ui.cx, ui.titleY, ui.scale);
  drawButton(ctx, ui.mute.btn,   ui.mute.state);
  drawSlider(ctx, ui.vol.slider, ui.vol.state.value);
  drawButton(ctx, ui.back.btn,   ui.back.state);
}
