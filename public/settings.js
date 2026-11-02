/* settings.js — يطبّق إعدادات صفحة الخيارات على كل صفحات الموقع */
(function () {
  var g = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var r = document.documentElement;
  function apply() {
    var t = g("theme") || "light";
    if (t === "auto") t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    r.dataset.theme = t;
    var fs = parseInt(g("fs")), lh = parseFloat(g("lh")), ff = g("ff");
    var css = "";
    if (fs) css += "--fs:" + fs + "px;";
    if (lh) css += "--lh:" + lh + ";";
    if (ff) css += "--ff:" + (ff === "cairo" ? "Cairo" : "Amiri") + ";";
    var st = document.getElementById("nh-settings") || document.createElement("style");
    st.id = "nh-settings";
    st.textContent = ":root{" + css + "}" +
      ".rd-text,#rdText,#syn-text,#text,#text *,#content,#content *,.reading-text{" +
      (fs ? "font-size:var(--fs)!important;" : "") +
      (lh ? "line-height:var(--lh)!important;" : "") +
      "}" + (ff ? "body,body *:not(i):not(svg):not([data-lucide]){font-family:var(--ff),serif!important;}" : "");
    (document.head || r).appendChild(st);
  }
  if (!document.getElementById("nh-fonts")) {
    var l = document.createElement("link"); l.id = "nh-fonts"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;900&display=swap";
    (document.head || r).appendChild(l);
  }
  apply();
  document.addEventListener("DOMContentLoaded", function () {
    apply();
    if (!document.getElementById("nh-copy")) {
      var f = document.createElement("footer"); f.id = "nh-copy";
      f.textContent = "© " + new Date().getFullYear() + " نور الحياة — جميع الحقوق محفوظة";
      f.style.cssText = "text-align:center;padding:18px 12px 100px;font:600 14px Cairo,sans-serif;opacity:.75";
      document.body.appendChild(f);
    }
  });
  window.addEventListener("storage", apply);
  window.addEventListener("pageshow", apply);
  var isOptions = /options\.html$/i.test(location.pathname);
  if (!isOptions) document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("nh-opt-btn")) return;
    var a = document.createElement("a");
    a.id = "nh-opt-btn"; a.href = "options.html"; a.title = "الخيارات"; a.textContent = "⚙️";
    a.style.cssText = "position:fixed;left:16px;bottom:90px;z-index:9999;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;text-decoration:none;background:linear-gradient(135deg,#151e73,#2a3ba8);box-shadow:0 6px 18px rgba(21,30,115,.3)";
    document.body.appendChild(a);
  });
})();
