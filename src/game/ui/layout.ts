export interface Layout {
  scale: number;
  gap: number;
  cx: number;
  cy: number;
  btnW: number;
  btnH: number;
}

export function getLayout(canvasW: number, canvasH: number): Layout {
  const scale = Math.min(canvasW, canvasH);
  return {
    scale,
    gap: scale * 0.03,
    cx: canvasW / 2,
    cy: canvasH / 2,
    btnW: scale * 0.4,
    btnH: scale * 0.1,
  };
}

export function drawTitle(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, scale: number, sizeFactor = 0.1): void {
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.floor(scale * sizeFactor)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}
