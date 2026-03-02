/**
 * Renders all CLI output variants with mock data for visual testing.
 * Run with: npm run preview
 */

import pc from "picocolors";

const DIVIDER = pc.dim("─".repeat(40));

function header(label) {
  console.log("");
  console.log(DIVIDER);
  console.log(pc.dim(`--- ${label} ---`));
  console.log(DIVIDER);
  console.log("");
}

// --- Add: success ---
header("Add: success");
console.log(`  ${pc.green("\u2713")} Claude Code v1.0.26`);
console.log("");
console.log(`  ${pc.green("\u2713")} Found ${pc.bold("my-plugin@marketplace")}`);
console.log(`  ${pc.green("\u2713")} Rescoped to ${pc.dim("/Users/erdem/my-project")}`);
console.log(`    ${pc.dim("Scope: local")}`);

// --- Add: multiple plugins ---
header("Add: multiple plugins");
console.log(`  ${pc.green("\u2713")} Claude Code v1.0.26`);
console.log("");
console.log(`  ${pc.green("\u2713")} Found ${pc.bold("my-plugin@marketplace")}`);
console.log(`  ${pc.green("\u2713")} Rescoped to ${pc.dim("/Users/erdem/my-project")}`);
console.log(`    ${pc.dim("Scope: local")}`);
console.log("");
console.log(`  ${pc.green("\u2713")} Found ${pc.bold("other-plugin@marketplace")}`);
console.log(`  ${pc.green("\u2713")} Rescoped to ${pc.dim("/Users/erdem/my-project")}`);
console.log(`    ${pc.dim("Scope: project")}`);

// --- Add: already configured ---
header("Add: already configured");
console.log(`  ${pc.green("\u2713")} Claude Code v1.0.26`);
console.log("");
console.log(`  ${pc.yellow("~")} ${pc.bold("my-plugin@marketplace")} already configured`);

// --- Add: plugin not found ---
header("Add: plugin not found");
console.log(`  ${pc.green("\u2713")} Claude Code v1.0.26`);
console.log("");
console.log(`  ${pc.red("\u2717")} ${pc.bold("my-plugin@marketplace")} not found in global`);
console.log(`    ${pc.dim("config. No workaround needed.")}`);

// --- Remove: success ---
header("Remove: success");
console.log(`  ${pc.green("\u2713")} Claude Code v1.0.26`);
console.log("");
console.log(`  ${pc.green("\u2713")} Removed ${pc.bold("my-plugin@marketplace")}`);
console.log(`    ${pc.dim("from /Users/erdem/my-project")}`);

// --- Claude not installed ---
header("Claude not installed");
console.log(`  ${pc.red("\u2717")} Claude Code not found`);
console.log(`    ${pc.dim("Install it from https://claude.ai/download")}`);

// --- Error during operation ---
header("Error during operation");
console.log(`  ${pc.green("\u2713")} Claude Code v1.0.26`);
console.log("");
console.log(`  ${pc.red("\u2717")} ${pc.bold("my-plugin@marketplace")}`);
console.log(`    ${pc.dim("Config file not found: /path/to/file")}`);

console.log("");
