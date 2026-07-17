import type { Audio                 } from "@starweb-libs/audio/audio.js";
import type { Button, Slider        } from "@starweb-libs/ui/types.js";
import { transition                 } from "@starweb-libs/engine/transition.js";
import { getPointer                 } from "@starweb-libs/engine/input/pointer.js";
import { getLayout, drawTitle       } from "@starweb-libs/ui/layout.js";
import { getButtonState, drawButton } from "@starweb-libs/ui/button.js";
import { updateSlider, drawSlider   } from "@starweb-libs/ui/slider.js";
import type { SettingsMenuState     } from "./types.ts";
import type { FrameState, PlayState } from "../game/types.ts";

export function handleSettingsFrame(w: number, h: number, playState: PlayState, audio: Audio): FrameState {
  const { scale, gap, cx, cy, btnW, btnH } = getLayout(w, h);
  const titleY = scale * 0.15;

  const muteBtn:   Button = { x: cx - btnW/2, y: cy - btnH/2,       w: btnW, h: btnH, label: audio.muted ? "Unmute" : "Mute" };
  const backBtn:   Button = { x: cx - btnW/2, y: h - btnH - gap*2,  w: btnW, h: btnH, label: "Back" };
  const volSlider: Slider = { x: cx - btnW/2, y: cy + btnH/2 + gap, w: btnW, h: btnH, label: "Volume" };

  const mute = { btn: muteBtn, state: getButtonState(muteBtn, getPointer()) };
  const back = { btn: backBtn, state: getButtonState(backBtn, getPointer()) };

  playState.volState = updateSlider(volSlider, playState.volState, getPointer());

  if (mute.state.clicked) audio.setMuted(!audio.muted);
  audio.setVolume(playState.volState.value);

  const ui = { cx, scale, titleY, mute, back, vol: { slider: volSlider, state: playState.volState }, muted: audio.muted };

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
