import type { Audio                 } from "@starweb-libs/audio/audio.js";
import { transition                 } from "@starweb-libs/engine/transition.js";
import { getPointer                 } from "@starweb-libs/engine/input/pointer.js";
import { getLayout, drawTitle       } from "@starweb-libs/ui/layout.js";
import { getButtonState, drawButton } from "@starweb-libs/ui/button.js";
import type { PauseMenuState, PauseAction } from "./types.ts";
import type { FrameState, PlayState       } from "../game/types.ts";
import { resetPlayState                   } from "../game/play.ts";

export function handlePauseFrame(w: number, h: number, playState: PlayState, audio: Audio): FrameState {
  const { scale, gap, cx, cy, btnW, btnH } = getLayout(w, h);
  const totalH = btnH * 3 + gap * 2;
  const firstY = cy - totalH / 2;
  const titleY = firstY - btnH * 0.5 - gap * 2;

  const resumeBtn  = { x: cx - btnW/2, y: firstY,                    w: btnW, h: btnH, label: "Resume"  };
  const restartBtn = { x: cx - btnW/2, y: firstY + (btnH + gap),     w: btnW, h: btnH, label: "Restart" };
  const quitBtn    = { x: cx - btnW/2, y: firstY + (btnH + gap) * 2, w: btnW, h: btnH, label: "Quit"    };

  const resume  = { btn: resumeBtn,  state: getButtonState(resumeBtn, getPointer())  };
  const restart = { btn: restartBtn, state: getButtonState(restartBtn, getPointer()) };
  const quit    = { btn: quitBtn,    state: getButtonState(quitBtn, getPointer())    };

  let action: PauseAction = null;
  if (resume.state.clicked)  action = "resume";
  if (restart.state.clicked) action = "restart";
  if (quit.state.clicked)    action = "quit";

  const ui = { cx, scale, titleY, resume, restart, quit, action };

  if (ui.action === "resume")  return transition({ game: "level-playing", ui: null }, audio);
  if (ui.action === "quit")    return transition({ game: "menu-title",    ui: null }, audio);
  if (ui.action === "restart") return transition(
    { game: "level-playing", ui: null },
    audio,
    () => resetPlayState(playState)
  );
  return { game: "level-paused", ui };
}

export function renderPauseFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  ui: PauseMenuState | null,
): void {
  if (!ui) return;
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, w, h);
  drawTitle(ctx, "Paused", ui.cx, ui.titleY, ui.scale);
  drawButton(ctx, ui.resume.btn,  ui.resume.state);
  drawButton(ctx, ui.restart.btn, ui.restart.state);
  drawButton(ctx, ui.quit.btn,    ui.quit.state);
}
