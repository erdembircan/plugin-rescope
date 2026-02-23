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

## Pull Request Reviews

- When asked to work on PRs, list open PRs to get their numbers, then pass each directly to the `review` agent. Do not fetch PR details, diffs, or analyze anything yourself — the review agent handles all of that.
- Do NOT instruct the review agent to only report findings. Let it do its job: apply requested changes and/or merge based on review comments.
- Do NOT duplicate work that the review agent is already designed to do.
- After all review agents have completed their work and at least one PR was merged, sync the local repo: run `git fetch` first, then `git pull` only if there are new changes.
