# مولد الوصفات الإبداعية — Google Sheets Edition

تم ربط الموقع بملف Google Sheets:
https://docs.google.com/spreadsheets/d/16iOSnylKxHB5XmvjWpdazfsKNHPrkfU-vc7lQIfhyuI/edit

## المطلوب في Google Sheet

اسم التبويب الأول:
Zine

وعناوين الصف الأول:
Subject | Perspective | Art Style | Constraint

اسم التبويب الثاني:
Interactive Infographic

وعناوين الصف الأول:
Topic | Audience | Interaction Goal

يمكن إضافة أي عدد من الصفوف تحت كل عمود، وسيقرأها الموقع عند فتح الصفحة من أي جهاز.

## مهم
يجب أن يكون Google Sheet منشورًا/متاحًا للقراءة على الويب حتى يستطيع موقع GitHub Pages قراءته.

## ما تغير
- حذف "وضع المحرر" نهائيًا من جميع صفحات الموقع.
- لا يوجد localStorage للقوائم.
- كل فتح لصفحة التوليد يقرأ أحدث القوائم من Google Sheet.
- إذا تعذر الوصول إلى الشيت، يستخدم الموقع القوائم الاحتياطية المدمجة بدل أن يتعطل.
