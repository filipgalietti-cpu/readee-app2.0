/**
 * List all publisher models on Vertex AI for the project.
 * Filters to anything that looks Live-ready.
 *
 * Usage:
 *   set -a && source .env.local && set +a && node scripts/list-vertex-models.js
 */

(async () => {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath) {
    console.error("GOOGLE_APPLICATION_CREDENTIALS not set.");
    process.exit(1);
  }

  const { GoogleAuth } = require("google-auth-library");
  const cred = require(credPath);
  const project = cred.project_id;

  const auth = new GoogleAuth({
    keyFilename: credPath,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const accessToken = (await client.getAccessToken())?.token;

  // Vertex publisher models discovery — region scoped.
  for (const region of ["us-central1", "us-east5", "global"]) {
    console.log(`\n── ${region} ──`);
    const url = `https://${region}-aiplatform.googleapis.com/v1beta1/projects/${project}/locations/${region}/publishers/google/models?pageSize=200`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      console.log(`  ✗ ${res.status}: ${(await res.text()).slice(0, 200)}`);
      continue;
    }
    const json = await res.json();
    const models = (json.publisherModels ?? []).map((m) => {
      const id = (m.name || "").replace(/.*publishers\/google\/models\//, "");
      const stage = m.launchStage || "";
      return { id, stage };
    });
    const liveModels = models.filter((m) => /(live|native-audio|bidi)/i.test(m.id));
    const allGemini = models.filter((m) => /^gemini/.test(m.id));
    console.log(`  total: ${models.length}, gemini: ${allGemini.length}, live: ${liveModels.length}`);
    if (liveModels.length > 0) {
      console.log(`  Live candidates:`);
      for (const m of liveModels) console.log(`    ${m.id} [${m.stage}]`);
    } else if (allGemini.length > 0) {
      // Show all gemini models so we can spot typos / new naming.
      console.log(`  All gemini models on this project:`);
      for (const m of allGemini) console.log(`    ${m.id} [${m.stage}]`);
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
