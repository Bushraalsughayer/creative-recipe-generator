
const DEFAULTS = {
  topics: [
    "كيف تتغير مدينة واحدة خلال 24 ساعة",
    "رحلة حبة القهوة من المزرعة إلى الكوب",
    "ماذا يحدث لنفاياتنا بعد رميها",
    "دورة حياة قطعة ملابس",
    "كيف يستخدم الناس هواتفهم خلال اليوم",
    "كم تستهلك أنشطتنا اليومية من الماء دون أن نشعر",
    "رحلة طرد من الطلب حتى الوصول",
    "كيف تنضج ثمرة الرطب",
    "كيف تتغير الظلال في المكان خلال اليوم",
    "ماذا يحدث في المطار خلال ساعة واحدة",
    "أين يذهب وقتنا في يوم عادي",
    "كيف ينتقل خبر أو ترند عبر الإنترنت",
    "ماذا يحدث خلف الكواليس عندما نضغط إرسال",
    "حياة منتج قبل أن يصل إلى رف المتجر",
    "كيف تتغير الأشياء التي نحملها معنا مع العمر",
    "كيف يتغير استخدام مكان واحد بين الصباح والمساء",
    "كيف تنتقل المياه من المصدر إلى المنزل",
    "كيف تتغير عادات الطعام بين الأجيال",
    "كيف تتحرك الحشود داخل فعالية كبيرة",
    "ماذا يحدث للطعام الذي لا نأكله"
  ],
  audiences: [
    "أطفال من 7 إلى 10 سنوات",
    "أطفال من 11 إلى 13 سنة",
    "مراهقين من 14 إلى 18 سنة",
    "طلاب جامعات",
    "شباب من 20 إلى 30 سنة",
    "بالغين غير متخصصين",
    "كبار السن",
    "عائلات",
    "زوار وسياح",
    "جمهور عام لديه معرفة محدودة بالموضوع",
    "أشخاص مهتمين بالموضوع لكنهم غير متخصصين",
    "أشخاص يعرفون أساسيات الموضوع ويريدون التعمق",
    "متخصصين أو ممارسين في المجال"
  ],
  goals: [
    "مقارنة معلومات مختلفة",
    "اكتشاف التغير عبر الزمن",
    "فهم تسلسل عملية أو رحلة",
    "استكشاف العلاقات بين أجزاء نظام",
    "الانتقال من الصورة العامة إلى التفاصيل",
    "اكتشاف أنماط أو فروق مخفية",
    "رؤية أثر تغيير عامل واحد على النتيجة",
    "العثور على المعلومة الأكثر ارتباطًا به",
    "استكشاف المعلومات حسب المكان",
    "فهم العلاقة بين السبب والنتيجة",
    "تكوين فهم تدريجي لموضوع معقد",
    "اختبار توقعاته ثم مقارنتها بالبيانات"
  ]
};

const TEACHER_PASSWORD = "publication403";
const state = {
  data: structuredClone(DEFAULTS),
  locked: { topics:false, audiences:false, goals:false },
  current: { topics:"", audiences:"", goals:"" }
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
  if(list.length===1) return list[0];
  let x=list[Math.floor(Math.random()*list.length)];
  while(x===previous) x=list[Math.floor(Math.random()*list.length)];
  return x;
}
function load(){
  const packed=new URLSearchParams(location.search).get("bank");
  if(packed){ try{state.data=decodeData(packed);return;}catch(e){} }
  const saved=localStorage.getItem("interactiveRecipeData");
  if(saved){ try{state.data=JSON.parse(saved);}catch(e){} }
}
function generate(){
  ["topics","audiences","goals"].forEach(key=>{
    if(!state.locked[key]) state.current[key]=randomItem(state.data[key],state.current[key]);
    $(key+"Text").textContent=state.current[key];
  });
}
function brief(){
  return `صمّم إنفوجرافيك تفاعلي عن ${state.current.topics}. موجّه إلى ${state.current.audiences}. صمّم التجربة بحيث تساعد المستخدم على ${state.current.goals}.`;
}
function lines(v){return v.split("\n").map(x=>x.trim()).filter(Boolean);}
function fillTeacher(){
  $("topicsInput").value=state.data.topics.join("\n");
  $("audiencesInput").value=state.data.audiences.join("\n");
  $("goalsInput").value=state.data.goals.join("\n");
}
function readTeacher(){
  const x={topics:lines($("topicsInput").value),audiences:lines($("audiencesInput").value),goals:lines($("goalsInput").value)};
  if(!x.topics.length||!x.audiences.length||!x.goals.length){alert("يجب أن تحتوي كل قائمة على عنصر واحد على الأقل.");return null;}
  return x;
}

document.querySelectorAll(".lock-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const key=btn.dataset.key; state.locked[key]=!state.locked[key];
    btn.classList.toggle("locked",state.locked[key]);
    btn.textContent=state.locked[key]?"● مثبّت":"○ تثبيت";
  });
});
$("generateBtn").addEventListener("click",generate);
$("copyBtn").addEventListener("click",()=>{
  navigator.clipboard.writeText(brief()).then(()=>{
    $("statusMessage").textContent="تم نسخ الوصفة.";setTimeout(()=>$("statusMessage").textContent="",1500);
  });
});
$("aboutBtn").addEventListener("click",()=>$("aboutDialog").showModal());
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>$(b.dataset.close).close()));
$("teacherBtn").addEventListener("click",()=>{
  $("teacherPassword").value="";$("passwordError").textContent="";$("passwordDialog").showModal();setTimeout(()=>$("teacherPassword").focus(),50);
});
function login(){
  if($("teacherPassword").value===TEACHER_PASSWORD){
    $("passwordDialog").close();fillTeacher();$("sharePanel").classList.add("hidden");$("teacherDialog").showModal();
  } else {$("passwordError").textContent="كلمة السر غير صحيحة.";$("teacherPassword").select();}
}
$("passwordSubmit").addEventListener("click",login);
$("teacherPassword").addEventListener("keydown",e=>{if(e.key==="Enter")login();});
$("saveLocalBtn").addEventListener("click",()=>{
  const x=readTeacher();if(!x)return;state.data=x;localStorage.setItem("interactiveRecipeData",JSON.stringify(x));generate();$("teacherDialog").close();
});
$("shareBtn").addEventListener("click",()=>{
  const x=readTeacher();if(!x)return;$("shareUrl").value=location.href.split("?")[0]+"?bank="+encodeData(x);$("sharePanel").classList.remove("hidden");
});
$("copyShareBtn").addEventListener("click",()=>navigator.clipboard.writeText($("shareUrl").value));
$("resetBtn").addEventListener("click",()=>{
  if(!confirm("هل تريد استعادة القوائم الأصلية؟"))return;state.data=structuredClone(DEFAULTS);localStorage.removeItem("interactiveRecipeData");fillTeacher();
});

load();generate();
