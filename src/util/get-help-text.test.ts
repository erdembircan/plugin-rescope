import { describe, expect, it } from "vitest";
import { getHelpText } from "#util/get-help-text.js";

describe("getHelpText", () => {
  it("returns a string containing the usage line", () => {
    const text = getHelpText();

    expect(text).toContain("Usage: plugin-rescope");
  });

  it("documents the add and remove commands", () => {
    const text = getHelpText();

    expect(text).toContain("add");
    expect(text).toContain("remove");
  });

  it("documents the --scope option", () => {
    const text = getHelpText();

    expect(text).toContain("--scope");
  });

  it("documents the --help option", () => {
    const text = getHelpText();

    expect(text).toContain("--help");
  });

  it("includes at least one example", () => {
    const text = getHelpText();

    expect(text).toContain("plugin-rescope");
    expect(text).toContain("@marketplace");
  });
});
