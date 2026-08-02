# LankaQuest — Firestore Trip Architecture

**Document:** `FIRESTORE_TRIP_ARCHITECTURE.md`
**Project:** LankaQuest
**Architecture:** Firebase Authentication + Cloud Firestore + Firebase Storage
**Status:** Production Architecture Reference

---

## 1. Purpose

This document defines the official Firestore architecture for the LankaQuest trip-planning and quotation-request system.

The architecture is designed to support:

* Tourist accounts
* Guide accounts
* Trip planning
* Multiple trip plans
* Saved destinations
* Quotation requests
* Guide quotations
* Tourist dashboard
* Trip history
* Firestore scalability
* Pagination
* Security Rules
* Timestamp-based sorting
* Future growth of the platform

The system must use Firebase as the primary backend.

LocalStorage must **not** be used as the permanent source of truth for trips, profiles, quotations, or user data.

---

# 2. Core Architecture

```text
                    LankaQuest
                        │
                        ▼
              Firebase Authentication
                        │
               ┌────────┴────────┐
               │                 │
            Tourist             Guide
               │                 │
               ▼                 ▼
        Firestore Database   Firestore Database
               │                 │
               └────────┬────────┘
                        │
                        ▼
                 Trip / Request Data
                        │
                        ▼
                Guide Quotation
                        │
                        ▼
                Tourist Dashboard
```

---

# 3. Firebase Services

LankaQuest uses the following Firebase services:

```text
Firebase Authentication
        │
        ├── Google Authentication
        ├── Email / Password
        └── Firebase UID
                │
                ▼
        Cloud Firestore
                │
                ├── Tourist Profiles
                ├── Guide Profiles
                ├── Trips
                ├── Destinations
                ├── Quotation Requests
                └── Quotations
                │
                ▼
        Firebase Storage
                │
                ├── Profile images
                ├── Guide documents
                └── Other uploaded media
```

---

# 4. Firebase UID

The Firebase Authentication UID is the permanent identity key for a user.

Example:

```text
Firebase Auth
UID:
abc123xyz789
```

Firestore documents should use this UID where appropriate.

Example:

```text
lankaQuestTourists
    └── abc123xyz789
```

and:

```text
lankaQuestGuides
    └── abc123xyz789
```

The application must never use an email address as the primary identity key.

---

# 5. Tourist Profile

Collection:

```text
lankaQuestTourists
```

Document ID:

```text
Firebase UID
```

Example:

```text
lankaQuestTourists
└── abc123xyz789
    ├── uid
    ├── name
    ├── email
    ├── phone
    ├── photoURL
    ├── accountType
    ├── createdAt
    └── updatedAt
```

Example document:

```json
{
  "uid": "abc123xyz789",
  "name": "Tourist Name",
  "email": "tourist@example.com",
  "phone": "",
  "photoURL": "",
  "accountType": "tourist",
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp"
}
```

---

# 6. Guide Profile

Collection:

```text
lankaQuestGuides
```

Document ID:

```text
Firebase UID
```

Example:

```text
lankaQuestGuides
└── guideUid123
    ├── uid
    ├── name
    ├── email
    ├── phone
    ├── languages
    ├── experience
    ├── locations
    ├── verificationStatus
    ├── createdAt
    └── updatedAt
```

---

# 7. Trip Architecture

Trips belong to a tourist.

Recommended structure:

```text
lankaQuestTourists
└── {touristUid}
    └── trips
        └── {tripId}
```

Example:

```text
lankaQuestTourists
└── abc123xyz789
    └── trips
        ├── trip001
        ├── trip002
        └── trip003
```

Each trip represents one complete travel plan.

---

# 8. Trip Document

Example:

```json
{
  "tripId": "trip001",

  "title": "Sri Lanka Adventure",

  "status": "draft",

  "startDate": "2027-11-11",

  "endDate": "2027-12-30",

  "travelers": 2,

  "travelStyle": "relaxing",

  "transportation": "private-car",

  "accommodation": "standard",

  "specialRequests": "",

  "destinationCount": 3,

  "createdAt": "serverTimestamp",

  "updatedAt": "serverTimestamp"
}
```

