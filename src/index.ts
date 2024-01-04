import * as core from "@actions/core";
import runMain from "./run";
import postRunMain from "./post-run";

const POST_RUN = core.getState("post-run");

async function run(): Promise<void> {
  // serve as the entry-point for both main and post-run invocations
  if (POST_RUN) {
    postRunMain();
  } else {
    runMain();
  }
}

run();
