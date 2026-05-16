import { playSound } from "web-engine/audio/playback.ts";
import { wasPressed } from "web-engine/input/keyboard.ts";

import type { PlayState, GameState } from "./types.ts";
import { renderPlayState, selectLevel, updatePlayState, resetPlayState } from "./play.ts";

import { drawTitleMenu } from "../ui/title.ts";
import { drawSettingsMenu } from "../ui/settings.ts";
import { drawLevelSelect } from "../ui/levels.ts";
import { updatePauseMenu, drawPauseMenu } from "../ui/pause.ts";
import { drawWonMenu } from "../ui/won.ts";

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
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  if (state === "menu-title") {
    const { startClicked, settingsClicked } = drawTitleMenu(ctx, W, H);
    if (startClicked)    { playSound("button"); return playState.levels.length > 1 ? "menu-levels" : "level-playing"; }
    if (settingsClicked) { playSound("button"); return "menu-settings"; }
    return state;
  }

  if (state === "menu-settings") {
    const { backClicked } = drawSettingsMenu(ctx, canvas.width, H);
    if (backClicked) { playSound("button"); state = "menu-title"; }
    return state;
  }

  if (state === "menu-levels"){
    const { clickedIndex, backClicked } = drawLevelSelect(ctx, playState.levels, W, H);
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
  ) renderPlayState(ctx, playState, W, H);

  if (state === "level-paused") {
    const pauseAction = updatePauseMenu(W, H);
    drawPauseMenu(ctx, W, H, pauseAction);
    if (pauseAction.action === "resume") { playSound("button"); return "level-playing"; }
    if (pauseAction.action === "quit")   { playSound("button"); return "menu-title";   }
    if (pauseAction.action === "restart") {
      playSound("button");
      resetPlayState(playState);
      return "level-playing";
    }
  }

  if (state === "level-won") {
    const action = drawWonMenu(ctx, W, H, playState.levelIndex < playState.levels.length - 1);
    if (action === "quit") { playSound("button"); return "menu-title"; }
    if (action === "next") { playSound("button"); selectLevel(playState, playState.levelIndex + 1); return "level-playing"; }
    if (action === "restart") {
      playSound("button");
      resetPlayState(playState);
      return "level-playing";
    }
  }

  return state;
}
