# LankaQuest — Code Audit & Fix Plan

**Repository:** `nipunadhamma/admin`
**Branch:** `main`
**Project:** LankaQuest
**Purpose:** Production-ready Tourism Platform
**Status:** Audit & Fix Planning

---

## 1. Critical Security Fixes

### 1.1 Firestore Security Rules

**Priority:** 🔴 CRITICAL
**Status:** ⬜ Pending

### Problem

Application එක Firestore data සඳහා client-side JavaScript authorization checks මත heavily depend වෙනවා.

Client-side checks security boundary එකක් නොවේ.

### Required Fix

Firestore Security Rules create කරන්න.

Rules මඟින්:

* Authentication required කිරීම
* Tourist තමන්ගේ data පමණක් access කිරීම
* Guide තමන්ගේ data පමණක් access කිරීම
* Tourist trips owner පමණක් read/write කිරීම
* Quotation requests owner/authorized guide පමණක් access කිරීම
* Unauthorized users වෙනත් users' documents කියවීම වැළැක්වීම
* Guide verification data admin-only කිරීම

### Files

text
firebase.json
firestore.rules        ← create
firestore.indexes.json ← create if required


---

## 2. Guide Private Data Protection

**Priority:** 🔴 CRITICAL
**Status:** ⬜ Pending

### Problem

Guide registration data තුළ sensitive information තිබෙනවා:

text
NIC
Passport
Date of Birth
Address
Guide License Number
Phone
Qualifications


මේ data public guide profile data සමඟ mix වීම security risk එකක්.

### Required Architecture

Public profile:

text
lankaQuestGuides/{uid}


Private verification data:

text
lankaQuestGuidePrivate/{uid}


### Public Profile

text
uid
name
email
phone
profileImage
languages
specializations
experience
rating
verificationStatus


### Private Data

text
uid
nic
passport
dateOfBirth
address
guideLicenseNumber
documents
verificationNotes


Private collection එක admin / authorized verification process එකට පමණක් access කළ හැකි විය යුතුයි.

---

# 3. Firebase Authentication as Single Source of Truth

**Priority:** 🔴 CRITICAL
**Status:** ⬜ Pending

### Problem

Project එක Firebase Authentication භාවිතා කරන අතර:

text
localStorage
sessionStorage
Firebase Auth


තුනම user/session state සඳහා භාවිතා වෙන අවස්ථා තිබෙනවා.

### Required Architecture

text
Firebase Authentication
        ↓
onAuthStateChanged()
        ↓
Firebase UID
        ↓
Firestore Profile
        ↓
Application


### Required Changes

`localStorage` / `sessionStorage` user objects authorization සඳහා භාවිතා නොකළ යුතුයි.

Firebase Auth UID එක authoritative identity එක විය යුතුයි.

### Main File

text
js/auth.js


### Related Files

text
js/login.js
js/register.js
js/guide-register.js
js/tourist-dashboard.js
js/guide-dashboard.js
js/find-guides.js
js/my-trip.js
js/quotation-request.js
js/trip-planner.js


---

# 4. Firestore Ownership Validation

**Priority:** 🔴 CRITICAL
**Status:** ⬜ Pending

Client-side authorization checks වලට අමතරව Firestore Rules මඟින් ownership enforce කළ යුතුයි.

### Tourist Trip

text
request.auth.uid == resource.data.touristId


### Quotation Request

Tourist owner:

text
request.auth.uid == resource.data.touristId


Authorized Guide:

text
request.auth.uid == resource.data.guideId


### Important

Client-side:

javascript
if (data.touristId !== currentUser.uid)


වැනි checks පමණක් ප්‍රමාණවත් නොවේ.

Server-side Firestore Rules අනිවාර්යයි.

### Related Files

text
js/find-guides.js
js/quotation-request.js
js/trip-planner.js
js/guide-dashboard.js
js/guide-requests.js
js/my-trip.js


---

# 5. Guide Verification Security

**Priority:** 🔴 CRITICAL
**Status:** ⬜ Pending

### Problem

Guide verification status:

text
pending
approved
rejected


වැනි values client-side workflow එකේ තිබෙනවා.

User කෙනෙකුට තමන්ගේ verification status තමන්ම:

