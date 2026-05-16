import { playSound } from "web-engine/audio/playback.ts";
import { wasPressed } from "web-engine/input/keyboard.ts";

import type { PlayState, FrameState } from "./types.ts";
import { renderPlayState, selectLevel, updatePlayState, resetPlayState } from "./play.ts";

import { updateTitleMenu,    drawTitleMenu    } from "../ui/title.ts";
import { updateSettingsMenu, drawSettingsMenu } from "../ui/settings.ts";
import { updateLevelSelect,  drawLevelSelect  } from "../ui/levels.ts";
import { updatePauseMenu,    drawPauseMenu    } from "../ui/pause.ts";
import { updateWonMenu,      drawWonMenu      } from "../ui/won.ts";

function button(frame: FrameState): FrameState { playSound("button"); return frame; }

export function updateFrame(
  canvas: HTMLCanvasElement,
  frame: FrameState | null,
  playState: PlayState,
  dt: number
): FrameState {
  const { width: w, height: h } = canvas;

  if (frame === null) return { game: "menu-title", ui: updateTitleMenu(w, h) };

  if (wasPressed("Escape")) {
    if (frame.game === "level-playing") return { game: "level-paused",  ui: updatePauseMenu(w, h) };
    if (frame.game === "level-paused")  return { game: "level-playing", ui: null };
  }

  if (frame.game === "level-playing") {
    if (updatePlayState(playState, dt)) {
      playSound("win");
      return {
        game: "level-won",
        ui: updateWonMenu(w, h, playState.levelIndex < playState.levels.length - 1)
      };
    }
    return frame;
  }

  switch (frame.game) {
    case "menu-title": {
      const ui = updateTitleMenu(w, h);
      if (ui.start.state.clicked) return button(playState.levels.length > 1
        ? { game: "menu-levels", ui: updateLevelSelect(w, h, playState.levels) }
        : { game: "level-playing", ui: null });
      if (ui.settings.state.clicked) return button({
        game: "menu-settings",
        ui: updateSettingsMenu(w, h)
      });
      return { game: "menu-title", ui };
    }
    case "menu-settings": {
      const ui = updateSettingsMenu(w, h);
      if (ui.back.state.clicked) return button({
        game: "menu-title",
        ui: updateTitleMenu(w, h)
      });
      return { game: "menu-settings", ui };
    }
    case "menu-levels": {
      const ui = updateLevelSelect(w, h, playState.levels);
      if (ui.back.state.clicked) return button({ game: "menu-title", ui: updateTitleMenu(w, h) });
      if (ui.clickedIndex !== null) {
        selectLevel(playState, ui.clickedIndex);
        return button({ game: "level-playing", ui: null });
      }
      return { game: "menu-levels", ui };
    }
    case "level-paused": {
      const ui = updatePauseMenu(w, h);
      if (ui.action === "resume") return button({ game: "level-playing", ui: null });
      if (ui.action === "quit") return button({ game: "menu-title", ui: updateTitleMenu(w, h) });
      if (ui.action === "restart") {
        resetPlayState(playState);
        return button({ game: "level-playing", ui: null });
      }
      return { game: "level-paused", ui };
    }
    case "level-won": {
      const ui = updateWonMenu(w, h, playState.levelIndex < playState.levels.length - 1);
      if (ui.action === "quit") return button({ game: "menu-title", ui: updateTitleMenu(w, h) });
      if (ui.action === "next") {
        selectLevel(playState, playState.levelIndex + 1);
        return button({ game: "level-playing", ui: null });
      }
      if (ui.action === "restart") {
        resetPlayState(playState);
        return button({ game: "level-playing", ui: null });
      }
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
