const DATA = {
  subjects: [
    "1",
    "2",
    "3"
  ],

  perspectives: [
    "طفل",
    "سائح يزور المكان لأول مرة",
    "أمين أرشيف من المستقبل",
    "شخص يتأخر دائمًا",
    "جامع مهووس بالتفاصيل",
    "غرض جامد يراقب البشر",
    "شخص يرى الموضوع للمرة الأولى",
    "شخص يعرف المكان عن ظهر قلب",
    "باحث يوثّق التفاصيل",
    "راوٍ لا يمكن الوثوق به تمامًا",
    "شخص من جيل مختلف",
    "شخص يلاحظ التفاصيل التي يتجاهلها الجميع"
  ],

  methods: [
    "الكولاج والصور المقتبسة",
    "فن السكانر مع الخط اليدوي",
    "التصوير الفوتوغرافي مع تايبوجرافي تحريري جريء",
    "الرسم والعلامات التخطيطية",
    "التايبوجرافي فقط",
    "الخامات الموجودة والملامس الحقيقية",
    "التصوير بالأبيض والأسود",
    "صور مولّدة بالذكاء الاصطناعي ممزوجة بعناصر يدوية",
    "ملامس التصوير الضوئي والقصاصات الخشنة",
    "شبكة تصميم منضبطة مع عنصر واحد يكسر النظام",
    "التكرار والتسلسل البصري",
    "التصوير المقرّب والقصّات الحادة"
  ],

  constraints: [
    "لا تُظهر أي وجه بشري",
    "تستخدم لونين فقط",
    "تكرر عنصرًا بصريًا واحدًا في كامل المطبوعة",
    "تضيف طيّة أو قصّة أو تدخّلًا ماديًا واحدًا على الأقل",
    "لا تستخدم أكثر من خطّين",
    "تجعل إحدى الصفحات المزدوجة تعمل بلا أي كلمات",
    "تعرض العناصر بمقياس غير معتاد",
    "تدرج نصًا مقتبسًا من مصدر موجود مسبقًا",
    "تستخدم الصورة نفسها أكثر من مرة ولكن بطريقة مختلفة كل مرة",
    "تجعل إحدى الصفحات المزدوجة كثيفة جدًا وأخرى شديدة الفراغ",
    "تضيف صفحة واحدة تتطلب تفاعل القارئ",
    "تبني النظام البصري حول شكل هندسي واحد"
  ]
};

const state = {
  locked: {
    subjects: false,
    perspectives: false,
    methods: false,
    constraints: false
  },
  current: {
    subjects: "",
    perspectives: "",
    methods: "",
    constraints: ""
  }
};

const $ = id => document.getElementById(id);

function randomItem(list, previous) {
  if (!list.length) return "";
  if (list.length === 1) return list[0];

  let next = list[Math.floor(Math.random() * list.length)];
  let guard = 0;
  while (next === previous && guard < 20) {
    next = list[Math.floor(Math.random() * list.length)];
    guard++;
  }
  return next;
}

function generate() {
  ["subjects", "perspectives", "methods", "constraints"].forEach(key => {
    if (!state.locked[key]) {
      state.current[key] = randomItem(DATA[key], state.current[key]);
    }
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

document.querySelectorAll("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => $(btn.dataset.close).close());
});

generate();
