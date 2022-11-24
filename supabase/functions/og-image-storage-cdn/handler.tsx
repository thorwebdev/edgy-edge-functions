import React from "https://esm.sh/react@18.2.0";
import { ImageResponse } from "https://deno.land/x/og_edge@0.0.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STORAGE_URL =
  "https://bljghubhkofddfrezkhn.supabase.co/storage/v1/object/public/images/edgy-images/";

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const name = url.searchParams.get("name");

  const storageRes = await fetch(`${STORAGE_URL}${name}.png`);
  if (storageRes.ok) return storageRes;

  const generatedImage = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 128,
          background: "lavender",
        }}
      >
        Hello {name}!
      </div>
    )
  );

  // Upload to Supabase storage
  const supabaseAdminClient = createClient(
    // Supabase API URL - env var exported by default when deployed.
    Deno.env.get("SUPABASE_URL") ?? "",
    // Supabase API SERVICE ROLE KEY - env var exported by default when deployed.
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data, error } = await supabaseAdminClient.storage
    .from("images")
    .upload(`edgy-images/${name}.png`, generatedImage.body!, {
      cacheControl: "3600",
      upsert: false,
    });
  console.log({ data, error });

  return generatedImage;
}
