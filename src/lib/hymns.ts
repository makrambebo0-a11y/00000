import { supabase } from "@/integrations/supabase/client";

export const MAX_MB = 100;

export function hymnSubmission(title: string, singer: string, lyrics: string, audio_path: string | null) {
  return { title: title.trim(), singer: singer.trim() || null, lyrics: lyrics.trim() || null, audio_path, status: "approved" };
}

export async function isHymnOwner() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return false;
  const result = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  return !result.error && result.data === true;
}

export async function removeHymn(hymn: Hymn) {
  if (!(await isHymnOwner())) throw new Error("الحذف متاح لصاحب الموقع فقط.");
  if (hymn.audio_path) {
    const { error } = await supabase.storage.from("hymns").remove([hymn.audio_path]);
    if (error) throw new Error("تعذر حذف الملف الصوتي، حاول مرة أخرى.");
  }
  const { data, error } = await supabase.from("hymns").delete().eq("id", hymn.id).select("id");
  if (error || !data?.length) throw new Error("تعذر حذف الترنيمة، حاول مرة أخرى.");
}

export type Hymn = {
  id: string;
  title: string;
  singer: string | null;
  lyrics: string | null;
  audio_path: string | null;
  status: string;
  created_at: string;
  url?: string | undefined;
};

export async function withAudioUrls(rows: Hymn[]): Promise<Hymn[]> {
  const paths = rows.map((r) => r.audio_path).filter(Boolean) as string[];
  if (!paths.length) return rows;
  const { data } = await supabase.storage.from("hymns").createSignedUrls(paths, 60 * 60 * 6);
  const map = new Map(data?.map((s) => [s.path, s.signedUrl]));
  return rows.map((r) => ({ ...r, url: r.audio_path ? map.get(r.audio_path) ?? undefined : undefined }));
}
