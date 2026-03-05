# plugin-rescope

**Rescope Claude Code plugins across projects.**

[![CI](https://github.com/erdembircan/plugin-rescope/actions/workflows/ci.yml/badge.svg)](https://github.com/erdembircan/plugin-rescope/actions/workflows/ci.yml)

Claude Code has a bug where installing a plugin at the local or user scope prevents you from reinstalling it into a different project ([anthropics/claude-code#14202](https://github.com/anthropics/claude-code/issues/14202)). **plugin-rescope** works around this by rescoping plugins across projects.

## Install

```bash
npm install -g plugin-rescope
```

## Usage

```
npx plugin-rescope [add|remove] [options] <plugin> [<plugin> ...]
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
npx plugin-rescope add --scope local my-plugin@marketplace
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

## Requirements

- Node.js >= 18.0.0

## License

[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0) -- see [LICENSE](./LICENSE) for details.
