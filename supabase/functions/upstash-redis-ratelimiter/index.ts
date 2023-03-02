import { serve } from "std/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "https://esm.sh/@upstash/ratelimit@0.3.3";

console.log(`Function "upstash-redis-ratelimiter" up and running!`);
serve(async (_req) => {
  try {
    const redis = new Redis({
      url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
      token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
    });

    // Create a new ratelimiter, that allows 10 requests per 10 seconds
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(2, "10 s"),
      analytics: true,
    });

    // Use a constant string to limit all requests with a single ratelimit
    // Or use a userID, apiKey or ip address for individual limits.
    const identifier = "api";
    const { success } = await ratelimit.limit(identifier);

    if (!success) {
      throw new Error("limit exceeded");
    }
    return new Response(JSON.stringify({ success }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200,
    });
  }
});
