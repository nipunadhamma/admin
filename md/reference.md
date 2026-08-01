# 🇱🇰 LankaQuest — Attractions, Search & Promotion System

## 1. අරමුණ

LankaQuest website එකේ Sri Lanka tourist destinations, attractions, hotels, restaurants, yoga classes, activities සහ වෙනත් tourism-related services එකම **search system** එකක් හරහා සොයාගත හැකි architecture එකක් සකස් කිරීම.

ප්‍රධාන අරමුණ:

* `index.html` search
* `attractions.html` search
* Destination pages search
* Hotels / Restaurants / Yoga Classes / Activities search
* Future promoted businesses search

සියල්ලම **එකම Search Index එකක්** භාවිතා කිරීම.

---

# 2. ප්‍රධාන Architecture එක

```text
                    DATA SOURCES
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
      places.js     businesses.js    guides.js
          │              │              │
          └──────────────┼──────────────┘
                         ↓
                Search Index Generator
                         ↓
                  search-index.json
                         ↓
                    js/search.js
                         ↓
              ┌──────────┴──────────┐
              ↓                     ↓
          index.html          attractions.html
              │                     │
              └──────────┬──────────┘
                         ↓
                 Same Search System
```

---

# 3. Tourist Attractions

`places.js` එකේ තිබෙන්නේ Sri Lanka tourist attractions / destinations.

උදාහරණ:

```javascript
{
    id: "sigiriya",

    name: "Sigiriya",

    type: "attraction",

    category: "heritage",

    province: "Central Province",

    district: "Matale",

    image:
        "images/destinations/sigiriya/sigiriya-main.jpg",

    rating: 4.9
}
```

---

# 4. Province → District → Attraction Tree

`attractions.html` page එකේ attractions organize වන්නේ:

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
│   │
│   ├── Colombo
│   ├── Kalutara
│   └── Gampaha
│
├── Southern Province
│
├── Eastern Province
│
└── ...
```

`places.js` එකේ data එක අනුව generator එකෙන් මේ structure එක automatically generate කළ හැක.

---

# 5. Automatic HTML Generation

අලුත් attraction එකක් `places.js` එකට add කළ පසු manually HTML file එකක් සෑදීම අවශ්‍ය නොවන ලෙස system එක සකස් කළ යුතුය.

Flow:

```text
Add place to places.js
        ↓
Run generator
        ↓
Province detected
        ↓
District detected
        ↓
HTML page generated
        ↓
Search index updated
```

උදාහරණ:

```text
places.js
    ↓
Sigiriya
    ↓
Central Province
    ↓
Matale
    ↓
attractions/
└── central-province/
    └── matale/
        └── sigiriya.html
```

---

# 6. Common Search System

`index.html` සහ `attractions.html` සඳහා වෙන වෙනම search systems හදන්නේ නැත.

එකම:

```text
js/search.js
```

භාවිතා කළ යුතුය.

Architecture:

```text
search-index.json
        ↓
   js/search.js
        ↓
┌───────┴────────┐
↓                ↓
index.html   attractions.html
```

එම නිසා search behavior එක සෑම page එකකම එකම ආකාරයට ක්‍රියා කරයි.

---

# 7. Search Index

Search index එකට පහත information ඇතුළත් කළ හැක:

* Name
* ID
* Type
* Category
* Province
* District
* Location
* Description
* Keywords
* Rating
* Featured status
* Promotion status

උදාහරණ:

```javascript
{
    id: "sigiriya",

    type: "attraction",

    name: "Sigiriya",

    province: "Central Province",

    district: "Matale",

    category: "heritage",

    keywords: [
        "lion rock",
        "sigiriya rock",
        "matale",
        "heritage"
    ]
}
```

---

# 8. Future Business / Service System

Tourist attractions වලට අමතරව LankaQuest එකේ future එකේ tourism businesses promote කිරීමට හැකි විය යුතුය.

උදාහරණ:

* Hotels
* Restaurants
* Yoga Classes
* Spas
* Ayurveda Centers
* Surf Schools
* Diving Centers
* Safari Services
* Tour Activities
* Transport Services
* Other tourism businesses

මේවා `places.js` එකට mix නොකර වෙනම data source එකක් භාවිතා කිරීම වඩා හොඳය.

```text
data/
│
├── places.js
│
├── businesses.js
│
└── guides.js
```

---

# 9. businesses.js

Future business එකක් උදාහරණයක් ලෙස:

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

    contact: {
        phone: "",
        website: ""
    }
}
```

---

# 10. Search එකට Business එක එකතු වීම

Business එක `businesses.js` එකට add කළ පසු:

```text
businesses.js
       ↓
Search Index Generator
       ↓
search-index.json
       ↓
js/search.js
```

එම business එක automatically search results වලට ඇතුළත් වේ.

Manual search code modification අවශ්‍ය නොවිය යුතුය.

---

# 11. Search Examples

