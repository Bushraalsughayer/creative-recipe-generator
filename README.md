# مولد الوصفات الإبداعية — Data JS Edition

هذه النسخة لا تستخدم Google Sheets ولا CSV ولا fetch.

## ملفات البيانات التي تعدلينها مستقبلًا

- zine-data.js
- infographic-data.js

الموقع يحمّلهما مباشرة كملفات JavaScript، لذلك هذا هو الحل الأبسط والأثبت على GitHub Pages.

## طريقة التعديل

### zine-data.js
ستجدين:
- subjects
- perspectives
- methods
- constraints

كل قائمة عبارة عن عناصر بين علامتي اقتباس.

مثال:

"subjects": [
  "الانتظار",
  "الطعام بوصفه ذاكرة",
  "موضوع جديد"
]

لإضافة عنصر:
- أضيفي سطرًا جديدًا بين علامتي اقتباس.
- ضعي فاصلة بعد السطر السابق.

### infographic-data.js
ستجدين:
- topics
- audiences
- goals

## بعد التعديل
ارفعي فقط ملف البيانات الذي عدلتيه إلى GitHub بنفس الاسم ثم Commit changes.

لا تحتاجين تعديل:
- zine.js
- infographic.js
- HTML
- CSS
