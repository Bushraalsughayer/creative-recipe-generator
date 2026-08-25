
const SHEET_ID = "16iOSnylKxHB5XmvjWpdazfsKNHPrkfU-vc7lQIfhyuI";

/*
 * DATA SOURCE RULE:
 * do not cache the list, and do not read the list from any cache.
 * Always read from the source Google Sheet.
 *
 * لذلك:
 * - لا نستخدم localStorage أو sessionStorage أو IndexedDB.
 * - لا توجد قوائم احتياطية داخل الكود.
 * - نضيف cache-buster جديدًا لكل طلب إلى Google Sheets.
 * - إذا فشل المصدر، نعرض خطأ ولا نستخدم أي بيانات قديمة.
 */
function loadGoogleSheetTab(sheetName) {
  return new Promise((resolve, reject) => {
    const callbackName = "__liveSheet_" + Math.random().toString(36).slice(2);
    const script = document.createElement("script");
    const cacheBuster = Date.now() + "_" + Math.random().toString(36).slice(2);
    const timeout = setTimeout(() => finish(new Error("Google Sheet request timed out")), 10000);

    function finish(error, value) {
      clearTimeout(timeout);
      try { delete window[callbackName]; } catch (_) {}
      script.remove();
      error ? reject(error) : resolve(value);
    }

    window[callbackName] = response => {
      try {
        if (!response || response.status !== "ok") {
          throw new Error("Google Sheet returned a non-OK response");
        }

        const headers = response.table.cols.map(col => (col.label || "").trim());
        const rows = response.table.rows.map(row =>
          row.c.map(cell => cell && cell.v != null ? String(cell.v).trim() : "")
        );

        const result = {};
        headers.forEach((header, columnIndex) => {
          if (!header) return;
          result[header] = rows
            .map(row => row[columnIndex] || "")
            .filter(Boolean);
        });

        finish(null, result);
      } catch (error) {
        finish(error);
      }
    };

    const tqx = `out:json;responseHandler:${callbackName}`;

    // Unique URL every time so the browser/CDN cannot reuse a previous list response.
    script.src =
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?` +
      `sheet=${encodeURIComponent(sheetName)}` +
      `&tqx=${encodeURIComponent(tqx)}` +
      `&_source_refresh=${encodeURIComponent(cacheBuster)}`;

    script.onerror = () => finish(new Error("Could not reach the source Google Sheet"));
    document.head.appendChild(script);
  });
}

function getRequiredColumn(data, possibleHeaders, readableName) {
  for (const header of possibleHeaders) {
    if (Array.isArray(data[header]) && data[header].length > 0) {
      return data[header];
    }
  }
  throw new Error(`Missing or empty Google Sheet column: ${readableName}`);
}

function randomItem(list, previous) {
  if (list.length === 1) return list[0];
  let value = list[Math.floor(Math.random() * list.length)];
  while (value === previous) {
    value = list[Math.floor(Math.random() * list.length)];
  }
  return value;
}

const state = {
  data: null,
  locked: { subjects:false, perspectives:false, methods:false, constraints:false },
  current: { subjects:"", perspectives:"", methods:"", constraints:"" }
};

const $ = id => document.getElementById(id);

function generate() {
  if (!state.data) return;
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
    const sheet = await loadGoogleSheetTab("Zine");

    state.data = {
      subjects: getRequiredColumn(sheet, ["Subject","Subjects","الموضوع","الموضوعات"], "Subject"),
      perspectives: getRequiredColumn(sheet, ["Perspective","Perspectives","وجهة النظر","وجهات النظر"], "Perspective"),
      methods: getRequiredColumn(sheet, ["Art Style","ArtStyle","Method","Methods","الأسلوب الفني","الأساليب الفنية"], "Art Style"),
      constraints: getRequiredColumn(sheet, ["Constraint","Constraints","القيد الإبداعي","القيود الإبداعية"], "Constraint")
    };

    $("generateBtn").disabled = false;
    $("copyBtn").disabled = false;
    generate();
  } catch (error) {
    console.error(error);
    $("statusMessage").classList.add("error-message");
    $("statusMessage").textContent =
      "تعذر تحميل القوائم مباشرة من Google Sheet. تأكد من نشر الشيت وأسماء التبويب والأعمدة ثم حدّث الصفحة.";
  }
})();
