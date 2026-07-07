export type Role = "user" | "assistant" | "system";

export type Intent =
  | "career"
  | "visa"
  | "language"
  | "travel"
  | "culture"
  | "general";

export type Register = "keigo" | "polite" | "casual";

export type Message = {
  id: string;
  role: Role;
  content: string;
  intent?: Intent;
  rich?: RichResponse | null;
  created_at?: string;
};

export type Conversation = {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string | null;
};

export type StreamChunk =
  | { type: "token"; text: string }
  | { type: "done"; message: Message }
  | { type: "error"; error: string };

export type RoadmapMilestone = {
  when: string; // e.g. "Q1 2027" or "2028-04"
  title: string;
  detail: string;
  done?: boolean;
};

export type ItineraryDay = {
  day: number;
  city: string;
  highlights: string[];
};

export type RichResponse =
  | { kind: "roadmap"; title: string; milestones: RoadmapMilestone[] }
  | { kind: "timeline"; title: string; entries: RoadmapMilestone[] }
  | { kind: "itinerary"; destination: string; days: ItineraryDay[] }
  | { kind: "card"; title: string; body: string; footer?: string };

