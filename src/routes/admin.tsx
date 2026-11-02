import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => { throw redirect({ to: "/hymns" }); },
  head: () => ({ meta: [
    { title: "دخول صاحب الموقع | نور الحياة" },
    { name: "description", content: "دخول صاحب الموقع من صفحة الترانيم." },
    { name: "robots", content: "noindex" },
    { property: "og:title", content: "دخول صاحب الموقع | نور الحياة" },
    { property: "og:description", content: "دخول صاحب الموقع من صفحة الترانيم." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});
