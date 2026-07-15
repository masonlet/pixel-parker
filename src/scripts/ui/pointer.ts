import {
  pointerX,
  pointerY,
  wasPointerClicked,
  isPointerDown
} from "@starweb-libs/engine/input/pointer.js";

export function getPointer() {
  return { x: pointerX(), y: pointerY(), clicked: wasPointerClicked(), down: isPointerDown() };
}
