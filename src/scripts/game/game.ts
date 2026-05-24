import { createGameCanvas } from "web-engine/canvas.ts";
import { initKeyboard     } from "web-engine/input/keyboard.ts";
import { initPointer      } from "web-engine/input/pointer.ts";
import { Audio            } from "web-engine/audio.ts";

export function bootstrapGame() {
  const { canvas, ctx } = createGameCanvas();

  initKeyboard();
  initPointer(canvas);

  const audio = new Audio();
  audio.init();

  return { canvas, ctx, audio };
}
