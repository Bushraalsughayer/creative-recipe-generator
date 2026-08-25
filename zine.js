
const DEFAULTS = {
  subjects: [
    "الأشياء التي يحتفظ بها الناس لقيمتها العاطفية",
    "الانتظار",
    "الطقوس الصغيرة التي نكررها كل يوم",
    "الأشياء التي تختفي من حياتنا تدريجيًا",
    "الأشياء التي نجمعها دون أن نخطط لذلك",
    "الآثار التي يتركها الناس خلفهم",
    "الطعام بوصفه ذاكرة",
    "الجانب الهادئ من مكان مزدحم",
    "الأشياء التي نصلحها بدل أن نستبدلها",
    "أشياء عادية تحمل قصصًا غير عادية",
    "عادات محلية لا يلاحظها الزائر بسهولة",
    "ما يحمله الناس في حقائبهم",
    "اللغة البصرية لحيّ أو شارع",
    "أشياء لا تحدث إلا ليلًا",
    "الطرق التي نعبّر بها عن مرور الوقت",
    "مكان يتغير على مدار اليوم"
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
  ],
  enabled: { perspectives:true, methods:true, constraints:true }
};

const TEACHER_PASSWORD = "publication403";
const state = {
  data: structuredClone(DEFAULTS),
  locked: { subjects:false, perspectives:false, methods:false, constraints:false },
  current: { subjects:"", perspectives:"", methods:"", constraints:"" }
};
const $ = id => document.getElementById(id);

function encodeData(obj){
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let binary = ""; bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
}
function decodeData(str){
  let s = str.replaceAll("-","+").replaceAll("_","/");
  while(s.length % 4) s += "=";
  const bytes = Uint8Array.from(atob(s), c => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}
function randomItem(list, previous){
  if(list.length === 1) return list[0];
  let x = list[Math.floor(Math.random()*list.length)];
  while(x === previous) x = list[Math.floor(Math.random()*list.length)];
  return x;
}
function load(){
  const packed = new URLSearchParams(location.search).get("bank");
  if(packed){ try { state.data = decodeData(packed); return; } catch(e){} }
  const saved = localStorage.getItem("zineRecipeData");
  if(saved){ try { state.data = JSON.parse(saved); } catch(e){} }
}
function applyEnabled(){
  document.querySelector(".perspective-card").classList.toggle("category-hidden", !state.data.enabled.perspectives);
  document.querySelector(".method-card").classList.toggle("category-hidden", !state.data.enabled.methods);
  document.querySelector(".constraint-card").classList.toggle("category-hidden", !state.data.enabled.constraints);
}
function generate(){
  ["subjects","perspectives","methods","constraints"].forEach(key=>{
    if(key !== "subjects" && !state.data.enabled[key]) return;
    if(!state.locked[key]) state.current[key] = randomItem(state.data[key], state.current[key]);
    $(key+"Text").textContent = state.current[key];
  });
  applyEnabled();
}
function brief(){
  const parts = [`صمّم مطبوعة عن ${state.current.subjects}.`];
  if(state.data.enabled.perspectives) parts.push(`اعرض الموضوع من وجهة نظر ${state.current.perspectives}.`);
  if(state.data.enabled.methods) parts.push(`استكشف الفكرة باستخدام ${state.current.methods}.`);
  if(state.data.enabled.constraints) parts.push(`بشرط أن ${state.current.constraints}.`);
  return parts.join(" ");
}
function lines(v){ return v.split("\n").map(x=>x.trim()).filter(Boolean); }
function fillTeacher(){
  $("subjectsInput").value = state.data.subjects.join("\n");
  $("perspectivesInput").value = state.data.perspectives.join("\n");
  $("methodsInput").value = state.data.methods.join("\n");
  $("constraintsInput").value = state.data.constraints.join("\n");
  $("enablePerspective").checked = state.data.enabled.perspectives;
  $("enableMethod").checked = state.data.enabled.methods;
  $("enableConstraint").checked = state.data.enabled.constraints;
}
function readTeacher(){
  const x = {
    subjects: lines($("subjectsInput").value),
    perspectives: lines($("perspectivesInput").value),
    methods: lines($("methodsInput").value),
    constraints: lines($("constraintsInput").value),
    enabled: {
      perspectives: $("enablePerspective").checked,
      methods: $("enableMethod").checked,
      constraints: $("enableConstraint").checked
    }
  };
  if(!x.subjects.length || (x.enabled.perspectives && !x.perspectives.length) ||
     (x.enabled.methods && !x.methods.length) || (x.enabled.constraints && !x.constraints.length)){
    alert("تحقق من أن القوائم المفعلة تحتوي على عناصر.");
    return null;
  }
  return x;
}

document.querySelectorAll(".lock-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const key = btn.dataset.key;
    state.locked[key] = !state.locked[key];
    btn.classList.toggle("locked", state.locked[key]);
    btn.textContent = state.locked[key] ? "● مثبّت" : "○ تثبيت";
  });
});
$("generateBtn").addEventListener("click", generate);
$("copyBtn").addEventListener("click", ()=>{
  navigator.clipboard.writeText(brief()).then(()=>{
    $("statusMessage").textContent = "تم نسخ الوصفة.";
    setTimeout(()=>$("statusMessage").textContent="",1500);
  });
});
$("aboutBtn").addEventListener("click", ()=>$("aboutDialog").showModal());
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>$(b.dataset.close).close()));
$("teacherBtn").addEventListener("click", ()=>{
  $("teacherPassword").value=""; $("passwordError").textContent="";
  $("passwordDialog").showModal(); setTimeout(()=>$("teacherPassword").focus(),50);
});
function login(){
  if($("teacherPassword").value === TEACHER_PASSWORD){
    $("passwordDialog").close(); fillTeacher(); $("sharePanel").classList.add("hidden"); $("teacherDialog").showModal();
  } else {
    $("passwordError").textContent="كلمة السر غير صحيحة."; $("teacherPassword").select();
  }
}
$("passwordSubmit").addEventListener("click", login);
$("teacherPassword").addEventListener("keydown", e=>{if(e.key==="Enter") login();});
$("saveLocalBtn").addEventListener("click", ()=>{
  const x=readTeacher(); if(!x) return;
  state.data=x; localStorage.setItem("zineRecipeData", JSON.stringify(x));
  generate(); $("teacherDialog").close();
});
$("shareBtn").addEventListener("click", ()=>{
  const x=readTeacher(); if(!x) return;
  $("shareUrl").value = location.href.split("?")[0] + "?bank=" + encodeData(x);
  $("sharePanel").classList.remove("hidden");
});
$("copyShareBtn").addEventListener("click", ()=>navigator.clipboard.writeText($("shareUrl").value));
$("resetBtn").addEventListener("click", ()=>{
  if(!confirm("هل تريد استعادة القوائم الأصلية؟")) return;
  state.data=structuredClone(DEFAULTS); localStorage.removeItem("zineRecipeData"); fillTeacher();
});

load(); generate();
