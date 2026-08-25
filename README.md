# مولد الوصفات الإبداعية — Source Google Sheet Only

Google Sheet:
https://docs.google.com/spreadsheets/d/16iOSnylKxHB5XmvjWpdazfsKNHPrkfU-vc7lQIfhyuI/edit

## قاعدة البيانات في هذه النسخة

do not cache the list, and do not read the list from any cache. Always read from the source Google Sheet

تم تطبيقها فعليًا في دالة `loadGoogleSheetTab()`:

- لا توجد قوائم احتياطية.
- لا يوجد localStorage للقوائم.
- لا يوجد sessionStorage للقوائم.
- لا يوجد IndexedDB للقوائم.
- كل تحميل للصفحة يرسل طلبًا جديدًا وفريدًا إلى Google Sheet.
- إذا فشل Google Sheet لا يولّد الموقع من أي بيانات قديمة.

## أسماء التبويبات المتوقعة

Zine

Interactive Infographic

## عناوين الأعمدة

Zine:
Subject | Perspective | Art Style | Constraint

Interactive Infographic:
Topic | Audience | Interaction Goal
