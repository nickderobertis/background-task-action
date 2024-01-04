# Background Task Github Action

Run Github Actions commands in the background and show their logs separately

## Inputs

The only required input is `run`.

| Parameter           | Description                                                          | Allowed Values                                  | Default         |
| ------------------- | -------------------------------------------------------------------- | ----------------------------------------------- | --------------- |
| `run`               | Commands to run, supports multiple lines                             |                                                 |                 |
| `tail`              | Which outputs to tail while you wait                                 | `stderr,stdout,true,false`                      | `stderr,stdout` |
| `log-output`        | Which outputs to log post-run (after the job)                        | `stderr,stdout,true,false`                      | `stderr,stdout` |
| `log-output-resume` | Which outputs should resume where tail left off (no duplicate lines) | `stderr,stdout,true,false`                      | `stderr,stdout` |
| `log-output-if`     | Whether or not to log output                                         | `failure,exit-early,timeout,success,true,false` |                 |
| `working-directory` | Sets the working directory (cwd) for the shell running commands      |                                                 |                 |

## Outputs

N/A

## Examples

```yaml
jobs:
  run_action_default:
    runs-on: ubuntu-latest
    name: Run the action defined in this repository, with default options
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Start services
        uses: nickderobertis/background-task-action@v1
        with:
          run: docker-compose up -d
      - name: Wait for server
        run: |
          curl --retry 20 --retry-delay 3 --fail --retry-connrefused -Lsv http://localhost:3000
      - name: Run tests
        run: ./tests.sh
```

## Development Status

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for versioning.
Any time the major version changes, there may be breaking changes. If it is working well for you, consider
pegging to the current major version, e.g. `nickderobertis/background-task-action@v1`, to avoid breaking changes. Alternatively,
you can always point to the most recent stable release with the `nickderobertis/background-task-action@latest`.

## Developing

Clone the repo and then run `npm install` to set up the pre-commit hooks.

## Author

Created by Nick DeRobertis. MIT License.
