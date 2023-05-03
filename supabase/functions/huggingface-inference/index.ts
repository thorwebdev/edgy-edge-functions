import { HfInference } from "https://esm.sh/@huggingface/inference@2.2.0";

console.log("Hello from `huggingface-inference`!");

// Get your API token from
const hf = new HfInference();

import { Application, Router } from "oak";

const router = new Router();
router
  // Note: path should be prefixed with function name
  .get("/huggingface-inference", (context) => {
    context.response.body = `Huggingface.js playground in Deno Edge Functions. Supported routes: ["/translation", "/textToSpeech", "/textToImage"]`;
  })
  .get("/huggingface-inference/translation", async (context) => {
    console.log("Running `translation` with `t5-base` model.");
    const res: string = await hf.translation({
      model: "t5-base",
      inputs: "My name is Wolfgang and I live in Berlin",
    });

    context.response.body = res;
  })
  .get("/huggingface-inference/textToSpeech", async (context) => {
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
  .get("/huggingface-inference/textToImage", async (context) => {
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
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });