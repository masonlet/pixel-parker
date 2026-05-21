export interface Layout {
  scale: number;
  gap: number;
  cx: number;
  cy: number;
  btnW: number;
  btnH: number;
}

export function getLayout(w: number, h: number): Layout {
  const scale = Math.min(w, h);
  return {
    scale,
    gap: scale * 0.03,
    cx: w / 2,
    cy: h / 2,
    btnW: scale * 0.4,
    btnH: scale * 0.1,
  };
}

export function drawTitle(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  scale: number, scaleFactor = 0.1
): void {
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.floor(scale * scaleFactor)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}
