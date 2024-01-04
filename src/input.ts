import * as core from "@actions/core";
import type { Inputs, LogOutputIf } from "./types";

type RawInputs = {
  run: string;
  tail: string;
  logOutput: string;
  logOutputResume: string;
  logOutputIf: string;
  workingDirectory: string;
};

function getRawInputs(): RawInputs {
  const run = core.getInput("run");
  const tail = core.getInput("tail");

  const logOutput = core.getInput("log-output");
  const logOutputResume = core.getInput("log-output-resume");
  const logOutputIf = core.getInput("log-output-if");
  const workingDirectory = core.getInput("working-directory");

  return {
    run,
    tail,
    logOutput,
    logOutputResume,
    logOutputIf,
    workingDirectory,
  };
}

function parseLogOption(str: string) {
  const option = { stdout: false, stderr: false };
  if (str === "true") return { stdout: true, stderr: true };
  if (str === "false") return option;
  if (str.includes("stdout")) option.stdout = true;
  if (str.includes("stderr")) option.stderr = true;

  return option;
}

function isValidLogOutputIf(str: string | undefined): str is LogOutputIf {
  return /true|false|failure|exit-early|timeout|success/.test(str || "");
}

function normalizeInputs(inputs: RawInputs): Inputs {
  let {
    run,
    tail: rawTail,
    logOutput: rawLogOutput,
    logOutputResume: rawLogOutputResume,
    logOutputIf,
    workingDirectory,
  } = inputs;

  const tail = parseLogOption(rawTail);
  const logOutputResume = parseLogOption(rawLogOutputResume);
  const logOutput = parseLogOption(rawLogOutput);

  if (!isValidLogOutputIf(logOutputIf)) {
    throw new Error(
      `Invalid input for: log-output-if, expecting: true,false,failure,exit-early,timeout,success received: ${logOutputIf}`
    );
  }

  return {
    run,
    tail,
    logOutput,
    logOutputResume,
    logOutputIf,
    workingDirectory,
  };
}

const INPUTS = normalizeInputs(getRawInputs());
export default INPUTS;
