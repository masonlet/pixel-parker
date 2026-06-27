import { flushPointer    } from "@starweb-libs/engine/input/pointer.js";
import { flushKeyboard   } from "@starweb-libs/engine/input/keyboard.js";
import type { Audio      } from "@starweb-libs/audio/audio.js";
import type { FrameState } from "./types.ts";

export function transition(frame: FrameState, audio: Audio, fn?: () => void): FrameState {
  audio.playSound("button");
  fn?.();
  flushPointer();
  flushKeyboard();
  return frame;
}
