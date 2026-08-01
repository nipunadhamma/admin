# 🇱🇰 LankaQuest — Attractions, Search & Sponsored Advertising System

## 1. අරමුණ

LankaQuest website එකේ:

* Tourist Attractions
* Destinations
* Hotels
* Restaurants
* Yoga Classes
* Activities
* Guides
* Tourism Businesses
* Sponsored Businesses

යන සියල්ල future එකේ එකම **Search Experience** එකක් තුළින් සොයාගත හැකි architecture එකක් සකස් කිරීම.

Search system එක සහ advertising system එක **වෙනම systems දෙකක්** ලෙස ක්‍රියා කළ යුතුය.

---

# 2. ප්‍රධාන Architecture

```text
                    LANKAQUEST DATA
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    places.js       businesses.js      guides.js
        │                │                │
        └────────────────┼────────────────┘
                         ↓
                Generator System
                         ↓
              search-index.json
                         ↓
                    search.js
                         ↓
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
     index.html      attractions.html   Future Pages
```

---

# 3. Attractions Data

Tourist destinations සහ attractions සඳහා:

```text
js/places.js
```

භාවිතා කළ යුතුය.

උදාහරණ:

```javascript
{
    id: "sigiriya",

    name: "Sigiriya",

    type: "attraction",

    category: "heritage",

    province: "Central Province",

    district: "Matale",

    location: "Sigiriya",

    image: "images/destinations/sigiriya/sigiriya-main.jpg",

    rating: 4.9,

    featured: true
}
```

---

# 4. Province → District → Attraction

`places.js` data එක අනුව attractions automatically organize කළ යුතුය.

```text
Attractions
│
├── Central Province
│   │
│   ├── Matale
│   │   ├── Sigiriya
│   │   └── ...
│   │
│   ├── Kandy
│   │   ├── Temple of the Tooth
│   │   └── ...
│
├── Western Province
│
├── Southern Province
│
├── Eastern Province
│
└── ...
```

Manual HTML organization අවශ්‍ය නොවිය යුතුය.

---

# 5. Automatic Attraction Generator

`places.js` එකේ attraction එකක් add කළ පසු generator එක run කිරීමෙන් province pages generate විය යුතුය.

```text
places.js
    ↓
Generator
    ↓
Province
    ↓
District
    ↓
Attractions
    ↓
Province HTML
    ↓
Search Index
```

Generator:

```text
generator/generate-attractions.js
```

Generated data:

```text
data/generated/search-index.json
```

---

# 6. Existing Attractions Architecture

පරණ manually-created province HTML pages architecture එක future system එකේ main source of truth නොවිය යුතුය.

අලුත් system එකේ:

```text
places.js
    ↓
Generator
    ↓
Generated Province Pages
```

යන architecture එක භාවිතා කළ යුතුය.

---

# 7. Common Search System

`index.html` සහ `attractions.html` සඳහා වෙන වෙනම search systems නොසෑදිය යුතුය.

එකම:

```text
js/search.js
```

භාවිතා කළ යුතුය.

```text
search-index.json
        ↓
    search.js
        ↓
┌───────┴────────┐
↓                ↓
index.html   attractions.html
```

Search behavior එක සියලුම pages වල consistent විය යුතුය.

---

# 8. Search Index

Search index එකට පහත data ඇතුළත් කළ හැක:

```text
ID
Name
Type
Category
Province
District
Location
Description
Keywords
Rating
Featured
Promoted
Hide
```

උදාහරණ:

```javascript
{
    id: "sigiriya",

    type: "attraction",

    name: "Sigiriya",

    category: "heritage",

    province: "Central Province",

    district: "Matale",

    location: "Sigiriya",

    keywords: [
        "lion rock",
        "sigiriya rock",
        "matale",
        "heritage"
    ],

    featured: true,

    promoted: false,

    hide: false
}
```

---

# 9. Businesses

