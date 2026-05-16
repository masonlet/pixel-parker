import { playSound } from "web-engine/audio/playback.ts";
import { wasPressed } from "web-engine/input/keyboard.ts";

import type { PlayState, GameState } from "./types.ts";
import { renderPlayState, selectLevel, updatePlayState, resetPlayState } from "./play.ts";

import { updateTitleMenu, drawTitleMenu } from "../ui/title.ts";
import { updateSettingsMenu, drawSettingsMenu } from "../ui/settings.ts";
import { drawLevelSelect } from "../ui/levels.ts";
import { updatePauseMenu, drawPauseMenu } from "../ui/pause.ts";
import { updateWonMenu, drawWonMenu } from "../ui/won.ts";

export function updateFrame(
  state: GameState,
  playState: PlayState,
  dt: number
): GameState {
  if (wasPressed("Escape")) {
    if      (state === "level-playing") return "level-paused";
    else if (state === "level-paused")  return "level-playing";
  }
  if (state !== "level-playing") return state;
  if (updatePlayState(playState, dt)) {
    playSound("win");
    return "level-won";
  }

  return state;
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  playState: PlayState,
  state: GameState
): GameState {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state === "menu-title") {
    const titleState = updateTitleMenu(canvas.width, canvas.height);
    drawTitleMenu(ctx, canvas.width, canvas.height, titleState);
    if (titleState.start.state.clicked) {
      playSound("button");
      return playState.levels.length > 1 ? "menu-levels" : "level-playing";
    }
    if (titleState.settings.state.clicked) {
      playSound("button");
      return "menu-settings";
    }
    return state;
  }

  if (state === "menu-settings") {
    const settingsState = updateSettingsMenu(canvas.width, canvas.height);
    drawSettingsMenu(ctx, canvas.width, canvas.height, settingsState);
    if (settingsState.back.state.clicked) { playSound("button"); return "menu-title"; }
    return state;
  }

  if (state === "menu-levels"){
    const { clickedIndex, backClicked } = drawLevelSelect(ctx, playState.levels, canvas.width, canvas.height);
    if (backClicked) { playSound("button"); return "menu-title"; }
    if (clickedIndex !== null) {
      playSound("button");
      selectLevel(playState, clickedIndex);
      return "level-playing";
    }
    return state;
  }

  if (state === "level-playing"
   || state === "level-paused"
   || state === "level-won"
  ) renderPlayState(ctx, playState, canvas.width, canvas.height);

  if (state === "level-paused") {
    const pauseState = updatePauseMenu(canvas.width, canvas.height);
    drawPauseMenu(ctx, canvas.width, canvas.height, pauseState);
    if (pauseState.action === "resume") { playSound("button"); return "level-playing"; }
    if (pauseState.action === "quit")   { playSound("button"); return "menu-title";   }
    if (pauseState.action === "restart") {
      playSound("button");
      resetPlayState(playState);
      return "level-playing";
    }
  }

  if (state === "level-won") {
    const wonState = updateWonMenu(canvas.width, canvas.height, playState.levelIndex < playState.levels.length - 1);
    drawWonMenu(ctx, canvas.width, canvas.height, wonState);
    if (wonState.action === "quit") {
      playSound("button");
      return "menu-title";
    }
    if (wonState.action === "next") {
      playSound("button");
      selectLevel(playState, playState.levelIndex + 1);
      return "level-playing";
    }
    if (wonState.action === "restart") {
      playSound("button");
      resetPlayState(playState);
      return "level-playing";
    }
  }

  return state;
}
