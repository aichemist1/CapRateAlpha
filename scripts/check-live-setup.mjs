import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const envPath = path.join(cwd, ".env.local");

const required = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
];

const optional = [
  "SUPABASE_STORAGE_BUCKET",
  "RESEND_API_KEY",
  "NOTIFICATIONS_FROM_EMAIL",
  "OPENAI_API_KEY",
  "OPENAI_MODEL"
];

function parseEnv(contents) {
  const result = {};

  for (const line of contents.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const idx = trimmed.indexOf("=");

    if (idx === -1) {
      continue;
    }

    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    result[key] = value;
  }

  return result;
}

if (!fs.existsSync(envPath)) {
  console.log("Missing .env.local");
  console.log("");
  console.log("Next step:");
  console.log("1. Copy .env.example to .env.local");
  console.log("2. Fill in the Supabase values");
  console.log("3. Re-run: npm run qa:setup-check");
  process.exit(1);
}

const env = parseEnv(fs.readFileSync(envPath, "utf8"));
const missing = required.filter((key) => !env[key]);

console.log("CapRateAlpha live setup check");
console.log("");

if (missing.length > 0) {
  console.log("Missing required variables:");

  for (const key of missing) {
    console.log(`- ${key}`);
  }

  console.log("");
  console.log("Live QA is blocked until those are filled in.");
  process.exit(1);
}

console.log("Required variables present:");

for (const key of required) {
  console.log(`- ${key}`);
}

console.log("");
console.log("Optional variables:");

for (const key of optional) {
  console.log(`- ${key}: ${env[key] ? "set" : "not set"}`);
}

console.log("");
console.log("Manual live QA prerequisites:");
console.log("- Apply supabase/schema.sql in your Supabase project");
console.log(`- Ensure the storage bucket exists: ${env.SUPABASE_STORAGE_BUCKET || "assets"}`);
console.log("- Start the app with: npm run dev");
console.log("- Test signup, onboarding, photo upload, publish, public inquiry, and LoopNet export");
