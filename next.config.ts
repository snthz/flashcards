import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["sql.js", "kokoro-js", "@huggingface/transformers", "onnxruntime-node", "phonemizer"],
  outputFileTracingIncludes: {
    "/api/speech": ["./node_modules/kokoro-js/voices/af_heart.bin", "./node_modules/kokoro-js/voices/bf_emma.bin", "./node_modules/onnxruntime-node/bin/napi-v3/linux/**/*"],
    "/api/import": ["./node_modules/sql.js/dist/sql-wasm.wasm"],
    "/api/export": ["./node_modules/sql.js/dist/sql-wasm.wasm"],
    "/decks/\\[id\\]/options": ["./node_modules/@open-spaced-repetition/**/*"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

export default withSerwist(nextConfig);
