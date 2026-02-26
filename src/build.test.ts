import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const BUILD_OUTPUT = resolve(import.meta.dirname, "..", "build", "index.js");

describe("build output", () => {
  it("contains no unresolved #core/* import specifiers", () => {
    const content = readFileSync(BUILD_OUTPUT, "utf-8");

    expect(content).not.toMatch(/#core\//);
  });

  it("contains no unresolved #util/* import specifiers", () => {
    const content = readFileSync(BUILD_OUTPUT, "utf-8");

    expect(content).not.toMatch(/#util\//);
  });

  it("exports the PluginRescope class", () => {
    const content = readFileSync(BUILD_OUTPUT, "utf-8");

    expect(content).toMatch(/export\s*\{[^}]*PluginRescope/);
  });
});
