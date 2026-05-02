const down = new Set<number>();
const clicked = new Set<number>();
const released = new Set<number>();

let canvasRef: HTMLCanvasElement | null = null;
let posX = 0;
let posY = 0;

export function initMouse(canvas: HTMLCanvasElement): void {
  canvasRef = canvas;

  window.addEventListener("mousedown", (e) => {
    if (!down.has(e.button)) clicked.add(e.button);
    down.add(e.button);
  });

  window.addEventListener("mouseup", (e) => {
    down.delete(e.button);
    released.add(e.button);
  });

  window.addEventListener("mousemove", (e) => {
    if (!canvasRef) return;
    const rect = canvasRef.getBoundingClientRect();
    const scaleX = canvasRef.width / rect.width;
    const scaleY = canvasRef.height / rect.height;
    posX = (e.clientX - rect.left) * scaleX;
    posY = (e.clientY - rect.top) * scaleY;
  });

  window.addEventListener("blur", () => {
    down.clear();
  });
}

export function isMouseDown(button = 0): boolean      { return down.has(button); }
export function wasMouseClicked(button = 0): boolean  { return clicked.has(button); }
export function wasMouseReleased(button = 0): boolean { return released.has(button); }

export function mouseX(): number { return posX; }
export function mouseY(): number { return posY; }

export function clearFrameMouse(): void {
  clicked.clear();
  released.clear();
}
