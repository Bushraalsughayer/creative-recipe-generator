
const SHEET_ID = "16iOSnylKxHB5XmvjWpdazfsKNHPrkfU-vc7lQIfhyuI";

/*
 * DATA SOURCE RULE:
 * do not cache the list, and do not read the list from any cache.
 * Always read from the source Google Sheet.
 *
 * No localStorage / sessionStorage / IndexedDB / fallback lists.
 * A unique cache-buster is added to every request.
 */
function loadGoogleSheetByGid(gid) {
  return new Promise((resolve, reject) => {
    const callbackName = "__liveSheet_" + Math.random().toString(36).slice(2);
    const script = document.createElement("script");
    const cacheBuster = Date.now() + "_" + Math.random().toString(36).slice(2);
    const timer = setTimeout(() => finish(new Error("Google Sheet request timed out")), 10000);

    function finish(error, value) {
      clearTimeout(timer);
      try { delete window[callbackName]; } catch (_) {}
      script.remove();
      error ? reject(error) : resolve(value);
    }

    window[callbackName] = response => {
      try {
        if (!response || response.status !== "ok" || !response.table) {
          throw new Error("Google Sheet returned an invalid response");
        }

        // IMPORTANT:
        // We ignore column names completely.
        // Only the fixed column order matters.
        const rows = response.table.rows.map(row =>
          row.c.map(cell => cell && cell.v != null ? String(cell.v).trim() : "")
        );

        finish(null, rows);
      } catch (error) {
        finish(error);
      }
    };

    const tqx = `out:json;responseHandler:${callbackName}`;

    script.src =
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?` +
      `gid=${encodeURIComponent(gid)}` +
      `&headers=1` +
      `&tqx=${encodeURIComponent(tqx)}` +
      `&_source_refresh=${encodeURIComponent(cacheBuster)}`;

    script.onerror = () => finish(new Error("Could not reach the source Google Sheet"));
    document.head.appendChild(script);
  });
}

function getColumnByIndex(rows, index, readableName) {
  const values = rows
    .map(row => row[index] || "")
    .filter(Boolean);

  if (!values.length) {
    throw new Error(`Column ${readableName} is empty or missing`);
  }

  return values;
}

function randomItem(list, previous) {
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Cannot generate from an empty list");
  }
  if (list.length === 1) return list[0];

  let value = list[Math.floor(Math.random() * list.length)];
  while (value === previous) {
    value = list[Math.floor(Math.random() * list.length)];
  }
  return value;
}

const INFO_GID = "0";

const state = {
  data: null,
  locked: { topics:false, audiences:false, goals:false },
  current: { topics:"", audiences:"", goals:"" }
};

const $ = id => document.getElementById(id);

function generate() {
  if (!state.data) return;

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
  if (!state.data) return;
  navigator.clipboard.writeText(briefText()).then(() => {
    $("statusMessage").textContent = "تم نسخ الوصفة.";
    setTimeout(() => $("statusMessage").textContent = "", 1500);
  });
});

$("aboutBtn").addEventListener("click", () => $("aboutDialog").showModal());
document.querySelectorAll("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => $(btn.dataset.close).close());
});

(async function initFromSourceOnly() {
  try {
    const rows = await loadGoogleSheetByGid(INFO_GID);

    // Fixed column order:
    // A = Topic
    // B = Audience
    // C = Interaction Goal
    state.data = {
      topics: getColumnByIndex(rows, 0, "A / Topic"),
      audiences: getColumnByIndex(rows, 1, "B / Audience"),
      goals: getColumnByIndex(rows, 2, "C / Interaction Goal")
    };

    $("generateBtn").disabled = false;
    $("copyBtn").disabled = false;
    generate();

  } catch (error) {
    console.error("Infographic loading error:", error);
    $("statusMessage").classList.add("error-message");
    $("statusMessage").textContent =
      "تعذر تحميل قوائم الإنفوجرافيك من Google Sheet. تأكد أن مشاركة الشيت مضبوطة على Anyone with the link ثم حدّث الصفحة.";
  }
})();
