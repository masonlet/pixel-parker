import { getLayout, drawTitle } from "./layout.ts";
import { type Button } from "./types.ts";
import { drawButton, isHovered, isClicked } from "./button.ts";
import type { Level } from "../level/types.ts";

export function drawLevelSelect(
  ctx: CanvasRenderingContext2D,
  levels: Level[],
  canvasW: number,
  canvasH: number,
): { clickedIndex: number | null; backClicked: boolean } {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const { scale, gap, cx, cy, btnW, btnH } = getLayout(canvasW, canvasH);

  const titleY = scale * 0.15;
  drawTitle(ctx, "Select Level", cx, titleY, scale);

  const cols = 3;
  const cellW = btnH * 3;
  const gridW = cellW * cols + gap * (cols - 1);
  const gridH = btnH * 3 + gap * 2;
  const gridX = cx - gridW / 2;
  const gridY = cy - gridH / 2;

  let clickedIndex: number | null = null;

  for (let i = 0; i < Math.min(levels.length, 9); i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const btn: Button = {
      x: gridX + col * (cellW + gap),
      y: gridY + row * (btnH + gap),
      w: cellW, h: btnH,
      label: levels[i]?.name ?? `Level ${i + 1}`,
    };
    drawButton(ctx, btn, isHovered(btn));
    if (isClicked(btn)) clickedIndex = i;
  }

  const backBtn: Button = {
    x: cx - btnW / 2,
    y: canvasH - btnH - gap * 2,
    w: btnW, h: btnH,
    label: "Back",
  };
  drawButton(ctx, backBtn, isHovered(backBtn));

  return { clickedIndex, backClicked: isClicked(backBtn) };
}
