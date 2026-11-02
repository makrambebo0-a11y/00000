import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HymnsNav } from "@/components/HymnsNav";
import { MAX_MB, withAudioUrls, hymnSubmission, removeHymn, type Hymn } from "@/lib/hymns";
import { HymnOwnerAccess } from "@/components/HymnOwnerAccess";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import hero from "@/assets/hymns-hero.jpg";

export const Route = createFileRoute("/hymns")({
  head: () => ({
    meta: [
      { title: "الترانيم | نور الحياة" },
      { name: "description", content: "استمع إلى الترانيم وشارك ترنيمتك مع الجميع." },
      { property: "og:title", content: "الترانيم | نور الحياة" },
      { property: "og:description", content: "استمع إلى الترانيم وشارك ترنيمتك مع الجميع." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" }],
  }),
  component: HymnsPage,
});

function HymnsPage() {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [owner, setOwner] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("hymns").select("*").order("created_at", { ascending: false });
    setError(error ? "تعذر تحميل الترانيم، حاول مرة أخرى." : "");
    setHymns(await withAudioUrls((data ?? []) as Hymn[]));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(hymn: Hymn) {
    if (!window.confirm(`حذف "${hymn.title}" نهائيًا؟`)) return;
    setDeleting(hymn.id); setError("");
    try { await removeHymn(hymn); await load(); }
    catch (error) { setError(error instanceof Error ? error.message : "تعذر الحذف."); }
    finally { setDeleting(null); }
  }

  const shown = hymns.filter((h) => !q || h.title.includes(q) || h.singer?.includes(q) || h.lyrics?.includes(q));

  return (
    <div dir="rtl" lang="ar" className="hymns-page min-h-screen">
      <HymnsNav active="/hymns" />

      <header className="hymns-hero">
        <img src={hero} alt="" width={1600} height={704} className="hymns-hero-img" />
        <div className="hymns-hero-shade" />
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <span className="hymns-chip">♪ سبحوا الرب تسبيحاً جديداً</span>
          <h1 className="hymns-hero-title">الترانيم</h1>
          <p className="hymns-hero-text">استمع إلى أجمل الترانيم، وشارك ترنيمة تحبها مع الجميع.</p>
          <div className="mt-6 max-w-xl">
            <input className="hymns-search" placeholder="ابحث باسم الترنيمة أو المرنم أو الكلمات..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="hymns-subtitle">كل الترانيم</h2>
            <span className="hymns-count">{shown.length} ترنيمة</span>
            <HymnOwnerAccess onOwnerChange={setOwner} />
          </div>
          {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="hymns-card h-24 animate-pulse" />)}</div>
          ) : shown.length === 0 ? (
            <div className="hymns-card py-12 text-center text-muted-foreground">لا توجد ترانيم بعد. كن أول من يضيف ترنيمة!</div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {shown.map((h, i) => (
                <li key={h.id} className="hymns-card hymns-item" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-start gap-3">
                    <span className="hymns-disc">♪</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold">{h.title}</h3>
                      {h.singer && <p className="text-sm text-muted-foreground">{h.singer}</p>}
                    </div>
                    {owner && <Button variant="destructive" size="icon" aria-label={`حذف ${h.title}`} title="حذف الترنيمة" disabled={deleting !== null} onClick={() => remove(h)}><Trash2 /></Button>}
                  </div>
                  {h.url && <audio controls preload="none" src={h.url} className="mt-4 w-full" />}
                  {h.lyrics && (
                    <>
                      <Button variant="ghost" className="hymns-ghost mt-3" onClick={() => setOpen(open === h.id ? null : h.id)}>
                        {open === h.id ? "إخفاء الكلمات" : "عرض الكلمات"}
                      </Button>
                      {open === h.id && <p className="hymns-lyrics">{h.lyrics}</p>}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
        <UploadForm onPublished={load} />
      </main>
    </div>
  );
}

function UploadForm({ onPublished }: { onPublished: () => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [singer, setSinger] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    setMsg(null);
    if (!title.trim()) return setMsg({ ok: false, text: "اكتب اسم الترنيمة" });
    if (!file && !lyrics.trim()) return setMsg({ ok: false, text: "أضف ملف صوتي أو كلمات الترنيمة" });
    if (file && file.size > MAX_MB * 1024 * 1024) return setMsg({ ok: false, text: `حجم الملف أكبر من ${MAX_MB} ميجا` });
    setBusy(true);
    let audio_path: string | null = null;
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp3";
      audio_path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("hymns").upload(audio_path, file, { contentType: file.type });
      if (error) { setBusy(false); return setMsg({ ok: false, text: "تعذر رفع الملف، حاول مرة أخرى" }); }
    }
    const { error } = await supabase.from("hymns").insert(hymnSubmission(title, singer, lyrics, audio_path));
    setBusy(false);
    if (error) return setMsg({ ok: false, text: "حدث خطأ، حاول مرة أخرى" });
    setTitle(""); setSinger(""); setLyrics(""); setFile(null);
    form.reset();
    setMsg({ ok: true, text: "تم نشر ترنيمتك!" });
    await onPublished();
  }

  return (
    <form onSubmit={submit} className="hymns-card hymns-form h-fit space-y-3 lg:sticky lg:top-4">
      <h2 className="hymns-subtitle">شارك ترنيمة</h2>
      <input className="hymns-input" placeholder="اسم الترنيمة *" maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className="hymns-input" placeholder="المرنم / الفريق" maxLength={100} value={singer} onChange={(e) => setSinger(e.target.value)} />
      <textarea className="hymns-input min-h-32" placeholder="كلمات الترنيمة" maxLength={10000} value={lyrics} onChange={(e) => setLyrics(e.target.value)} />
      <label className="hymns-drop">
        <input type="file" accept="audio/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <span className="text-2xl">🎵</span>
        <span className="font-semibold">{file ? file.name : "اختر ملف صوتي"}</span>
        <span className="text-xs text-muted-foreground">حتى {MAX_MB} ميجا</span>
      </label>
      <Button type="submit" disabled={busy} className="hymns-btn w-full">{busy ? "جاري الإرسال..." : "إرسال الترنيمة"}</Button>
      {msg && <p className={msg.ok ? "hymns-ok" : "text-sm text-destructive"}>{msg.text}</p>}
    </form>
  );
}
