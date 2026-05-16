import { isPointerDown, wasPointerClicked, pointerX, pointerY } from "web-engine/input/pointer.ts";
import type { Slider, SliderState } from "./types.ts";

export function updateSlider(s: Slider, state: SliderState): SliderState {
  const x = pointerX(), y = pointerY();
  if (!isPointerDown()) return { ...state, dragging: false };

  const dragging = state.dragging
                || (wasPointerClicked()
                 && x >= s.x && x <= s.x + s.w
                 && y >= s.y && y <= s.y + s.h
                );

  if (!dragging) return state;

  const value = Math.max(0, Math.min(1, (x - s.x) / s.w));
  return { dragging, value };
}

export function drawSlider(ctx: CanvasRenderingContext2D, s: Slider, value: number): void {
  ctx.fillStyle = "#222";
  ctx.fillRect(s.x, s.y, s.w, s.h);

  ctx.fillStyle = "#666";
  ctx.fillRect(s.x, s.y, s.w * value, s.h);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(s.x, s.y, s.w, s.h);

  ctx.fillStyle = "#fff";
  ctx.font = `${s.h * 0.4}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${s.label}: ${Math.round(value * 100)}%`, s.x + s.w / 2, s.y + s.h / 2);
}
