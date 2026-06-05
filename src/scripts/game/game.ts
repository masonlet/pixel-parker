import { createGameCanvas } from "starweb-engine/canvas.js";
import { initKeyboard     } from "starweb-engine/input/keyboard.js";
import { initPointer      } from "starweb-engine/input/pointer.js";
import { Audio            } from "starweb-audio/audio.js";

export function bootstrapGame() {
  const { canvas, ctx } = createGameCanvas();

  initKeyboard();
  initPointer(canvas);

  const audio = new Audio();
  audio.init();

  return { canvas, ctx, audio };
}
