import type { FrameState, PlayState    } from "../game/types.ts";
import { transition                    } from "../game/transition.ts";
import { selectLevel                   } from "../game/play.ts";
import type { Level                    } from "../level/types.ts";
import type { Button, LevelSelectState } from "./types.ts";
import { getLayout, drawTitle          } from "./layout.ts";
import { getButtonState, drawButton    } from "./button.ts";

export function handleLevelFrame(canvasW: number, canvasH: number, playState: PlayState): FrameState {
  const ui = updateLevelSelect(canvasW, canvasH, playState.levels);
  if (ui.back.state.clicked) return transition({ game: "menu-title",    ui: null });
  if (ui.clickedIndex !== null) {
    const index = ui.clickedIndex;
    return transition(
      { game: "level-playing", ui: null },
      () => selectLevel(playState, index)
    );
  }
  return { game: "menu-levels", ui };
}

export function updateLevelSelect(canvasW: number, canvasH: number, levels: Level[]): LevelSelectState {
  const { scale, gap, cx, cy, btnW, btnH } = getLayout(canvasW, canvasH);
  const titleY = scale * 0.15;

  const cols  = 3;
  const cellW = btnH * 3;
  const gridW = cellW * cols + gap * (cols - 1);
  const gridH = btnH * 3 + gap * 2;
  const gridX = cx - gridW / 2;
  const gridY = cy - gridH / 2;

  let clickedIndex: number | null = null;
  const levelEntries = Array.from({ length: Math.min(levels.length, 9) }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const btn: Button = {
      x: gridX + col * (cellW + gap),
      y: gridY + row * (btnH + gap),
      w: cellW, h: btnH,
      label: levels[i]?.name ?? `Level ${i + 1}`,
    };
    const state = getButtonState(btn);
    if (state.clicked) clickedIndex = i;
    return { btn, state };
  });

  const backBtn: Button = { x: cx - btnW/2, y: canvasH - btnH - gap*2, w: btnW, h: btnH, label: "Back" };
  const back = { btn: backBtn, state: getButtonState(backBtn) };

  return { cx, scale, titleY, levels: levelEntries, back, clickedIndex };
}

export function drawLevelSelect(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  state: LevelSelectState,
): void {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasW, canvasH);
  drawTitle(ctx, "Select Level", state.cx, state.titleY, state.scale);
  for (const entry of state.levels) drawButton(ctx, entry.btn, entry.state);
  drawButton(ctx, state.back.btn, state.back.state);
}
