import type { Audio                 } from "starweb-audio/audio.js";
import type { Button                } from "starweb-ui/types.js";
import { getLayout, drawTitle       } from "starweb-ui/layout.js";
import { getButtonState, drawButton } from "starweb-ui/button.js";
import type { TitleMenuState        } from "./types.ts";
import { getPointer                 } from "./pointer.ts";
import type { FrameState, PlayState } from "../game/types.ts";
import { transition                 } from "../game/transition.ts";

export function handleTitleFrame(w: number, h: number, playState: PlayState, audio: Audio): FrameState {
  const { scale, gap, cx, cy, btnW, btnH } = getLayout(w, h);
  const titleY = cy - btnH * 1.5 - gap * 2;

  const startBtn:    Button = { x: cx - btnW/2, y: cy - btnH/2,       w: btnW, h: btnH, label: "START"    };
  const settingsBtn: Button = { x: cx - btnW/2, y: cy + btnH/2 + gap, w: btnW, h: btnH, label: "SETTINGS" };

  const ui = {
    cx, scale, titleY,
    start:    { btn: startBtn,    state: getButtonState(startBtn, getPointer())    },
    settings: { btn: settingsBtn, state: getButtonState(settingsBtn, getPointer()) },
  };

  if (ui.start.state.clicked) return transition(
    playState.levels.length > 1 ? { game: "menu-levels", ui: null }
                                : { game: "level-playing", ui: null },
    audio
  );
  if (ui.settings.state.clicked) return transition({ game: "menu-settings", ui: null }, audio);
  return { game: "menu-title", ui };
}

export function renderTitleFrame(ctx: CanvasRenderingContext2D, ui: TitleMenuState | null): void {
  if (!ui) return;
  drawTitle(ctx, "Pixel Parker", ui.cx, ui.titleY, ui.scale, 0.12);
  drawButton(ctx, ui.start.btn,    ui.start.state);
  drawButton(ctx, ui.settings.btn, ui.settings.state);
}
