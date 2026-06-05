import { pointerX, pointerY, wasPointerClicked } from "starweb-engine/input/pointer.js";
import type { Button, ButtonState } from "./types.ts";

export function getButtonState(b: Button): ButtonState {
  const mx = pointerX(), my = pointerY();
  const hovered = mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;
  return { hovered, clicked: hovered && wasPointerClicked() };
}

export function drawButton(ctx: CanvasRenderingContext2D, b: Button, ui: ButtonState): void {
  ctx.fillStyle = ui.hovered ? "#444" : "#222";
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = "#fff";
  ctx.font = `${b.h * 0.4}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2);
}