Commercial tourism services `places.js` එකට mix නොකළ යුතුය.

වෙනම:

```text
businesses.js
```

භාවිතා කළ යුතුය.

උදාහරණ:

```javascript
{
    id: "sigiriya-yoga-center",

    type: "business",

    category: "yoga",

    name: "Sigiriya Yoga Center",

    province: "Central Province",

    district: "Matale",

    location: "Sigiriya",

    description:
        "Yoga classes near Sigiriya.",

    image:
        "images/businesses/sigiriya-yoga-center.jpg",

    promoted: true,

    featured: true,

    hide: false,

    adActive: true
}
```

---

# 10. `hide` System

Adminට business එක Search එකෙන් සම්පූර්ණයෙන් hide කිරීමට:

```javascript
hide: true
```

භාවිතා කළ හැක.

```text
hide: false
    ↓
Search වල පෙන්වයි

hide: true
    ↓
Search වලින් සම්පූර්ණයෙන් ඉවත් වේ
```

මෙය:

* Search
* Sponsored section
* Featured listings

සියල්ලටම apply විය යුතුය.

---

# 11. Promoted System

Business එකක් promoted නම්:

```javascript
promoted: true
```

භාවිතා කළ හැක.

සාමාන්‍ය business:

```javascript
promoted: false
```

Promoted status එක Search ranking එක automatically වෙනස් කළ යුතු නැත.

---

# 12. Search Ranking

Search results සඳහා සරල relevance algorithm එකක් භාවිතා කළ යුතුය.

Priority:

```text
1. Exact Name Match
2. Exact Location Match
3. Relevant Name Match
4. Category Match
5. District Match
6. Province Match
7. Keyword Match
```

උදාහරණයක්:

Search:

```text
Sigiriya
```

මුලින්:

```text
🏛️ Sigiriya
Matale · Central Province
```

ඊළඟට relevant results:

```text
🏛️ Sigiriya Museum
🧘 Sigiriya Yoga Center
🏨 Sigiriya Hotel
```

වැනි results පෙන්විය හැක.

---

# 13. Sponsored Search Results

Sponsored business එකක් Search results වලට බලෙන් ඉහළට දැමිය යුතු නැත.

Search relevance එක ප්‍රධාන වේ.

Sponsored status එක result එකේ label එකක් ලෙස පමණක් පෙන්විය හැක.

උදාහරණ:

```text
⭐ Sponsored

🧘 Sigiriya Yoga Center
Yoga · Sigiriya · Matale
```

නමුත් Sponsored listings ගොඩක් search result එකේ ඉහළට දැමීමෙන් user experience එකට කරදරයක් විය හැක.

ඒ නිසා Sponsored Search results සඳහා සීමාවක් තබාගත යුතුය.

---

# 14. Separate Sponsored Advertising System

LankaQuest website එකේ **Google AdSense වගේ website advertising area එකක්** වෙනම system එකක් ලෙස තිබිය යුතුය.

මෙය Search system එකෙන් වෙනම වේ.

```text
SEARCH SYSTEM
      │
      └── Search Results


ADVERTISEMENT SYSTEM
      │
      └── Sponsored Ads
```

Search result area එකේ advertising සඳහා ඉඩක් ගත නොහැක.

---

# 15. Sponsored Advertisement Placement

ප්‍රධාන Sponsored Advertisement section එක:

```text
Hero Section
      ↓
Sponsored Ads Strip
      ↓
Main Website Content
```

එනම් Homepage එකේ Hero section එකට යටින් කුඩා horizontal Sponsored strip එකක් තැබිය යුතුය.

---

# 16. Desktop Sponsored Ads

Desktop screen එකේ:

```text
┌─────────────────────────────────────────────┐
│                    HERO                     │
│              Discover Sri Lanka             │
│                  Search                     │
└─────────────────────────────────────────────┘

                 Sponsored

┌──────────────┬──────────────┬──────────────┐
│ Advertisement│ Advertisement│ Advertisement│
│      1       │      2       │      3       │
└──────────────┴──────────────┴──────────────┘

                 Main Content
```

