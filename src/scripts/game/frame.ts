import { playSound } from "web-engine/audio/playback.ts";
import { flushPointer } from "web-engine/input/pointer.ts";
import { wasPressed, flushKeyboard } from "web-engine/input/keyboard.ts";

import type { PlayState, FrameState } from "./types.ts";
import { renderPlayState, selectLevel, updatePlayState, resetPlayState } from "./play.ts";

import { updateTitleMenu,    drawTitleMenu    } from "../ui/title.ts";
import { updateSettingsMenu, drawSettingsMenu } from "../ui/settings.ts";
import { updateLevelSelect,  drawLevelSelect  } from "../ui/levels.ts";
import { updatePauseMenu,    drawPauseMenu    } from "../ui/pause.ts";
import { updateWonMenu,      drawWonMenu      } from "../ui/won.ts";

function transition(frame: FrameState, fn?: () => void): FrameState {
  playSound("button");
  fn?.();

  flushPointer();
  flushKeyboard();

  return frame;
}

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

  if (frame.ui === null) {
    switch (frame.game) {
      case "menu-title":    return { game: "menu-title",    ui: updateTitleMenu(w, h) };
      case "menu-settings": return { game: "menu-settings", ui: updateSettingsMenu(w, h) };
      case "menu-levels":   return { game: "menu-levels",   ui: updateLevelSelect(w, h, playState.levels) };
      case "level-paused":  return { game: "level-paused",  ui: updatePauseMenu(w, h) };
      case "level-won":     return { game: "level-won",     ui: updateWonMenu(w, h, playState.levelIndex < playState.levels.length - 1) };
    }
  }
  switch (frame.game) {
    case "menu-title": {
      const ui = updateTitleMenu(w, h);
      if (ui.start.state.clicked) return transition(playState.levels.length > 1
        ? { game: "menu-levels", ui: null }
        : { game: "level-playing", ui: null }
      );
      if (ui.settings.state.clicked) return transition({ game: "menu-settings", ui: null });
      return { game: "menu-title", ui };
    }
    case "menu-settings": {
      const ui = updateSettingsMenu(w, h);
      if (ui.back.state.clicked) return transition({ game: "menu-title", ui: null });
      return { game: "menu-settings", ui };
    }
    case "menu-levels": {
      const ui = updateLevelSelect(w, h, playState.levels);
      if (ui.back.state.clicked) return transition({ game: "menu-title",    ui: null });
      if (ui.clickedIndex !== null) {
        const index = ui.clickedIndex;
        return transition(
          { game: "level-playing", ui: null },
          () => selectLevel(playState, index)
        );
      }
      return { game: "menu-levels", ui };
    }
    case "level-paused": {
      const ui = updatePauseMenu(w, h);
      if (ui.action === "resume")  return transition({ game: "level-playing", ui: null });
      if (ui.action === "quit")    return transition({ game: "menu-title",    ui: null });
      if (ui.action === "restart") return transition(
        { game: "level-playing", ui: null },
        () => resetPlayState(playState)
      );
      return { game: "level-paused", ui };
    }
    case "level-won": {
      const ui = updateWonMenu(w, h, playState.levelIndex < playState.levels.length - 1);
      if (ui.action === "quit")    return transition({ game: "menu-title", ui: null });
      if (ui.action === "next")    return transition(
        { game: "level-playing", ui: null },
        () => selectLevel(playState, playState.levelIndex + 1)
      );
      if (ui.action === "restart") return transition(
        { game: "level-playing", ui: null },
        () => resetPlayState(playState)
      );
      return { game: "level-won", ui };
    }
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