---

# 9. Trip Status

Trips must use controlled status values.

Recommended statuses:

```text
draft
quotation_requested
quotation_received
accepted
completed
cancelled
```

Lifecycle:

```text
draft
  │
  ▼
quotation_requested
  │
  ▼
quotation_received
  │
  ▼
accepted
  │
  ▼
completed
```

Cancellation:

```text
draft
   │
   ▼
cancelled
```

---

# 10. Trip Destinations

Destinations belong to a trip.

Recommended structure:

```text
lankaQuestTourists
└── {touristUid}
    └── trips
        └── {tripId}
            └── destinations
                ├── destination001
                ├── destination002
                └── destination003
```

Example:

```text
Trip
├── destination001
├── destination002
└── destination003
```

Example destination:

```json
{
  "placeId": "sigiriya",
  "name": "Sigiriya",
  "district": "Matale",
  "province": "Central Province",
  "rating": 4.9,
  "image": "images/destinations/sigiriya/sigiriya-main.jpg",
  "order": 1,
  "createdAt": "serverTimestamp"
}
```

---

# 11. Why Store placeId?

The trip should keep the original attraction ID.

Example:

```json
{
  "placeId": "sigiriya"
}
```

instead of depending only on:

```json
{
  "name": "Sigiriya"
}
```

The `placeId` allows the application to identify the destination reliably even if the display name changes.

---

# 12. Destination Order

Each destination should have an `order` value.

Example:

```text
order: 1 → Sigiriya
order: 2 → Kandy
order: 3 → Ella
```

This allows the Tourist Dashboard to display:

```text
1. Sigiriya
2. Kandy
3. Ella
```

The order can later be changed using drag-and-drop functionality.

---

# 13. Plan 1 / Plan 2 / Plan 3

The Tourist Dashboard should display saved trip plans.

Example:

```text
My Trips

Plan 1
Sri Lanka Adventure
3 Places

Plan 2
Hill Country Tour
5 Places

Plan 3
Southern Coast
4 Places
```

The UI label can use:

```text
Plan 1
Plan 2
Plan 3
```

but the database must use the actual `tripId`.

Example:

```text
trip001
trip002
trip003
```

The number is only a display concept.

---

# 14. Trip Numbering

Do not permanently store:

```text
planNumber: 1
```

unless there is a specific business requirement.

Instead, query trips by:

```text
createdAt DESC
```

and display the result position:

```text
First result  → Plan 1
Second result → Plan 2
Third result  → Plan 3
```

This prevents numbering problems when a tourist deletes or archives a trip.

---

# 15. Tourist Dashboard

The Tourist Dashboard should load trips from Firestore.

Example:

```text
Tourist Dashboard
        │
        ▼
Get current Firebase user
        │
        ▼
Get user's trips
        │
        ▼
Sort by createdAt DESC
        │
        ▼
Display
        │
        ├── Plan 1
        ├── Plan 2
        └── Plan 3
```

---

# 16. Trip Planner Persistence

When a tourist adds:

```text
Sigiriya
Thamba Dola
Pidurangala
```

the data should be saved to Firestore.

Therefore:

```text
Refresh page
     ↓
Firebase Auth remains active
     ↓
Load current trip
     ↓
Load destinations
     ↓
Display previous selections
```

The trip must not disappear simply because the page was refreshed.

---

# 17. Important Refresh Rule

Before a quotation request is submitted:

```text
Trip data remains available.
```

Example:

```text
Refresh Trip Planner
        ↓
Trip still contains
Sigiriya
Thamba Dola
Pidurangala
```

This is required because the tourist may accidentally refresh the page.

---

# 18. After Sending Quotation Request

When the tourist submits the quotation request:

