// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.2.0";
import { createClient } from "@supabase/supabase-js";
import { Database } from "./types.ts";

console.log("Hello from `huggingface-image-captioning`!");

type storageObjectRecord = Database["storage"]["Tables"]["objects"]["Row"];
interface WebhookPayload {
  type: "INSERT";
  table: string;
  record: storageObjectRecord;
  schema: "storage";
  old_record: null;
}

const examplePayload = {
  type: "INSERT",
  table: "objects",
  record: {
    id: "b5748d87-7a6f-4776-8257-00cc8057e2a9",
    name: "75-300x300.jpg",
    owner: null,
    version: null,
    metadata: null,
    bucket_id: "images",
    created_at: "2023-05-10T09:22:55.338964+00:00",
    updated_at: "2023-05-10T09:22:55.338964+00:00",
    path_tokens: ["75-300x300.jpg"],
    last_accessed_at: "2023-05-10T09:22:55.338964+00:00",
  },
  schema: "storage",
  old_record: null,
};
const hf = new HfInference(Deno.env.get("HUGGINGFACE_ACCESS_TOKEN"));

serve(async (req) => {
  const webhookPayload: WebhookPayload = await req.json();
  const storageObjectRecord = webhookPayload.record;

  const supabaseAdminClient = createClient<Database>(
    // Supabase API URL - env var exported by default when deployed.
    Deno.env.get("SUPABASE_URL") ?? "",
    // Supabase API SERVICE ROLE KEY - env var exported by default when deployed.
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Construct storage url
  const {
    data: { publicUrl },
  } = supabaseAdminClient.storage
    .from(storageObjectRecord.bucket_id!)
    .getPublicUrl(storageObjectRecord.path_tokens!.join("/"));

  // Caption the image with huggingface
  const imgDesc: string = await hf.imageToText({
    data: await (await fetch(publicUrl)).blob(),
    model: "nlpconnect/vit-gpt2-image-captioning",
  });

  // write caption to db
  await supabaseAdminClient
    .from("image-caption")
    .insert({ id: storageObjectRecord.id!, caption: imgDesc })
    .throwOnError();

  return new Response(JSON.stringify({ status: 200 }), {
    headers: { "Content-Type": "application/json" },
  });
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
