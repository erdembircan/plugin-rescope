# Project Instructions

## Git

- Use `git -C <path>` instead of `cd`-ing into directories when running git commands.

## Commits

- Commit incrementally as you work. Group related changes into logical commits rather than waiting until the entire implementation is finished.
- If a set of changes forms a coherent unit (e.g., a new file, a refactor, a config change), commit it right away before moving on.

## Documentation

The `docs/` folder at the project root contains design documents and flowcharts. It is gitignored and won't be available in worktrees.

If an issue or PR references a doc file (e.g., "use docs/use-case-flowchart.mmd"), read the file contents from the main working directory and include them in the agent's prompt so it has access to the information.

## GitHub Project Tasks

When asked to work on GitHub project tasks, always spawn the `planner` agent first to fetch and plan tasks, then use the `task` agent to execute approved tasks. Do not attempt to interact with GitHub Projects directly.
