const NAV = [
  { href: "/home.html", label: "الرئيسية" },
  { href: "/bible.html", label: "الكتاب المقدس" },
  { href: "/agpeya.html", label: "الأجبية" },
  { href: "/synaxarium.html", label: "السنكسار" },
  { href: "/games.html", label: "الألعاب" },
  { href: "/hymns", label: "الترانيم" },
];

export function HymnsNav({ active }: { active?: string }) {
  return (
    <nav className="hymns-nav">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <a href="/home.html" className="flex items-center gap-2">
          <span className="hymns-logo">ن</span>
          <span className="text-lg font-black text-primary-foreground">نور الحياة</span>
        </a>
        <div className="flex flex-wrap gap-1">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className={n.href === active ? "hymns-nav-link active" : "hymns-nav-link"}>
              {n.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
