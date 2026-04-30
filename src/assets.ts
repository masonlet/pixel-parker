export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export function tintImage(
  source: HTMLImageElement,
  color: string,
): HTMLCanvasElement {
  const off = document.createElement("canvas");
  off.width = source.width;
  off.height = source.height;
  const c = off.getContext("2d");
  if (!c) throw new Error("Failed to get offscreen 2d context");

  c.drawImage(source, 0, 0);
  c.globalCompositeOperation = "source-in";
  c.fillStyle = color;
  c.fillRect(0, 0, off.width, off.height);

  return off;
}
