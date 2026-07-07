import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type UserDocument = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  updated_at: string;
};

export function useDocuments() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("user_documents")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setDocs(data as UserDocument[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const save = useCallback(async (doc: Omit<UserDocument, "id" | "user_id" | "updated_at">) => {
    if (!user) return null;
    const { data } = await supabase
      .from("user_documents")
      .insert({ user_id: user.id, ...doc })
      .select("*")
      .single();
    if (data) setDocs((d) => [data as UserDocument, ...d]);
    return data as UserDocument | null;
  }, [user]);

  const remove = useCallback(async (id: string) => {
    await supabase.from("user_documents").delete().eq("id", id);
    setDocs((d) => d.filter((x) => x.id !== id));
  }, []);

  return { docs, loading, save, remove, reload: load };
}