## Search: `Sigiriya`

Result:

```text
🏛️ Sigiriya
Matale · Central Province
Heritage
View Details →
```

ඊට අමතරව location එකට සම්බන්ධ businesses පෙන්විය හැක:

```text
🧘 Sigiriya Yoga Center
Yoga · Sigiriya · Matale
⭐ Featured
View Details →
```

---

## Search: `Yoga`

Result:

```text
🧘 Sigiriya Yoga Center
Yoga · Sigiriya · Matale
⭐ Featured
View Details →
```

---

## Search: `Matale`

Result:

```text
🏛️ Sigiriya
Matale · Central Province

🧘 Sigiriya Yoga Center
Yoga · Matale
```

---

# 12. Promotion System

Future එකේ businesses වලට paid / promoted listings ලබාදීමට architecture එකේ support තිබිය යුතුය.

Business data එකේ:

```javascript
promoted: true
```

හෝ:

```javascript
promoted: false
```

භාවිතා කළ හැක.

Featured listing සඳහා:

```javascript
featured: true
```

භාවිතා කළ හැක.

---

# 13. Search Result Labels

Promoted business එකකට:

```text
⭐ Featured
```

හෝ:

```text
Sponsored
```

වැනි label එකක් පෙන්විය හැක.

සාමාන්‍ය business එක:

```text
Yoga Class
Sigiriya · Matale
```

Promoted business එක:

```text
⭐ Featured
Yoga Class
Sigiriya · Matale
```

---

# 14. Future Search Categories

Search system එක future එකේ පහත types support කළ හැක:

```text
attraction
business
hotel
restaurant
yoga
activity
guide
transport
```

නමුත් `type` එක සහ `category` එක වෙනම concepts ලෙස තබා ගැනීම වැදගත්ය.

උදාහරණ:

```javascript
type: "business"
category: "yoga"
```

හෝ:

```javascript
type: "business"
category: "hotel"
```

---

# 15. Recommended Folder Structure

```text
LankaQuest/
│
├── index.html
├── attractions.html
├── trip-planner.html
│
├── attractions/
│   ├── central-province/
│   │   ├── matale/
│   │   │   ├── sigiriya.html
│   │   │   └── ...
│   │   └── kandy/
│   │
│   ├── western-province/
│   ├── southern-province/
│   └── ...
│
├── data/
│   ├── places.js
│   ├── businesses.js
│   └── guides.js
│
├── data/generated/
│   └── search-index.json
│
├── js/
│   ├── search.js
│   ├── places.js
│   └── ...
│
└── generator/
    └── generate-attractions.js
```

---

# 16. Important Rule

### `places.js`

Tourist destinations / attractions සඳහා.

### `businesses.js`

Commercial tourism services සඳහා.

### `guides.js`

Registered LankaQuest guides සඳහා.

### `search-index.json`

Search කිරීම සඳහා combined index එක.

---

# 17. Final System

අවසාන architecture එක:

```text
                    LankaQuest Data
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    Attractions       Businesses        Guides
    places.js       businesses.js      guides.js
        │                │                │
        └────────────────┼────────────────┘
                         ↓
                Automatic Generator
                         ↓
               search-index.json
                         ↓
                    search.js
                         ↓
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
     Homepage       Attractions       Future Pages
     Search           Search             Search
```

---

# 18. Main Development Principle

LankaQuest එකට අලුත් content එකක් add කරන විට:

```text
Add Data
   ↓
Run Generator
   ↓
HTML generated
   ↓
Search Index generated
   ↓
Search automatically updated
```

ඒ නිසා අලුත් attraction එකක්, hotel එකක්, yoga class එකක් හෝ වෙනත් tourism service එකක් add කරන සෑම අවස්ථාවකම search system එකේ වෙනම code edit කිරීම අවශ්‍ය නොවේ.

---

# 19. Future Expansion

මෙම architecture එක පසුව:

```text
Tourist Attractions
       +
Hotels
       +
Restaurants
       +
Yoga / Ayurveda
       +
Activities
       +
Guides
       +
Transport
       +
Sponsored Businesses
```

යන සියල්ලම **එකම LankaQuest Search Experience එකක්** තුළට ගෙන ඒමට හැකි වන ලෙස සැලසුම් කර ඇත.

---

## Development Order

LankaQuest එකේ මේ feature එක implement කරන විට පහත order එක භාවිතා කළ යුතුය:

1. `places.js` final data structure
2. Province → District → Attraction generator
3. Automatic attraction HTML generation
4. Common `search.js`
5. `search-index.json` generation
6. `index.html` search integration
7. `attractions.html` search integration
8. `businesses.js`
9. Business search integration
10. Featured / Promoted system
11. Future Guide / Service search integration

**Goal:** එකම data source එකෙන් content generate කිරීමත්, එකම search system එකෙන් සියලුම LankaQuest content සොයාගැනීමත්.
