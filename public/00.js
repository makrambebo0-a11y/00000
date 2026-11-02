// 1. مصفوفة أسماء الشهور القبطية
const copticMonths = [
  "توت", "بابه", "هاتور", "كيهك", "طوبة", "أمشير",
  "برمهات", "برمودة", "بشنس", "بؤونة", "أبيب", "مسرى", "النسيء"
];

// 2. دالة حساب التاريخ القبطي من التاريخ الميلادي الحالي
function calculateCopticDate(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = يناير
  const day = date.getDate();

  // التحقق من السنة الكبيسة الميلادية السابقة لمعرفة هل عيد النيروز 11 أم 12 سبتمبر
  const isPrevLeap = (year - 1) % 4 === 0;
  const newYearDay = isPrevLeap ? 12 : 11;

  // بداية السنة القبطية الحالية
  let copticYear = year - 283;
  let startOfCopticYear = new Date(year, 8, newYearDay); // 8 تعني شهر سبتمبر

  // إذا كان التاريخ الحالي قبل 11/12 سبتمبر، فنحن نتبع السنة القبطية السابقة
  if (date < startOfCopticYear) {
    copticYear--;
    const isLeapBefore = (year - 2) % 4 === 0;
    startOfCopticYear = new Date(year - 1, 8, isLeapBefore ? 12 : 11);
  }

  // حساب الفرق بالأيام بين اليوم الحالي وبداية السنة القبطية
  const diffTime = Math.abs(date - startOfCopticYear);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // تحديد الشهر واليوم القبطي
  const monthIndex = Math.floor(diffDays / 30);
  const copticDay = (diffDays % 30) + 1;
  const copticMonth = copticMonths[monthIndex] || "النسيء";

  return {
    day: copticDay,
    month: copticMonth,
    year: copticYear,
    formatted: `${copticDay} ${copticMonth} ${copticYear} للشهداء`
  };
}

// 3. دالة تحديث الواجهة التلقائي
function updateCopticUI() {
  const copticData = calculateCopticDate();

  // تحديث نص التاريخ القبطي في بطاقة الصفحة الرئيسية
  const dateDisplay = document.getElementById('coptic-date-display');
  if (dateDisplay) {
    dateDisplay.textContent = copticData.formatted;
  }

  // تحديث عنوان التذكار في قسم السنكسار تلقائياً
  const synaxariumTitle = document.getElementById('synaxarium-date-title');
  if (synaxariumTitle) {
    synaxariumTitle.textContent = `تذكار اليوم: ${copticData.day} ${copticData.month}`;
  }
}

// 4. تشغيل التحديث فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  updateCopticUI();
});
// ===== تحويل التاريخ الميلادي لقبطي =====
const coptic_months = [
  "توت","بابه","هاتور","كيهك","طوبه","أمشير",
  "برمهات","برمودة","بشنس","بئونه","أبيب","مسرى","النسيء"
];

function toCoptic(date) {
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  // رقم اليوم الجولياني
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a, mm = m + 12 * a - 3;
  const jdn = d + Math.floor((153 * mm + 2) / 5) + 365 * yy +
    Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  const c = jdn - 1824665; // بداية التقويم القبطي
  const year = Math.floor((4 * c + 3) / 1461);
  const dayOfYear = c - Math.floor((1461 * year) / 4);
  const month = Math.floor(dayOfYear / 30);
  const day = (dayOfYear % 30) + 1;
  return { year, month: month + 1, day };
}

// ===== بيانات السنكسار =====
// المفتاح: "الشهر-اليوم" (رقم الشهر القبطي - اليوم)
const synaxarium = {
  "1-1":  { title: "عيد النيروز", text: "اكتبي هنا نص سنكسار 1 توت..." },
  "1-2":  { title: "عنوان اليوم", text: "نص السنكسار..." },
  "1-3":  { title: "عنوان اليوم", text: "نص السنكسار..." }
  // كملي باقي الأيام بنفس الشكل
};

// ===== عرض سنكسار النهاردة =====
function showSynaxarium() {
  const c = toCoptic(new Date());
  const key = c.month + "-" + c.day;
  const data = synaxarium[key];

  document.getElementById("syn-date").textContent =
    c.day + " " + coptic_months[c.month - 1] + " " + c.year;

  document.getElementById("syn-title").textContent =
    data ? data.title : "لا يوجد نص لهذا اليوم";

  document.getElementById("syn-text").textContent =
    data ? data.text : "";
}

showSynaxarium();
function render(list) {
  grid.innerHTML = "";
  if (!list.length) { grid.innerHTML = '<div class="bk-empty">لا توجد نتائج</div>'; return; }
  list.forEach((b, i) => {
    const a = document.createElement("a");
    a.className = "bk-card";
    a.href = b.href;
    a.style.animationDelay = (i * 0.06) + "s";

    // لو الكتاب له صورة نعرضها، وإلا نعرض الإيموجي
    const pic = b.img ? `<img src="${b.img}" alt="${b.title}">` : (b.icon || "📖");

    a.innerHTML = `<div class="bk-icon">${pic}</div><h2>${b.title}</h2><p>${b.desc}</p><span class="bk-open">فتح الكتاب ←</span>`;
    grid.appendChild(a);
  });
}
const items = [
  { 
    img: "00.png", // أو رابط الصورة مباشر
    title: "الأجبية", 
    href: "#", 
    desc: "صلوات السبعة أوقات: باكر والثالثة والسادسة والتاسعة والغروب والنوم ونصف الليل." 
  },
  // باقي العناصر...
];