
const sourceData = window.ZINE_DATA;

if (!sourceData) {
  throw new Error("zine-data.js لم يتم تحميله");
}

const state = {
  data: {
    subjects: [...sourceData.subjects],
    perspectives: [...sourceData.perspectives],
    methods: [...sourceData.methods],
    constraints: [...sourceData.constraints]
  },
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
  ["subjects","perspectives","methods","constraints"].forEach(key => {
    if (!state.locked[key]) {
      state.current[key] = randomItem(state.data[key], state.current[key]);
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
