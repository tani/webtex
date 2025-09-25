/**
 * Integration test helper
 *
 * Authors:
 *   Andrés Zorro <zorrodg@gmail.com>
 *   Michael Brade <brade@kde.org>
 */

import {
  type ChildProcessWithoutNullStreams,
  spawn as spawnCmd,
} from "node:child_process";
import { existsSync } from "node:fs";
import { constants } from "node:os";

const PATH = process.env.PATH;

/**
 * Creates a child process with script path
 * @param {string} processPath Path of the process to execute
 * @param {Array} args Arguments to the command
 * @param {Object} env (optional) Environment variables
 */
function assertStreams(
  child: ReturnType<typeof spawnCmd>,
): child is ChildProcessWithoutNullStreams {
  return Boolean(child.stdin && child.stdout && child.stderr);
}

function createProcess(
  processPath: string,
  args: string[] = [],
  env: NodeJS.ProcessEnv | null = null,
): ChildProcessWithoutNullStreams {
  // ensure that path exists
  if (!processPath || !existsSync(processPath)) {
    throw new Error("Invalid process path");
  }

  args = [processPath].concat(args);

  // this works for node-based CLIs and has to be adjusted for other processes
  const child = spawnCmd("node", args, {
    env: Object.assign(
      {
        NODE_ENV: "test",
        PATH, // this is needed in order to get all the binaries in the current terminal
      },
      env,
    ),
    stdio: ["pipe", "pipe", "pipe", "ipc"], // create an IPC channel, enable subprocess.send()
  });

  if (!assertStreams(child)) {
    child.kill(constants.signals.SIGTERM);
    throw new Error("Expected child process streams to be available");
  }

  return child;
}

/**
 * Creates a command and executes inputs (user responses) to stdin.
 * Returns a promise that resolves when all inputs are sent.
 * Rejects the promise if an error occurs.
 * @param {string} processPath Path of the process to execute
 * @param {Array} args Arguments to the command
 * @param {Array} inputs (Optional) Array of inputs (user responses)
 * @param {Object} opts (optional) Environment variables
 */
interface ExecuteOptions {
  env?: NodeJS.ProcessEnv | null;
  timeout?: number;
  maxTimeout?: number;
}

interface ExecuteResult {
  stdout: string;
  stderr: string;
}

interface AttachedProcessPromise<T> extends Promise<T> {
  attachedProcess?: ChildProcessWithoutNullStreams;
}

function executeWithInput(
  processPath: string,
  args: string[] = [],
  inputs: string[] = [],
  opts: ExecuteOptions = {},
): Promise<ExecuteResult> {
  const { env = null, timeout = 100, maxTimeout = 10000 } = opts;
  const childProcess = createProcess(processPath, args, env);
  childProcess.stdin.setDefaultEncoding("utf-8");

  //
  let currentInputTimeout: NodeJS.Timeout | undefined;

  // waiting for a response to input on stdin; kills process when expired
  let killIOTimeout: NodeJS.Timeout | undefined;

  // Creates a loop to feed user inputs to the child process in order to get results from the tool.
  // This code is heavily inspired (if not blatantly copied) from inquirer-test:
  // https://github.com/ewnd9/inquirer-test/blob/6e2c40bbd39a061d3e52a8b1ee52cdac88f8d7f7/index.js#L14
  const loop = (inputs: string[]) => {
    if (killIOTimeout) {
      clearTimeout(killIOTimeout);
    }

    if (!inputs.length) {
      childProcess.stdin.end();

      // Set a timeout to wait for CLI response. If CLI takes longer than
      // maxTimeout to respond, kill the childProcess and notify user
      killIOTimeout = setTimeout(() => {
        console.error("Error: Reached I/O timeout");
        childProcess.kill(constants.signals.SIGTERM);
      }, maxTimeout);

      return;
    }

    currentInputTimeout = setTimeout(() => {
      childProcess.stdin.write(inputs[0]);
      // Log debug I/O statements on tests
      if (env?.DEBUG) {
        console.log("input:", inputs[0]);
      }
      loop(inputs.slice(1));
    }, timeout);
  };

  const promise: AttachedProcessPromise<ExecuteResult> = new Promise(
    (resolve, reject) => {
      let stdout = "";
      let stderr = "";

      // get output from CLI
      childProcess.stdout.on("data", (data) => {
        stdout += data.toString();

        if (killIOTimeout) {
          clearTimeout(killIOTimeout);
        }

        // Log debug I/O statements on tests
        if (env?.DEBUG) {
          console.log("stdout:", data.toString());
        }
      });

      // get errors from CLI
      childProcess.stderr.on("data", (data) => {
        stderr += data.toString();

        if (killIOTimeout) {
          clearTimeout(killIOTimeout);
        }

        // Log debug I/O statements on tests
        if (env?.DEBUG) {
          console.log("stderr:", data.toString());
        }
      });

      childProcess.on("exit", (code, signal) => {
        if (currentInputTimeout) {
          clearTimeout(currentInputTimeout);
        }

        if (code === 0) {
          resolve({
            stdout: stdout,
            stderr: stderr,
          });
        } else {
          reject({
            code: code,
            signal: signal,
            stdout: stdout,
            stderr: stderr,
          });
        }
      });

      childProcess.on("error", (err) => {
        childProcess.removeAllListeners("exit"); // don't call other listeners after error
        reject(err);
      });

      // kick off the process
      loop(inputs);
    },
  );

  // Appending the process to the promise, in order to add additional parameters or behavior
  // (such as IPC communication)
  promise.attachedProcess = childProcess;

  return promise;
}

export { createProcess };

export function create(processPath: string) {
  function execute(
    args: string[] = [],
    inputs: string[] = [],
    opts: ExecuteOptions = {},
  ): Promise<ExecuteResult> {
    return executeWithInput(processPath, args, inputs, opts);
  }

  return { execute };
}

export const DOWN = "\x1B\x5B\x42";
export const UP = "\x1B\x5B\x41";
export const ENTER = "\x0D";
export const SPACE = "\x20";
