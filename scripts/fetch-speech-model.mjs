import { env } from "@huggingface/transformers";
import { KokoroTTS } from "kokoro-js";

const directory = process.env.TTS_MODEL_DIR;
if (!directory) throw new Error("TTS_MODEL_DIR is required");
env.cacheDir = directory;

const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
for (const voice of ["af_heart", "bf_emma"]) {
  const audio = await tts.generate("Ready.", { voice });
  console.log(`${voice}: ${(audio.audio.length / audio.sampling_rate).toFixed(2)}s`);
}
