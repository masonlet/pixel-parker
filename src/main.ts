import "./style.css";

import { startLoop } from "web-engine/update.ts";
import { registerSound } from "web-engine/audio.ts";

import { bootstrapGame } from "./game/game.ts";
import type { GameState } from "./game/types.ts";
import { createPlayState } from "./game/play.ts";
import { updateFrame, renderFrame } from "./game/frame.ts";

import { loadCampaign } from "./campaign/load.ts";

const { canvas, ctx } = bootstrapGame();

await registerSound("button", "audio/ui/button.wav");
await registerSound("win", "audio/ui/win.wav");

const campaign = await loadCampaign("test");
const playState = createPlayState(campaign);
let state = "title" as GameState;

startLoop(
  (dt) => { state = updateFrame(state, playState, dt);          },
  (  ) => { state = renderFrame(ctx, canvas, playState, state); },
);
