const regen = require("./regen_items.json");
const results = require("./regen_results.json");

const picks = [
  regen.find(i => i.reason === "desk_scene" && i.level === "2nd Grade"),
  regen.find(i => i.reason === "desk_scene" && i.level === "4th Grade"),
  regen.find(i => i.reason === "bad_k" && i.id.startsWith("RF.K.3")),
  regen.find(i => i.reason === "bad_k" && i.id.startsWith("K.L.")),
  regen.find(i => i.reason === "missing"),
];

for (const item of picks) {
  if (!item) continue;
  console.log("=".repeat(70));
  console.log(`ID: ${item.id} | ${item.level} | Reason: ${item.reason}`);
  console.log(`Question: ${item.prompt.slice(0, 120)}${item.prompt.length > 120 ? "..." : ""}`);
  console.log();
  console.log(`BEFORE: ${item.current || "(empty)"}`);
  console.log();
  console.log(`AFTER:  ${results[item.id]}`);
  console.log();
}