Desktop:

**Maximum 3 Sponsored Ads**

---

# 17. Mobile Sponsored Ads

Mobile screen එකේ userට advertisement ගොඩක් පෙන්විය යුතු නැත.

```text
┌────────────────────────┐
│         HERO           │
│       Search           │
└────────────────────────┘

       Sponsored

┌────────────────────────┐
│     Advertisement      │
│                        │
│     View Details →     │
└────────────────────────┘

       Main Content
```

Mobile:

**Maximum 1 Sponsored Ad**

---

# 18. Search Area එකට Advertisement නොදැමීම

Search experience එක clean තබාගත යුතුය.

එබැවින්:

```text
❌ Search box එක ඇතුළේ ads
❌ Search suggestions අතර ads
❌ Search result අතර ads
❌ Search ranking එක advertisement නිසා වෙනස් කිරීම
```

නොකළ යුතුය.

Search result එකේ Sponsored business එකක් relevant නම් normal result එකක් ලෙස පෙන්විය හැක.

---

# 19. Sponsored Advertisement Data

Future එකේ වෙනම advertisement data source එකක් භාවිතා කළ හැක.

උදාහරණ:

```text
data/
├── places.js
├── businesses.js
├── guides.js
└── advertisements.js
```

Advertisement:

```javascript
{
    id: "ad-sigiriya-yoga",

    businessId: "sigiriya-yoga-center",

    title: "Yoga Classes Near Sigiriya",

    image:
        "images/businesses/sigiriya-yoga.jpg",

    description:
        "Relax with yoga surrounded by nature.",

    link:
        "businesses/sigiriya-yoga-center.html",

    active: true
}
```

---

# 20. Advertisement Visibility

Business data:

```javascript
promoted: true
featured: true
hide: false
adActive: true
```

මේ values වල වැඩ වෙනස්ය.

### `promoted`

Business එක promoted listing එකක්ද?

```text
true / false
```

### `featured`

Business එක Featured listing එකක්ද?

```text
true / false
```

### `hide`

Business එක Search සහ Sponsored system දෙකෙන්ම hide කළ යුතුද?

```text
true / false
```

### `adActive`

Advertisement එක currently active ද?

```text
true / false
```

---

# 21. Hide vs Ad Active

උදාහරණ:

```javascript
hide: true
```

→ Business එක Search එකෙන් සහ Sponsored placement එකෙන් සම්පූර්ණයෙන් ඉවත් වේ.

```javascript
hide: false,
adActive: false
```

→ Business එක Search එකේ තිබිය හැක.

නමුත් Sponsored advertisement එක නොපෙන්වයි.

```javascript
hide: false,
adActive: true
```

→ Search + Sponsored placement දෙකම active විය හැක.

---

# 22. Sponsored Ads සඳහා User Experience Rules

LankaQuest advertising system එක:

```text
❌ Popup
❌ Full-screen advertisement
❌ Auto-play video
❌ Forced redirect
❌ Search interruption
❌ Excessive advertisements
```

භාවිතා නොකළ යුතුය.

භාවිතා කළ යුත්තේ:

```text
✅ Small Sponsored Card
✅ Clearly labelled Sponsored
✅ Clean design
✅ Mobile responsive
✅ Maximum 3 Desktop
✅ Maximum 1 Mobile
```

---

# 23. Destination Pages

Future එකේ:

```text
destinations/
    sigiriya.html
```

වැනි pages ද search system එකට connect කළ යුතුය.

Destination page එකේ data source:

```text
places.js
```

විය හැක.

---

# 24. Future Business Pages

Business එකක් add කළ විට future generator එකෙන්:

```text
businesses/
└── sigiriya-yoga-center.html
```

වැනි page එකක් automatically generate කළ හැක.

ඒ page එක:

