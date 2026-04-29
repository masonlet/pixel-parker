const keys = new Set<string>();

window.addEventListener("keydown", (e) => {
  keys.add(e.code);
});
window.addEventListener("keyup", (e) => {
  keys.delete(e.code);
});
window.addEventListener("blur", () => {
  keys.clear();
});

export function isDown(code: string): boolean {
  return keys.has(code);
}
