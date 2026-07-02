import assert from "node:assert/strict";
import { getVercelBuildDecision } from "./vercel-ignore-build.mjs";

const betaProjectId = "prj_hnGuJvK01dXKVK9foVsSucy4qIrx";

const cases = [
  {
    name: "main builds production",
    env: {
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_PROJECT_PRODUCTION_URL: "app.pinaymate.com",
    },
    shouldBuild: true,
  },
  {
    name: "main skips beta",
    env: {
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_PROJECT_PRODUCTION_URL: "beta.pinaymate.com",
      VERCEL_PROJECT_ID: betaProjectId,
    },
    shouldBuild: false,
  },
  {
    name: "dev builds beta",
    env: {
      VERCEL_GIT_COMMIT_REF: "dev",
      VERCEL_PROJECT_PRODUCTION_URL: "beta.pinaymate.com",
      VERCEL_PROJECT_ID: betaProjectId,
    },
    shouldBuild: true,
  },
  {
    name: "dev skips production",
    env: {
      VERCEL_GIT_COMMIT_REF: "dev",
      VERCEL_PROJECT_PRODUCTION_URL: "app.pinaymate.com",
    },
    shouldBuild: false,
  },
  {
    name: "feature skips known production project",
    env: {
      VERCEL_GIT_COMMIT_REF: "feature/demo",
      VERCEL_PROJECT_PRODUCTION_URL: "app.pinaymate.com",
    },
    shouldBuild: false,
  },
  {
    name: "unknown project fails open",
    env: {
      VERCEL_GIT_COMMIT_REF: "dev",
      VERCEL_PROJECT_PRODUCTION_URL: "unknown.example.com",
    },
    shouldBuild: true,
  },
];

for (const testCase of cases) {
  assert.equal(
    getVercelBuildDecision(testCase.env).shouldBuild,
    testCase.shouldBuild,
    testCase.name,
  );
}

console.log(`PASS Vercel branch deployment policy (${cases.length} cases)`);
