/**
 * Returns the CLI help text for plugin-rescope.
 */
export function getHelpText(): string {
  return [
    "Usage: plugin-rescope [add|remove] [options] <plugin> [<plugin> ...]",
    "",
    "Rescope Claude Code plugins across projects.",
    "",
    "Commands:",
    "  add       Register plugin(s) for the current project (default)",
    "  remove    Unregister plugin(s) from the current project",
    "",
    "Options:",
    "  --scope <scope>  Override the plugin scope (e.g. local, global)",
    "  --help           Show this help message",
    "",
    "Examples:",
    "  plugin-rescope my-plugin@marketplace",
    "  plugin-rescope add --scope local my-plugin@marketplace",
    "  plugin-rescope remove my-plugin@marketplace",
  ].join("\n");
}