```text
businesses.js
      ↓
Business Generator
      ↓
Business HTML
      ↓
Search Index
```

වලට connect විය යුතුය.

---

# 25. Final Folder Structure

```text
LankaQuest/
│
├── index.html
├── attractions.html
├── trip-planner.html
│
├── attractions/
│
├── destinations/
│
├── businesses/
│
├── data/
│   ├── places.js
│   ├── businesses.js
│   ├── guides.js
│   ├── advertisements.js
│   │
│   └── generated/
│       └── search-index.json
│
├── generator/
│   ├── generate-attractions.js
│   ├── generate-businesses.js
│   └── generate-search-index.js
│
├── js/
│   ├── search.js
│   ├── attractions.js
│   └── ...
│
└── css/
    ├── attractions.css
    ├── sponsored-ads.css
    └── ...
```

---

# 26. Final Content Flow

අලුත් attraction එකක්:

```text
Add to places.js
       ↓
Run Generator
       ↓
Province / District detected
       ↓
HTML generated
       ↓
Search Index updated
       ↓
Search automatically updated
```

අලුත් business එකක්:

```text
Add to businesses.js
       ↓
Run Generator
       ↓
Business HTML generated
       ↓
Search Index updated
       ↓
Search automatically updated
```

Sponsored advertisement එකක්:

```text
Add / Update Advertisement
       ↓
Check hide
       ↓
Check adActive
       ↓
Desktop → max 3
Mobile → max 1
       ↓
Display below Hero
```

---

# 27. Final Search + Advertising Architecture

```text
                       LANKAQUEST
                           │
            ┌──────────────┴──────────────┐
            ↓                             ↓
       SEARCH SYSTEM                 AD SYSTEM
            │                             │
      search-index.json              Advertisements
            │                             │
        search.js                   hide / active
            │                             │
    ┌───────┼────────┐                    ↓
    ↓       ↓        ↓             Sponsored Strip
  Home  Attractions Future Pages         │
                                    ┌────┴────┐
                                    ↓         ↓
                                 Desktop    Mobile
                                   3          1
```

---

# 28. Main Development Principle

LankaQuest එකේ future development එකේදී:

> **Data first → Generator → Search Index → UI**

යන principle එක භාවිතා කළ යුතුය.

අලුත් content එකක් add කරන විට search code manually edit නොකළ යුතුය.

---

# 29. Development Order

1. `places.js` final structure
2. Province → District generator
3. Automatic attraction pages
4. Common `search.js`
5. `search-index.json`
6. `index.html` search
7. `attractions.html` search
8. `businesses.js`
9. Business page generator
10. Business search integration
11. `hide` system
12. `promoted` / `featured` system
13. Search relevance algorithm
14. Sponsored Advertisement system
15. Desktop 3-ad layout
16. Mobile 1-ad layout
17. Admin advertisement controls
18. Future Guide / Service integration

---

# 30. අවසාන තීරණය

LankaQuest එකේ **Search සහ Advertising එකිනෙකට බාධා නොවන systems දෙකක්** ලෙස තබාගත යුතුය.

### Search

```text
User Search
     ↓
Relevant Places
     ↓
Relevant Businesses
     ↓
Relevant Services
```

### Advertising

```text
Hero
 ↓
Small Sponsored Strip
 ↓
Main Content
```

Desktop:

```text
3 Sponsored Ads
```

Mobile:

```text
1 Sponsored Ad
```

Search area එකේ advertisement සඳහා **කිසිම ඉඩක් නොගත යුතුය**.

මේ architecture එකෙන් LankaQuest එක future එකේ tourism businesses promote කිරීමටත්, search experience එක clean තබාගැනීමටත්, පසුව Google AdSense වැනි external advertising solution එකක් අවශ්‍ය වුවහොත් වෙනම ad slot එකක් එකතු කිරීමටත් හැකි වන production-friendly foundation එකක් ලබාගත හැක.
