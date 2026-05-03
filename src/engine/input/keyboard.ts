const keys = new Set<string>();
const pressedThisFrame = new Set<string>();

export function initKeyboard(): void {
  window.addEventListener("keydown", (e) => {
    if (!keys.has(e.code)) pressedThisFrame.add(e.code);
    keys.add(e.code);
  });
  window.addEventListener("keyup", (e) => {
    keys.delete(e.code);
  });
  window.addEventListener("blur", () => {
    keys.clear();
  });
}

export function isDown(code: string): boolean     { return keys.has(code); }
export function wasPressed(code: string): boolean {
  if (pressedThisFrame.has(code)) {
    pressedThisFrame.delete(code);
    return true;
  }
  return false;
}
