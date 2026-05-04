import { pointerX, pointerY, wasPointerClicked } from "../../engine/input/pointer.ts";

export interface Button {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export function isHovered(b: Button): boolean {
  const mx = pointerX(), my = pointerY();
  return mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;
}

export function isClicked(b: Button): boolean {
  return isHovered(b) && wasPointerClicked();
}

export function drawButton(ctx: CanvasRenderingContext2D, b: Button, hover: boolean): void {
  ctx.fillStyle = hover ? "#444" : "#222";
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
