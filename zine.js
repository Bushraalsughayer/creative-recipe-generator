
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      field += '"';
      i++;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

async function loadCSV(filename) {
  const url = `${filename}?v=${Date.now()}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`تعذر تحميل ${filename}`);
  }

  const text = await response.text();
  const rows = parseCSV(text)
    .filter(row => row.some(cell => String(cell).trim() !== ""));

  if (rows.length < 2) {
    throw new Error(`ملف ${filename} فارغ أو غير صالح`);
  }

  const headers = rows[0].map(h =>
    String(h).replace(/^\uFEFF/, "").trim()
  );

  const data = {};
  headers.forEach((header, colIndex) => {
    if (!header) return;

    data[header] = rows
      .slice(1)
      .map(row => String(row[colIndex] ?? "").trim())
      .filter(Boolean);
  });

  return data;
}

function getColumn(data, names) {
  for (const name of names) {
    if (Array.isArray(data[name]) && data[name].length) {
      return data[name];
    }
  }
  return null;
}

function showLoadError(error) {
  console.error(error);
  const status = document.getElementById("statusMessage");
  if (status) {
    status.textContent = "تعذر تحميل ملف البيانات";
    status.title = error?.message || "";
  }
}

const DATA_FILE = "zine.csv";

const state = {
  data: {
    subjects: [],
    perspectives: [],
    methods: [],
    constraints: []
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
  if (!list || !list.length) return "";
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
    $(key + "Text").textContent = state.current[key] || "—";
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

async function loadData() {
  $("statusMessage").textContent = "جاري تحميل البيانات…";

  try {
    const data = await loadCSV(DATA_FILE);

    state.data.subjects =
      getColumn(data, ["Subject","Subjects","الموضوع","الموضوعات"]);

    state.data.perspectives =
      getColumn(data, ["Perspective","Perspectives","وجهة النظر","وجهات النظر"]);

    state.data.methods =
      getColumn(data, ["Art Style","ArtStyle","Method","Methods","الأسلوب الفني","الأساليب الفنية"]);

    state.data.constraints =
      getColumn(data, ["Constraint","Constraints","القيد الإبداعي","القيود الإبداعية"]);

    const missing = Object.entries(state.data)
      .filter(([_, list]) => !list || !list.length)
      .map(([key]) => key);

    if (missing.length) {
      throw new Error("أعمدة مفقودة أو فارغة: " + missing.join(", "));
    }

    $("statusMessage").textContent = "";
    generate();
  } catch (error) {
    showLoadError(error);
    ["subjects","perspectives","methods","constraints"].forEach(key => {
      $(key + "Text").textContent = "تعذر تحميل البيانات";
    });
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

$("generateBtn").addEventListener("click", () => {
  if (!state.data.subjects.length) {
    loadData();
  } else {
    generate();
  }
});

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

loadData();
