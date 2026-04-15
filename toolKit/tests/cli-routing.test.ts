import { describe, expect, test } from "vitest";
import { createToolkitCli } from "../src/cli/index";

describe("CLI routing", () => {
  test("registers top-level command groups", () => {
    const cli = createToolkitCli();
    const commandNames = cli.commands.map((command) => command.name());
    expect(commandNames).toContain("research");
    expect(commandNames).toContain("design");
    expect(commandNames).toContain("sprint");
  });

  test("research includes run/gate/report", () => {
    const cli = createToolkitCli();
    const research = cli.commands.find((command) => command.name() === "research");
    expect(research).toBeTruthy();

    const subNames = (research?.commands ?? []).map((command) => command.name());
    expect(subNames).toContain("run");
    expect(subNames).toContain("gate");
    expect(subNames).toContain("report");
  });
});
