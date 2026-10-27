import { AVATAR_PIXELS, type CropRect } from "./index";

function canvas(size: number) {
  const element = document.createElement("canvas");
  element.width = size;
  element.height = size;
  return element;
}

function draw(source: CanvasImageSource, rect: CropRect, size: number) {
  const target = canvas(size);
  const context = target.getContext("2d");
  if (!context) return null;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, rect.x, rect.y, rect.size, rect.size, 0, 0, size, size);
  return target;
}

function encode(source: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => source.toBlob(resolve, type, quality));
}

export async function loadImage(file: File) {
  if (typeof createImageBitmap !== "function") return null;
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return null;
  }
}

export async function renderAvatar(bitmap: ImageBitmap, rect: CropRect): Promise<Blob | null> {
  let source: CanvasImageSource = bitmap;
  let area = rect;
  while (area.size / 2 >= AVATAR_PIXELS) {
    const size = Math.round(area.size / 2);
    const step = draw(source, area, size);
    if (!step) return null;
    source = step;
    area = { x: 0, y: 0, size };
  }
  const result = draw(source, area, AVATAR_PIXELS);
  if (!result) return null;
  const webp = await encode(result, "image/webp", 0.86);
  if (webp?.type === "image/webp") return webp;
  const flat = canvas(AVATAR_PIXELS);
  const context = flat.getContext("2d");
  if (!context) return null;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, AVATAR_PIXELS, AVATAR_PIXELS);
  context.drawImage(result, 0, 0);
  return encode(flat, "image/jpeg", 0.9);
}