text
approved


කරගන්න නොහැකි විය යුතුයි.

### Required Rule

Guide verification fields වෙනස් කළ හැක්කේ authorized admin process එකට පමණි.

### Protected Fields

text
verificationStatus
verifiedAt
verifiedBy
rejectionReason
verificationNotes


### Related Files

text
guide-verification.html
js/guide-verification.js
admin-guides.html
js/admin-guides.js


---

# 6. Guide Registration Architecture

**Priority:** 🟠 HIGH
**Status:** ⬜ Pending

### Problem

Guide registration logic duplicate/inconsistent.

Existing files:

text
register.html
js/register.js

guide-register.html
js/guide-register.js


### Required Decision

Primary Guide Registration flow එක:

text
guide-register.html
        ↓
Firebase Authentication
        ↓
lankaQuestGuides/{uid}
        ↓
lankaQuestGuidePrivate/{uid}
        ↓
pending verification


### Required

General registration page එකෙන් Guide registration logic duplicate නොවිය යුතුයි.

---

# 7. XSS / Unsafe innerHTML

**Priority:** 🟠 HIGH
**Status:** ⬜ Pending

### Problem

User/Firestore data HTML templates තුළ direct interpolation කරන තැන් තිබෙනවා.

Example pattern:

javascript
element.innerHTML = `
    <h3>${data.name}</h3>
`;


### Risk

Future එකේ user-generated content Firestore එකෙන් ආවොත් malicious HTML/JavaScript injection වෙන්න පුළුවන්.

### Required Fix

Trusted/static content සඳහා `textContent` භාවිතා කරන්න.

Dynamic HTML අවශ්‍ය තැන්වල:

* escape utility
* DOM APIs
* strict sanitization

භාවිතා කරන්න.

### Main Areas

text
js/map.js
js/quotation-request.js
js/find-guides.js
js/guide-dashboard.js
js/my-trip.js


---

# 8. Duplicate Quotation Requests

**Priority:** 🟠 HIGH
**Status:** ⬜ Pending

### Problem

User එක Submit button එක multiple times click කළොත් duplicate requests create විය හැක.

### Required Fix

Submit operation අතරතුර:

text
button.disabled = true


කරන්න.

Request success/failure අනුව state reset කරන්න.

### Better Architecture

Unique request ID / idempotency strategy එකක් භාවිතා කිරීම.

### Main Files

text
js/trip-planner.js
js/quotation-request.js


---

# 9. Firebase SDK Version Consistency

**Priority:** 🟡 MEDIUM
**Status:** ⬜ Pending

### Problem

Firebase SDK versions එකම project එකේ files අතර වෙනස්.

Example:

text
10.12.5
10.12.2


### Required Fix

සියලු Firebase imports එකම version එකකට update කරන්න.

Recommended source:

text
js/firebase-config.js


### Files to Audit

text
*.html
*.js


Firebase CDN imports ඇති සියලු files.

---

# 10. Firebase Configuration Centralization

**Priority:** 🟡 MEDIUM
**Status:** ⬜ Pending

### Problem

Firebase configuration/import logic files අතර duplicate වෙලා තිබේද යන්න audit කරන්න.

### Required Architecture

text
firebase-config.js
        ↓
Firebase initialization
        ↓
Other JS modules


### Main File

text
js/firebase-config.js


---

# 11. Broken Links & Missing Files Audit

**Priority:** 🟠 HIGH
**Status:** ⬜ Pending

සියලු HTML/JS/CSS references verify කළ යුතුයි.

### Check

text
HTML → CSS
HTML → JS
JS → images
JS → HTML
CSS → images
places.js → destination pages
places.js → image files


### Important Areas

text
js/places.js
attractions/
images/
css/
js/


### Required

Broken paths:

text
404
404 image
missing HTML
missing CSS
missing JS


කිසිවක් ඉතිරි නොවන ලෙස check කිරීම.

---

# 12. Destination Data Consistency

**Priority:** 🟠 HIGH
**Status:** ⬜ Pending

`places.js` data සහ actual filesystem එක match කළ යුතුයි.

### Validate

text
place ID
place name
coordinates
image
gallery
destination page
province
district
category
rating


