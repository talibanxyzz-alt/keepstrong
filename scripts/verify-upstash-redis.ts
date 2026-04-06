/**
 * Verifies Upstash Redis credentials for API rate limiting.
 * Usage: add UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to .env.local, then:
 *   npm run verify:upstash
 */
import { Redis } from "@upstash/redis";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error(
    "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN in .env.local.\n" +
      "Create a database at https://console.upstash.com/ → Redis → copy REST URL and token."
  );
  process.exit(1);
}

const redis = new Redis({ url, token });

async function main() {
  const pong = await redis.ping();
  if (pong !== "PONG") {
    console.error("Unexpected PING response:", pong);
    process.exit(1);
  }
  console.log("Upstash Redis OK — rate limiting will be active when this app runs with these env vars.");
}

main().catch((err) => {
  console.error("Connection failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
