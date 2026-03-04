# plugin-rescope

**Rescope Claude Code plugins across projects.**

[![Build](https://github.com/erdembircan/plugin-rescope/actions/workflows/build.yml/badge.svg)](https://github.com/erdembircan/plugin-rescope/actions/workflows/build.yml)

Claude Code has a bug where installing a plugin at the local or user scope prevents you from reinstalling it into a different project ([anthropics/claude-code#14202](https://github.com/anthropics/claude-code/issues/14202)). **plugin-rescope** works around this by rescoping plugins across projects.

## Install

```bash
npm install -g plugin-rescope
```

## Usage

```
plugin-rescope [add|remove] [options] <plugin> [<plugin> ...]
```

Run from the project directory where you want the plugin.

### Commands

| Command  | Description                                         |
| -------- | --------------------------------------------------- |
| `add`    | Register plugin(s) for the current project (default)|
| `remove` | Unregister plugin(s) from the current project       |

When no command is specified, `add` is used.

### Options

| Option            | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `--scope <scope>` | Set the plugin scope: `local` or `project` (default: `local`)    |
| `--help`          | Show the help message                                            |

**Scopes:**

- `local` -- writes to `.claude/settings.local.json` (per-user, not committed to version control)
- `project` -- writes to `.claude/settings.json` (shared across the team via version control)

### Recommended: Use npx

The easiest way to run `plugin-rescope` is with `npx`, which comes bundled with Node.js. It downloads and runs the package on the fly -- no global install required and you always get the latest version:

```bash
npx plugin-rescope my-plugin@marketplace
```

### Examples

Add a single plugin to the current project:

```bash
npx plugin-rescope my-plugin@marketplace
```

Explicitly use the `add` command with a scope override:

```bash
npx plugin-rescope add --scope project my-plugin@marketplace
```

Add multiple plugins at once:

```bash
npx plugin-rescope my-plugin@marketplace another-plugin@marketplace
```

Remove a plugin from the current project:

```bash
npx plugin-rescope remove my-plugin@marketplace
```

Show help:

```bash
npx plugin-rescope --help
```

### Global Install

If you prefer not to use `npx`, install globally:

```bash
npm install -g plugin-rescope
```

Then run the command directly:

```bash
plugin-rescope my-plugin@marketplace
plugin-rescope remove my-plugin@marketplace
```

## How It Works

1. **Checks Claude Code** -- verifies that the Claude CLI is installed by running `claude --version`.
2. **Reads global plugin config** -- looks up the plugin in `~/.claude/plugins/installed_plugins.json` to find its existing installation record.
3. **Adds a project binding** -- copies the plugin's installation metadata into the global config with the current project path, so Claude Code recognizes it for this project.
4. **Enables in project settings** -- adds the plugin to the project's settings file (`.claude/settings.local.json` or `.claude/settings.json` depending on the scope).

The `remove` command reverses this: it removes the project binding from the global config and deletes the plugin entry from the project settings.

## Requirements

- Node.js >= 18.0.0
- Claude Code CLI installed

## License

[AGPL-3.0-or-later](https://www.gnu.org/licenses/agpl-3.0.html) -- see [LICENSE](./LICENSE) for details.
