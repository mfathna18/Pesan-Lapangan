// Skip git hooks on CI/Vercel — husky is dev-only and can slow or block installs.
import { execSync } from "node:child_process";

if (process.env.CI || process.env.VERCEL || process.env.HUSKY === "0") {
  process.exit(0);
}

execSync("husky", { stdio: "inherit" });
