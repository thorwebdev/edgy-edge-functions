// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Database } from "./types.ts";

console.log("Hello from `resend` function!");

type UserRecord = Database["auth"]["Tables"]["users"]["Row"];
interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: null | UserRecord;
  schema: "public";
  old_record: null | UserRecord;
}

serve(async (req) => {
  const payload: WebhookPayload = await req.json();
  const newUser = payload.record;
  const deletedUser = payload.old_record;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
    },
    body: JSON.stringify({
      from: "SupaThor <team@email.thor.bio>",
      to: [deletedUser?.email ?? newUser?.email],
      subject: deletedUser
        ? "Sorry to see you go"
        : "Welcome to the SupaThorClub",
      html: deletedUser
        ? `Hey ${deletedUser.email}, we're very sad to see you go! Pleas come visit again soon!`
        : `Hey ${newUser?.email} we're glad to have you!`,
    }),
  });

  const data = await res.json();
  console.log({ data });

  return new Response("ok");
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
