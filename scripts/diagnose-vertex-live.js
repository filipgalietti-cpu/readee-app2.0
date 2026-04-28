/**
 * Vertex AI Live API end-to-end probe.
 *
 *   1. Mint a GCP access token from the service account.
 *   2. Open the Vertex Live BidiGenerateContent WebSocket.
 *   3. Send setup, wait for setupComplete.
 *
 * If setupComplete arrives, Vertex Live is live on this project.
 * If the socket closes or times out, capture the actual reason —
 * that's the only signal that matters.
 *
 * Usage:
 *   set -a && source .env.local && set +a && node scripts/diagnose-vertex-live.js
 */

const WebSocket = require("ws");

(async () => {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath) {
    console.error("GOOGLE_APPLICATION_CREDENTIALS not set. Source .env.local first.");
    process.exit(1);
  }

  const { GoogleAuth } = require("google-auth-library");
  const cred = require(credPath);
  const project = cred.project_id;

  console.log("\n=== STEP 1: get access token via service account ===");
  const auth = new GoogleAuth({
    keyFilename: credPath,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const accessToken = (await client.getAccessToken())?.token;
  if (!accessToken) {
    console.error("✗ no access token returned.");
    process.exit(1);
  }
  console.log(`  ✓ token minted (length ${accessToken.length})`);
  console.log(`  project: ${project}`);

  // Per Vertex AI docs (Apr 2026):
  //   gemini-live-2.5-flash-native-audio  — GA, recommended
  //   gemini-live-2.5-flash-preview-native-audio-09-2025 — preview
  //     (deprecated 2026-03-19, migrate to GA)
  const REGIONS = ["us-central1"];
  const MODELS = [
    "gemini-live-2.5-flash-native-audio",
    "gemini-live-2.5-flash-preview-native-audio-09-2025",
  ];

  for (const region of REGIONS) {
    for (const model of MODELS) {
      console.log(`\n=== STEP 2: try ${region} / ${model} ===`);
      const wsUrl = `wss://${region}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent?access_token=${encodeURIComponent(
        accessToken,
      )}`;
      const ws = new WebSocket(wsUrl);

      const result = await new Promise((resolve) => {
        const timer = setTimeout(() => resolve({ kind: "timeout" }), 10000);

        ws.on("open", () => {
          console.log("  → WebSocket opened, sending setup");
          ws.send(
            JSON.stringify({
              setup: {
                model: `projects/${project}/locations/${region}/publishers/google/models/${model}`,
                generation_config: { response_modalities: ["AUDIO"] },
              },
            }),
          );
        });
        ws.on("message", (data) => {
          let msg;
          try {
            msg = JSON.parse(data.toString());
          } catch {
            msg = { raw: data.toString().slice(0, 200) };
          }
          if (msg.setupComplete) {
            clearTimeout(timer);
            resolve({ kind: "ok" });
          } else {
            console.log("  ←", JSON.stringify(msg).slice(0, 200));
          }
        });
        ws.on("error", (e) => {
          clearTimeout(timer);
          resolve({ kind: "error", error: String(e) });
        });
        ws.on("close", (code, reason) => {
          clearTimeout(timer);
          resolve({
            kind: "close",
            code,
            reason: reason?.toString().slice(0, 200) || "",
          });
        });
      });
      try { ws.close(); } catch {}

      if (result.kind === "ok") {
        console.log(`  ✅ Vertex Live works on ${region} / ${model}.`);
        console.log(`\n=== VERDICT ===`);
        console.log(`  Live API is enabled. Use:`);
        console.log(`    region: ${region}`);
        console.log(`    model:  ${model}`);
        process.exit(0);
      } else if (result.kind === "close") {
        console.log(`  ✗ closed (code ${result.code}): ${result.reason}`);
      } else if (result.kind === "timeout") {
        console.log(`  ✗ timeout — no setupComplete in 10s`);
      } else {
        console.log(`  ✗ error: ${result.error}`);
      }
    }
  }

  console.log("\n=== VERDICT ===");
  console.log("  ❌ No Vertex Live model accepted setup.");
  console.log("     Either Vertex AI API isn't enabled on the project,");
  console.log("     or the service account lacks aiplatform.user role.");
  console.log("     Check: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
