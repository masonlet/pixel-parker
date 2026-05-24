import "./style.css";

import { startLoop } from "web-engine/update.ts";
import { Audio     } from "web-engine/audio.ts";

import { bootstrapGame   } from "./scripts/game/game.ts";
import type { FrameState } from "./scripts/game/types.ts";
import { createPlayState } from "./scripts/game/play.ts";
import { updateFrame, renderFrame } from "./scripts/game/frame.ts";

import { loadCampaign } from "./scripts/campaign/load.ts";

const BASE_URL = import.meta.env.BASE_URL;

const { canvas, ctx } = bootstrapGame();

const audio = new Audio();
audio.init();
await audio.registerSound("button", "audio/ui/button.wav", BASE_URL);
await audio.registerSound("win", "audio/ui/win.wav", BASE_URL);

const campaign = await loadCampaign("test");
const playState = createPlayState(campaign);
let frame: FrameState = { game: "menu-title", ui: null };

startLoop(
  (dt) => { frame = updateFrame(canvas, frame, playState, dt); },
  (  ) => { renderFrame(ctx, canvas, playState, frame);        },
  { tickRate: "variable", maxDelta: 250 },
);
