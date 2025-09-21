import { createSyncFn } from "unasync";
import Worker from "web-worker";


export const createTex2svg = () => {
  const worker = new Worker(new URL("./worker.js", import.meta.url), {
    type: "module",
  });
  return createSyncFn(worker);
}
