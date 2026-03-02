import pc from "picocolors";

/**
 * Formats the Claude Code version validation success line.
 *
 * @param version - The detected Claude Code version string.
 * @returns Formatted string with green checkmark and version.
 */
export function formatVersionFound(version: string): string {
  return `  ${pc.green("\u2713")} Claude Code v${version}`;
}

/**
 * Formats the Claude Code not found error.
 *
 * @returns Formatted string with red cross and install instructions.
 */
export function formatVersionNotFound(): string {
  return [
    `  ${pc.red("\u2717")} Claude Code not found`,
    `    ${pc.dim("Install it from https://claude.ai/download")}`,
  ].join("\n");
}

/**
 * Formats a successful plugin add (rescope) result.
 *
 * @param pluginName - The plugin identifier (e.g. "my-plugin@marketplace").
 * @param projectPath - The absolute path to the project root.
 * @param scope - The scope used ("local" or "project").
 * @returns Formatted string showing found, rescoped, and scope lines.
 */
export function formatAddSuccess(
  pluginName: string,
  projectPath: string,
  scope: string,
): string {
  return [
    `  ${pc.green("\u2713")} Found ${pc.bold(pluginName)}`,
    `  ${pc.green("\u2713")} Rescoped to ${pc.dim(projectPath)}`,
    `    ${pc.dim(`Scope: ${scope}`)}`,
  ].join("\n");
}

/**
 * Formats the "already configured" skip message for a plugin.
 *
 * @param pluginName - The plugin identifier.
 * @returns Formatted string with yellow tilde indicating skip.
 */
export function formatAlreadyConfigured(pluginName: string): string {
  return `  ${pc.yellow("~")} ${pc.bold(pluginName)} already configured`;
}

/**
 * Formats the "plugin not found in global config" message.
 *
 * @param pluginName - The plugin identifier.
 * @returns Formatted string with red cross and explanation.
 */
export function formatPluginNotFound(pluginName: string): string {
  return [
    `  ${pc.red("\u2717")} ${pc.bold(pluginName)} not found in global`,
    `    ${pc.dim("config. No workaround needed.")}`,
  ].join("\n");
}

/**
 * Formats a successful plugin remove result.
 *
 * @param pluginName - The plugin identifier.
 * @param projectPath - The absolute path to the project root.
 * @returns Formatted string showing removal confirmation.
 */
export function formatRemoveSuccess(
  pluginName: string,
  projectPath: string,
): string {
  return [
    `  ${pc.green("\u2713")} Removed ${pc.bold(pluginName)}`,
    `    ${pc.dim(`from ${projectPath}`)}`,
  ].join("\n");
}

/**
 * Formats an error that occurred during a plugin operation.
 *
 * @param pluginName - The plugin identifier.
 * @param message - The error message.
 * @returns Formatted string with red cross and error detail.
 */
export function formatError(pluginName: string, message: string): string {
  return [
    `  ${pc.red("\u2717")} ${pc.bold(pluginName)}`,
    `    ${pc.dim(message)}`,
  ].join("\n");
}
