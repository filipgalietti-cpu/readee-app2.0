#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const envPath = path.resolve(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const ref = "rwlvjtowmfrrqeqvwolo";
const password = env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.error("Missing SUPABASE_DB_PASSWORD in .env.local");
  console.error("Find it in Supabase Dashboard > Settings > Database > Connection String");
  process.exit(1);
}

const sqlFile = process.argv[2] || path.resolve(__dirname, "..", "supabase", "migrations", "016_question_audit.sql");
const sql = fs.readFileSync(sqlFile, "utf-8");

const client = new Client({
  host: `aws-0-us-east-1.pooler.supabase.com`,
  port: 6543,
  database: "postgres",
  user: `postgres.${ref}`,
  password: password,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Connecting to Supabase PostgreSQL...");
  await client.connect();
  console.log("Connected. Running migration...");
  await client.query(sql);
  console.log("Migration applied successfully!");
  await client.end();
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
