import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Paperclip, Globe, Mic, Square, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChatStore, type ChatMessage } from "@/lib/chat-store";
import logo from "@/assets/yuki-logo.png";
import { useAuth } from "@/hooks/use-auth";

export function ChatWindow({ header }: { header?: React.ReactNode }) {
  const {
    conversationId,
    messages,
    pending,
    pendingPrompt,
    setConversation,
    setMessages,
    appendMessage,
    setPending,
    setPendingPrompt,
  } = useChatStore();
  const [input, setInput] = useState("");
  const [webSearch, setWebSearch] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    if (!conversationId) return;
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (data)
        setMessages(
          data.map((m) => ({
            id: m.id,
            content: m.content,
            created_at: m.created_at ?? undefined,
            role: m.role as "user" | "assistant",
          })),
        );
    })();
  }, [conversationId, setMessages]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || pending) return;
    setInput("");

    let finalMessage = message;
    if (webSearch) finalMessage = `[Web search requested] ${finalMessage}`;
    if (attachment) finalMessage = `${finalMessage}\n\n(Attached file: ${attachment.name})`;
    const savedAttachment = attachment;
    setAttachment(null);

    let convId = conversationId;
    if (!convId) {
      if (!user) return;
      const { data, error } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title: message.slice(0, 60) })
        .select("id")
        .single();
      if (error || !data) {
        console.error("[ChatWindow] create conversation failed", error);
        return;
      }
      convId = data.id;
      setConversation(convId);
    }

    appendMessage({ id: crypto.randomUUID(), role: "user", content: finalMessage });
    setPending(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: convId, message: finalMessage, web_search: webSearch }),
      });
      const data = await res.json().catch(() => ({} as Record<string, unknown>));
      if (!res.ok) throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
      const reply =
        (data as { reply?: string; message?: string })?.reply ??
        (data as { message?: string })?.message ??
        "";
      appendMessage({ id: crypto.randomUUID(), role: "assistant", content: reply || "…" });
    } catch (e) {
      console.error("[ChatWindow] send failed", e);
      appendMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      });
      if (savedAttachment) setAttachment(savedAttachment);
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (pendingPrompt) {
      const t = pendingPrompt;
      setPendingPrompt(null);
      void send(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background overflow-hidden">
      {header}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 && !pending && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Start a conversation with Yuki
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {pending && (
          <div className="flex items-start gap-3">
            <img src={logo.url} alt="" className="h-8 w-8 rounded-full bg-white p-1 border border-border" />
            <div className="rounded-2xl bg-accent/40 px-4 py-3 text-sm text-muted-foreground">
              <span className="inline-flex gap-1">
                <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-card px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="rounded-2xl border border-border bg-background px-4 py-2"
        >
          {attachment && (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-md bg-accent/40 px-2.5 py-1.5 text-[11px]">
              <span className="flex min-w-0 items-center gap-1.5 truncate">
                <Paperclip className="h-3 w-3 shrink-0" />
                <span className="truncate">{attachment.name}</span>
              </span>
              <button type="button" onClick={() => setAttachment(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <img src={logo.url} alt="" className="h-5 w-5" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={pending ? "Yuki is thinking..." : "Ask Yuki anything..."}
              className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <button type="button" className="text-muted-foreground hover:text-foreground">
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="rounded-full bg-primary p-2 text-primary-foreground disabled:opacity-50"
            >
              {pending ? <Square className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2 pl-7">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
            />
            <Chip
              icon={<Paperclip className="h-3 w-3" />}
              onClick={() => fileRef.current?.click()}
              active={!!attachment}
            >
              Attach
            </Chip>
            <Chip
              icon={<Globe className="h-3 w-3" />}
              onClick={() => setWebSearch((v) => !v)}
              active={webSearch}
            >
              Web Search
            </Chip>
          </div>
        </form>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          🔒 Yuki can make mistakes. Please double-check important info.
        </p>
      </div>
    </div>
  );
}

function Chip({
  children,
  icon,
  onClick,
  active,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:bg-accent/40"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl bg-accent/60 px-4 py-2.5 text-sm text-accent-foreground">
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <img src={logo.url} alt="" className="h-8 w-8 rounded-full bg-white p-1 border border-border shrink-0" />
      <div className="max-w-[80%] rounded-2xl bg-background border border-border px-4 py-3 text-sm">
        <div className="prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-2">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}