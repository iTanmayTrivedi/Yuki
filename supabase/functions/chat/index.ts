// Supabase Edge Function: chat
// Receives { conversation_id, message } → stores user msg, calls Lovable AI Gateway, stores + returns reply.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { conversation_id, message } = await req.json();
    if (!conversation_id || !message) {
      return new Response(JSON.stringify({ error: "conversation_id and message required" }), { status: 400, headers: { ...cors, "content-type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await supabase.from("messages").insert({ conversation_id, role: "user", content: message });

    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(30);

    const messages = [
      { role: "system", content: "You are Yuki, a friendly, concise AI assistant with a Japan-inspired personality. Use markdown when helpful." },
      ...(history ?? []).map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      console.error("AI gateway error", aiRes.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error", detail: text }), { status: 500, headers: { ...cors, "content-type": "application/json" } });
    }

    const aiJson = await aiRes.json();
    const reply: string = aiJson?.choices?.[0]?.message?.content ?? "";

    await supabase.from("messages").insert({ conversation_id, role: "assistant", content: reply });

    return new Response(JSON.stringify({ reply }), { headers: { ...cors, "content-type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "content-type": "application/json" } });
  }
});