import "./style.css";
import { bootstrapGame            } from "@starweb-libs/engine/bootstrap.js";
import { Audio                    } from "@starweb-libs/audio/audio.js";
import { startLoop                } from "@starweb-libs/engine/update.js";
import type { FrameState          } from "./scripts/game/types.ts";
import { createPlayState          } from "./scripts/game/play.ts";
import { updateFrame, renderFrame } from "./scripts/game/frame.ts";
import { loadCampaign             } from "./scripts/campaign/load.ts";

const { ctx, size } = bootstrapGame();

const audio = new Audio();
audio.init();

const BASE_URL = import.meta.env.BASE_URL;
await audio.registerSound("button", "audio/ui/button.wav", BASE_URL);
await audio.registerSound("win", "audio/ui/win.wav", BASE_URL);

const campaign = await loadCampaign("test", audio);
const playState = createPlayState(campaign, audio);
let frame: FrameState = { game: "menu-title", ui: null };

startLoop(
  (dt) => { frame = updateFrame(size, frame, playState, audio, dt); },
  (  ) => { renderFrame(ctx, size, playState, frame);               },
  { tickRate: "variable", maxDelta: 250, pauseOnHidden: true },
);
