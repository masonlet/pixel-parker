import type { Audio                           } from "starweb-audio/audio.js";
import type { FrameState, PlayState           } from "../game/types.ts";
import { transition                           } from "../game/transition.ts";
import { selectLevel, resetPlayState          } from "../game/play.ts";
import type { Button, CompleteMenuState, CompleteAction } from "./types.ts";
import { getLayout, drawTitle                 } from "./layout.ts";
import { getButtonState, drawButton           } from "./button.ts";

export function handleCompleteFrame(
  w: number, h: number,
  playState: PlayState,
  audio: Audio
): FrameState {
  const { scale, gap, cx, cy, btnW, btnH } = getLayout(w, h);
  const hasNext = playState.levelIndex < playState.levels.length - 1
  const btnCount = hasNext ? 3 : 2;
  const totalH = btnH * btnCount + gap * (btnCount - 1);
  const firstY = cy - totalH / 2;
  const titleY = firstY - btnH * 0.5 - gap * 2;

  const restartBtn: Button = { x: cx - btnW/2, y: firstY,                                 w: btnW, h: btnH, label: "Restart" };
  const quitBtn:    Button = { x: cx - btnW/2, y: firstY + (btnH + gap) * (btnCount - 1), w: btnW, h: btnH, label: "Quit"    };

  const restart = { btn: restartBtn, state: getButtonState(restartBtn) };
  const quit    = { btn: quitBtn,    state: getButtonState(quitBtn)    };

  let next: CompleteMenuState["next"] = null;
  if (hasNext) {
    const nextBtn: Button = { x: cx - btnW/2, y: firstY + (btnH + gap), w: btnW, h: btnH, label: "Next" };
    next = { btn: nextBtn, state: getButtonState(nextBtn) };
  }

  let action: CompleteAction = null;
  if (next?.state.clicked)   action = "next";
  if (restart.state.clicked) action = "restart";
  if (quit.state.clicked)    action = "quit";

  const ui = { cx, scale, titleY, restart, next, quit, action };

  if (ui.action === "quit")    return transition({ game: "menu-title", ui: null }, audio);
  if (ui.action === "next")    return transition(
    { game: "level-playing", ui: null },
    audio,
    () => selectLevel(playState, playState.levelIndex + 1)
  );
  if (ui.action === "restart") return transition(
    { game: "level-playing", ui: null },
    audio,
    () => resetPlayState(playState)
  );
  return { game: "level-complete", ui };
}

export function renderCompleteFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  ui: CompleteMenuState | null,
): void {
  if (!ui) return;

  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, w, h);
  drawTitle(ctx, "Level Complete!", ui.cx, ui.titleY, ui.scale);
  drawButton(ctx, ui.restart.btn, ui.restart.state);
  if (ui.next) drawButton(ctx, ui.next.btn, ui.next.state);
  drawButton(ctx, ui.quit.btn, ui.quit.state);
}
