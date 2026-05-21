import { flushPointer    } from "web-engine/input/pointer.ts";
import { flushKeyboard   } from "web-engine/input/keyboard.ts";
import { playSound       } from "web-engine/audio/playback.ts";
import type { FrameState } from "./types";

export function transition(frame: FrameState, fn?: () => void): FrameState {
  playSound("button");
  fn?.();

  flushPointer();
  flushKeyboard();

  return frame;
}
