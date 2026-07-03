import { create } from "zustand";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

type State = {
  conversationId: string | null;
  messages: ChatMessage[];
  pending: boolean;
  pendingPrompt: string | null;
  setConversation: (id: string | null) => void;
  setMessages: (m: ChatMessage[]) => void;
  appendMessage: (m: ChatMessage) => void;
  setPending: (v: boolean) => void;
  setPendingPrompt: (v: string | null) => void;
  reset: () => void;
};

export const useChatStore = create<State>((set) => ({
  conversationId: null,
  messages: [],
  pending: false,
  pendingPrompt: null,
  setConversation: (id) => set({ conversationId: id }),
  setMessages: (messages) => set({ messages }),
  appendMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setPending: (pending) => set({ pending }),
  setPendingPrompt: (pendingPrompt) => set({ pendingPrompt }),
  reset: () => set({ conversationId: null, messages: [], pending: false, pendingPrompt: null }),
}));