```text
Trip Planner
     ↓
Submit Request
     ↓
Quotation Request Created
     ↓
Trip status = quotation_requested
```

The trip must **not** be destroyed.

Instead:

```text
Trip
status:
quotation_requested
```

This preserves the historical relationship between the tourist and the request.

---

# 19. After Successful Submission

Recommended flow:

```text
Trip Planner
      │
      ▼
Create quotation request
      │
      ▼
Update trip status
      │
      ▼
quotation_requested
      │
      ▼
Clear current temporary planner state
      │
      ▼
Tourist Dashboard
```

After the request is successfully submitted, the planner can start with a new empty draft.

Therefore:

```text
Before Send:

Current Trip
├── Sigiriya
├── Thamba Dola
└── Pidurangala

After Send:

Quotation Request
├── Sigiriya
├── Thamba Dola
└── Pidurangala

New Trip Planner
└── Empty
```

The old request remains stored in Firestore.

---

# 20. Quotation Requests

Recommended top-level collection:

```text
quotationRequests
```

Example:

```text
quotationRequests
├── request001
├── request002
└── request003
```

Example document:

```json
{
  "requestId": "request001",

  "touristId": "abc123xyz789",

  "tripId": "trip001",

  "status": "pending",

  "startDate": "2027-11-11",

  "endDate": "2027-12-30",

  "travelers": 2,

  "travelStyle": "relaxing",

  "transportation": "private-car",

  "accommodation": "standard",

  "specialRequests": "",

  "createdAt": "serverTimestamp",

  "updatedAt": "serverTimestamp"
}
```

---

# 21. Snapshot Trip Data

A quotation request should store the important trip information as a snapshot.

Example:

```text
quotationRequests/request001
```

contains:

```text
tripId
startDate
endDate
travelers
travelStyle
transportation
accommodation
specialRequests
```

This is important because the original trip may later change.

The quotation request should represent what the tourist actually submitted.

---

# 22. Request Destinations

Recommended:

```text
quotationRequests
└── request001
    └── destinations
        ├── destination001
        ├── destination002
        └── destination003
```

Example:

```json
{
  "placeId": "sigiriya",
  "name": "Sigiriya",
  "district": "Matale",
  "province": "Central Province",
  "order": 1
}
```

This creates a historical snapshot.

---

# 23. Guide Quotations

Recommended:

```text
quotationRequests
└── request001
    └── quotations
        ├── quotation001
        └── quotation002
```

Example:

```json
{
  "guideId": "guideUid123",

  "requestId": "request001",

  "totalPrice": 350000,

  "currency": "LKR",

  "message": "",

  "status": "submitted",

  "createdAt": "serverTimestamp",

  "updatedAt": "serverTimestamp"
}
```

---

# 24. Multiple Guides

A tourist may receive quotations from multiple guides.

Example:

```text
Request 001
│
├── Guide A
│   └── LKR 350,000
│
├── Guide B
│   └── LKR 385,000
│
└── Guide C
    └── LKR 320,000
```

The tourist can compare quotations from the dashboard.

---

# 25. Quotation Status

Recommended values:

```text
submitted
viewed
accepted
rejected
expired
cancelled
```

---

# 26. Historical Data

Completed requests should not be deleted.

Example:

```text
Tourist
│
├── Current Trips
│
├── Active Requests
│
└── Trip History
      │
      ├── 2026 Trip
      ├── 2027 Trip
      └── 2028 Trip
```

Historical data provides long-term value.

---

# 27. Firestore Growth

Firestore can contain a very large amount of data.

For example:

```text
10,000 tourists
       ↓
50,000 trips
       ↓
200,000 quotation requests
       ↓
500,000 quotations
```

This is not a reason to manually delete old data.

The architecture should instead use:

* Pagination
* Indexed queries
* Subcollections
* Limited result sets
* Timestamp ordering
* Archived records
* Efficient document sizes

---

# 28. Pagination

Do not load every trip belonging to a tourist at once.

Avoid:

