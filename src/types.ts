export type LogOutputIf =
  | "true"
  | "false"
  | "failure"
  | "exit-early"
  | "timeout"
  | "success";

export type Inputs = {
  run: string;
  workingDirectory: string;
  tail: {
    stdout: boolean;
    stderr: boolean;
  };
  logOutput: {
    stdout: boolean;
    stderr: boolean;
  };
  logOutputResume: {
    stdout: boolean;
    stderr: boolean;
  };
  logOutputIf: LogOutputIf;
};
