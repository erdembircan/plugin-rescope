/**
 * Renders all CLI output variants with mock data for visual testing.
 * Run with: npm run preview
 *
 * Note: This script uses picocolors directly to preview the visual
 * appearance of the CLI. The actual source code uses the generic
 * format functions from src/util/format-output.ts.
 */

import pc from "picocolors";

const DIVIDER = pc.dim("\u2500".repeat(40));

function section(label) {
  console.log("");
  console.log(DIVIDER);
  console.log(pc.dim(`--- ${label} ---`));
  console.log(DIVIDER);
  console.log("");
}

// --- Add: success ---
section("Add: success");
console.log(`  ${pc.green("\u2713")} Claude Code v1.0.26`);
console.log("");
console.log(`  ${pc.green("\u2713")} my-plugin@marketplace rescoped to /Users/erdem/my-project (local)`);

// --- Add: multiple plugins ---
section("Add: multiple plugins");
console.log(`  ${pc.green("\u2713")} Claude Code v1.0.26`);
console.log("");
console.log(`  ${pc.green("\u2713")} my-plugin@marketplace rescoped to /Users/erdem/my-project (local)`);
console.log("");
console.log(`  ${pc.green("\u2713")} other-plugin@marketplace rescoped to /Users/erdem/my-project (project)`);

// --- Add: already configured ---
section("Add: already configured");
console.log(`  ${pc.green("\u2713")} Claude Code v1.0.26`);
console.log("");
console.log(`  ${pc.green("\u2713")} my-plugin@marketplace already configured`);

// --- Add: plugin not found ---
section("Add: plugin not found");
console.log(`  ${pc.green("\u2713")} Claude Code v1.0.26`);
console.log("");
console.log(`  ${pc.red("\u2717")} my-plugin@marketplace not found in global config. No workaround needed.`);

// --- Remove: success ---
section("Remove: success");
console.log(`  ${pc.green("\u2713")} Claude Code v1.0.26`);
console.log("");
console.log(`  ${pc.green("\u2713")} my-plugin@marketplace removed from /Users/erdem/my-project`);

// --- Claude not installed ---
section("Claude not installed");
console.log(`  ${pc.red("\u2717")} Claude Code not found`);

// --- Error during operation ---
section("Error during operation");
console.log(`  ${pc.green("\u2713")} Claude Code v1.0.26`);
console.log("");
console.log(`  ${pc.red("\u2717")} my-plugin@marketplace: Config file not found: /path/to/file`);

// --- Divider example ---
section("Divider");
console.log(DIVIDER);

console.log("");