```javascript
getDocs(allTrips)
```

when the collection could become large.

Instead:

```text
Load first 10
     ↓
Load next 10
     ↓
Load next 10
```

Recommended page size:

```text
10–20 records
```

depending on the UI.

---

# 29. Dashboard Pagination

Example:

```text
My Trips

Plan 1
Plan 2
Plan 3
...
Plan 10

[Load More]
```

When the tourist clicks:

```text
Load More
```

the next Firestore page is requested.

---

# 30. Timestamp Fields

Use Firebase server timestamps.

Recommended fields:

```text
createdAt
updatedAt
```

Example:

```javascript
serverTimestamp()
```

Do not depend on the user's computer clock for database ordering.

---

# 31. Query Ordering

Trips:

```text
orderBy("createdAt", "desc")
```

Quotation requests:

```text
orderBy("createdAt", "desc")
```

Quotations:

```text
orderBy("createdAt", "desc")
```

This keeps the newest records first.

---

# 32. Data Size Rules

Do not store unnecessary large data inside Firestore documents.

Avoid:

```text
large images
base64 images
huge HTML documents
large gallery files
```

inside Firestore.

Use:

```text
Firebase Storage
```

for large files.

Firestore should store the URL/reference.

---

# 33. Attraction Data

Static attraction information can remain in the LankaQuest project data source.

Example:

```text
js/places.js
```

Example:

```json
{
  "id": "sigiriya",
  "name": "Sigiriya",
  "province": "Central Province",
  "district": "Matale"
}
```

Trips should store the `placeId` and a snapshot of important display data.

---

# 34. Why Use a Snapshot?

Suppose:

```text
2026:
Sigiriya
rating = 4.9
```

Later:

```text
2028:
rating = 4.7
```

A historical quotation should not unexpectedly change because the attraction data changed.

Therefore the request stores:

```text
placeId
name
district
province
```

as a submission snapshot.

---

# 35. Security Model

A tourist should only be able to access their own private trip data.

Example:

```text
Tourist A
    ↓
Can read
Tourist A trips

Cannot read
Tourist B trips
```

Guides should only access quotation requests that are intentionally available to them according to the business rules.

---

# 36. Firestore Security Principle

Never trust the frontend.

The frontend may contain:

```javascript
if (user.uid === touristId)
```

but this is not sufficient security.

Actual authorization must be enforced by:

```text
Firestore Security Rules
```

---

# 37. Tourist Data Rule

Conceptually:

```text
request.auth.uid
        ==
tourist document ID
```

A tourist can:

```text
Read own profile
Write own profile
Read own trips
Create own trips
Update own trips
Read own quotation requests
```

but cannot access another tourist's private data.

---

# 38. Guide Data Rule

A guide should only be able to perform operations permitted by their guide account.

Example:

```text
Guide
  ↓
View available quotation requests
  ↓
Create quotation
  ↓
Update own quotation
```

A guide must not be able to modify another guide's quotation.

---

# 39. Current Trip vs Historical Trip

The application should distinguish between:

```text
Current Draft
```

and:

```text
Submitted / Historical Trip
```

Example:

```text
Trip
│
├── status: draft
│       ↓
│   editable
│
└── status: quotation_requested
        ↓
    historical submission
```

---

# 40. Editing Rules

A draft trip can be modified.

Example:

```text
Add destination
Remove destination
Change date
Change travelers
Change travel style
```

After submission:

```text
quotation_requested
```

the original request snapshot must remain unchanged.

If the tourist wants another trip, create a new trip.

---

# 41. New Trip After Request

After successful quotation request:

```text
Old Trip
trip001
status = quotation_requested

New Trip
trip002
status = draft
```

This gives the tourist a clean planner.

---

# 42. Tourist Dashboard Example

```text
My Trips
────────────────────────────

Plan 1
Sri Lanka Adventure
3 Places
Quotation Requested

Plan 2
Hill Country Tour
5 Places
Draft

Plan 3
Southern Coast
4 Places
Completed
```

