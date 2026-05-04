const down = new Set<number>();
const clicked = new Set<number>();
const released = new Set<number>();

let canvasRef: HTMLCanvasElement | null = null;
let posX = 0;
let posY = 0;

export function initPointer(canvas: HTMLCanvasElement): void {
  canvasRef = canvas;

  const updatePos = (e: PointerEvent) => {
    if (!canvasRef) return;
    const rect = canvasRef.getBoundingClientRect();
    const scaleX = canvasRef.width / rect.width;
    const scaleY = canvasRef.height / rect.height;
    posX = (e.clientX - rect.left) * scaleX;
    posY = (e.clientY - rect.top) * scaleY;
  };

  window.addEventListener("pointerdown", (e) => {
    updatePos(e);
    if (!down.has(e.button)) clicked.add(e.button);
    down.add(e.button);
  });

  window.addEventListener("pointerup", (e) => {
    updatePos(e);
    down.delete(e.button);
    released.add(e.button);
  });

  window.addEventListener("pointermove", updatePos);

  window.addEventListener("blur", () => {
    down.clear();
  });
}

export function isPointerDown(button = 0): boolean      { return down.has(button); }
export function wasPointerClicked(button = 0): boolean  { return clicked.has(button); }
export function wasPointerReleased(button = 0): boolean { return released.has(button); }
export function pointerX(): number { return posX; }
export function pointerY(): number { return posY; }

export function clearFramePointer(): void {
  clicked.clear();
  released.clear();
}
