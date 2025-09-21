import { createSyncFn } from "unasync";
import Worker from "web-worker";

const worker = new Worker(new URL("./worker.js", import.meta.url), {
  type: "module",
});
export const tex2svg = createSyncFn(worker);
