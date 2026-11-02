<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
# Agents

- The original static site lives in public/ (home page is public/home.html); `/` redirects there. New dynamic pages (e.g. /hymns) are TanStack routes linked from the static nav. Why: keep the user's hand-written HTML intact.
- Keep hymn publishing and owner deletion on /hymns; /admin is a compatibility redirect only. Enforce deletion through role-scoped RLS and revalidate roles before deletion, because hiding a control is not authorization.
