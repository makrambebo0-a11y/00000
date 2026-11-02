import { createFileRoute } from "@tanstack/react-router";

// GitHub Pages serves the original static homepage as a public file.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      window.location.replace(`${import.meta.env.BASE_URL}home.html`);
    }
  },
  head: () => ({
    meta: [
      { title: "نور الحياة | بوابة القبطية الأرثوذكسية" },
      { name: "description", content: "الكتاب المقدس والأجبية والسنكسار والترانيم في مكان واحد." },
      { property: "og:title", content: "نور الحياة" },
      { property: "og:description", content: "الكتاب المقدس والأجبية والسنكسار والترانيم." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
