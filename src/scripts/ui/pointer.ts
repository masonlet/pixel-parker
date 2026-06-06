import { pointerX, pointerY, wasPointerClicked, isPointerDown } from "starweb-engine/input/pointer.js";

export function getPointer() {
  return { x: pointerX(), y: pointerY(), clicked: wasPointerClicked(), down: isPointerDown() };
}
