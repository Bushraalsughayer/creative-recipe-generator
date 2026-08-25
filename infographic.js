
const SHEET_ID = "16iOSnylKxHB5XmvjWpdazfsKNHPrkfU-vc7lQIfhyuI";

/*
  Reads a Google Sheet tab using Google Visualization's JSONP response.
  This avoids browser CORS issues on a static GitHub Pages site.
*/
function loadGoogleSheetTab(sheetName) {
  return new Promise((resolve, reject) => {
    const callbackName = "__sheetCallback_" + Math.random().toString(36).slice(2);
    const script = document.createElement("script");
    const timer = setTimeout(() => cleanup(new Error("Sheet loading timed out")), 8000);

    function cleanup(error, value) {
      clearTimeout(timer);
      delete window[callbackName];
      script.remove();
      error ? reject(error) : resolve(value);
    }

    window[callbackName] = response => {
      try {
        if (!response || response.status !== "ok") {
          throw new Error("Google Sheet response was not OK");
        }

        const cols = response.table.cols.map(c => (c.label || "").trim());
        const rows = response.table.rows.map(row =>
          row.c.map(cell => cell && cell.v != null ? String(cell.v).trim() : "")
        );

        const data = {};
        cols.forEach((header, colIndex) => {
          if (!header) return;
          data[header] = rows.map(r => r[colIndex] || "").filter(Boolean);
        });
        cleanup(null, data);
      } catch (err) {
        cleanup(err);
      }
    };

    const tqx = `out:json;responseHandler:${callbackName}`;
    script.src =
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?` +
      `sheet=${encodeURIComponent(sheetName)}&tqx=${encodeURIComponent(tqx)}`;

    script.onerror = () => cleanup(new Error("Could not load Google Sheet"));
    document.head.appendChild(script);
  });
}

function firstExistingColumn(data, names) {
  for (const name of names) {
    if (Array.isArray(data[name]) && data[name].length) return data[name];
  }
  return null;
}

const FALLBACK = {
  topics: [
    "كيف تتغير مدينة واحدة خلال 24 ساعة","رحلة حبة القهوة من المزرعة إلى الكوب",
    "ماذا يحدث لنفاياتنا بعد رميها","دورة حياة قطعة ملابس","كيف يستخدم الناس هواتفهم خلال اليوم",
    "كم تستهلك أنشطتنا اليومية من الماء دون أن نشعر","رحلة طرد من الطلب حتى الوصول",
    "كيف تنضج ثمرة الرطب","كيف تتغير الظلال في المكان خلال اليوم",
    "ماذا يحدث في المطار خلال ساعة واحدة","أين يذهب وقتنا في يوم عادي",
    "كيف ينتقل خبر أو ترند عبر الإنترنت","ماذا يحدث خلف الكواليس عندما نضغط إرسال",
    "حياة منتج قبل أن يصل إلى رف المتجر","كيف تتغير الأشياء التي نحملها معنا مع العمر",
    "كيف يتغير استخدام مكان واحد بين الصباح والمساء","كيف تنتقل المياه من المصدر إلى المنزل",
    "كيف تتغير عادات الطعام بين الأجيال","كيف تتحرك الحشود داخل فعالية كبيرة",
    "ماذا يحدث للطعام الذي لا نأكله"
  ],
  audiences: [
    "أطفال من 7 إلى 10 سنوات","أطفال من 11 إلى 13 سنة","مراهقين من 14 إلى 18 سنة",
    "طلاب جامعات","شباب من 20 إلى 30 سنة","بالغين غير متخصصين","كبار السن","عائلات",
    "زوار وسياح","جمهور عام لديه معرفة محدودة بالموضوع",
    "أشخاص مهتمين بالموضوع لكنهم غير متخصصين",
    "أشخاص يعرفون أساسيات الموضوع ويريدون التعمق",
    "متخصصين أو ممارسين في المجال"
  ],
  goals: [
    "مقارنة معلومات مختلفة","اكتشاف التغير عبر الزمن","فهم تسلسل عملية أو رحلة",
    "استكشاف العلاقات بين أجزاء نظام","الانتقال من الصورة العامة إلى التفاصيل",
    "اكتشاف أنماط أو فروق مخفية","رؤية أثر تغيير عامل واحد على النتيجة",
    "العثور على المعلومة الأكثر ارتباطًا به","استكشاف المعلومات حسب المكان",
    "فهم العلاقة بين السبب والنتيجة","تكوين فهم تدريجي لموضوع معقد",
    "اختبار توقعاته ثم مقارنتها بالبيانات"
  ]
};

const state = {
  data: structuredClone(FALLBACK),
  locked: { topics:false, audiences:false, goals:false },
  current: { topics:"", audiences:"", goals:"" }
};

const $ = id => document.getElementById(id);

function randomItem(list, previous) {
  if (!list.length) return "";
  if (list.length === 1) return list[0];
  let next = list[Math.floor(Math.random() * list.length)];
  while (next === previous) next = list[Math.floor(Math.random() * list.length)];
  return next;
}

function generate() {
  ["topics","audiences","goals"].forEach(key => {
    if (!state.locked[key]) state.current[key] = randomItem(state.data[key], state.current[key]);
    $(key + "Text").textContent = state.current[key];
  });
}

function briefText() {
  return `صمّم إنفوجرافيك تفاعلي عن ${state.current.topics}. موجّه إلى ${state.current.audiences}. صمّم التجربة بحيث تساعد المستخدم على ${state.current.goals}.`;
}

async function loadSheetData() {
  try {
    const sheet = await loadGoogleSheetTab("Interactive Infographic");

    state.data.topics =
      firstExistingColumn(sheet, ["Topic","Topics","الموضوع","الموضوعات"]) || FALLBACK.topics;

    state.data.audiences =
      firstExistingColumn(sheet, ["Audience","Audiences","الفئة المستهدفة","الفئات المستهدفة"]) || FALLBACK.audiences;

    state.data.goals =
      firstExistingColumn(sheet, ["Interaction Goal","Interaction Goal ","InteractionGoal","Goals","هدف التفاعل","أهداف التفاعل"]) || FALLBACK.goals;
  } catch (err) {
    console.warn("Using built-in infographic lists because Google Sheet could not be loaded.", err);
  }
}

document.querySelectorAll(".lock-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.key;
    state.locked[key] = !state.locked[key];
    btn.classList.toggle("locked", state.locked[key]);
    btn.textContent = state.locked[key] ? "● مثبّت" : "○ تثبيت";
  });
});

$("generateBtn").addEventListener("click", generate);

$("copyBtn").addEventListener("click", () => {
  navigator.clipboard.writeText(briefText()).then(() => {
    $("statusMessage").textContent = "تم نسخ الوصفة.";
    setTimeout(() => $("statusMessage").textContent = "", 1500);
  });
});

$("aboutBtn").addEventListener("click", () => $("aboutDialog").showModal());
document.querySelectorAll("[data-close]").forEach(btn =>
  btn.addEventListener("click", () => $(btn.dataset.close).close())
);

(async function init() {
  await loadSheetData();
  generate();
})();
