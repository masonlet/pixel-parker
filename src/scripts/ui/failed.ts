import type { Audio                 } from "@starweb-libs/audio/audio.js";
import type { Button                } from "@starweb-libs/ui/types.js";
import { getPointer                 } from "@starweb-libs/engine/input/pointer.js";
import { getLayout, drawTitle       } from "@starweb-libs/ui/layout.js";
import { getButtonState, drawButton } from "@starweb-libs/ui/button.js";
import { transition                 } from "@starweb-libs/menus/transition.js";
import type { FailedMenuState, FailedAction } from "./types.ts";
import type { FrameState, PlayState         } from "../game/types.ts";
import { resetPlayState                     } from "../game/play.ts";

export function handleFailedFrame(
  w: number, h: number,
  playState: PlayState,
  audio: Audio
): FrameState {
  const { scale, gap, cx, cy, btnW, btnH } = getLayout(w, h);
  const totalH  = btnH * 2 + gap;
  const firstY  = cy - totalH / 2;
  const titleY = firstY - btnH * 0.5 - gap * 2;

  const restartBtn: Button = { x: cx - btnW/2, y: firstY,                                 w: btnW, h: btnH, label: "Restart" };
  const quitBtn: Button = { x: cx - btnW/2, y: firstY + btnH + gap, w: btnW, h: btnH, label: "Quit" };

  const restart = { btn: restartBtn, state: getButtonState(restartBtn, getPointer()) };
  const quit    = { btn: quitBtn,    state: getButtonState(quitBtn, getPointer())    };

  let action: FailedAction = null;
  if (restart.state.clicked) action = "restart";
  if (quit.state.clicked)    action = "quit";

  const ui = { cx, scale, titleY, restart, quit, action };

  if (ui.action === "quit")    return transition({ game: "menu-title", ui: null }, audio);
  if (ui.action === "restart") return transition(
    { game: "level-playing", ui: null },
    audio,
    () => resetPlayState(playState)
  );
  return { game: "level-failed", ui };
}

export function renderFailedFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  ui: FailedMenuState | null,
): void {
  if (!ui) return;

  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, w, h);
  drawTitle(ctx, "Level Failed!", ui.cx, ui.titleY, ui.scale);
  drawButton(ctx, ui.restart.btn, ui.restart.state);
  drawButton(ctx, ui.quit.btn, ui.quit.state);
}
