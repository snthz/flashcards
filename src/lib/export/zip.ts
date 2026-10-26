import { Zip, ZipDeflate, ZipPassThrough } from "fflate";
import { readMediaFile } from "@/lib/media";
import type { ExportBundle } from "./collect";

export function apkgStream(collection: Uint8Array, media: ExportBundle["media"]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const zip = new Zip((error, chunk, final) => {
        if (error) {
          controller.error(error);
          return;
        }
        controller.enqueue(chunk);
        if (final) controller.close();
      });
      const run = async () => {
        const collectionEntry = new ZipDeflate("collection.anki2", { level: 6 });
        zip.add(collectionEntry);
        collectionEntry.push(collection, true);
        const manifest: Record<string, string> = {};
        for (const file of media) {
          const data = await readMediaFile(file.path);
          if (!data) continue;
          manifest[String(file.index)] = file.name;
          const entry = new ZipPassThrough(String(file.index));
          zip.add(entry);
          entry.push(new Uint8Array(data), true);
        }
        const manifestEntry = new ZipDeflate("media", { level: 6 });
        zip.add(manifestEntry);
        manifestEntry.push(new TextEncoder().encode(JSON.stringify(manifest)), true);
        zip.end();
      };
      run().catch((error) => controller.error(error));
    },
  });
}
