import { playSound } from "web-engine/audio.ts";
import { wasPressed } from "web-engine/input/keyboard.ts";

import type { PlayState, GameState } from "./types.ts";
import { renderPlayState, updatePlayState, resetPlayState } from "./play.ts";

import { drawTitleMenu } from "../ui/title.ts";
import { drawSettingsMenu } from "../ui/settings.ts";
import { drawPauseMenu } from "../ui/pause.ts";
import { drawWonMenu } from "../ui/won.ts";

export function updateFrame(
  state: GameState,
  playState: PlayState,
  dt: number
): GameState {
  if (wasPressed("Escape")) {
    if      (state === "playing") return "paused";
    else if (state === "paused")  return "playing";
  }
  if (state !== "playing") return state;
  if (updatePlayState(playState, dt)) {
    playSound("win");
    return "won";
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

  if (state === "title") {
    const { startClicked, settingsClicked } = drawTitleMenu(ctx, canvas.width, canvas.height);
    if (startClicked)    { playSound("button"); return "playing";  }
    if (settingsClicked) { playSound("button"); return "settings"; }
    return state;
  }

  if (state === "settings") {
    const { backClicked } = drawSettingsMenu(ctx, canvas.width, canvas.height);
    if (backClicked) { playSound("button"); state = "title"; }
    return state;
  }

  if (state === "playing"
   || state === "paused"
   || state === "won"
  ) renderPlayState(ctx, playState, canvas.width, canvas.height);

  if (state === "paused") {
    const action = drawPauseMenu(ctx, canvas.width, canvas.height);
    if (action === "resume") { playSound("button"); return "playing"; }
    if (action === "quit")   { playSound("button"); return "title";   }
    if (action === "restart") {
      playSound("button");
      resetPlayState(playState);
      return "playing";
    }
  }

  if (state === "won") {
    const action = drawWonMenu(ctx, canvas.width, canvas.height);
    if (action === "quit") { playSound("button"); return "title"; }
    if (action === "restart") {
      playSound("button");
      resetPlayState(playState);
      return "playing";
    }
  }

  return state;
}
