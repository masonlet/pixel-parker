import { createGameCanvas } from "@starweb-libs/engine/canvas.js";
import { initKeyboard     } from "@starweb-libs/engine/input/keyboard.js";
import { initPointer      } from "@starweb-libs/engine/input/pointer.js";
import { Audio            } from "@starweb-libs/audio/audio.js";

export function bootstrapGame() {
  const { canvas, ctx, size } = createGameCanvas();

  initKeyboard();
  initPointer(canvas);

  const audio = new Audio();
  audio.init();

  return { canvas, ctx, size, audio };
}
