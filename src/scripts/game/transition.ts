import { flushPointer    } from "web-engine/input/pointer.ts";
import { flushKeyboard   } from "web-engine/input/keyboard.ts";
import type { Audio      } from "web-engine/audio.ts";
import type { FrameState } from "./types.ts";

export function transition(frame: FrameState, audio: Audio, fn?: () => void): FrameState {
  audio.playSound("button");
  fn?.();
  flushPointer();
  flushKeyboard();
  return frame;
}
