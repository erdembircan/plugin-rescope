# plugin-rescope

**Rescope Claude Code plugins across projects.**

[![npm version](https://img.shields.io/npm/v/plugin-rescope.svg)](https://www.npmjs.com/package/plugin-rescope)
[![License: AGPL-3.0-or-later](https://img.shields.io/npm/l/plugin-rescope.svg)](https://www.gnu.org/licenses/agpl-3.0.html)
[![Lint](https://github.com/erdembircan/plugin-rescope/actions/workflows/lint.yml/badge.svg)](https://github.com/erdembircan/plugin-rescope/actions/workflows/lint.yml)
[![Test](https://github.com/erdembircan/plugin-rescope/actions/workflows/test.yml/badge.svg)](https://github.com/erdembircan/plugin-rescope/actions/workflows/test.yml)
[![Type Check](https://github.com/erdembircan/plugin-rescope/actions/workflows/typecheck.yml/badge.svg)](https://github.com/erdembircan/plugin-rescope/actions/workflows/typecheck.yml)

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

| Option           | Description                                  |
| ---------------- | -------------------------------------------- |
| `--scope <scope>`| Override the plugin scope (e.g. local, global)|
| `--help`         | Show the help message                        |

### Examples

Add a single plugin to the current project:

```bash
plugin-rescope my-plugin@marketplace
```

Explicitly use the `add` command with a scope override:

```bash
plugin-rescope add --scope local my-plugin@marketplace
```

Add multiple plugins at once:

```bash
plugin-rescope my-plugin@marketplace another-plugin@marketplace
```

Remove a plugin from the current project:

```bash
plugin-rescope remove my-plugin@marketplace
```

Skip the global install with `npx`:

```bash
npx plugin-rescope --scope local my-plugin@marketplace
```

Show help:

```bash
plugin-rescope --help
```

## Requirements

- Node.js >= 18.0.0
- Claude CLI installed

## License

[AGPL-3.0-or-later](https://www.gnu.org/licenses/agpl-3.0.html) -- see [LICENSE](./LICENSE) for details.
