import "./style.css";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctxOrNull = canvas.getContext("2d");
if (!ctxOrNull) throw new Error("2D canvas context not found");
const ctx = ctxOrNull;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function frame(_t: number) {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
