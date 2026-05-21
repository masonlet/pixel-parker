import { playSound  } from "web-engine/audio/playback.ts";
import { wasPressed } from "web-engine/input/keyboard.ts";

import type { PlayState, FrameState       } from "./types.ts";
import { renderPlayState, updatePlayState } from "./play.ts";
import { transition                       } from "./transition.ts";

import { handleTitleFrame, renderTitleFrame       } from "../ui/title.ts";
import { renderSettingsFrame, handleSettingsFrame } from "../ui/settings.ts";
import { renderLevelFrame,    handleLevelFrame    } from "../ui/levels.ts";
import { renderPauseFrame, handlePauseFrame       } from "../ui/pause.ts";
import { renderWonFrame, handleWonFrame           } from "../ui/won.ts";

function handlePlayingFrame(frame: FrameState, playState: PlayState, dt: number): FrameState {
  if (updatePlayState(playState, dt)) {
    playSound("win");
    return { game: "level-won", ui: null };
  }
  return frame;
}

export function updateFrame(
  canvas: HTMLCanvasElement,
  frame: FrameState,
  playState: PlayState,
  dt: number
): FrameState {
  if (wasPressed("Escape"))  {
    if (frame.game === "level-playing") return transition({ game: "level-paused",  ui: null });
    if (frame.game === "level-paused")  return transition({ game: "level-playing", ui: null });
  }

  const { width: w, height: h } = canvas;
  switch (frame.game) {
    case "menu-title":    return handleTitleFrame   (w, h, playState);
    case "menu-levels":   return handleLevelFrame   (w, h, playState);
    case "menu-settings": return handleSettingsFrame(w, h);
    case "level-playing": return handlePlayingFrame (frame, playState, dt);
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

  if (!frame.game.startsWith("menu-")) renderPlayState(ctx, playState, w, h);

  switch (frame.game) {
    case "menu-title":    renderTitleFrame   (ctx, frame.ui); break;
    case "menu-settings": renderSettingsFrame(ctx, frame.ui); break;
    case "menu-levels":   renderLevelFrame   (ctx, frame.ui); break;
    case "level-paused":  renderPauseFrame   (ctx, w, h, frame.ui); break;
    case "level-won":     renderWonFrame     (ctx, w, h, frame.ui); break;
  }
}
