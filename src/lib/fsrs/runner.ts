import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import type { TrainingReview } from "./history";

const TIMEOUT_MS = 5 * 60_000;

const SCRIPT = `
const { computeParameters, FSRSBinding, FSRSBindingItem, FSRSBindingReview } = require(process.argv[1]);
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", async () => {
  try {
    const { items, current, numRelearningSteps } = JSON.parse(input);
    const train = items.map((reviews) => new FSRSBindingItem(reviews.map((review) => new FSRSBindingReview(review.rating, review.deltaT))));
    const weights = await computeParameters(train, { enableShortTerm: true, numRelearningSteps });
    const evaluate = (parameters) => {
      const result = new FSRSBinding(parameters).evaluate(train);
      return { logLoss: result.logLoss, rmse: result.rmseBins };
    };
    let before;
    try {
      before = evaluate(current ?? undefined);
    } catch {
      before = evaluate(undefined);
    }
    process.stdout.write(JSON.stringify({ weights, before, after: evaluate(weights) }));
  } catch (error) {
    process.stdout.write(JSON.stringify({ error: String(error && error.message ? error.message : error) }));
  }
});
`;

export interface TrainingOutput {
  weights: number[];
  before: { logLoss: number; rmse: number };
  after: { logLoss: number; rmse: number };
}

function bindingPath() {
  return createRequire(path.join(process.cwd(), "package.json")).resolve("@open-spaced-repetition/binding");
}

export function trainInChildProcess(items: TrainingReview[][], current: number[] | null, numRelearningSteps: number) {
  return new Promise<TrainingOutput | { error: string }>((resolve) => {
    const child = spawn(process.execPath, ["-e", SCRIPT, bindingPath()], { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => child.kill("SIGKILL"), TIMEOUT_MS);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => (stdout += chunk));
    child.stderr.on("data", (chunk: string) => (stderr += chunk.slice(0, 2000)));
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ error: error.message });
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      try {
        resolve(JSON.parse(stdout) as TrainingOutput | { error: string });
      } catch {
        resolve({ error: `optimizer exited with ${signal ?? code}: ${stderr.split("\n").find((line) => line.includes("panicked") || line.includes("Error")) ?? ""}` });
      }
    });
    child.stdin.end(JSON.stringify({ items, current, numRelearningSteps }));
  });
}