---

# 43. Firestore Collection Overview

Final recommended structure:

```text
lankaQuestTourists
│
└── {touristUid}
    │
    └── trips
        │
        └── {tripId}
            │
            └── destinations
                └── {destinationId}


lankaQuestGuides
│
└── {guideUid}


quotationRequests
│
└── {requestId}
    │
    ├── destinations
    │   └── {destinationId}
    │
    └── quotations
        └── {quotationId}
```

---

# 44. Why This Structure?

This architecture separates:

```text
User Identity
       ↓
Tourist Profile
       ↓
Trip
       ↓
Trip Destinations
       ↓
Quotation Request
       ↓
Guide Quotations
```

Each layer has a clear responsibility.

---

# 45. Scalability Strategy

When LankaQuest grows:

```text
100 users
    ↓
1,000 users
    ↓
10,000 users
    ↓
100,000 users
```

the application should continue using:

```text
Pagination
Indexes
Small documents
Subcollections
Server timestamps
Efficient queries
Security Rules
```

rather than loading the entire database.

---

# 46. Firestore Indexes

If queries combine:

```text
where()
+
orderBy()
```

Firestore may require an index.

Example:

```text
touristId
status
createdAt
```

Indexes should be created when Firebase requests them.

Do not create unnecessary indexes for every field.

---

# 47. Cost Control

Firestore billing is affected by reads, writes and storage.

Therefore the frontend should avoid:

```text
Repeated getDocs()
Repeated listeners
Loading entire collections
Unnecessary refresh queries
```

Prefer:

```text
Limited queries
Pagination
Caching where appropriate
onSnapshot only where real-time updates are actually required
```

---

# 48. Real-Time Data

Real-time listeners should be used only where necessary.

Good examples:

```text
New quotation received
Guide responds to request
Quotation status changes
```

Static pages do not need real-time Firestore listeners.

---

# 49. Trip Planner Local State

Temporary UI state may exist in JavaScript.

For example:

```javascript
currentTrip
selectedDestinations
```

But the permanent source of truth must be Firestore.

Architecture:

```text
UI State
   ↓
Firestore
   ↓
Reload
   ↓
Firestore
   ↓
UI State
```

---

# 50. No Permanent LocalStorage Architecture

Do not build the new system around:

```javascript
localStorage.setItem("myTrip", ...)
```

LocalStorage may optionally be used for minor UI preferences.

It must not be the authoritative storage for:

```text
Trips
Quotation Requests
User Profiles
Guide Quotations
```

---

# 51. Failed Submission Handling

If quotation submission fails:

```text
Firestore write fails
        ↓
Do NOT clear planner
        ↓
Show error
        ↓
Tourist can retry
```

This is extremely important.

The planner should only be cleared after the backend confirms successful submission.

---

# 52. Successful Submission Handling

Correct sequence:

```text
1. Validate form
       ↓
2. Validate Firebase user
       ↓
3. Validate destinations
       ↓
4. Create quotation request
       ↓
5. Save destination snapshots
       ↓
6. Update trip status
       ↓
7. Confirm success
       ↓
8. Clear current draft
       ↓
9. Redirect to dashboard
```

Never clear the trip before step 6/7.

---

# 53. Duplicate Submission Protection

The application should prevent accidental double submission.

Example:

```text
Send Request
     ↓
Button disabled
     ↓
Request processing
     ↓
Success
```

If the user clicks twice quickly, two requests should not accidentally be created.

Future implementation can use:

```text
requestId
idempotency logic
transaction/batched writes
```

where appropriate.

---

# 54. Recommended Future Architecture

As LankaQuest becomes larger, the system can evolve into:

```text
Firebase Authentication
        │
        ▼
Cloud Firestore
        │
        ├── Users
        ├── Trips
        ├── Requests
        └── Quotations
        │
        ▼
Cloud Functions
        │
        ├── Notifications
        ├── Request validation
        ├── Status updates
        └── Automated cleanup/archiving
        │
        ▼
Firebase Cloud Messaging
```