### Required

Every referenced resource must exist.

---

# 13. Trip Planner Data Validation

**Priority:** 🟠 HIGH
**Status:** ⬜ Pending

Trip Planner data Firestore එකට save කිරීමට පෙර validate කරන්න.

### Validate

text
destination IDs
start date
end date
traveler count
travel style
tourist UID


### Prevent

text
empty destination
invalid date
end date < start date
invalid traveler count
unauthorized UID
duplicate submission


### Main File

text
js/trip-planner.js


---

# 14. Tourist Dashboard Security

**Priority:** 🔴 CRITICAL
**Status:** ⬜ Pending

Tourist dashboard එකට login නැති user කෙනෙකුට access නොදිය යුතුයි.

### Required

text
onAuthStateChanged()
        ↓
authenticated?
        ↓
tourist?
        ↓
load dashboard


Unauthorized users:

text
login.html


වෙත redirect කිරීම.

### Main File

text
js/tourist-dashboard.js


---

# 15. Guide Dashboard Security

**Priority:** 🔴 CRITICAL
**Status:** ⬜ Pending

Guide dashboard එක:

text
authenticated
+
guide role
+
approved status


verify කළ පසුව පමණක් accessible විය යුතුයි.

### Main File

text
js/guide-dashboard.js


---

# 16. Admin Dashboard Security

**Priority:** 🔴 CRITICAL
**Status:** ⬜ Pending

Admin UI එක hidden URL එකක් නිසා secure වෙන්නේ නැහැ.

### Required

Admin authorization server-side enforce කරන්න.

Recommended:

text
Firebase Auth
      ↓
custom admin claim
      ↓
Firestore Rules


### Files

text
admin-guides.html
js/admin-guides.js


---

# 17. Authentication Redirect Consistency

**Priority:** 🟠 HIGH
**Status:** ⬜ Pending

Login/register flows verify කරන්න.

### Required Flows

text
Tourist Login
    ↓
Tourist Dashboard


text
Guide Login
    ↓
Guide Dashboard


text
Unauthorized
    ↓
Login


text
Already authenticated
    ↓
appropriate dashboard


---

# 18. Logout Consistency

**Priority:** 🟠 HIGH
**Status:** ⬜ Pending

Logout එකේ:

text
Firebase signOut()


ප්‍රධාන action එක විය යුතුයි.

Old localStorage/sessionStorage authentication data තිබේ නම් ඒවා clear කරන්න.

---

# 19. Error Handling

**Priority:** 🟡 MEDIUM
**Status:** ⬜ Pending

Firebase operations සියල්ල:

javascript
try {
    ...
} catch (error) {
    ...
}


හෝ equivalent error handling එකක් තිබිය යුතුයි.

### User should see

text
Friendly error message


### Developer should get

text
console.error(...)


---

# 20. Loading States

**Priority:** 🟡 MEDIUM
**Status:** ⬜ Pending

Firestore requests අතරතුර user එකට loading state පෙන්වන්න.

Examples:

text
Loading guides...
Loading trip...
Submitting quotation...
Verifying guide...


---

# 21. Form Validation

**Priority:** 🟠 HIGH
**Status:** ⬜ Pending

All forms audit කරන්න.

### Guide Registration

text
name
email
phone
NIC
passport
DOB
address
license


### Tourist Registration

text
name
email
password


### Trip Planner

text
dates
travelers
style
destinations


---

# 22. Password / Authentication Handling

**Priority:** 🔴 CRITICAL
**Status:** ⬜ Pending

Password values:

* Firestore වල save නොකරන්න
* localStorage වල save නොකරන්න
* sessionStorage වල save නොකරන්න
* custom password fields database එකකට යවන්න එපා

Firebase Authentication පමණක් password handling සඳහා භාවිතා කරන්න.

---

# 23. Sensitive Data Logging

**Priority:** 🟠 HIGH
**Status:** ⬜ Pending

`console.log()` audit කරන්න.

මෙවැනි data console එකට output නොවිය යුතුයි:

text
password
NIC
passport
DOB
address
Firebase tokens
private user documents


---

# 24. Production Security Headers

**Priority:** 🟡 MEDIUM
**Status:** ⬜ Pending

