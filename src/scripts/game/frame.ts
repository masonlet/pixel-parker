import { playSound  } from "web-engine/audio/playback.ts";
import { wasPressed } from "web-engine/input/keyboard.ts";

import type { PlayState, FrameState       } from "./types.ts";
import { renderPlayState, updatePlayState } from "./play.ts";

import { drawTitleMenu, handleTitleFrame       } from "../ui/title.ts";
import { drawSettingsMenu, handleSettingsFrame } from "../ui/settings.ts";
import { drawLevelSelect, handleLevelFrame     } from "../ui/levels.ts";
import { drawPauseMenu, handlePauseFrame       } from "../ui/pause.ts";
import { drawWonMenu, handleWonFrame           } from "../ui/won.ts";

export function updateFrame(
  canvas: HTMLCanvasElement,
  frame: FrameState | null,
  playState: PlayState,
  dt: number
): FrameState {
  const { width: w, height: h } = canvas;

  if (frame === null) return { game: "menu-title", ui: null };

  if (wasPressed("Escape")) {
    if (frame.game === "level-playing") return { game: "level-paused",  ui: null };
    if (frame.game === "level-paused")  return { game: "level-playing", ui: null };
  }

  if (frame.game === "level-playing") {
    if (updatePlayState(playState, dt)) {
      playSound("win");
      return { game: "level-won", ui: null };
    }
    return frame;
  }

  switch (frame.game) {
    case "menu-title":    return handleTitleFrame   (w, h, playState);
    case "menu-levels":   return handleLevelFrame   (w, h, playState);
    case "menu-settings": return handleSettingsFrame(w, h);
    case "level-paused":  return handlePauseFrame   (w, h, playState);
    case "level-won":     return handleWonFrame     (w, h, playState)
  }
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  playState: PlayState,
  frame: FrameState
): void {
  const { width: w, height: h } = canvas;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  if (frame.game === "level-playing"
   || frame.game === "level-paused"
   || frame.game === "level-won"
  ) renderPlayState(ctx, playState, w, h);

  switch (frame.game) {
    case "menu-title":    if (frame.ui) drawTitleMenu   (ctx, w, h, frame.ui); break;
    case "menu-settings": if (frame.ui) drawSettingsMenu(ctx, w, h, frame.ui); break;
    case "menu-levels":   if (frame.ui) drawLevelSelect (ctx, w, h, frame.ui); break;
    case "level-paused":  if (frame.ui) drawPauseMenu   (ctx, w, h, frame.ui); break;
    case "level-won":     if (frame.ui) drawWonMenu     (ctx, w, h, frame.ui); break;
  }
}
