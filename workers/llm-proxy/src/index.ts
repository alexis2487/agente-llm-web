cd C:\Users\jaira\OneDrive\Desktop\agente-llm-web\workers\llm-proxy

@'
import { Hono } from "hono";

type Env = {
  Bindings: {
    OPENAI_API_KEY: string;
    ALLOW_ORIGIN?: string;
  };
};

const app = new Hono<Env>();

// --- CORS básico (ajustaremos en prod) ---
app.use("*", async (c, next) => {
  const origin = c.env.ALLOW_ORIGIN ?? "*";
  c.header("Access-Control-Allow-Origin", origin);
  c.header("Access-Control-Allow-Headers", "content-type");
  c.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (c.req.method === "OPTIONS") return c.text("", 204);
  await next();
});

// --- Healthcheck ---
app.get("/health", (c) => c.json({ ok: true, service: "llm-proxy" }));

// --- Tipos mínimos ---
type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
type ChatRequest = {
  messages: ChatMessage[];
  model?: string; // opcional, default gpt-4o-mini
  temperature?: number;
  max_tokens?: number;
};

// --- POST /chat: llama a OpenAI (no-stream) ---
app.post("/chat", async (c) => {
  let body: ChatRequest;
  try {
    body = await c.req.json<ChatRequest>();
  } catch {
    return c.json({ error: "invalid_json" }, 400);
  }

  if (!body?.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return c.json({ error: "bad_request", detail: "messages required" }, 400);
  }

  const model = body.model ?? "gpt-4o-mini";
  const temperature = body.temperature ?? 0.7;
  const max_tokens = body.max_tokens;

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: body.messages,
      temperature,
      ...(max_tokens ? { max_tokens } : {}),
      stream: false,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    return c.json(
      { error: "upstream_error", status: resp.status, detail: text.slice(0, 500) },
      500
    );
  }

  const data = await resp.json<any>();
  const content: string | undefined = data?.choices?.[0]?.message?.content;

  if (!content) {
    return c.json({ error: "empty_response" }, 502);
  }

  return c.json({
    model,
    message: { role: "assistant", content },
  });
});

export default app;
'@ | Set-Content -Encoding UTF8 "src\index.ts"
