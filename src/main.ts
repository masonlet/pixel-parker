import "./style.css";

import { createGameCanvas } from "./engine/canvas.ts";
import { startLoop } from "./engine/update.ts";
import { initKeyboard, wasPressed } from "./engine/input/keyboard.ts";
import { initMouse } from "./engine/input/mouse.ts";

import type { GameState } from "./game/state.ts";
import { type PlayState, updatePlay, renderPlay, spawnVehicles } from "./game/play.ts";

import { drawTitleMenu } from "./game/ui/title.ts";
import { drawSettingsMenu } from "./game/ui/settings.ts";
import { drawPauseMenu } from "./game/ui/pause.ts";
import { drawWonMenu } from "./game/ui/won.ts";

import { loadCampaign } from "./game/campaign/load.ts";

const { canvas, ctx } = createGameCanvas();
initKeyboard();
initMouse(canvas);

const campaign = await loadCampaign("test");

const playState: PlayState = {
  levels: campaign.levels,
  levelIndex: 0,
  level: campaign.levels[0]!,
  vehicleTypes: campaign.vehicleTypes,
  vehicles: spawnVehicles(campaign.levels[0]!, campaign.vehicleTypes),
  vehicleIndex: 0,
  debugMode: false,
};

let state = "title" as GameState;

startLoop(
  (dt) => {
    if (wasPressed("Escape")) {
      if (state === "playing") state = "paused";
      else if (state === "paused") state = "playing";
    }
    if (state !== "playing") return;
    if (updatePlay(playState, dt)) state = "won";
  },
  () => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (state === "title") {
      const { startClicked, settingsClicked } = drawTitleMenu(ctx, canvas.width, canvas.height);
      if (startClicked) state = "playing";
      if (settingsClicked) state = "settings";
      return;
    }
    if (state === "settings") {
      const { backClicked } = drawSettingsMenu(ctx, canvas.width, canvas.height);
      if (backClicked) state = "title";
      return;
    }
    if (state === "playing" || state === "paused" || state === "won")
      renderPlay(ctx, playState, canvas.width, canvas.height);

    if (state === "paused") {
      const action = drawPauseMenu(ctx, canvas.width, canvas.height);
      if (action === "resume") state = "playing";
      if (action === "restart") {
        playState.vehicles = spawnVehicles(playState.level, playState.vehicleTypes);
        playState.vehicleIndex = 0;
        state = "playing";
      }
      if (action === "quit") state = "title";
    }

    if (state === "won") {
      const action = drawWonMenu(ctx, canvas.width, canvas.height);
      if (action === "restart") {
        playState.vehicles = spawnVehicles(playState.level, playState.vehicleTypes);
        playState.vehicleIndex = 0;
        state = "playing";
      }
      if (action === "quit") state = "title";
    }
  },
);
