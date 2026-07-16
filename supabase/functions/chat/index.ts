import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODELS = [
  "llama-3.3-70b-versatile",
];

const SYSTEM_PROMPT =
  "You are Yuki, a warm, thoughtful AI travel companion specializing in Japan. Give concise, practical, evocative recommendations with a light poetic touch. Use short paragraphs.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation_id, message } = await req.json();
    if (!message) {
      return json({ error: "message is required" }, 400);
    }  

    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      return json({ error: "GROQ_API_KEY not configured" }, 500);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Load prior messages for context
    let history: { role: string; content: string }[] = [];
    if (conversation_id) {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/messages?conversation_id=eq.${conversation_id}&select=role,content&order=created_at.asc`,
        {
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
        },
      );
      if (res.ok) history = await res.json();
    }

    // Persist user message
    if (conversation_id) {
      await fetch(`${supabaseUrl}/rest/v1/messages`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id,
          role: "user",
          content: message,
        }),
      });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content: message },
    ];

    let reply: string | null = null;
    let lastError = "";
    for (const model of MODELS) {
      const r = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ model, messages }),
        },
      );
      const data = await r.json().catch(() => ({}));
      if (r.ok && data?.choices?.[0]?.message?.content) {
        reply = data.choices[0].message.content;
        break;
      }
      lastError = `${r.status} ${JSON.stringify(data)}`;
      console.warn(`Model ${model} failed:`, lastError);
      // Only try fallback on rate-limit / server errors
      if (r.status !== 429 && r.status < 500) break;
    }

    if (!reply) {
      console.error("All models failed:", lastError);
      reply =
        "Yuki is a little overwhelmed right now (the free AI models are rate-limited). Please try again in a moment. 🍵";
    }

    // Persist assistant reply
    if (conversation_id) {
      await fetch(`${supabaseUrl}/rest/v1/messages`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id,
          role: "assistant",
          content: reply,
        }),
      });
    }

    return json({ reply });
  } catch (e) {
    console.error("chat function error:", e);
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}