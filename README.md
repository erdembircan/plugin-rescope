# plugin-rescope

**Rescope Claude Code plugins across projects.**

[![npm version](https://img.shields.io/npm/v/plugin-rescope.svg)](https://www.npmjs.com/package/plugin-rescope)
[![License: AGPL-3.0-or-later](https://img.shields.io/npm/l/plugin-rescope.svg)](https://www.gnu.org/licenses/agpl-3.0.html)
[![Lint](https://github.com/erdembircan/plugin-rescope/actions/workflows/lint.yml/badge.svg)](https://github.com/erdembircan/plugin-rescope/actions/workflows/lint.yml)
[![Test](https://github.com/erdembircan/plugin-rescope/actions/workflows/test.yml/badge.svg)](https://github.com/erdembircan/plugin-rescope/actions/workflows/test.yml)
[![Type Check](https://github.com/erdembircan/plugin-rescope/actions/workflows/typecheck.yml/badge.svg)](https://github.com/erdembircan/plugin-rescope/actions/workflows/typecheck.yml)

## Overview

Claude Code has a bug where installing a plugin at the local or user scope prevents you from reinstalling it into a different project ([anthropics/claude-code#14202](https://github.com/anthropics/claude-code/issues/14202)). **plugin-rescope** provides workarounds to rescope plugins across projects by manipulating Claude Code's global and local configuration files directly.

The tool registers the current project with the specified scope in the global plugin registry (`~/.claude/plugins/installed_plugins.json`) and enables the plugin in the local project settings (`.claude/settings.local.json`).

## Installation

```bash
npm install -g plugin-rescope
```

Or use it directly with `npx`:

```bash
npx plugin-rescope --scope local my-plugin@marketplace
```

## Quick Start

Navigate to the project where you want to rescope a plugin, then run:

```bash
plugin-rescope --scope local my-plugin@marketplace
```

This will:

1. Verify that the Claude CLI is installed.
2. Look up the plugin in the global Claude plugin registry.
3. Register the current project with the given scope in the global config.
4. Enable the plugin in the local project settings.

## API Reference

The package exports its classes from the main entry point. You can also import utilities directly.

### `PluginRescope`

Orchestrates the full rescoping workflow: parses CLI arguments, validates the Claude CLI installation, and registers a plugin in both global and local configuration.

```ts
import { PluginRescope } from "plugin-rescope";
```

### `ClaudeCodeToolbox`

Provides methods for interacting with Claude Code's configuration files. Requires two `JsonConfig` instances -- one for the global plugin registry and one for the local project settings.

```ts
import { ClaudeCodeToolbox } from "plugin-rescope";
import { JsonConfig } from "plugin-rescope/util/JsonConfig.js";

const toolbox = new ClaudeCodeToolbox(
  new JsonConfig("/home/user/.claude/plugins/installed_plugins.json"),
  new JsonConfig("/path/to/project/.claude/settings.local.json"),
);
```

#### `validateInstallation(): false | string`

Checks whether the Claude CLI is installed by running `claude --version`. Returns the version string (e.g. `"1.0.0"`) if found, or `false` if the CLI is not available.

```ts
const version = toolbox.validateInstallation();

if (!version) {
  console.error("Claude CLI is not installed.");
  process.exit(1);
}

console.log(`Claude CLI v${version} detected.`);
```

#### `getGlobalPluginConfig(pluginName: string): PluginBinding[]`

Retrieves the plugin bindings for a given plugin from the global registry. Returns an empty array if the plugin is not found.

```ts
const bindings = toolbox.getGlobalPluginConfig("my-plugin@marketplace");

for (const binding of bindings) {
  console.log(`${binding.scope} -> ${binding.projectPath}`);
}
```

Each `PluginBinding` has the following shape:

```ts
{
  scope: string;
  installPath: string;
  version: string;
  installedAt: string;
  lastUpdated: string;
  gitCommitSha: string;
  projectPath: string;
}
```

#### `addGlobalPluginBinding(pluginName: string, binding: PluginBinding): void`

Appends a new binding to the given plugin's entry in the global registry. Creates the plugin entry if it does not already exist.

```ts
toolbox.addGlobalPluginBinding("my-plugin@marketplace", {
  scope: "local",
  installPath: "/home/user/.claude/plugins/cache/my-plugin",
  version: "1.0.0",
  installedAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  gitCommitSha: "abc1234",
  projectPath: "/path/to/project",
});
```

#### `getEnabledPlugins(): Record<string, boolean>`

Reads the enabled plugins map from the local project settings. Returns an empty object if no plugins are enabled.

```ts
const plugins = toolbox.getEnabledPlugins();

for (const [name, enabled] of Object.entries(plugins)) {
  console.log(`${name}: ${enabled ? "enabled" : "disabled"}`);
}
```

#### `addLocalPlugin(pluginName: string): void`

Enables a plugin in the local project settings by setting its entry to `true`.

```ts
toolbox.addLocalPlugin("my-plugin@marketplace");
```

### `JsonConfig`

Reads and writes a JSON configuration file on disk.

```ts
import { JsonConfig } from "plugin-rescope/util/JsonConfig.js";

const config = new JsonConfig("/path/to/config.json");
```

#### `read(): object`

Reads and parses the JSON file. Throws `ConfigNotFoundError` if the file does not exist.

```ts
const data = config.read();
```

#### `update(data: object): void`

Serializes the given data as pretty-printed JSON and overwrites the file. Throws `ConfigNotFoundError` if the file does not exist.

```ts
config.update({ version: 1, plugins: {} });
```

### `ShellCommand`

Runs shell commands synchronously via `child_process.execSync`.

#### `static execute(command: string): string`

Executes a shell command and returns its trimmed stdout output. Throws `ShellCommandError` if the command exits with a non-zero code.

```ts
import { ShellCommand } from "plugin-rescope/util/ShellCommand.js";

const output = ShellCommand.execute("claude --version");
console.log(output); // "1.0.23 (Claude Code)"
```

### `FlagParser<T extends string>`

Instance-based generic flag parser for CLI arguments. Accepts flag definitions at construction and parses argument arrays into typed flag/positional pairs.

```ts
import { FlagParser } from "plugin-rescope/util/FlagParser.js";

const parser = new FlagParser(["scope", "output"]);
```

#### `parse(args: string[]): { flags: Record<T, string>; positional: string }`

Parses CLI arguments into named flags and a positional argument. Flags are matched by `--`-prefixed tokens. Unrecognized tokens become the positional argument.

```ts
const { flags, positional } = parser.parse([
  "--scope",
  "local",
  "my-plugin@marketplace",
]);

console.log(flags.scope); // "local"
console.log(positional); // "my-plugin@marketplace"
```

Flag names passed to the constructor are normalized: `--` prefixes are stripped, whitespace is trimmed, and internal spaces are removed. This means you can pass `"--scope"` or `"scope"` interchangeably.

```ts
// These are equivalent:
new FlagParser(["scope"]);
new FlagParser(["--scope"]);
```

## Configuration

### Global Plugin Registry

Located at `~/.claude/plugins/installed_plugins.json`, this file tracks all installed plugins and their project bindings. The structure is:

```json
{
  "version": 1,
  "plugins": {
    "my-plugin@marketplace": [
      {
        "scope": "local",
        "installPath": "/home/user/.claude/plugins/cache/my-plugin",
        "version": "1.0.0",
        "installedAt": "2026-01-15T10:30:00.000Z",
        "lastUpdated": "2026-01-15T10:30:00.000Z",
        "gitCommitSha": "abc1234",
        "projectPath": "/home/user/projects/my-project"
      }
    ]
  }
}
```

Each plugin key maps to an array of bindings, one per project where it has been installed.

### Local Project Settings

Located at `.claude/settings.local.json` in your project root, this file controls which plugins are enabled for the current project:

```json
{
  "enabledPlugins": {
    "my-plugin@marketplace": true
  }
}
```

## Error Handling

The package provides two custom error classes for structured error handling.

### `ConfigNotFoundError`

Thrown when a required configuration file does not exist on disk. Extends `Error`.

```ts
import { ConfigNotFoundError } from "plugin-rescope/util/ConfigNotFoundError.js";

try {
  const data = config.read();
} catch (error) {
  if (error instanceof ConfigNotFoundError) {
    console.error(error.message);
    // "Config file not found: /path/to/config.json"
  }
}
```

### `ShellCommandError`

Thrown when a shell command executed via `ShellCommand.execute()` fails (non-zero exit code). Extends `Error`.

```ts
import { ShellCommandError } from "plugin-rescope/util/ShellCommandError.js";

try {
  ShellCommand.execute("claude --version");
} catch (error) {
  if (error instanceof ShellCommandError) {
    console.error("Command failed:", error.message);
  }
}
```

## Contributing

### Prerequisites

- Node.js >= 18.0.0

### Setup

```bash
git clone https://github.com/erdembircan/plugin-rescope.git
cd plugin-rescope
npm ci
```

### Scripts

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `npm run build`     | Compile TypeScript and minify |
| `npm run lint`      | Run ESLint                    |
| `npm run lint:fix`  | Run ESLint with auto-fix      |
| `npm run typecheck` | Run type checking             |
| `npm test`          | Run tests with Vitest         |

### Project Structure

```
src/
  index.ts                    # Package entry point
  core/
    PluginRescope.ts          # CLI workflow orchestrator
    ClaudeCodeToolbox.ts      # Claude config manipulation
  util/
    FlagParser.ts             # CLI argument parser
    JsonConfig.ts             # JSON file read/write
    ShellCommand.ts           # Shell command execution
    ConfigNotFoundError.ts    # Missing config error
    ShellCommandError.ts      # Command failure error
```

### Guidelines

- Test behavior, not implementation details.
- Use conventional commit messages.
- Run `npm run lint` and `npm run typecheck` before submitting a PR.

## License

[AGPL-3.0-or-later](https://www.gnu.org/licenses/agpl-3.0.html) -- see [LICENSE](./LICENSE) for details.
