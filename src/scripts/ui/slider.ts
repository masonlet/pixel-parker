import { isPointerDown, wasPointerClicked, pointerX, pointerY } from "web-engine/input/pointer.ts";

export type Slider = {
  x: number; y: number;
  w: number; h: number;
  label?: string;
  dragging?: boolean
};

export function drawSlider(ctx: CanvasRenderingContext2D, s: Slider, value: number): void {
  ctx.fillStyle = "#222";
  ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.fillStyle = "#666";
  ctx.fillRect(s.x, s.y, s.w * value, s.h);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(s.x, s.y, s.w, s.h);

  if (s.label) {
    ctx.fillStyle = "#fff";
    ctx.font = `${s.h * 0.4}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      `${s.label}: ${Math.round(value * 100)}%`,
      s.x + s.w / 2, s.y + s.h / 2
    );
  }
}

export function sliderValue(s: Slider): number | null {
  const x = pointerX(), y = pointerY();
  if (!isPointerDown()) { s.dragging = false; return null; }
  if (wasPointerClicked()) if (x >= s.x
                            && x <= s.x + s.w
                            && y >= s.y
                            && y <= s.y + s.h
                           ) s.dragging = true;
  if (!s.dragging) return null;
  return Math.max(0, Math.min(1, (x - s.x) / s.w));
}
