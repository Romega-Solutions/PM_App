import { fileURLToPath } from "node:url";

const PRODUCTION_DOMAINS = new Set(["app.pinaymate.com"]);
const BETA_DOMAINS = new Set(["beta.pinaymate.com"]);
const BETA_PROJECT_IDS = new Set(["prj_hnGuJvK01dXKVK9foVsSucy4qIrx"]);

export function getVercelBuildDecision(env = process.env) {
  const branch = env.VERCEL_GIT_COMMIT_REF || "";
  const productionUrl = env.VERCEL_PROJECT_PRODUCTION_URL || "";
  const projectId = env.VERCEL_PROJECT_ID || "";

  const isProductionProject = PRODUCTION_DOMAINS.has(productionUrl);
  const isBetaProject =
    BETA_DOMAINS.has(productionUrl) || BETA_PROJECT_IDS.has(projectId);

  if (!branch) {
    return {
      shouldBuild: true,
      reason:
        "missing VERCEL_GIT_COMMIT_REF; failing open to avoid suppressing deploys",
    };
  }

  if (!isProductionProject && !isBetaProject) {
    return {
      shouldBuild: true,
      reason: `unrecognized Vercel project for ${
        productionUrl || projectId || "unknown"
      }`,
    };
  }

  if (branch === "main") {
    if (isProductionProject) {
      return {
        shouldBuild: true,
        reason: "main branch belongs to pm-app production",
      };
    }

    return {
      shouldBuild: false,
      reason: "main branch does not deploy to pm-app-beta",
    };
  }

  if (branch === "dev") {
    if (isBetaProject) {
      return {
        shouldBuild: true,
        reason: "dev branch belongs to pm-app-beta",
      };
    }

    return {
      shouldBuild: false,
      reason: "dev branch does not deploy to pm-app production",
    };
  }

  return {
    shouldBuild: false,
    reason: `branch ${branch} is not a production or beta deployment lane`,
  };
}

function run() {
  const decision = getVercelBuildDecision();
  const action = decision.shouldBuild ? "allowed" : "skipped";

  console.log(`Vercel build ${action}: ${decision.reason}`);
  process.exit(decision.shouldBuild ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
