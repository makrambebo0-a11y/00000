import { useEffect, useState, type FormEvent } from "react";
import { LogIn, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isHymnOwner } from "@/lib/hymns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function HymnOwnerAccess({ onOwnerChange }: { onOwnerChange: (owner: boolean) => void }) {
  const [owner, setOwner] = useState(false);
  const [open, setOpen] = useState(false);
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    isHymnOwner().then((value) => { if (active) { setOwner(value); onOwnerChange(value); } });
    return () => { active = false; };
  }, [onOwnerChange]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      if (signup) {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}hymns` } });
        setMessage(error ? "تعذر إنشاء الحساب، حاول مرة أخرى." : "افتح رسالة تأكيد الإيميل، وبعدها سجل دخول.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setMessage("راجع الإيميل وكلمة السر وتأكيد الإيميل."); return; }
        const allowed = await isHymnOwner();
        setOwner(allowed); onOwnerChange(allowed);
        if (allowed) { setOpen(false); setPassword(""); }
        else { await supabase.auth.signOut(); setMessage("الحساب ده مش حساب صاحب الموقع."); }
      }
    } catch { setMessage("تعذر الاتصال، حاول مرة أخرى."); }
    finally { setBusy(false); }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) { setMessage("تعذر تسجيل الخروج."); setOpen(true); return; }
    setOwner(false); onOwnerChange(false);
  }

  return <>
    <Button variant="ghost" className="hymns-ghost" onClick={() => owner ? signOut() : setOpen(true)}>
      {owner ? <LogOut /> : <LogIn />}{owner ? "تسجيل خروج" : "دخول صاحب الموقع"}
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent dir="rtl" className="hymns-page max-w-sm">
        <DialogTitle>{signup ? "إنشاء حساب" : "دخول صاحب الموقع"}</DialogTitle>
        <DialogDescription>نور الحياة</DialogDescription>
        <form onSubmit={submit} className="space-y-3">
          <input aria-label="الإيميل" className="hymns-input" type="email" autoComplete="email" required placeholder="الإيميل" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input aria-label="كلمة السر" className="hymns-input" type="password" autoComplete={signup ? "new-password" : "current-password"} required minLength={6} placeholder="كلمة السر" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" className="hymns-btn w-full" disabled={busy}>{busy ? "جاري الاتصال..." : signup ? "إنشاء حساب" : "دخول"}</Button>
          {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
          <Button variant="link" type="button" disabled={busy} onClick={() => { setSignup(!signup); setMessage(""); }}>{signup ? "عندي حساب" : "أول مرة؟ اعمل حساب"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}