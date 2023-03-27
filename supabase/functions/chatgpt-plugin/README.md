# Build a ChatGPT Plugin

## Generate openapi spec

```bash
deno run -A supabase/functions/chatgpt-plugin/generate_openapi_spec.ts
```

## Deploy function

```bash
supabase functions deploy chatgpt-plugin --no-verify-jwt
```