Firebase Hosting configuration හරහා consider කරන්න:

text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy


CSP එක Leaflet/CDN requirements සමඟ test කරලා add කරන්න.

---

# 25. External CDN Security

**Priority:** 🟡 MEDIUM
**Status:** ⬜ Pending

External resources audit කරන්න:

text
Leaflet
Firebase
Fonts
Other CDN libraries


SRI support තිබෙන resources සඳහා integrity attributes consider කරන්න.

---

# 26. Leaflet / OpenStreetMap Configuration

**Priority:** 🟡 MEDIUM
**Status:** ⬜ Pending

Map implementation verify කරන්න.

Check:

text
tile URL
attribution
zoom
markers
popup
search
map toggle
mobile responsiveness


### Main Files

text
js/map.js
js/map-toggle.js


---

# 27. Search & Autocomplete

**Priority:** 🟡 MEDIUM
**Status:** ⬜ Pending

Search system audit කරන්න.

Check:

text
live search
autocomplete
clear button
category filtering
province filtering
district filtering
map marker selection


### Main File

text
js/map.js


---

# 28. Trip Planner / My Trip Synchronization

**Priority:** 🟠 HIGH
**Status:** ⬜ Pending

Trip data flows:

text
Explore Map
    ↓
Add to My Trip
    ↓
My Trip
    ↓
Trip Planner
    ↓
Quotation Request


සියල්ල එකම data model එක භාවිතා කරනවාද verify කරන්න.

---

# 29. Data Model Consistency

**Priority:** 🟠 HIGH
**Status:** ⬜ Pending

Firestore collections වල field names consistent කරන්න.

Examples:

text
touristId
guideId
tripId
quotationRequestId
createdAt
updatedAt
status


`touristID`, `touristId`, `userId` වගේ duplicate naming avoid කරන්න.

---

# 30. Timestamp Consistency

**Priority:** 🟡 MEDIUM
**Status:** ⬜ Pending

Firestore timestamps සඳහා server timestamp භාවිතා කිරීම prefer කරන්න.

text
serverTimestamp()


Client computer clock එක trust නොකරන්න.

---

# 31. Firestore Query / Index Audit

**Priority:** 🟡 MEDIUM
**Status:** ⬜ Pending

Queries involving:

text
where()
orderBy()


සියල්ල audit කරන්න.

Required composite indexes තිබේ නම්:

text
firestore.indexes.json


maintain කරන්න.

---

# 32. Accessibility Audit

**Priority:** 🟡 MEDIUM
**Status:** ⬜ Pending

Check:

text
alt attributes
button labels
form labels
keyboard navigation
focus states
ARIA where necessary
color contrast


---

# 33. Mobile Responsive Audit

**Priority:** 🟡 MEDIUM
**Status:** ⬜ Pending

Pages:

text
Home
Map
Trip Planner
My Trip
Login
Register
Guide Register
Guide Dashboard
Tourist Dashboard
Admin Dashboard
Attractions
Quotation Request


mobile screens වල test කරන්න.

---

# 34. HTML Validation

**Priority:** 🟢 LOW
**Status:** ⬜ Pending

All HTML files audit කරන්න:

text
duplicate IDs
missing closing tags
invalid nesting
missing lang
missing title
missing meta viewport


---

# 35. CSS Audit

**Priority:** 🟢 LOW
**Status:** ⬜ Pending

Check:

text
duplicate CSS
unused CSS
conflicting selectors
!important overuse
mobile breakpoints
global styles


---

# 36. JavaScript Duplicate Logic

**Priority:** 🟠 HIGH
**Status:** ⬜ Pending

Duplicate functions / event listeners identify කරන්න.

Especially:

text
auth
logout
user loading
trip loading
guide loading
Firestore initialization


---

# 37. JavaScript Runtime Errors

**Priority:** 🔴 CRITICAL
**Status:** ⬜ Pending

Browser Console audit:

text
ReferenceError
TypeError
FirebaseError
404
CORS
Permission denied
Failed to fetch


සියල්ල resolve කරන්න.

---

# 38. Firebase Permission Errors

**Priority:** 🔴 CRITICAL
**Status:** ⬜ Pending

