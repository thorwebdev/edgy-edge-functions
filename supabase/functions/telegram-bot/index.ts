import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import {
  Bot,
  webhookCallback,
} from "https://deno.land/x/grammy@v1.14.1/mod.ts";

const bot = new Bot(Deno.env.get("BOT_TOKEN") || "");

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`));

const handleUpdate = webhookCallback(bot, "std/http");

console.log(`Bot is running!`);

serve(async (req) => {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("secret") !== Deno.env.get("FUNCTION_SECRET")) {
      return new Response("not allowed", { status: 405 });
    }

    const response = await handleUpdate(req);
    return response;
  } catch (err) {
    console.error(err);
    return new Response("error", { status: 400 });
  }
});

console.log(`Function "telegram-bot" up and running!`);
