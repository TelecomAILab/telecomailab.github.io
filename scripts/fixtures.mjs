import { cpSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
const command = process.argv[2] ?? "dev";
if (!["dev", "build", "check"].includes(command)) throw new Error("Use dev, build, or check.");
mkdirSync(".fixture-public", { recursive: true });
cpSync("public", ".fixture-public", { recursive: true });
cpSync("tests/fixtures/public", ".fixture-public", { recursive: true });
const result = spawnSync(process.execPath, ["node_modules/astro/bin/astro.mjs", command, ...process.argv.slice(3)], {
  stdio: "inherit", env: { ...process.env, TELECOMAI_FIXTURES: "1" },
});
process.exitCode = result.status ?? 1;
