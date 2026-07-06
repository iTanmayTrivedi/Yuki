import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  location: string | null;
  bio: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

// Convert a storage path to a signed URL (private bucket)
async function toSigned(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (data) {
      setProfile(data as Profile);
      setAvatarUrl(await toSigned(data.avatar_url));
      setBannerUrl(await toSigned(data.banner_url));
    } else {
      // Fallback: create one if trigger somehow missed
      const meta = user.user_metadata as { full_name?: string } | null;
      const { data: inserted } = await supabase
        .from("profiles")
        .insert({ id: user.id, full_name: meta?.full_name ?? user.email?.split("@")[0] ?? null })
        .select("*")
        .single();
      if (inserted) setProfile(inserted as Profile);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function update(patch: Partial<Profile>) {
    if (!user) return;
    const { data } = await supabase.from("profiles").update(patch).eq("id", user.id).select("*").single();
    if (data) {
      setProfile(data as Profile);
      if (patch.avatar_url !== undefined) setAvatarUrl(await toSigned(data.avatar_url));
      if (patch.banner_url !== undefined) setBannerUrl(await toSigned(data.banner_url));
    }
  }

  async function uploadImage(file: File, kind: "avatar" | "banner"): Promise<string | null> {
    if (!user) return null;
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      console.error("[useProfile] upload error", error);
      return null;
    }
    await update(kind === "avatar" ? { avatar_url: path } : { banner_url: path });
    return path;
  }

  return { profile, avatarUrl, bannerUrl, loading, update, uploadImage, reload: load };
}