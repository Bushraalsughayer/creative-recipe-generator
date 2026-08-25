
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
  subjects: [
    "الأشياء التي يحتفظ بها الناس لقيمتها العاطفية","الانتظار","الطقوس الصغيرة التي نكررها كل يوم",
    "الأشياء التي تختفي من حياتنا تدريجيًا","الأشياء التي نجمعها دون أن نخطط لذلك",
    "الآثار التي يتركها الناس خلفهم","الطعام بوصفه ذاكرة","الجانب الهادئ من مكان مزدحم",
    "الأشياء التي نصلحها بدل أن نستبدلها","أشياء عادية تحمل قصصًا غير عادية",
    "عادات محلية لا يلاحظها الزائر بسهولة","ما يحمله الناس في حقائبهم",
    "اللغة البصرية لحيّ أو شارع","أشياء لا تحدث إلا ليلًا",
    "الطرق التي نعبّر بها عن مرور الوقت","مكان يتغير على مدار اليوم"
  ],
  perspectives: [
    "طفل","سائح يزور المكان لأول مرة","أمين أرشيف من المستقبل","شخص يتأخر دائمًا",
    "جامع مهووس بالتفاصيل","غرض جامد يراقب البشر","شخص يرى الموضوع للمرة الأولى",
    "شخص يعرف المكان عن ظهر قلب","باحث يوثّق التفاصيل","راوٍ لا يمكن الوثوق به تمامًا",
    "شخص من جيل مختلف","شخص يلاحظ التفاصيل التي يتجاهلها الجميع"
  ],
  methods: [
    "الكولاج والصور المقتبسة","فن السكانر مع الخط اليدوي",
    "التصوير الفوتوغرافي مع تايبوجرافي تحريري جريء","الرسم والعلامات التخطيطية",
    "التايبوجرافي فقط","الخامات الموجودة والملامس الحقيقية","التصوير بالأبيض والأسود",
    "صور مولّدة بالذكاء الاصطناعي ممزوجة بعناصر يدوية",
    "ملامس التصوير الضوئي والقصاصات الخشنة",
    "شبكة تصميم منضبطة مع عنصر واحد يكسر النظام","التكرار والتسلسل البصري",
    "التصوير المقرّب والقصّات الحادة"
  ],
  constraints: [
    "لا تُظهر أي وجه بشري","تستخدم لونين فقط","تكرر عنصرًا بصريًا واحدًا في كامل المطبوعة",
    "تضيف طيّة أو قصّة أو تدخّلًا ماديًا واحدًا على الأقل","لا تستخدم أكثر من خطّين",
    "تجعل إحدى الصفحات المزدوجة تعمل بلا أي كلمات","تعرض العناصر بمقياس غير معتاد",
    "تدرج نصًا مقتبسًا من مصدر موجود مسبقًا",
    "تستخدم الصورة نفسها أكثر من مرة ولكن بطريقة مختلفة كل مرة",
    "تجعل إحدى الصفحات المزدوجة كثيفة جدًا وأخرى شديدة الفراغ",
    "تضيف صفحة واحدة تتطلب تفاعل القارئ","تبني النظام البصري حول شكل هندسي واحد"
  ]
};

const state = {
  data: structuredClone(FALLBACK),
  locked: { subjects:false, perspectives:false, methods:false, constraints:false },
  current: { subjects:"", perspectives:"", methods:"", constraints:"" }
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
  ["subjects","perspectives","methods","constraints"].forEach(key => {
    if (!state.locked[key]) state.current[key] = randomItem(state.data[key], state.current[key]);
    $(key + "Text").textContent = state.current[key];
  });
}

function briefText() {
  return [
    `صمّم مطبوعة عن ${state.current.subjects}.`,
    `اعرض الموضوع من وجهة نظر ${state.current.perspectives}.`,
    `استكشف الفكرة باستخدام ${state.current.methods}.`,
    `بشرط أن ${state.current.constraints}.`
  ].join(" ");
}

async function loadSheetData() {
  try {
    const sheet = await loadGoogleSheetTab("Zine");

    state.data.subjects =
      firstExistingColumn(sheet, ["Subject","Subjects","الموضوع","الموضوعات"]) || FALLBACK.subjects;

    state.data.perspectives =
      firstExistingColumn(sheet, ["Perspective","Perspectives","وجهة النظر","وجهات النظر"]) || FALLBACK.perspectives;

    state.data.methods =
      firstExistingColumn(sheet, ["Art Style","ArtStyle","Method","Methods","الأسلوب الفني","الأساليب الفنية"]) || FALLBACK.methods;

    state.data.constraints =
      firstExistingColumn(sheet, ["Constraint","Constraints","القيد الإبداعي","القيود الإبداعية"]) || FALLBACK.constraints;
  } catch (err) {
    console.warn("Using built-in Zine lists because Google Sheet could not be loaded.", err);
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
