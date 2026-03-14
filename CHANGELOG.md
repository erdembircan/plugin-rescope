# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-03-13

### Fixed

- Remove invalid `./` prefix from bin path
- Update README badge to point to correct CI workflow

### Changed

- Change license from AGPL-3.0 to Apache-2.0
- Simplify CI workflows from 6 files to 2
- Add repository metadata (`repository`, `bugs`, `homepage`, `keywords`) to package.json

## [1.0.0] - 2026-03-04

### Added

- CLI tool for rescoping Claude Code plugins across projects
- `add` command to bind plugins to local or project scope
- `remove` command to unbind plugins
- `--scope` flag with `local` and `project` options
- `--help` flag for CLI usage
- Support for installing multiple plugins in one command
- Colored, structured CLI output with pipe border format
- Local config creation on first use
- esbuild bundling for distribution
- GitHub Actions CI and release workflows
- Design documents (Mermaid diagrams) in `docs/contracts/`

[1.0.1]: https://github.com/erdembircan/plugin-rescope/releases/tag/v1.0.1
[1.0.0]: https://github.com/erdembircan/plugin-rescope/releases/tag/v1.0.0
