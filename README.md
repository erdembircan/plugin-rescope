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

Run from the project directory where you want the plugin:

```bash
plugin-rescope --scope local my-plugin@marketplace
```

Or skip the global install with `npx`:

```bash
npx plugin-rescope --scope local my-plugin@marketplace
```

### What it does

1. Checks that the Claude CLI is installed.
2. Looks up the plugin in the global Claude plugin registry.
3. Registers the current project under the given scope.
4. Enables the plugin in the local project settings.

## Requirements

- Node.js >= 18.0.0
- Claude CLI installed

## Contributing

```bash
git clone https://github.com/erdembircan/plugin-rescope.git
cd plugin-rescope
npm ci
```

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `npm run build`     | Compile TypeScript and minify |
| `npm run lint`      | Run ESLint                    |
| `npm run lint:fix`  | Run ESLint with auto-fix      |
| `npm run typecheck` | Run type checking             |
| `npm test`          | Run tests with Vitest         |

## License

[AGPL-3.0-or-later](https://www.gnu.org/licenses/agpl-3.0.html) -- see [LICENSE](./LICENSE) for details.
