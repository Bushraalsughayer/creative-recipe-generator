
const sourceData = window.INFOGRAPHIC_DATA;

if (!sourceData) {
  throw new Error("infographic-data.js لم يتم تحميله");
}

const state = {
  data: {
    topics: [...sourceData.topics],
    audiences: [...sourceData.audiences],
    goals: [...sourceData.goals]
  },
  locked: {
    topics: false,
    audiences: false,
    goals: false
  },
  current: {
    topics: "",
    audiences: "",
    goals: ""
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
  ["topics","audiences","goals"].forEach(key => {
    if (!state.locked[key]) {
      state.current[key] = randomItem(state.data[key], state.current[key]);
    }
    $(key + "Text").textContent = state.current[key];
  });
}

function briefText() {
  return `صمّم إنفوجرافيك تفاعلي عن ${state.current.topics}. موجّه إلى ${state.current.audiences}. صمّم التجربة بحيث تساعد المستخدم على ${state.current.goals}.`;
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