---

# 55. Data Lifecycle

Recommended lifecycle:

```text
DRAFT
  │
  │ Tourist edits
  ▼
QUOTATION_REQUESTED
  │
  │ Guides respond
  ▼
QUOTATION_RECEIVED
  │
  │ Tourist selects
  ▼
ACCEPTED
  │
  ▼
COMPLETED
```

Alternative:

```text
DRAFT
  │
  ▼
CANCELLED
```

---

# 56. Important Principle

**Never delete historical business data simply because the planner has been reset.**

Example:

```text
Tourist submits Plan 1
        ↓
Plan 1 becomes historical
        ↓
Planner becomes empty
        ↓
Tourist creates Plan 2
```

Plan 1 must remain available in the dashboard/history.

---

# 57. Final Architecture

The official LankaQuest architecture is:

```text
                    Firebase Auth
                         │
                         ▼
                 Tourist / Guide UID
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
 lankaQuestTourists             lankaQuestGuides
          │
          ▼
        trips
          │
          ▼
    destinations
          │
          │ Submit
          ▼
 quotationRequests
          │
          ▼
    destinations
          │
          ▼
     quotations
          │
          ▼
   Tourist Dashboard
```

---

# 58. Production Rules

The following rules are considered mandatory for the LankaQuest production system:

1. Firebase Authentication is the identity source.
2. Firebase UID is the user identity key.
3. Firestore is the permanent application data source.
4. LocalStorage is not the permanent trip database.
5. Trips use unique `tripId` values.
6. Trip status must be controlled.
7. Submitted requests must preserve historical snapshots.
8. Successful quotation submission must not destroy historical data.
9. Failed submissions must preserve the current planner.
10. New trips should be created after successful submission.
11. Dashboard numbering such as Plan 1 / Plan 2 / Plan 3 is a UI concept.
12. Trips should be sorted using `createdAt`.
13. Large collections must use pagination.
14. Large files must use Firebase Storage.
15. Security must be enforced by Firestore Rules.
16. The frontend must never be considered the security boundary.
17. Real-time listeners should only be used where necessary.
18. Duplicate quotation submissions must be prevented.
19. Historical requests should remain available.
20. The architecture must remain scalable as LankaQuest grows.

---

# 59. Final Data Flow

```text
Tourist Login
     │
     ▼
Firebase Authentication
     │
     ▼
Tourist Dashboard
     │
     ▼
Create / Continue Trip
     │
     ▼
Add Destinations
     │
     ▼
Enter Travel Details
     │
     ▼
Save Draft to Firestore
     │
     ▼
Refresh Page
     │
     ▼
Load Draft from Firestore
     │
     ▼
Submit Quotation Request
     │
     ├─────────────── Failure
     │                   │
     │                   ▼
     │             Keep Draft
     │
     ▼
Create Request Snapshot
     │
     ▼
Update Trip Status
     │
     ▼
quotation_requested
     │
     ▼
Create New Draft Trip
     │
     ▼
Tourist Dashboard
     │
     ├── Plan 1
     ├── Plan 2
     └── Plan 3
             │
             ▼
        Guide Quotations
             │
             ▼
      Tourist Selection
             │
             ▼
          Accepted
             │
             ▼
         Completed
```

---

## 60. Architecture Status

**LankaQuest Firestore Trip Architecture**

```text
Status: APPROVED FOR IMPLEMENTATION
Backend: Firebase
Database: Cloud Firestore
Authentication: Firebase Authentication
File Storage: Firebase Storage
Permanent Trip Storage: Firestore
Temporary UI State: JavaScript
Historical Data: Preserved
Pagination: Required for scalable collections
Security: Firestore Security Rules
```

This document should be treated as the reference architecture when implementing or modifying the LankaQuest Trip Planner, Tourist Dashboard, Guide Dashboard, Quotation Request system, and related Firestore code.
