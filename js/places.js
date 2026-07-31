
/* ============================================================
   SRI LANKA TOURISM DATABASE

   Main Destination Database

   මෙම Data එක භාවිතා කරන්නේ:

   🗺️ Interactive Map
   🔍 Search
   🏛️ Category Filter
   ⭐ Ratings
   🌟 Featured Places
   📸 Gallery
   🧳 Trip Planner
   📄 Destination Pages

============================================================ */


window.touristPlaces = [
  /* ========================================================
       01. SIGIRIYA
    ======================================================== */

  {
    id: "sigiriya",

    name: "Sigiriya",

    sinhalaName: "සීගිරිය",

    title: "Sigiriya Rock Fortress",

    shortDescription:
      "An ancient rock fortress and one of Sri Lanka's most iconic historical attractions.",

    description:
      "Sigiriya is an ancient rock fortress famous for its spectacular rock, ancient palace ruins, frescoes and beautiful gardens.",

    category: "heritage",

    categoryName: "Heritage & History",

    province: "Central Province",

    district: "Matale",

    location: "Sigiriya, Matale, Sri Lanka",

    coordinates: [7.957, 80.7603],

    image: "images/destinations/sigiriya/sigiriya-main.jpg",

    gallery: [
      "images/destinations/sigiriya/sigiriya-01.jpg",
      "images/destinations/sigiriya/sigiriya-02.jpg",
      "images/destinations/sigiriya/sigiriya-03.jpg",
      "images/destinations/sigiriya/sigiriya-04.jpg",
    ],

    featured: true,

    rating: 4.9,

    bestTime: "January to April",

    page: "destinations/sigiriya.html",
  },

  /* ========================================================
       02. KANDY
    ======================================================== */

  {
    id: "kandy",

    name: "Kandy",

    sinhalaName: "මහනුවර",

    title: "Kandy – Cultural Capital of Sri Lanka",

    shortDescription:
      "A beautiful cultural city surrounded by mountains and home to the Temple of the Sacred Tooth Relic.",

    description:
      "Kandy is one of Sri Lanka's most important cultural destinations, famous for the Temple of the Sacred Tooth Relic and Kandy Lake.",

    category: "culture",

    categoryName: "Culture & Religion",

    province: "Central Province",

    district: "Kandy",

    location: "Kandy, Sri Lanka",

    coordinates: [7.2906, 80.6337],

    image: "images/destinations/kandy/kandy-main.jpg",

    gallery: [
      "images/destinations/kandy/kandy-01.jpg",
      "images/destinations/kandy/kandy-02.jpg",
      "images/destinations/kandy/kandy-03.jpg",
      "images/destinations/kandy/kandy-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "December to April",

    page: "destinations/kandy.html",
  },

  /* ========================================================
       03. ELLA
    ======================================================== */

  {
    id: "ella",

    name: "Ella",

    sinhalaName: "ඇල්ල",

    title: "Ella – The Beautiful Mountain Escape",

    shortDescription:
      "A breathtaking mountain destination famous for tea plantations, waterfalls and scenic landscapes.",

    description:
      "Ella is a popular mountain destination surrounded by lush green hills and tea plantations.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Uva Province",

    district: "Badulla",

    location: "Ella, Badulla, Sri Lanka",

    coordinates: [6.8667, 81.0466],

    image: "images/destinations/ella/ella-main.jpg",

    gallery: [
      "images/destinations/ella/ella-01.jpg",
      "images/destinations/ella/ella-02.jpg",
      "images/destinations/ella/ella-03.jpg",
      "images/destinations/ella/ella-04.jpg",
    ],

    featured: true,

    rating: 4.9,

    bestTime: "January to March",

    page: "destinations/ella.html",
  },

  /* ========================================================
       04. GALLE FORT
    ======================================================== */

  {
    id: "galle-fort",

    name: "Galle Fort",

    sinhalaName: "ගාල්ල කොටුව",

    title: "Galle Fort – Historic Coastal City",

    shortDescription:
      "A historic fortified city and UNESCO World Heritage destination on Sri Lanka's southern coast.",

    description:
      "Galle Fort is famous for its colonial architecture, historic streets, museums, cafes and ocean views.",

    category: "heritage",

    categoryName: "Heritage & History",

    province: "Southern Province",

    district: "Galle",

    location: "Galle Fort, Galle, Sri Lanka",

    coordinates: [6.0269, 80.217],

    image: "images/destinations/galle-fort/galle-fort-main.jpg",

    gallery: [
      "images/destinations/galle-fort/galle-fort-01.jpg",
      "images/destinations/galle-fort/galle-fort-02.jpg",
      "images/destinations/galle-fort/galle-fort-03.jpg",
      "images/destinations/galle-fort/galle-fort-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "December to April",

    page: "destinations/galle-fort.html",
  },

  /* ========================================================
       05. YALA NATIONAL PARK
    ======================================================== */

  {
    id: "yala",

    name: "Yala National Park",

    sinhalaName: "යාල ජාතික උද්‍යානය",

    title: "Yala National Park",

    shortDescription:
      "Sri Lanka's famous wildlife destination known for elephants, leopards and diverse ecosystems.",

    description:
      "Yala National Park is one of Sri Lanka's most popular wildlife destinations and offers exciting safari experiences.",

    category: "wildlife",

    categoryName: "Wildlife & Safari",

    province: "Southern Province",

    district: "Hambantota",

    location: "Yala, Sri Lanka",

    coordinates: [6.3728, 81.5185],

    image: "images/destinations/yala/yala-main.jpg",

    gallery: [
      "images/destinations/yala/yala-01.jpg",
      "images/destinations/yala/yala-02.jpg",
      "images/destinations/yala/yala-03.jpg",
      "images/destinations/yala/yala-04.jpg",
    ],

    featured: true,

    rating: 4.7,

    bestTime: "February to June",

    page: "destinations/yala.html",
  },

  /* ========================================================
       06. ANURADHAPURA
    ======================================================== */

  {
    id: "anuradhapura",

    name: "Anuradhapura",

    sinhalaName: "අනුරාධපුරය",

    title: "Ancient City of Anuradhapura",

    shortDescription:
      "An ancient sacred city filled with magnificent stupas, monasteries and Buddhist heritage.",

    description:
      "Anuradhapura was one of the great ancient capitals of Sri Lanka and remains an important sacred destination.",

    category: "heritage",

    categoryName: "Heritage & History",

    province: "North Central Province",

    district: "Anuradhapura",

    location: "Anuradhapura, Sri Lanka",

    coordinates: [8.3114, 80.4037],

    image: "images/destinations/anuradhapura/anuradhapura-main.jpg",

    gallery: [
      "images/destinations/anuradhapura/anuradhapura-01.jpg",
      "images/destinations/anuradhapura/anuradhapura-02.jpg",
      "images/destinations/anuradhapura/anuradhapura-03.jpg",
      "images/destinations/anuradhapura/anuradhapura-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "May to September",

    page: "destinations/anuradhapura.html",
  },

  /* ========================================================
       07. POLONNARUWA
    ======================================================== */

  {
    id: "polonnaruwa",

    name: "Polonnaruwa",

    sinhalaName: "පොළොන්නරුව",

    title: "Ancient City of Polonnaruwa",

    shortDescription:
      "A magnificent ancient city featuring historic ruins, temples and remarkable stone sculptures.",

    description:
      "Polonnaruwa is a UNESCO World Heritage ancient city known for its archaeological treasures and historic monuments.",

    category: "heritage",

    categoryName: "Heritage & History",

    province: "North Central Province",

    district: "Polonnaruwa",

    location: "Polonnaruwa, Sri Lanka",

    coordinates: [7.9403, 81.0188],

    image: "images/destinations/polonnaruwa/polonnaruwa-main.jpg",

    gallery: [
      "images/destinations/polonnaruwa/polonnaruwa-01.jpg",
      "images/destinations/polonnaruwa/polonnaruwa-02.jpg",
      "images/destinations/polonnaruwa/polonnaruwa-03.jpg",
      "images/destinations/polonnaruwa/polonnaruwa-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "May to September",

    page: "destinations/polonnaruwa.html",
  },

  /* ========================================================
       08. NUWARA ELIYA
    ======================================================== */

  {
    id: "nuwara-eliya",

    name: "Nuwara Eliya",

    sinhalaName: "නුවරඑළිය",

    title: "Little England of Sri Lanka",

    shortDescription:
      "A cool mountain town surrounded by tea plantations, gardens and beautiful colonial architecture.",

    description:
      "Nuwara Eliya is famous for its cool climate, tea estates, waterfalls and colonial charm.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Central Province",

    district: "Nuwara Eliya",

    location: "Nuwara Eliya, Sri Lanka",

    coordinates: [6.9497, 80.7891],

    image: "images/destinations/nuwara-eliya/nuwara-eliya-main.jpg",

    gallery: [
      "images/destinations/nuwara-eliya/nuwara-eliya-01.jpg",
      "images/destinations/nuwara-eliya/nuwara-eliya-02.jpg",
      "images/destinations/nuwara-eliya/nuwara-eliya-03.jpg",
      "images/destinations/nuwara-eliya/nuwara-eliya-04.jpg",
    ],

    featured: true,

    rating: 4.7,

    bestTime: "January to April",

    page: "destinations/nuwara-eliya.html",
  },

  /* ========================================================
       09. MIRISSA
    ======================================================== */

  {
    id: "mirissa",

    name: "Mirissa",

    sinhalaName: "මිරිස්ස",

    title: "Mirissa Beach",

    shortDescription:
      "A tropical beach destination famous for golden sands, sunsets and whale watching.",

    description:
      "Mirissa is one of Sri Lanka's most popular southern beach destinations.",

    category: "beach",

    categoryName: "Beaches & Coast",

    province: "Southern Province",

    district: "Matara",

    location: "Mirissa, Matara, Sri Lanka",

    coordinates: [5.9483, 80.4716],

    image: "images/destinations/mirissa/mirissa-main.jpg",

    gallery: [
      "images/destinations/mirissa/mirissa-01.jpg",
      "images/destinations/mirissa/mirissa-02.jpg",
      "images/destinations/mirissa/mirissa-03.jpg",
      "images/destinations/mirissa/mirissa-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "December to April",

    page: "destinations/mirissa.html",
  },

  /* ========================================================
       10. UNAWATUNA
    ======================================================== */

  {
    id: "unawatuna",

    name: "Unawatuna",

    sinhalaName: "උණවටුන",

    title: "Unawatuna Beach",

    shortDescription:
      "A beautiful tropical beach known for swimming, snorkeling and relaxing seaside experiences.",

    description:
      "Unawatuna is a popular beach destination near Galle with warm waters and a relaxed atmosphere.",

    category: "beach",

    categoryName: "Beaches & Coast",

    province: "Southern Province",

    district: "Galle",

    location: "Unawatuna, Galle, Sri Lanka",

    coordinates: [6.0097, 80.2488],

    image: "images/destinations/unawatuna/unawatuna-main.jpg",

    gallery: [
      "images/destinations/unawatuna/unawatuna-01.jpg",
      "images/destinations/unawatuna/unawatuna-02.jpg",
      "images/destinations/unawatuna/unawatuna-03.jpg",
      "images/destinations/unawatuna/unawatuna-04.jpg",
    ],

    featured: false,

    rating: 4.7,

    bestTime: "December to April",

    page: "destinations/unawatuna.html",
  },

  /* ========================================================
       11. BENTOTA
    ======================================================== */

  {
    id: "bentota",

    name: "Bentota",

    sinhalaName: "බෙන්තොට",

    title: "Bentota Beach",

    shortDescription:
      "A popular coastal destination offering beaches, water activities and relaxing resorts.",

    description:
      "Bentota is a well-known beach destination on Sri Lanka's southwest coast.",

    category: "beach",

    categoryName: "Beaches & Coast",

    province: "Western Province",

    district: "Galle",

    location: "Bentota, Sri Lanka",

    coordinates: [6.4211, 80.0017],

    image: "images/destinations/bentota/bentota-main.jpg",

    gallery: [
      "images/destinations/bentota/bentota-01.jpg",
      "images/destinations/bentota/bentota-02.jpg",
      "images/destinations/bentota/bentota-03.jpg",
      "images/destinations/bentota/bentota-04.jpg",
    ],

    featured: false,

    rating: 4.6,

    bestTime: "November to April",

    page: "destinations/bentota.html",
  },

  /* ========================================================
       12. ARUGAM BAY
    ======================================================== */

  {
    id: "arugam-bay",

    name: "Arugam Bay",

    sinhalaName: "ආරුගම්බේ",

    title: "Arugam Bay Surfing Paradise",

    shortDescription:
      "A world-famous surfing destination on Sri Lanka's east coast.",

    description:
      "Arugam Bay is internationally known for surfing, beaches and its relaxed coastal atmosphere.",

    category: "beach",

    categoryName: "Beaches & Coast",

    province: "Eastern Province",

    district: "Ampara",

    location: "Arugam Bay, Sri Lanka",

    coordinates: [6.8403, 81.8367],

    image: "images/destinations/arugam-bay/arugam-bay-main.jpg",

    gallery: [
      "images/destinations/arugam-bay/arugam-bay-01.jpg",
      "images/destinations/arugam-bay/arugam-bay-02.jpg",
      "images/destinations/arugam-bay/arugam-bay-03.jpg",
      "images/destinations/arugam-bay/arugam-bay-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "May to September",

    page: "destinations/arugam-bay.html",
  },

  /* ========================================================
       13. TRINCOMALEE
    ======================================================== */

  {
    id: "trincomalee",

    name: "Trincomalee",

    sinhalaName: "ත්‍රිකුණාමලය",

    title: "Trincomalee – East Coast Paradise",

    shortDescription:
      "A beautiful east coast destination known for beaches, temples and natural harbours.",

    description:
      "Trincomalee is famous for its beautiful beaches, historic sites and stunning coastal scenery.",

    category: "beach",

    categoryName: "Beaches & Coast",

    province: "Eastern Province",

    district: "Trincomalee",

    location: "Trincomalee, Sri Lanka",

    coordinates: [8.5874, 81.2152],

    image: "images/destinations/trincomalee/trincomalee-main.jpg",

    gallery: [
      "images/destinations/trincomalee/trincomalee-01.jpg",
      "images/destinations/trincomalee/trincomalee-02.jpg",
      "images/destinations/trincomalee/trincomalee-03.jpg",
      "images/destinations/trincomalee/trincomalee-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "May to September",

    page: "destinations/trincomalee.html",
  },

  /* ========================================================
       14. HORTON PLAINS
    ======================================================== */

  {
    id: "horton-plains",

    name: "Horton Plains",

    sinhalaName: "හෝර්ටන් තැන්න",

    title: "Horton Plains National Park",

    shortDescription:
      "A beautiful highland nature reserve famous for World's End and scenic hiking trails.",

    description:
      "Horton Plains is a spectacular highland national park with unique ecosystems, forests and dramatic viewpoints.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Central Province",

    district: "Nuwara Eliya",

    location: "Horton Plains, Sri Lanka",

    coordinates: [6.8021, 80.803],

    image: "images/destinations/horton-plains/horton-plains-main.jpg",

    gallery: [
      "images/destinations/horton-plains/horton-plains-01.jpg",
      "images/destinations/horton-plains/horton-plains-02.jpg",
      "images/destinations/horton-plains/horton-plains-03.jpg",
      "images/destinations/horton-plains/horton-plains-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "January to March",

    page: "destinations/horton-plains.html",
  },

  /* ========================================================
       15. ADAM'S PEAK
    ======================================================== */

  {
    id: "adams-peak",

    name: "Adam's Peak",

    sinhalaName: "ශ්‍රී පාදය",

    title: "Sri Pada – Adam's Peak",

    shortDescription:
      "A sacred mountain and famous pilgrimage destination with spectacular sunrise views.",

    description:
      "Adam's Peak is one of Sri Lanka's most famous mountains and a major pilgrimage destination.",

    category: "culture",

    categoryName: "Culture & Religion",

    province: "Sabaragamuwa Province",

    district: "Ratnapura",

    location: "Sri Pada, Sri Lanka",

    coordinates: [6.8096, 80.4994],

    image: "images/destinations/adams-peak/adams-peak-main.jpg",

    gallery: [
      "images/destinations/adams-peak/adams-peak-01.jpg",
      "images/destinations/adams-peak/adams-peak-02.jpg",
      "images/destinations/adams-peak/adams-peak-03.jpg",
      "images/destinations/adams-peak/adams-peak-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "December to May",

    page: "destinations/adams-peak.html",
  },

  /* ========================================================
       16. DAMBULLA
    ======================================================== */

  {
    id: "dambulla",

    name: "Dambulla Cave Temple",

    sinhalaName: "දඹුල්ල රජමහා විහාරය",

    title: "Dambulla Cave Temple",

    shortDescription:
      "A sacred cave temple complex famous for ancient Buddhist paintings and statues.",

    description:
      "Dambulla Cave Temple is one of Sri Lanka's most important Buddhist heritage sites.",

    category: "culture",

    categoryName: "Culture & Religion",

    province: "Central Province",

    district: "Matale",

    location: "Dambulla, Sri Lanka",

    coordinates: [7.8567, 80.6492],

    image: "images/destinations/dambulla/dambulla-main.jpg",

    gallery: [
      "images/destinations/dambulla/dambulla-01.jpg",
      "images/destinations/dambulla/dambulla-02.jpg",
      "images/destinations/dambulla/dambulla-03.jpg",
      "images/destinations/dambulla/dambulla-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "January to April",

    page: "destinations/dambulla.html",
  },

  /* ========================================================
       17. MINNERIYA NATIONAL PARK
    ======================================================== */

  {
    id: "minneriya",

    name: "Minneriya National Park",

    sinhalaName: "මින්නේරිය ජාතික උද්‍යානය",

    title: "Minneriya National Park",

    shortDescription:
      "A famous wildlife destination known for large gatherings of wild elephants.",

    description:
      "Minneriya National Park is a popular safari destination, especially famous for elephant gatherings.",

    category: "wildlife",

    categoryName: "Wildlife & Safari",

    province: "North Central Province",

    district: "Polonnaruwa",

    location: "Minneriya, Sri Lanka",

    coordinates: [8.0352, 80.8986],

    image: "images/destinations/minneriya/minneriya-main.jpg",

    gallery: [
      "images/destinations/minneriya/minneriya-01.jpg",
      "images/destinations/minneriya/minneriya-02.jpg",
      "images/destinations/minneriya/minneriya-03.jpg",
      "images/destinations/minneriya/minneriya-04.jpg",
    ],

    featured: true,

    rating: 4.7,

    bestTime: "June to September",

    page: "destinations/minneriya.html",
  },

  /* ========================================================
       18. UDAWALAWE NATIONAL PARK
    ======================================================== */

  {
    id: "udawalawe",

    name: "Udawalawe National Park",

    sinhalaName: "උඩවලව ජාතික උද්‍යානය",

    title: "Udawalawe National Park",

    shortDescription:
      "A popular safari destination famous for elephants and beautiful open landscapes.",

    description:
      "Udawalawe National Park is one of the best places in Sri Lanka to experience wild elephants.",

    category: "wildlife",

    categoryName: "Wildlife & Safari",

    province: "Sabaragamuwa Province",

    district: "Ratnapura",

    location: "Udawalawe, Sri Lanka",

    coordinates: [6.4746, 80.8886],

    image: "images/destinations/udawalawe/udawalawe-main.jpg",

    gallery: [
      "images/destinations/udawalawe/udawalawe-01.jpg",
      "images/destinations/udawalawe/udawalawe-02.jpg",
      "images/destinations/udawalawe/udawalawe-03.jpg",
      "images/destinations/udawalawe/udawalawe-04.jpg",
    ],

    featured: true,

    rating: 4.7,

    bestTime: "May to September",

    page: "destinations/udawalawe.html",
  },

  /* ========================================================
       19. BUNDALA NATIONAL PARK
    ======================================================== */

  {
    id: "bundala",

    name: "Bundala National Park",

    sinhalaName: "බුන්දල ජාතික උද්‍යානය",

    title: "Bundala National Park",

    shortDescription:
      "A beautiful wetland sanctuary known for migratory birds and diverse wildlife.",

    description:
      "Bundala National Park is an important wetland ecosystem and a paradise for birdwatchers.",

    category: "wildlife",

    categoryName: "Wildlife & Safari",

    province: "Southern Province",

    district: "Hambantota",

    location: "Bundala, Sri Lanka",

    coordinates: [6.2036, 81.2422],

    image: "images/destinations/bundala/bundala-main.jpg",

    gallery: [
      "images/destinations/bundala/bundala-01.jpg",
      "images/destinations/bundala/bundala-02.jpg",
      "images/destinations/bundala/bundala-03.jpg",
      "images/destinations/bundala/bundala-04.jpg",
    ],

    featured: false,

    rating: 4.5,

    bestTime: "November to March",

    page: "destinations/bundala.html",
  },

  /* ========================================================
       20. SINHARAJA FOREST
    ======================================================== */

  {
    id: "sinharaja",

    name: "Sinharaja Forest Reserve",

    sinhalaName: "සිංහරාජ වනාන්තරය",

    title: "Sinharaja Rainforest",

    shortDescription:
      "A UNESCO World Heritage rainforest rich in biodiversity and endemic wildlife.",

    description:
      "Sinharaja is Sri Lanka's famous tropical rainforest and an important biodiversity hotspot.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Sabaragamuwa Province",

    district: "Ratnapura",

    location: "Sinharaja, Sri Lanka",

    coordinates: [6.404, 80.455],

    image: "images/destinations/sinharaja/sinharaja-main.jpg",

    gallery: [
      "images/destinations/sinharaja/sinharaja-01.jpg",
      "images/destinations/sinharaja/sinharaja-02.jpg",
      "images/destinations/sinharaja/sinharaja-03.jpg",
      "images/destinations/sinharaja/sinharaja-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "January to April",

    page: "destinations/sinharaja.html",
  },

  /* ========================================================
       21. KNuckles Mountain Range
    ======================================================== */

  {
    id: "knuckles",

    name: "Knuckles Mountain Range",

    sinhalaName: "නකල්ස් කඳු පන්තිය",

    title: "Knuckles Mountain Range",

    shortDescription:
      "A spectacular mountain region famous for hiking, forests and dramatic landscapes.",

    description:
      "The Knuckles Mountain Range offers some of Sri Lanka's most beautiful hiking and nature experiences.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Central Province",

    district: "Matale",

    location: "Knuckles, Sri Lanka",

    coordinates: [7.5088, 80.7977],

    image: "images/destinations/knuckles/knuckles-main.jpg",

    gallery: [
      "images/destinations/knuckles/knuckles-01.jpg",
      "images/destinations/knuckles/knuckles-02.jpg",
      "images/destinations/knuckles/knuckles-03.jpg",
      "images/destinations/knuckles/knuckles-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "January to April",

    page: "destinations/knuckles.html",
  },

  /* ========================================================
       22. RAVANA FALLS
    ======================================================== */

  {
    id: "ravana-falls",

    name: "Ravana Falls",

    sinhalaName: "රාවණා ඇල්ල",

    title: "Ravana Falls",

    shortDescription:
      "A spectacular waterfall near Ella surrounded by lush mountain scenery.",

    description:
      "Ravana Falls is one of Sri Lanka's most popular waterfalls and a beautiful stop near Ella.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Uva Province",

    district: "Badulla",

    location: "Ella, Sri Lanka",

    coordinates: [6.8415, 81.0537],

    image: "images/destinations/ravana-falls/ravana-falls-main.jpg",

    gallery: [
      "images/destinations/ravana-falls/ravana-falls-01.jpg",
      "images/destinations/ravana-falls/ravana-falls-02.jpg",
      "images/destinations/ravana-falls/ravana-falls-03.jpg",
      "images/destinations/ravana-falls/ravana-falls-04.jpg",
    ],

    featured: false,

    rating: 4.6,

    bestTime: "October to April",

    page: "destinations/ravana-falls.html",
  },

  /* ========================================================
       23. NINE ARCH BRIDGE
    ======================================================== */

  {
    id: "nine-arch-bridge",

    name: "Nine Arch Bridge",

    sinhalaName: "නව ආරුක්කු පාලම",

    title: "Nine Arch Bridge",

    shortDescription:
      "A famous colonial-era railway bridge surrounded by lush green hills near Ella.",

    description:
      "The Nine Arch Bridge is one of Ella's most photographed attractions and a popular destination for train enthusiasts.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Uva Province",

    district: "Badulla",

    location: "Demodara, Ella, Sri Lanka",

    coordinates: [6.8767, 81.0597],

    image: "images/destinations/nine-arch-bridge/nine-arch-bridge-main.jpg",

    gallery: [
      "images/destinations/nine-arch-bridge/nine-arch-bridge-01.jpg",
      "images/destinations/nine-arch-bridge/nine-arch-bridge-02.jpg",
      "images/destinations/nine-arch-bridge/nine-arch-bridge-03.jpg",
      "images/destinations/nine-arch-bridge/nine-arch-bridge-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "January to March",

    page: "destinations/nine-arch-bridge.html",
  },

  /* ========================================================
       24. HIKKADUWA
    ======================================================== */

  {
    id: "hikkaduwa",

    name: "Hikkaduwa",

    sinhalaName: "හික්කඩුව",

    title: "Hikkaduwa Beach",

    shortDescription:
      "A vibrant beach destination famous for coral reefs, snorkeling and surfing.",

    description:
      "Hikkaduwa is a popular coastal destination offering marine experiences and a lively beach atmosphere.",

    category: "beach",

    categoryName: "Beaches & Coast",

    province: "Southern Province",

    district: "Galle",

    location: "Hikkaduwa, Sri Lanka",

    coordinates: [6.1395, 80.146],

    image: "images/destinations/hikkaduwa/hikkaduwa-main.jpg",

    gallery: [
      "images/destinations/hikkaduwa/hikkaduwa-01.jpg",
      "images/destinations/hikkaduwa/hikkaduwa-02.jpg",
      "images/destinations/hikkaduwa/hikkaduwa-03.jpg",
      "images/destinations/hikkaduwa/hikkaduwa-04.jpg",
    ],

    featured: false,

    rating: 4.6,

    bestTime: "November to April",

    page: "destinations/hikkaduwa.html",
  },

  /* ========================================================
       25. PASIKUDAH
    ======================================================== */

  {
    id: "pasikudah",

    name: "Pasikudah",

    sinhalaName: "පාසිකුඩා",

    title: "Pasikudah Beach",

    shortDescription:
      "A stunning east coast beach famous for shallow turquoise waters and white sand.",

    description:
      "Pasikudah is one of Sri Lanka's most beautiful beaches and is ideal for relaxing seaside holidays.",

    category: "beach",

    categoryName: "Beaches & Coast",

    province: "Eastern Province",

    district: "Batticaloa",

    location: "Pasikudah, Sri Lanka",

    coordinates: [7.9239, 81.56],

    image: "images/destinations/pasikudah/pasikudah-main.jpg",

    gallery: [
      "images/destinations/pasikudah/pasikudah-01.jpg",
      "images/destinations/pasikudah/pasikudah-02.jpg",
      "images/destinations/pasikudah/pasikudah-03.jpg",
      "images/destinations/pasikudah/pasikudah-04.jpg",
    ],

    featured: true,

    rating: 4.7,

    bestTime: "May to September",

    page: "destinations/pasikudah.html",
  },

  /* ========================================================
       26. JAFFNA
    ======================================================== */

  {
    id: "jaffna",

    name: "Jaffna",

    sinhalaName: "යාපනය",

    title: "Jaffna – Northern Sri Lanka",

    shortDescription:
      "A culturally rich northern destination known for temples, history and unique Tamil heritage.",

    description:
      "Jaffna offers visitors a unique cultural experience with historic sites, temples, local food and northern landscapes.",

    category: "culture",

    categoryName: "Culture & Religion",

    province: "Northern Province",

    district: "Jaffna",

    location: "Jaffna, Sri Lanka",

    coordinates: [9.6615, 80.0255],

    image: "images/destinations/jaffna/jaffna-main.jpg",

    gallery: [
      "images/destinations/jaffna/jaffna-01.jpg",
      "images/destinations/jaffna/jaffna-02.jpg",
      "images/destinations/jaffna/jaffna-03.jpg",
      "images/destinations/jaffna/jaffna-04.jpg",
    ],

    featured: true,

    rating: 4.6,

    bestTime: "January to September",

    page: "destinations/jaffna.html",
  },

  /* ========================================================
       27. NEGOMBO
    ======================================================== */

  {
    id: "negombo",

    name: "Negombo",

    sinhalaName: "මීගමුව",

    title: "Negombo Beach City",

    shortDescription:
      "A coastal city near Colombo International Airport known for beaches, seafood and fishing culture.",

    description:
      "Negombo is a convenient first or last stop for international travelers visiting Sri Lanka.",

    category: "beach",

    categoryName: "Beaches & Coast",

    province: "Western Province",

    district: "Gampaha",

    location: "Negombo, Sri Lanka",

    coordinates: [7.2083, 79.8358],

    image: "images/destinations/negombo/negombo-main.jpg",

    gallery: [
      "images/destinations/negombo/negombo-01.jpg",
      "images/destinations/negombo/negombo-02.jpg",
      "images/destinations/negombo/negombo-03.jpg",
      "images/destinations/negombo/negombo-04.jpg",
    ],

    featured: false,

    rating: 4.5,

    bestTime: "December to April",

    page: "destinations/negombo.html",
  },

  /* ========================================================
       28. KALPITIYA
    ======================================================== */

  {
    id: "kalpitiya",

    name: "Kalpitiya",

    sinhalaName: "කල්පිටිය",

    title: "Kalpitiya – Coastal Adventure",

    shortDescription:
      "A beautiful coastal destination known for dolphins, lagoons and water sports.",

    description:
      "Kalpitiya offers unique marine experiences including dolphin watching and kitesurfing.",

    category: "beach",

    categoryName: "Beaches & Coast",

    province: "North Western Province",

    district: "Puttalam",

    location: "Kalpitiya, Sri Lanka",

    coordinates: [8.2376, 79.7581],

    image: "images/destinations/kalpitiya/kalpitiya-main.jpg",

    gallery: [
      "images/destinations/kalpitiya/kalpitiya-01.jpg",
      "images/destinations/kalpitiya/kalpitiya-02.jpg",
      "images/destinations/kalpitiya/kalpitiya-03.jpg",
      "images/destinations/kalpitiya/kalpitiya-04.jpg",
    ],

    featured: false,

    rating: 4.6,

    bestTime: "May to September",

    page: "destinations/kalpitiya.html",
  },

  /* ========================================================
       29. PIDURANGALA
    ======================================================== */

  {
    id: "pidurangala",

    name: "Pidurangala Rock",

    sinhalaName: "පිදුරංගල",

    title: "Pidurangala Rock",

    shortDescription:
      "A spectacular viewpoint offering panoramic views of Sigiriya and the surrounding landscape.",

    description:
      "Pidurangala Rock is a popular hiking destination and offers one of the best views of Sigiriya Rock.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Central Province",

    district: "Matale",

    location: "Sigiriya, Matale, Sri Lanka",

    coordinates: [7.9697, 80.7527],

    image: "images/destinations/pidurangala/pidurangala-main.jpg",

    gallery: [
      "images/destinations/pidurangala/pidurangala-01.jpg",
      "images/destinations/pidurangala/pidurangala-02.jpg",
      "images/destinations/pidurangala/pidurangala-03.jpg",
      "images/destinations/pidurangala/pidurangala-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "January to April",

    page: "destinations/pidurangala.html",
  },

  /* ========================================================
       30. COLOMBO
    ======================================================== */

  {
    id: "colombo",

    name: "Colombo",

    sinhalaName: "කොළඹ",

    title: "Colombo – The Commercial Capital",

    shortDescription:
      "Sri Lanka's vibrant commercial capital offering modern attractions, history, shopping and food.",

    description:
      "Colombo is a lively city where visitors can experience modern Sri Lanka alongside colonial heritage, markets, restaurants and seaside attractions.",

    category: "culture",

    categoryName: "Culture & City",

    province: "Western Province",

    district: "Colombo",

    location: "Colombo, Sri Lanka",

    coordinates: [6.9271, 79.8612],

    image: "images/destinations/colombo/colombo-main.jpg",

    gallery: [
      "images/destinations/colombo/colombo-01.jpg",
      "images/destinations/colombo/colombo-02.jpg",
      "images/destinations/colombo/colombo-03.jpg",
      "images/destinations/colombo/colombo-04.jpg",
    ],

    featured: true,

    rating: 4.5,

    bestTime: "January to April",

    page: "destinations/colombo.html",
  },

  {
    id: "thamba-dola",
    name: "Thamba Dola",
    sinhalaName: "තඹ දොළ",
    title: "Thamba Dola – Natural Water Pool & Waterfall",
    shortDescription:
      "An attractive natural waterfall and pool located in the Kalutara district surrounded by rainforest.",
    description:
      "Thamba Dola is a serene natural cascade and bathing spot originating from the Kalu Gala reserve, offering crystal-clear fresh water within a lush green ecosystem.",
    category: "nature",
    categoryName: "Nature & Adventure",
    province: "Western Province",
    district: "Kalutara",
    location: "Polgampola, Sri Lanka",
    coordinates: [6.4833, 80.2167],
    image: "images/destinations/kalutara/thamba-dola-main.jpg",
    gallery: [
      "images/destinations/kalutara/thamba-01.jpg",
      "images/destinations/kalutara/thamba-02.jpg",
      "images/destinations/kalutara/thamba-03.jpg",
      "images/destinations/kalutara/thamba-04.jpg",
    ],
    featured: true,
    rating: 4.6,
    bestTime: "December to April",
    page: "destinations/thamba-dola.html",
  },
  {
    id: "kalu-ganga",
    name: "Kalu Ganga",
    sinhalaName: "කළු ගඟ",
    title: "Kalu Ganga – The Scenic River",
    shortDescription:
      "One of Sri Lanka's major rivers offering scenic boat rides and picturesque riverbanks.",
    description:
      "Kalu Ganga flows through the Kalutara district, providing visitors with relaxing boat excursions, vibrant local river life, and scenic views.",
    category: "nature",
    categoryName: "Nature & Adventure",
    province: "Western Province",
    district: "Kalutara",
    location: "Kalutara, Sri Lanka",
    coordinates: [6.5854, 79.9607],
    image: "images/destinations/kalutara/kalu-ganga-main.jpg",
    gallery: [
      "images/destinations/kalutara/kalu-01.jpg",
      "images/destinations/kalutara/kalu-02.jpg",
      "images/destinations/kalutara/kalu-03.jpg",
      "images/destinations/kalutara/kalu-04.jpg",
    ],
    featured: false,
    rating: 4.3,
    bestTime: "All year round",
    page: "destinations/kalu-ganga.html",
  },
  {
    id: "panadura-beach",
    name: "Panadura Beach",
    sinhalaName: "පානදුර වෙරළ",
    title: "Panadura Beach – Coastal Sunset Views",
    shortDescription:
      "A breezy coastal stretch popular for peaceful evening walks and stunning sunsets.",
    description:
      "Panadura Beach offers a relaxing seaside atmosphere, cool ocean breezes, and a wonderful setting for evening relaxation along the western coast.",
    category: "beach",
    categoryName: "Beach & Leisure",
    province: "Western Province",
    district: "Kalutara",
    location: "Panadura, Sri Lanka",
    coordinates: [6.7133, 79.9042],
    image: "images/destinations/kalutara/panadura-beach-main.jpg",
    gallery: [
      "images/destinations/kalutara/panadura-01.jpg",
      "images/destinations/kalutara/panadura-02.jpg",
      "images/destinations/kalutara/panadura-03.jpg",
      "images/destinations/kalutara/panadura-04.jpg",
    ],
    featured: false,
    rating: 4.2,
    bestTime: "January to March",
    page: "destinations/panadura-beach.html",
  },
  {
    id: "kalutara-bodhiya",
    name: "Kalutara Bodhiya",
    sinhalaName: "කළුතර බෝධීන් වහන්සේ",
    title: "Kalutara Bodhiya – Sacred Buddhist Site",
    shortDescription:
      "A globally renowned sacred Buddhist temple situated next to the banks of Kalu Ganga.",
    description:
      "Kalutara Bodhiya is an iconic spiritual landmark featuring a magnificent stupa and sacred fig tree, attracting thousands of pilgrims and travelers daily.",
    category: "culture",
    categoryName: "Culture & Heritage",
    province: "Western Province",
    district: "Kalutara",
    location: "Kalutara, Sri Lanka",
    coordinates: [6.5856, 79.9614],
    image: "images/destinations/kalutara/kalutara-bodhiya-main.jpg",
    gallery: [
      "images/destinations/kalutara/bodhiya-01.jpg",
      "images/destinations/kalutara/bodhiya-02.jpg",
      "images/destinations/kalutara/bodhiya-03.jpg",
      "images/destinations/kalutara/bodhiya-04.jpg",
    ],
    featured: true,
    rating: 4.8,
    bestTime: "All year round",
    page: "destinations/kalutara-bodhiya.html",
  },
  {
    id: "pelawatte-reservoir",
    name: "Pelawatte Reservoir",
    sinhalaName: "පැලවත්ත වැව",
    title: "Pelawatte Reservoir – Tranquil Waters",
    shortDescription:
      "A serene reservoir surrounded by lush green hills and peaceful countryside.",
    description:
      "Pelawatte Reservoir provides a calm and scenic environment away from busy towns, ideal for nature lovers seeking quiet landscapes.",
    category: "nature",
    categoryName: "Nature & Adventure",
    province: "Western Province",
    district: "Kalutara",
    location: "Pelawatte, Sri Lanka",
    coordinates: [6.435, 80.3],
    image: "images/destinations/kalutara/pelawatte-main.jpg",
    gallery: [
      "images/destinations/kalutara/pelawatte-01.jpg",
      "images/destinations/kalutara/pelawatte-02.jpg",
      "images/destinations/kalutara/pelawatte-03.jpg",
      "images/destinations/kalutara/pelawatte-04.jpg",
    ],
    featured: false,
    rating: 4.4,
    bestTime: "Throughout the year",
    page: "destinations/pelawatte-reservoir.html",
  },
  {
    id: "pinnakanda-center",
    name: "Pinnakanda Tourism Center",
    sinhalaName: "පින්නකන්ද සංචාරක මධ්‍යස්ථානය",
    title: "Pinnakanda – Rural Eco Experience",
    shortDescription:
      "A community tourism center showcasing local village life and natural surroundings in Mathugama.",
    description:
      "Pinnakanda gives visitors an authentic taste of rural Sri Lankan lifestyle, traditional crafts, and rich local biodiversity.",
    category: "culture",
    categoryName: "Culture & Eco Tourism",
    province: "Western Province",
    district: "Kalutara",
    location: "Mathugama, Sri Lanka",
    coordinates: [6.52, 80.13],
    image: "images/destinations/kalutara/pinnakanda-main.jpg",
    gallery: [
      "images/destinations/kalutara/pinnakanda-01.jpg",
      "images/destinations/kalutara/pinnakanda-02.jpg",
      "images/destinations/kalutara/pinnakanda-03.jpg",
      "images/destinations/kalutara/pinnakanda-04.jpg",
    ],
    featured: false,
    rating: 4.3,
    bestTime: "January to May",
    page: "destinations/pinnakanda.html",
  },
  {
    id: "agalawatta-streams",
    name: "Agalawatta Streams & Cascades",
    sinhalaName: "අගලවත්ත දොළ සහ ඇලි",
    title: "Agalawatta Streams – Rainforest Rivulets",
    shortDescription:
      "A network of crystal-clear streams and minor cascades flowing through Agalawatta greenery.",
    description:
      "Agalawatta streams offer refreshing, cool water currents originating from interior rainforest patches, ideal for tranquil nature explorations.",
    category: "nature",
    categoryName: "Nature & Adventure",
    province: "Western Province",
    district: "Kalutara",
    location: "Agalawatta, Sri Lanka",
    coordinates: [6.5333, 80.1667],
    image: "images/destinations/kalutara/agalawatta-main.jpg",
    gallery: [
      "images/destinations/kalutara/agalawatta-01.jpg",
      "images/destinations/kalutara/agalawatta-02.jpg",
      "images/destinations/kalutara/agalawatta-03.jpg",
      "images/destinations/kalutara/agalawatta-04.jpg",
    ],
    featured: false,
    rating: 4.5,
    bestTime: "November to April",
    page: "destinations/agalawatta-streams.html",
  },
  {
    id: "baduraliya-waterfalls",
    name: "Baduraliya Waterfalls",
    sinhalaName: "බදුරელიගම ස්වභාවික දිය ඇලි",
    title: "Baduraliya Waterfalls – Sinharajah Border Streams",
    shortDescription:
      "Pristine waterfalls and natural rock pools located near the borders of the Sinharaja rainforest.",
    description:
      "Baduraliya features cold, crystal-clear natural water streams flowing out of dense rainforest reserves, perfect for adventurous explorers.",
    category: "nature",
    categoryName: "Nature & Adventure",
    province: "Western Province",
    district: "Kalutara",
    location: "Baduraliya, Sri Lanka",
    coordinates: [6.5, 80.2667],
    image: "images/destinations/kalutara/baduraliya-main.jpg",
    gallery: [
      "images/destinations/kalutara/baduraliya-01.jpg",
      "images/destinations/kalutara/baduraliya-02.jpg",
      "images/destinations/kalutara/baduraliya-03.jpg",
      "images/destinations/kalutara/baduraliya-04.jpg",
    ],
    featured: true,
    rating: 4.7,
    bestTime: "December to March",
    page: "destinations/baduraliya-waterfalls.html",
  },
  {
    id: "wadduwa-beach",
    name: "Wadduwa Beach",
    sinhalaName: "වාද්දුව වෙරළ තීරය",
    title: "Wadduwa Beach – Resort Coastline",
    shortDescription:
      "A charming tropical beach lined with prestigious resort hotels and golden sands.",
    description:
      "Wadduwa Beach is famous among international and local holidaymakers for luxury beachfront properties, palm-fringed views, and peaceful vibes.",
    category: "beach",
    categoryName: "Beach & Leisure",
    province: "Western Province",
    district: "Kalutara",
    location: "Wadduwa, Sri Lanka",
    coordinates: [6.7, 79.9167],
    image: "images/destinations/kalutara/wadduwa-main.jpg",
    gallery: [
      "images/destinations/kalutara/wadduwa-01.jpg",
      "images/destinations/kalutara/wadduwa-02.jpg",
      "images/destinations/kalutara/wadduwa-03.jpg",
      "images/destinations/kalutara/wadduwa-04.jpg",
    ],
    featured: true,
    rating: 4.6,
    bestTime: "January to April",
    page: "destinations/wadduwa-beach.html",
  },
  {
    id: "kudagankanda",
    name: "Kudagankanda",
    sinhalaName: "කුඩාගංකන්ද",
    title: "Kudagankanda – Hiking & Panoramic Views",
    shortDescription:
      "A prominent hillock popular among trekking enthusiasts and nature viewpoint seekers.",
    description:
      "Kudagankanda offers an exciting short hiking trail through regional vegetation, rewarding climbers with panoramic views of the surrounding countryside.",
    category: "adventure",
    categoryName: "Hiking & Adventure",
    province: "Western Province",
    district: "Kalutara",
    location: "Kalutara District, Sri Lanka",
    coordinates: [6.55, 80.1167],
    image: "images/destinations/kalutara/kudagankanda-main.jpg",
    gallery: [
      "images/destinations/kalutara/kudagankanda-01.jpg",
      "images/destinations/kalutara/kudagankanda-02.jpg",
      "images/destinations/kalutara/kudagankanda-03.jpg",
      "images/destinations/kalutara/kudagankanda-04.jpg",
    ],
    featured: false,
    rating: 4.4,
    bestTime: "January to March",
    page: "destinations/kudagankanda.html",
  },
  {
    id: "sri-mahha-bodhiya",
    name: "Sri Maha Bodhiya",
    sinhalaName: "ජය ශ්‍රී මහා බෝධීන් වහන්සේ",
    title: "Sri Maha Bodhiya – The Sacred Fig Tree",
    shortDescription:
      "The oldest historically authenticated tree in the world, brought from sacred Bodhgaya.",
    description:
      "Sri Maha Bodhiya is the most sacred site in Anuradhapura, planted from a cutting of the southern branch of the original Sri Maha Bodhi tree in India under which Gautama Buddha attained enlightenment.",
    category: "culture",
    categoryName: "Culture & Heritage",
    province: "North Central Province",
    district: "Anuradhapura",
    location: "Anuradhapura, Sri Lanka",
    coordinates: [8.3445, 80.3956],
    image: "images/destinations/atamasthana/sri-maha-bodhiya-main.jpg",
    gallery: [
      "images/destinations/atamasthana/bodhi-01.jpg",
      "images/destinations/atamasthana/bodhi-02.jpg",
      "images/destinations/atamasthana/bodhi-03.jpg",
      "images/destinations/atamasthana/bodhi-04.jpg",
    ],
    featured: true,
    rating: 4.9,
    bestTime: "All year round",
    page: "destinations/sri-maha-bodhiya.html",
  },
  {
    id: "ruwanweli-maha-seya",
    name: "Ruwanweli Maha Seya",
    sinhalaName: "රුවන්වැලි මහා සෑය",
    title: "Ruwanweli Maha Seya – The Great Stupa",
    shortDescription:
      "An architectural marvel and one of the world's tallest ancient stupas built by King Dutugemunu.",
    description:
      "Ruwanweli Maha Seya is revered for its magnificent architecture and deep religious significance, holding a vast collection of the Buddha's relics.",
    category: "culture",
    categoryName: "Culture & Heritage",
    province: "North Central Province",
    district: "Anuradhapura",
    location: "Anuradhapura, Sri Lanka",
    coordinates: [8.3514, 80.3967],
    image: "images/destinations/atamasthana/ruwanweli-seya-main.jpg",
    gallery: [
      "images/destinations/atamasthana/ruwanweli-01.jpg",
      "images/destinations/atamasthana/ruwanweli-02.jpg",
      "images/destinations/atamasthana/ruwanweli-03.jpg",
      "images/destinations/atamasthana/ruwanweli-04.jpg",
    ],
    featured: true,
    rating: 4.9,
    bestTime: "All year round",
    page: "destinations/ruwanweli-maha-seya.html",
  },
  {
    id: "thuparamaya",
    name: "Thuparamaya",
    sinhalaName: "ථූපාරාමය",
    title: "Thuparamaya – The First Stupa in Sri Lanka",
    shortDescription:
      "The historical first dagoba built in Sri Lanka following the introduction of Buddhism.",
    description:
      "Thuparamaya was constructed by King Devanampiya Tissa to enshrine the right collarbone of the Buddha, featuring a unique vatadage architectural design.",
    category: "culture",
    categoryName: "Culture & Heritage",
    province: "North Central Province",
    district: "Anuradhapura",
    location: "Anuradhapura, Sri Lanka",
    coordinates: [8.3586, 80.3956],
    image: "images/destinations/atamasthana/thuparamaya-main.jpg",
    gallery: [
      "images/destinations/atamasthana/thupara-01.jpg",
      "images/destinations/atamasthana/thupara-02.jpg",
      "images/destinations/atamasthana/thupara-03.jpg",
      "images/destinations/atamasthana/thupara-04.jpg",
    ],
    featured: false,
    rating: 4.7,
    bestTime: "All year round",
    page: "destinations/thuparamaya.html",
  },
  {
    id: "loowahapaya",
    name: "Lovamahapaya",
    sinhalaName: "ලෝවාමਹਾපාය (ලෝහ ප්‍රාසාදය)",
    title: "Lovamahapaya – The Brazen Palace",
    shortDescription:
      "Historically known as the magnificent nine-story brazen palace for Buddhist monks.",
    description:
      "Lovamahapaya, originally constructed by King Dutugemunu with a brazen roof, today stands as an iconic field of stone pillars echoing ancient splendor.",
    category: "culture",
    categoryName: "Culture & Heritage",
    province: "North Central Province",
    district: "Anuradhapura",
    location: "Anuradhapura, Sri Lanka",
    coordinates: [8.3468, 80.3953],
    image: "images/destinations/atamasthana/lovamahapaya-main.jpg",
    gallery: [
      "images/destinations/atamasthana/loha-01.jpg",
      "images/destinations/atamasthana/loha-02.jpg",
      "images/destinations/atamasthana/loha-03.jpg",
      "images/destinations/atamasthana/loha-04.jpg",
    ],
    featured: false,
    rating: 4.6,
    bestTime: "All year round",
    page: "destinations/lovamahapaya.html",
  },
  {
    id: "abhayagiriya",
    name: "Abhayagiri Dagoba",
    sinhalaName: "අභයගිරි විහාරය",
    title: "Abhayagiri Dagoba – Ancient Monastic Complex",
    shortDescription:
      "One of the world's most extensive monastic ruins and a major ancient center of Buddhism.",
    description:
      "Abhayagiri Monastery was a vibrant international learning center holding thousands of monks, featuring a massive stupa and exquisite stone carvings like the Moonstone.",
    category: "culture",
    categoryName: "Culture & Heritage",
    province: "North Central Province",
    district: "Anuradhapura",
    location: "Anuradhapura, Sri Lanka",
    coordinates: [8.3653, 80.395],
    image: "images/destinations/atamasthana/abhayagiriya-main.jpg",
    gallery: [
      "images/destinations/atamasthana/abhaya-01.jpg",
      "images/destinations/atamasthana/abhaya-02.jpg",
      "images/destinations/atamasthana/abhaya-03.jpg",
      "images/destinations/atamasthana/abhaya-04.jpg",
    ],
    featured: true,
    rating: 4.8,
    bestTime: "All year round",
    page: "destinations/abhayagiriya.html",
  },
  {
    id: "jetavanaramaya",
    name: "Jetavanaramaya",
    sinhalaName: "ජෙතවනාරාමය",
    title: "Jetavanaramaya – Monumental Ancient Brick Stupa",
    shortDescription:
      "Once one of the tallest structures in the ancient world, built by King Mahasena.",
    description:
      "Jetavanaramaya is an architectural masterpiece of the ancient world, known for containing an immense volume of bricks and standing as a testament to ancient engineering.",
    category: "culture",
    categoryName: "Culture & Heritage",
    province: "North Central Province",
    district: "Anuradhapura",
    location: "Anuradhapura, Sri Lanka",
    coordinates: [8.3542, 80.4022],
    image: "images/destinations/atamasthana/jetavanaramaya-main.jpg",
    gallery: [
      "images/destinations/atamasthana/jetavana-01.jpg",
      "images/destinations/atamasthana/jetavana-02.jpg",
      "images/destinations/atamasthana/jetavana-03.jpg",
      "images/destinations/atamasthana/jetavana-04.jpg",
    ],
    featured: true,
    rating: 4.8,
    bestTime: "All year round",
    page: "destinations/jetavanaramaya.html",
  },
  {
    id: "mirisawetiya",
    name: "Mirisaveti Stupa",
    sinhalaName: "මිරිසවැටි ස්ථූපය",
    title: "Mirisaveti Stupa – Historical Votive Dagoba",
    shortDescription:
      "A prominent stupa built by King Dutugemunu after his victory over Elara.",
    description:
      "Mirisaveti Stupa holds deep historical significance associated with the King's sacred staff containing the Buddha's relic, set within a peaceful monastic setting.",
    category: "culture",
    categoryName: "Culture & Heritage",
    province: "North Central Province",
    district: "Anuradhapura",
    location: "Anuradhapura, Sri Lanka",
    coordinates: [8.3364, 80.3922],
    image: "images/destinations/atamasthana/mirisawetiya-main.jpg",
    gallery: [
      "images/destinations/atamasthana/mirisa-01.jpg",
      "images/destinations/atamasthana/mirisa-02.jpg",
      "images/destinations/atamasthana/mirisa-03.jpg",
      "images/destinations/atamasthana/mirisa-04.jpg",
    ],
    featured: false,
    rating: 4.7,
    bestTime: "All year round",
    page: "destinations/mirisawetiya.html",
  },
  {
    id: "lankaramaya",
    name: "Lankarama",
    sinhalaName: "ලංකාරාමය",
    title: "Lankarama – Ancient Monastic Stupa",
    shortDescription:
      "An ancient stupa built by King Valagamba in the Kalavenna area of Anuradhapura.",
    description:
      "Lankarama is a serene and charming dagoba encircled by monolithic stone pillars, offering a peaceful atmosphere for reflection and devotion.",
    category: "culture",
    categoryName: "Culture & Heritage",
    province: "North Central Province",
    district: "Anuradhapura",
    location: "Anuradhapura, Sri Lanka",
    coordinates: [8.3689, 80.3875],
    image: "images/destinations/atamasthana/lankaramaya-main.jpg",
    gallery: [
      "images/destinations/atamasthana/lankara-01.jpg",
      "images/destinations/atamasthana/lankara-02.jpg",
      "images/destinations/atamasthana/lankara-03.jpg",
      "images/destinations/atamasthana/lankara-04.jpg",
    ],
    featured: false,
    rating: 4.6,
    bestTime: "All year round",
    page: "destinations/lankaramaya.html",
  },
];



