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
