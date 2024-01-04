import * as core from "@actions/core";
import { Tail } from "tail";
import path from "path";
import { spawn } from "child_process";
import INPUTS from "./input";

type FullTail = Tail & {
  pos: number;
};

const { run, workingDirectory, tail, logOutput } = INPUTS;
const POST_RUN: string | undefined = core.getState("post-run");

let stderr: FullTail | undefined, stdout: FullTail | undefined;

if (core.isDebug()) {
  console.log(process.env);
}

// serve as the entry-point for both main and post-run invocations
if (POST_RUN) {
  require("./post-run");
} else {
  (async function () {
    core.saveState("post-run", process.pid);

    const cwd = workingDirectory || process.env.GITHUB_WORKSPACE || "./";
    const stdErrFile = path.join(cwd, `${process.pid}.err`);
    const stdOutFile = path.join(cwd, `${process.pid}.out`);

    const checkStderr = setInterval(() => {
      stderr = TailWrapper(stdErrFile, tail.stderr, core.info);
      if (stderr) clearInterval(checkStderr);
    }, 1000);

    const checkStdout = setInterval(() => {
      stdout = TailWrapper(stdOutFile, tail.stdout, core.info);
      if (stdout) clearInterval(checkStdout);
    }, 1000);

    runCommand(run);
  })();
}

async function exitHandler(error: Error, reason: string) {
  if (stdout && stdout.unwatch) stdout.unwatch();
  if (stderr && stderr.unwatch) stderr.unwatch();

  core.saveState(`reason_${process.pid}`, reason);
  if (stdout && stdout.pos) core.saveState("stdout", stdout.pos);
  if (stderr && stderr.pos) core.saveState("stderr", stderr.pos);

  if (error) {
    core.error(error);
    core.setFailed(error.message);
  }
  process.exit(error ? 1 : 0);
}

function runCommand(run: string) {
  let cmd = `(${run} wait)`;

  const pipeStdout = tail.stdout || logOutput.stdout;
  const pipeStderr = tail.stderr || logOutput.stderr;

  if (pipeStdout) cmd += ` > ${process.pid}.out`;
  if (pipeStderr) cmd += ` 2> ${process.pid}.err`;

  const shell = spawn(
    "bash",
    ["--noprofile", "--norc", "-eo", "pipefail", "-c", cmd],
    {
      detached: true,
      stdio: "ignore",
      ...(workingDirectory ? { cwd: workingDirectory } : {}),
    }
  );
  shell.on("error", (err) => exitHandler(err, "exit-early"));
  shell.on("close", () => exitHandler(new Error("Exited early"), "exit-early"));
}

function TailWrapper(
  filename: string,
  shouldTail: boolean,
  output: (data: any) => void
): FullTail | undefined {
  if (!shouldTail) return undefined;

  try {
    const tail = new Tail(filename, { flushAtEOF: true });
    tail.on("line", output);
    tail.on("error", core.warning);
    return tail as FullTail;
  } catch (e) {
    console.warn(
      "background-action tried to tail a file before it was ready...."
    );
    return undefined;
  }
}

export default async function runMain() {
  core.saveState("post-run", process.pid);

  const cwd = workingDirectory || process.env.GITHUB_WORKSPACE || "./";
  const stdErrFile = path.join(cwd, `${process.pid}.err`);
  const stdOutFile = path.join(cwd, `${process.pid}.out`);

  const checkStderr = setInterval(() => {
    stderr = TailWrapper(stdErrFile, tail.stderr, core.info);
    if (stderr) clearInterval(checkStderr);
  }, 1000);

  const checkStdout = setInterval(() => {
    stdout = TailWrapper(stdOutFile, tail.stdout, core.info);
    if (stdout) clearInterval(checkStdout);
  }, 1000);

  runCommand(run);
}
