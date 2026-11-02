# نور الحياة — GitHub Pages

المشروع مجهز للنشر كواجهة ثابتة على GitHub Pages. لا يحتاج إلى سيرفر خاص لتشغيل الواجهة. صفحة الترانيم تستخدم Supabase مباشرة من المتصفح لتسجيل الدخول وقاعدة البيانات وتخزين الصوتيات.

## النشر على GitHub Pages

1. ارفع محتويات هذا المشروع إلى مستودع GitHub على الفرع `main`.
2. من **Settings → Secrets and variables → Actions → Variables** أضف:
   - `VITE_SUPABASE_URL`: رابط مشروع Supabase.
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: مفتاح Supabase العام (publishable/anon).
3. من **Settings → Pages → Build and deployment** اختر **GitHub Actions**.
4. أضف رابط موقع GitHub Pages الكامل إلى **Supabase → Authentication → URL Configuration → Redirect URLs**، مثل `https://USERNAME.github.io/REPOSITORY/hymns`، واضبط Site URL على رابط الموقع الأساسي.
5. ادفع أي تحديث إلى `main` أو شغّل سير العمل `Deploy to GitHub Pages` يدويًا من تبويب Actions.

سير العمل يضبط مسار المستودع تلقائيًا، لذلك يعمل أيضًا على رابط `username.github.io/repository/`.

## التشغيل المحلي

```bash
bun install
cp .env.example .env.local
# املأ قيم Supabase في .env.local
bun run dev
```

## تنبيه بخصوص الوظائف الخلفية

GitHub Pages لا يشغّل API أو سيرفر Node. الترانيم والحسابات والصوتيات تبقى على Supabase، ويجب تطبيق migrations وسياسات RLS الموجودة في `supabase/` على مشروعك. لا تضع `service_role` أو أي مفتاح سري في متغير يبدأ بـ `VITE_` أو داخل GitHub Pages.

الحد في واجهة الرفع مضبوط على 100 ميجا، لكن حد الرفع الفعلي تحدده خطة وإعدادات Storage في Supabase. الخطة المجانية قد لا تسمح بملف 100 ميجا؛ يلزم التحقق من إعدادات مشروعك أو استخدام مزود تخزين يدعم ذلك. هذا التعديل لا ينقل الحسابات أو الترانيم أو الملفات الصوتية الموجودة.
