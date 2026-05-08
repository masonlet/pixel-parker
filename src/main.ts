import "./style.css";

import { startLoop } from "web-engine/update.ts";
import { wasPressed } from "web-engine/input/keyboard.ts";
import { registerSound, playSound } from "web-engine/audio.ts";

import { bootstrapGame } from "./game/game.ts";
import type { GameState } from "./game/types.ts";
import { createPlayState, updatePlay } from "./game/play.ts";
import { renderFrame } from "./game/render.ts";

import { loadCampaign } from "./campaign/load.ts";

const { canvas, ctx } = bootstrapGame();

await registerSound("button", "audio/ui/button.wav");
await registerSound("win", "audio/ui/win.wav");

const campaign = await loadCampaign("test");
const playState = createPlayState(campaign);

let state = "title" as GameState;

startLoop(
  (dt) => {
    if (wasPressed("Escape")) {
      if      (state === "playing") state = "paused";
      else if (state === "paused")  state = "playing";
    }
    if (state !== "playing") return;
    if (updatePlay(playState, dt)) {
      playSound("win");
      state = "won";
    }
  },
  () => {
    state = renderFrame(ctx, canvas, playState, state);
  },
);
