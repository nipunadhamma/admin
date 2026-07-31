# LankaQuest Project Rules

## Architecture

This project uses Firebase-first architecture.

Authentication:
- Firebase Authentication

Database:
- Firebase Firestore

Main Collections:
- lankaQuestGuides
- lankaQuestTourists
- lankaQuestQuotationRequests
- lankaQuestQuotations


## Forbidden Legacy Approach

Do not use:
- localStorage as database
- JSON arrays as database
- fake local collections


If old code contains:
- localStorage.getItem()
- localStorage.setItem()
- getStorageArray()

Treat it as legacy code and migrate to Firebase.



<script type="module" src="js/auth.js"></script>

<script type="module" src="js/trip-planner.js"></script>