/**
 * Diagnostic for Gemini Live API access.
 *
 * Reads GEMINI_API_KEY from .env.local. Three checks:
 *   1. List all models on this key → does any "live" / "native-audio"
 *      variant show up? If not, your project doesn't have Live access.
 *   2. Try minting an ephemeral auth token for the stable GA Live model.
 *   3. Open the Live WebSocket and wait for setupComplete. If it
 *      arrives, Live works end-to-end. If it times out, the key
 *      can mint tokens but can't run sessions — Live API needs
 *      explicit enablement.
 *
 * Usage:
 *   set -a && source .env.local && set +a && node scripts/diagnose-gemini-live.js
 */

const WebSocket = require("ws");

(async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not set. Source .env.local first.");
    process.exit(1);
  }

  console.log("\n=== STEP 1: list available models ===");
  const modelsRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
  );
  if (!modelsRes.ok) {
    console.error("models list failed:", modelsRes.status, await modelsRes.text());
    process.exit(1);
  }
  const modelsJson = await modelsRes.json();
  const all = (modelsJson.models ?? []).map((m) => m.name.replace("models/", ""));
  const liveOnes = all.filter((n) => /(live|native-audio|bidi)/i.test(n));
  console.log(`total models: ${all.length}`);
  console.log("Live / native-audio candidates:");
  if (liveOnes.length === 0) {
    console.log("  ⚠️  NONE — Live API isn't allowlisted on this key/project.");
  } else {
    for (const n of liveOnes) console.log("  •", n);
  }

  console.log("\n=== STEP 2: mint an ephemeral auth token (v1alpha) ===");
  const tokenBody = {
    config: {
      uses: 1,
      expireTime: new Date(Date.now() + 60 * 1000).toISOString(),
      newSessionExpireTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      liveConnectConstraints: {
        model: "models/gemini-2.0-flash-live-001",
        config: {
          responseModalities: ["AUDIO"],
        },
      },
    },
  };
  const tokRes = await fetch(
    `https://generativelanguage.googleapis.com/v1alpha/auth_tokens?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tokenBody),
    },
  );
  const tokText = await tokRes.text();
  if (!tokRes.ok) {
    console.log(`  ✗ token mint failed: ${tokRes.status}`);
    console.log("  body:", tokText.slice(0, 400));
    process.exit(1);
  }
  const tokJson = JSON.parse(tokText);
  const tokenName = tokJson.name;
  console.log(`  ✓ minted: ${tokenName}`);

  console.log("\n=== STEP 3: open Live WebSocket, wait for setupComplete ===");
  const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?access_token=${encodeURIComponent(
    tokenName,
  )}`;
  const ws = new WebSocket(wsUrl);

  const result = await new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ kind: "timeout" }), 12000);
    ws.on("open", () => {
      console.log("  → WebSocket opened, sending setup");
      ws.send(
        JSON.stringify({
          setup: {
            model: "models/gemini-2.0-flash-live-001",
            generationConfig: { responseModalities: ["AUDIO"] },
          },
        }),
      );
    });
    ws.on("message", (data) => {
      let msg;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        msg = { raw: data.toString().slice(0, 300) };
      }
      if (msg.setupComplete) {
        clearTimeout(timer);
        resolve({ kind: "setupComplete" });
      } else {
        console.log("  ← message:", JSON.stringify(msg).slice(0, 240));
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
        reason: reason.toString().slice(0, 240),
      });
    });
  });

  ws.close();

  console.log("\n=== VERDICT ===");
  if (result.kind === "setupComplete") {
    console.log("  ✅ Live API is ENABLED on this project. Live mode should work.");
  } else if (result.kind === "timeout") {
    console.log("  ❌ setupComplete never arrived. Token mint OK but sessions");
    console.log("     don't start — Live API needs allowlisting on AI Studio.");
  } else if (result.kind === "close") {
    console.log(`  ❌ socket closed (code ${result.code}): ${result.reason}`);
  } else {
    console.log(`  ❌ socket error: ${result.error}`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
