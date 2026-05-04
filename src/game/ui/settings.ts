import { getLayout } from "./layout.ts";
import { type Button, drawButton, isHovered, isClicked } from "./button.ts";
import { isMuted, setMuted } from "../../engine/audio.ts";

export function drawSettingsMenu(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
): { backClicked: boolean } {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const { scale, gap, cx, cy, btnW, btnH } = getLayout(canvasW, canvasH);

  const titleSize = Math.floor(scale * 0.1);
  const titleY = scale * 0.15;
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${titleSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Settings", cx, titleY);

  const muteBtn: Button = {
    x: cx - btnW / 2,
    y: cy - btnH / 2,
    w: btnW, h: btnH,
    label: isMuted() ? "Unmute" : "Mute",
  };
  drawButton(ctx, muteBtn, isHovered(muteBtn));
  if (isClicked(muteBtn)) setMuted(!isMuted());

  const backBtn: Button = {
    x: cx - btnW / 2,
    y: canvasH - btnH - gap * 2,
    w: btnW, h: btnH,
    label: "Back"
  };
  drawButton(ctx, backBtn, isHovered(backBtn));

  return { backClicked: isClicked(backBtn) };
}
