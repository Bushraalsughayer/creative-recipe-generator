
const PUBLISHED_ID = "2PACX-1vRE4XZA8gLvwCyqNfiQ7lzUUCBPbePxhDLTVs3IHcEZyw0xVIx3wV322Xv3JIr29pg3niBAK8RXDRbO";

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;

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

async function loadPublishedSheetByGid(gid) {
  const url =
    `https://docs.google.com/spreadsheets/d/e/${PUBLISHED_ID}/pub` +
    `?gid=${encodeURIComponent(gid)}&single=true&output=csv&_=${Date.now()}`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const text = await response.text();
  const rows = parseCSV(text).filter(r => r.some(cell => String(cell).trim() !== ""));
  if (!rows.length) throw new Error("Published sheet returned no rows");

  const headers = rows[0].map(h => String(h).trim());
  const data = {};

  headers.forEach((header, colIndex) => {
    if (!header) return;
    data[header] = rows
      .slice(1)
      .map(r => String(r[colIndex] ?? "").trim())
      .filter(Boolean);
  });

  return data;
}

function firstExistingColumn(data, names) {
  for (const name of names) {
    if (Array.isArray(data[name]) && data[name].length) return data[name];
  }
  return null;
}

const SHEET_GID = "1569150261";

const FALLBACK = {
  subjects: ["الانتظار","الطعام بوصفه ذاكرة","مكان يتغير على مدار اليوم"],
  perspectives: ["طفل","سائح يزور المكان لأول مرة","أمين أرشيف من المستقبل"],
  methods: ["الكولاج والصور المقتبسة","فن السكانر مع الخط اليدوي","التصوير الفوتوغرافي"],
  constraints: ["تستخدم لونين فقط","تكرر عنصرًا بصريًا واحدًا","لا تستخدم أكثر من خطّين"]
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
    const sheet = await loadPublishedSheetByGid(SHEET_GID);

    state.data.subjects =
      firstExistingColumn(sheet, ["Subject","Subjects","الموضوع","الموضوعات"]) || FALLBACK.subjects;

    state.data.perspectives =
      firstExistingColumn(sheet, ["Perspective","Perspectives","وجهة النظر","وجهات النظر"]) || FALLBACK.perspectives;

    state.data.methods =
      firstExistingColumn(sheet, ["Art Style","ArtStyle","Method","Methods","الأسلوب الفني","الأساليب الفنية"]) || FALLBACK.methods;

    state.data.constraints =
      firstExistingColumn(sheet, ["Constraint","Constraints","القيد الإبداعي","القيود الإبداعية"]) || FALLBACK.constraints;

    console.log("Zine lists loaded from Google Sheet.", {
      subjects: state.data.subjects.length,
      perspectives: state.data.perspectives.length,
      methods: state.data.methods.length,
      constraints: state.data.constraints.length
    });
  } catch (err) {
    console.warn("Could not load published Zine sheet. Using fallback lists.", err);
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
