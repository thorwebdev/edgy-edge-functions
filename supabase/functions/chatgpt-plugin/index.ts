import { Application, Router } from "oak";
import manifest from "./manifest.json" assert { type: "json" };
import openapi from "./openapi.json" assert { type: "json" };

console.log("Hello from `chatgpt-plugin` Function!");

const _TODOS: { [key: string]: Array<string> } = {
  global: ["test this plugin template"],
};

/**
 * @openapi
 * components:
 *   schemas:
 *     getTodosResponse:
 *       type: object
 *       properties:
 *         todos:
 *           type: array
 *           items:
 *             type: string
 *           description: The list of todos.
 */

const router = new Router();
router
  .get("/chatgpt-plugin", (ctx) => {
    ctx.response.body =
      "Building ChatGPT plugins with Supabase Edge Functions!";
  })
  /**
   * @openapi
   * /todos/{username}:
   *   get:
   *     operationId: getTodos
   *     summary: Get the list of todos
   *     parameters:
   *     - in: path
   *       name: username
   *       schema:
   *         type: string
   *       required: true
   *       description: The name of the user.
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/getTodosResponse'
   */
  .get("/chatgpt-plugin/todos/:username", (ctx) => {
    const username = ctx.params.username;
    ctx.response.body = _TODOS[username] ?? [];
  })
  .get("/chatgpt-plugin/.well-known/ai-plugin.json", (ctx) => {
    ctx.response.type = "text/json";
    ctx.response.body = JSON.stringify(manifest);
  })
  .get("/chatgpt-plugin/openapi.json", (ctx) => {
    ctx.response.type = "text/json";
    ctx.response.body = JSON.stringify(openapi);
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
