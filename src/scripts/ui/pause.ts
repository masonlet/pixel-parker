import { getLayout, drawTitle } from "./layout.ts";
import { getButtonState, drawButton } from "./button.ts";
import type { PauseMenuState, PauseAction } from "./types.ts";

export function updatePauseMenu(canvasW: number, canvasH: number): PauseMenuState {
  const { scale, gap, cx, cy, btnW, btnH } = getLayout(canvasW, canvasH);
  const totalH = btnH * 3 + gap * 2;
  const firstY = cy - totalH / 2;
  const titleY = firstY - btnH * 0.5 - gap * 2;

  const resumeBtn  = { x: cx - btnW/2, y: firstY,                    w: btnW, h: btnH, label: "Resume"  };
  const restartBtn = { x: cx - btnW/2, y: firstY + (btnH + gap),     w: btnW, h: btnH, label: "Restart" };
  const quitBtn    = { x: cx - btnW/2, y: firstY + (btnH + gap) * 2, w: btnW, h: btnH, label: "Quit"    };

  const resume  = { btn: resumeBtn,  state: getButtonState(resumeBtn)  };
  const restart = { btn: restartBtn, state: getButtonState(restartBtn) };
  const quit    = { btn: quitBtn,    state: getButtonState(quitBtn)    };

  let action: PauseAction = null;
  if (resume.state.clicked)  action = "resume";
  if (restart.state.clicked) action = "restart";
  if (quit.state.clicked)    action = "quit";

  return { cx, scale, titleY, resume, restart, quit, action };
}

export function drawPauseMenu(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  state: PauseMenuState,
): void {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvasW, canvasH);
  drawTitle(ctx, "Paused", state.cx, state.titleY, state.scale);
  drawButton(ctx, state.resume.btn,  state.resume.state);
  drawButton(ctx, state.restart.btn, state.restart.state);
  drawButton(ctx, state.quit.btn,    state.quit.state);
}