Every Firestore operation test කරන්න:

text
Create
Read
Update
Delete


Tourist / Guide / Admin roles අනුව.

---

# 39. Security Test Matrix

**Priority:** 🔴 CRITICAL
**Status:** ⬜ Pending

### Tourist

text
Own profile       → ALLOW
Other profile     → DENY
Own trip          → ALLOW
Other trip        → DENY
Own quotation     → ALLOW
Other quotation   → DENY
Guide private data→ DENY
Admin data        → DENY


### Guide

text
Own profile        → ALLOW
Other guide data   → DENY
Assigned request   → ALLOW
Unassigned request → DENY
Private guide data → DENY
Admin data         → DENY


### Admin

text
Guide verification → ALLOW
Private guide data → ALLOW
User management    → ALLOW


---

# 40. Final Production Audit

**Priority:** 🔴 CRITICAL
**Status:** ⬜ Pending

All previous fixes completed after:

text
Security
Authentication
Authorization
Firestore Rules
Data ownership
Forms
JavaScript
HTML
CSS
Images
Links
Mobile
SEO
Performance


Final test:

text
Fresh browser
Incognito
Mobile
Desktop
Unauthenticated
Tourist
Guide
Approved Guide
Pending Guide
Admin


---

# Recommended Fix Order

## Phase 1 — Security

text
1. Firestore Rules
2. Guide private data
3. Authentication architecture
4. Ownership rules
5. Admin authorization
6. Guide verification protection


## Phase 2 — Core Business Logic

text
7. Guide registration architecture
8. Trip Planner
9. My Trip
10. Quotation Request
11. Guide Requests
12. Guide Dashboard
13. Tourist Dashboard


## Phase 3 — Code Quality

text
14. XSS / innerHTML
15. Duplicate JS
16. Error handling
17. Form validation
18. Firebase SDK consistency
19. Data model consistency
20. Timestamp consistency


## Phase 4 — Resource Integrity

text
21. Broken HTML links
22. Broken JS links
23. Broken CSS links
24. Missing images
25. Destination pages
26. places.js references


## Phase 5 — UI / Production

text
27. Responsive design
28. Accessibility
29. SEO
30. Security headers
31. CDN security
32. Performance


## Phase 6 — Final Testing

text
33. Tourist testing
34. Guide testing
35. Admin testing
36. Unauthorized access testing
37. Firestore permission testing
38. Mobile testing
39. Desktop testing
40. Final production audit


---

# Rule for Future Fixes

**Do not mix multiple architectural approaches.**

LankaQuest production architecture:

text
Firebase Authentication
        ↓
Firebase UID
        ↓
Firestore
        ↓
Security Rules
        ↓
Application UI


Do not reintroduce legacy `localStorage`-based authentication as the primary authentication mechanism.

---

# Current Status

text
Repository
    ✅ GitHub connected

Current code
    ✅ Pushed to main

Audit
    🔄 In progress

Security Rules
    ⬜ Pending

Authentication hardening
    ⬜ Pending

Firestore ownership
    ⬜ Pending

Guide private data
    ⬜ Pending

Business logic audit
    ⬜ Pending

Broken links audit
    ⬜ Pending

Production audit
    ⬜ Pending


---

## Final Goal

text
LankaQuest
    │
    ├── Tourist
    │      ├── Register
    │      ├── Login
    │      ├── Explore
    │      ├── My Trip
    │      ├── Trip Planner
    │      └── Request Quotation
    │
    ├── Guide
    │      ├── Register
    │      ├── Verification
    │      ├── Dashboard
    │      ├── Requests
    │      └── Quotations
    │
    └── Admin
           ├── Guide Verification
           ├── User Management
           └── Platform Management


**Target:** Secure, consistent, Firebase-first, production-ready LankaQuest platform.



                    Google Login
                         ↓
                 Firebase Auth UID
                         ↓
                Profile තිබේද?
                  /          \
                YES           NO
                 ↓             ↓
             Dashboard     Registration
                              ↓
                    account type select
                       /             \
                   Tourist          Guide
                      ↓                ↓
             lankaQuestTourists   lankaQuestGuides
                  /{UID}               /{UID}
                                      pending