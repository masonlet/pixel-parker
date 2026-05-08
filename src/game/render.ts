import { playSound } from "web-engine/audio.ts";

import type { PlayState, GameState } from "./types.ts";

import { drawLevel } from "../level/render.ts";

import { drawTitleMenu } from "../ui/title.ts";
import { drawSettingsMenu } from "../ui/settings.ts";
import { drawPauseMenu } from "../ui/pause.ts";
import { drawWonMenu } from "../ui/won.ts";

import { drawVehicle } from "../vehicle/render.ts";

import { drawWallAabbs, drawOBB, drawSensors } from "../physics/debug.ts";

import { resetPlayState } from "./play.ts";

export function renderPlay(
  ctx: CanvasRenderingContext2D,
  p: PlayState,
  canvasW: number,
  canvasH: number,
): void {
  const active = p.vehicles[p.vehicleIndex];
  if (!active) return;

  const camX = active.body.position.x - canvasW / 2;
  const camY = active.body.position.y - canvasH / 2;

  drawLevel(ctx, p.level, camX, camY);
  for (const v of p.vehicles) drawVehicle(ctx, v, camX, camY);

  if (p.debugMode) {
    drawWallAabbs(ctx, p.level, camX, camY, canvasW, canvasH);
    for (const v of p.vehicles) {
      drawOBB(ctx, {
        cx: v.body.position.x,
        cy: v.body.position.y,
        hw: v.body.w / 2,
        hh: v.body.h / 2,
        angle: v.body.angle,
      }, camX, camY, `hsl(${v.hue}, 100%, 50%)`);
    }
    drawSensors(ctx, p.level, camX, camY, p.vehicles, active);
  }
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
  ) renderPlay(ctx, playState, canvas.width, canvas.height);

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
