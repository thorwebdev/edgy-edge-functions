import { HfInference } from "https://esm.sh/@huggingface/inference@2.3.2";

console.log("Hello from `hf-inference`!");

// Get your API token from
const hf = new HfInference(Deno.env.get("HUGGINGFACE_ACCESS_TOKEN"));

import { Application, Router } from "oak";

const router = new Router();
router
  // Note: path should be prefixed with function name
  .get("/hf-inference", (context) => {
    context.response.body = `Huggingface.js playground in Deno Edge Functions. Supported routes: ["/translation", "/textToSpeech", "/textToImage", '/imageToText']`;
  })
  .get("/hf-inference/translation", async (context) => {
    console.log("Running `translation` with `t5-base` model.");
    const res = await hf.translation({
      model: "t5-base",
      inputs: "My name is Wolfgang and I live in Berlin",
    });

    context.response.body = res.translation_text;
  })
  .get("/hf-inference/textToSpeech", async (context) => {
    console.log(
      "Running `textToSpeech` with `espnet/kan-bayashi_ljspeech_vits` model."
    );
    const blob: Blob = await hf.textToSpeech({
      model: "espnet/kan-bayashi_ljspeech_vits",
      inputs: "hello from supabase edge functions!",
    });

    context.response.body = blob;
    context.response.headers.set("Content-Type", "audio/wav");
  })
  .get("/hf-inference/textToImage", async (context) => {
    console.log(
      "Running `textToImage` with `stabilityai/stable-diffusion-2` model."
    );
    const blob: Blob = await hf.textToImage({
      model: "stabilityai/stable-diffusion-2",
      inputs: "Postgres, the most powerful database in the world!",
      parameters: {
        negative_prompt: "blurry",
      },
    });

    context.response.body = blob;
    context.response.headers.set("Content-Type", "image/png");
  })
  .get("/hf-inference/imageToText", async (context) => {
    console.log(
      "Running `imageToText` with `nlpconnect/vit-gpt2-image-captioning` model."
    );
    const imgDesc = await hf.imageToText({
      data: await (await fetch("https://picsum.photos/300/300")).blob(),
      model: "nlpconnect/vit-gpt2-image-captioning",
    });

    context.response.body = imgDesc.generated_text;
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
