/* ============================================================
   LANKAQUEST
   SRI LANKA TOURISM DATABASE

   MAIN DESTINATION DATABASE

   USED BY:

   🗺️ Interactive Map
   🔍 Search
   🏛️ Category Filter
   ⭐ Ratings
   🌟 Featured Places
   📸 Gallery
   🧳 Trip Planner
   📄 Attraction Generator

   IMPORTANT:

   Individual HTML page paths are NOT stored here.

   generate-attractions.js automatically creates:

   attractions-generated/
       province/
           district/
               place-id.html

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

    image:
      "images/destinations/sigiriya/sigiriya-main.jpg",

    gallery: [
      "images/destinations/sigiriya/sigiriya-01.jpg",
      "images/destinations/sigiriya/sigiriya-02.jpg",
      "images/destinations/sigiriya/sigiriya-03.jpg",
      "images/destinations/sigiriya/sigiriya-04.jpg",
    ],

    featured: true,

    rating: 4.9,

    bestTime: "January to April",
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

    image:
      "images/destinations/kandy/kandy-main.jpg",

    gallery: [
      "images/destinations/kandy/kandy-01.jpg",
      "images/destinations/kandy/kandy-02.jpg",
      "images/destinations/kandy/kandy-03.jpg",
      "images/destinations/kandy/kandy-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "December to April",
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

    image:
      "images/destinations/ella/ella-main.jpg",

    gallery: [
      "images/destinations/ella/ella-01.jpg",
      "images/destinations/ella/ella-02.jpg",
      "images/destinations/ella/ella-03.jpg",
      "images/destinations/ella/ella-04.jpg",
    ],

    featured: true,

    rating: 4.9,

    bestTime: "January to March",
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

    image:
      "images/destinations/galle-fort/galle-fort-main.jpg",

    gallery: [
      "images/destinations/galle-fort/galle-fort-01.jpg",
      "images/destinations/galle-fort/galle-fort-02.jpg",
      "images/destinations/galle-fort/galle-fort-03.jpg",
      "images/destinations/galle-fort/galle-fort-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "December to April",
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

    image:
      "images/destinations/yala/yala-main.jpg",

    gallery: [
      "images/destinations/yala/yala-01.jpg",
      "images/destinations/yala/yala-02.jpg",
      "images/destinations/yala/yala-03.jpg",
      "images/destinations/yala/yala-04.jpg",
    ],

    featured: true,

    rating: 4.7,

    bestTime: "February to June",
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

    image:
      "images/destinations/anuradhapura/anuradhapura-main.jpg",

    gallery: [
      "images/destinations/anuradhapura/anuradhapura-01.jpg",
      "images/destinations/anuradhapura/anuradhapura-02.jpg",
      "images/destinations/anuradhapura/anuradhapura-03.jpg",
      "images/destinations/anuradhapura/anuradhapura-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "May to September",
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

    image:
      "images/destinations/polonnaruwa/polonnaruwa-main.jpg",

    gallery: [
      "images/destinations/polonnaruwa/polonnaruwa-01.jpg",
      "images/destinations/polonnaruwa/polonnaruwa-02.jpg",
      "images/destinations/polonnaruwa/polonnaruwa-03.jpg",
      "images/destinations/polonnaruwa/polonnaruwa-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "May to September",
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

    image:
      "images/destinations/nuwara-eliya/nuwara-eliya-main.jpg",

    gallery: [
      "images/destinations/nuwara-eliya/nuwara-eliya-01.jpg",
      "images/destinations/nuwara-eliya/nuwara-eliya-02.jpg",
      "images/destinations/nuwara-eliya/nuwara-eliya-03.jpg",
      "images/destinations/nuwara-eliya/nuwara-eliya-04.jpg",
    ],

    featured: true,

    rating: 4.7,

    bestTime: "January to April",
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

    image:
      "images/destinations/mirissa/mirissa-main.jpg",

    gallery: [
      "images/destinations/mirissa/mirissa-01.jpg",
      "images/destinations/mirissa/mirissa-02.jpg",
      "images/destinations/mirissa/mirissa-03.jpg",
      "images/destinations/mirissa/mirissa-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "December to April",
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

    image:
      "images/destinations/unawatuna/unawatuna-main.jpg",

    gallery: [
      "images/destinations/unawatuna/unawatuna-01.jpg",
      "images/destinations/unawatuna/unawatuna-02.jpg",
      "images/destinations/unawatuna/unawatuna-03.jpg",
      "images/destinations/unawatuna/unawatuna-04.jpg",
    ],

    featured: false,

    rating: 4.7,

    bestTime: "December to April",
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

    image:
      "images/destinations/bentota/bentota-main.jpg",

    gallery: [
      "images/destinations/bentota/bentota-01.jpg",
      "images/destinations/bentota/bentota-02.jpg",
      "images/destinations/bentota/bentota-03.jpg",
      "images/destinations/bentota/bentota-04.jpg",
    ],

    featured: false,

    rating: 4.6,

    bestTime: "November to April",
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

    image:
      "images/destinations/arugam-bay/arugam-bay-main.jpg",

    gallery: [
      "images/destinations/arugam-bay/arugam-bay-01.jpg",
      "images/destinations/arugam-bay/arugam-bay-02.jpg",
      "images/destinations/arugam-bay/arugam-bay-03.jpg",
      "images/destinations/arugam-bay/arugam-bay-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "May to September",
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
  },


  /* ========================================================
       21. KNUCKLES MOUNTAIN RANGE
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
      "A beautiful east coast beach famous for its calm, shallow and crystal-clear waters.",

    description:
      "Pasikudah is one of Sri Lanka's most beautiful beaches, known for its long shallow bay and clear turquoise waters.",

    category: "beach",

    categoryName: "Beaches & Coast",

    province: "Eastern Province",

    district: "Batticaloa",

    location: "Pasikudah, Sri Lanka",

    coordinates: [7.9219, 81.5594],

    image: "images/destinations/pasikudah/pasikudah-main.jpg",

    gallery: [
      "images/destinations/pasikudah/pasikudah-01.jpg",
      "images/destinations/pasikudah/pasikudah-02.jpg",
      "images/destinations/pasikudah/pasikudah-03.jpg",
      "images/destinations/pasikudah/pasikudah-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "May to September",
  },


  /* ========================================================
       26. JAFFNA
  ======================================================== */

  {
    id: "jaffna",

    name: "Jaffna",

    sinhalaName: "යාපනය",

    title: "Jaffna – Northern Cultural Capital",

    shortDescription:
      "A culturally rich northern destination famous for temples, history and unique Tamil heritage.",

    description:
      "Jaffna offers a unique cultural experience with historic forts, Hindu temples, traditional cuisine and beautiful northern landscapes.",

    category: "culture",

    categoryName: "Culture & Heritage",

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

    featured: false,

    rating: 4.6,

    bestTime: "January to September",
  },


  /* ========================================================
       27. NEGOMBO
  ======================================================== */

  {
    id: "negombo",

    name: "Negombo",

    sinhalaName: "මීගමුව",

    title: "Negombo Beach",

    shortDescription:
      "A lively coastal destination near Colombo and Bandaranaike International Airport.",

    description:
      "Negombo is famous for its long sandy beaches, fishing culture, seafood and convenient location near the international airport.",

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
      "A coastal destination famous for kite surfing, dolphins and marine adventures.",

    description:
      "Kalpitiya is an exciting coastal destination offering kite surfing, dolphin watching, snorkeling and other marine experiences.",

    category: "adventure",

    categoryName: "Adventure & Experiences",

    province: "North Western Province",

    district: "Puttalam",

    location: "Kalpitiya, Sri Lanka",

    coordinates: [8.237, 79.7598],

    image: "images/destinations/kalpitiya/kalpitiya-main.jpg",

    gallery: [
      "images/destinations/kalpitiya/kalpitiya-01.jpg",
      "images/destinations/kalpitiya/kalpitiya-02.jpg",
      "images/destinations/kalpitiya/kalpitiya-03.jpg",
      "images/destinations/kalpitiya/kalpitiya-04.jpg",
    ],

    featured: false,

    rating: 4.6,

    bestTime: "May to October",
  },


  /* ========================================================
       29. PIDURANGALA ROCK
  ======================================================== */

  {
    id: "pidurangala",

    name: "Pidurangala Rock",

    sinhalaName: "පිදුරංගල ගල",

    title: "Pidurangala Rock",

    shortDescription:
      "A spectacular rock viewpoint offering panoramic views of Sigiriya and the surrounding landscape.",

    description:
      "Pidurangala Rock is a popular hiking destination located near Sigiriya, offering one of the best sunrise and sunset views in the area.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Central Province",

    district: "Matale",

    location: "Sigiriya, Sri Lanka",

    coordinates: [7.9708, 80.7597],

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
  },


  /* ========================================================
       30. COLOMBO
  ======================================================== */

  {
    id: "colombo",

    name: "Colombo",

    sinhalaName: "කොළඹ",

    title: "Colombo – Sri Lanka's Commercial Capital",

    shortDescription:
      "A vibrant city combining modern attractions, colonial heritage, shopping and coastal experiences.",

    description:
      "Colombo is Sri Lanka's largest city, offering cultural landmarks, museums, shopping districts, restaurants and a lively waterfront.",

    category: "city",

    categoryName: "Cities & Urban",

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

    bestTime: "January to March",
  },


  /* ========================================================
       31. THAMBA DOLA
  ======================================================== */

  {
    id: "thamba-dola",

    name: "Thamba Dola",

    sinhalaName: "තඹ දොළ",

    title: "Thamba Dola",

    shortDescription:
      "A peaceful natural attraction surrounded by the scenic landscapes of Kalutara.",

    description:
      "Thamba Dola is a lesser-known natural attraction in the Kalutara area, offering a peaceful environment away from busy tourist locations.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Western Province",

    district: "Kalutara",

    location: "Kalutara, Sri Lanka",

    coordinates: [6.5854, 80.1185],

    image: "images/destinations/thamba-dola/thamba-dola-main.jpg",

    gallery: [
      "images/destinations/thamba-dola/thamba-dola-01.jpg",
      "images/destinations/thamba-dola/thamba-dola-02.jpg",
      "images/destinations/thamba-dola/thamba-dola-03.jpg",
      "images/destinations/thamba-dola/thamba-dola-04.jpg",
    ],

    featured: false,

    rating: 4.3,

    bestTime: "November to April",
  },


  /* ========================================================
       32. KALU GANGA
  ======================================================== */

  {
    id: "kalu-ganga",

    name: "Kalu Ganga",

    sinhalaName: "කළු ගඟ",

    title: "Kalu Ganga",

    shortDescription:
      "A scenic river flowing through the lush landscapes of Sri Lanka's western region.",

    description:
      "Kalu Ganga is an important river in Sri Lanka, flowing through scenic landscapes and communities before reaching the sea at Kalutara.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Western Province",

    district: "Kalutara",

    location: "Kalutara, Sri Lanka",

    coordinates: [6.583, 79.96],

    image: "images/destinations/kalu-ganga/kalu-ganga-main.jpg",

    gallery: [
      "images/destinations/kalu-ganga/kalu-ganga-01.jpg",
      "images/destinations/kalu-ganga/kalu-ganga-02.jpg",
      "images/destinations/kalu-ganga/kalu-ganga-03.jpg",
      "images/destinations/kalu-ganga/kalu-ganga-04.jpg",
    ],

    featured: false,

    rating: 4.4,

    bestTime: "November to April",
  },


  /* ========================================================
       33. PANADURA BEACH
  ======================================================== */

  {
    id: "panadura-beach",

    name: "Panadura Beach",

    sinhalaName: "පානදුර වෙරළ",

    title: "Panadura Beach",

    shortDescription:
      "A relaxing coastal destination close to Colombo with a beautiful sandy shoreline.",

    description:
      "Panadura Beach is a popular local coastal destination offering sunsets, sea views and a relaxed atmosphere.",

    category: "beach",

    categoryName: "Beaches & Coast",

    province: "Western Province",

    district: "Kalutara",

    location: "Panadura, Sri Lanka",

    coordinates: [6.7132, 79.9042],

    image: "images/destinations/panadura-beach/panadura-beach-main.jpg",

    gallery: [
      "images/destinations/panadura-beach/panadura-beach-01.jpg",
      "images/destinations/panadura-beach/panadura-beach-02.jpg",
      "images/destinations/panadura-beach/panadura-beach-03.jpg",
      "images/destinations/panadura-beach/panadura-beach-04.jpg",
    ],

    featured: false,

    rating: 4.3,

    bestTime: "November to April",
  },


  /* ========================================================
       34. KALUTARA BODHIYA
  ======================================================== */

  {
    id: "kalutara-bodhiya",

    name: "Kalutara Bodhiya",

    sinhalaName: "කළුතර බෝධිය",

    title: "Kalutara Bodhiya",

    shortDescription:
      "One of Sri Lanka's most important Buddhist religious sites located beside the Kalu River.",

    description:
      "Kalutara Bodhiya is a famous Buddhist shrine and sacred Bodhi tree located in the heart of Kalutara.",

    category: "culture",

    categoryName: "Culture & Religion",

    province: "Western Province",

    district: "Kalutara",

    location: "Kalutara, Sri Lanka",

    coordinates: [6.5856, 79.9605],

    image: "images/destinations/kalutara-bodhiya/kalutara-bodhiya-main.jpg",

    gallery: [
      "images/destinations/kalutara-bodhiya/kalutara-bodhiya-01.jpg",
      "images/destinations/kalutara-bodhiya/kalutara-bodhiya-02.jpg",
      "images/destinations/kalutara-bodhiya/kalutara-bodhiya-03.jpg",
      "images/destinations/kalutara-bodhiya/kalutara-bodhiya-04.jpg",
    ],

    featured: true,

    rating: 4.7,

    bestTime: "January to December",
  },


  /* ========================================================
       35. PELAWATTE RESERVOIR
  ======================================================== */

  {
    id: "pelawatte-reservoir",

    name: "Pelawatte Reservoir",

    sinhalaName: "පැලවත්ත ජලාශය",

    title: "Pelawatte Reservoir",

    shortDescription:
      "A peaceful reservoir surrounded by greenery and scenic countryside in Kalutara.",

    description:
      "Pelawatte Reservoir offers a calm natural environment with scenic water views and surrounding countryside.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Western Province",

    district: "Kalutara",

    location: "Pelawatte, Sri Lanka",

    coordinates: [6.493, 80.120],

    image: "images/destinations/pelawatte-reservoir/pelawatte-reservoir-main.jpg",

    gallery: [
      "images/destinations/pelawatte-reservoir/pelawatte-reservoir-01.jpg",
      "images/destinations/pelawatte-reservoir/pelawatte-reservoir-02.jpg",
      "images/destinations/pelawatte-reservoir/pelawatte-reservoir-03.jpg",
      "images/destinations/pelawatte-reservoir/pelawatte-reservoir-04.jpg",
    ],

    featured: false,

    rating: 4.2,

    bestTime: "November to April",
  },


  /* ========================================================
       36. PINNAKANDA TOURISM CENTER
  ======================================================== */

  {
    id: "pinnakanda-tourism-center",

    name: "Pinnakanda Tourism Center",

    sinhalaName: "පින්නකන්ද සංචාරක මධ්‍යස්ථානය",

    title: "Pinnakanda Tourism Center",

    shortDescription:
      "A local tourism destination offering visitors a chance to explore the natural beauty of Kalutara.",

    description:
      "Pinnakanda Tourism Center is a developing local attraction providing opportunities to experience the natural environment and rural landscapes of the region.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Western Province",

    district: "Kalutara",

    location: "Kalutara, Sri Lanka",

    coordinates: [6.5000, 80.1000],

    image: "images/destinations/pinnakanda-tourism-center/pinnakanda-tourism-center-main.jpg",

    gallery: [
      "images/destinations/pinnakanda-tourism-center/pinnakanda-tourism-center-01.jpg",
      "images/destinations/pinnakanda-tourism-center/pinnakanda-tourism-center-02.jpg",
      "images/destinations/pinnakanda-tourism-center/pinnakanda-tourism-center-03.jpg",
      "images/destinations/pinnakanda-tourism-center/pinnakanda-tourism-center-04.jpg",
    ],

    featured: false,

    rating: 4.2,

    bestTime: "November to April",
  },
 
  /* ========================================================
       37. AGALAWATTA STREAMS AND CASCADES
  ======================================================== */

  {
    id: "agalawatta-streams-and-cascades",

    name: "Agalawatta Streams and Cascades",

    sinhalaName: "අගලවත්ත දොළ සහ දිය ඇලි",

    title: "Agalawatta Streams and Cascades",

    shortDescription:
      "A peaceful natural attraction featuring streams, cascades and lush greenery in Kalutara.",

    description:
      "Agalawatta is surrounded by streams, small cascades and beautiful green landscapes, making it a relaxing destination for nature lovers.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Western Province",

    district: "Kalutara",

    location: "Agalawatta, Kalutara, Sri Lanka",

    coordinates: [6.5320, 80.2200],

    image:
      "images/destinations/agalawatta-streams-and-cascades/agalawatta-streams-and-cascades-main.jpg",

    gallery: [
      "images/destinations/agalawatta-streams-and-cascades/agalawatta-streams-and-cascades-01.jpg",
      "images/destinations/agalawatta-streams-and-cascades/agalawatta-streams-and-cascades-02.jpg",
      "images/destinations/agalawatta-streams-and-cascades/agalawatta-streams-and-cascades-03.jpg",
      "images/destinations/agalawatta-streams-and-cascades/agalawatta-streams-and-cascades-04.jpg",
    ],

    featured: false,

    rating: 4.2,

    bestTime: "November to April",
  },


  /* ========================================================
       38. BADURALIYA WATERFALLS
  ======================================================== */

  {
    id: "baduraliya-waterfalls",

    name: "Baduraliya Waterfalls",

    sinhalaName: "බදුරලිය දිය ඇලි",

    title: "Baduraliya Waterfalls",

    shortDescription:
      "A scenic waterfall destination surrounded by the lush forests and hills of Kalutara.",

    description:
      "Baduraliya and its surrounding countryside offer beautiful streams, waterfalls and forest landscapes that are ideal for nature exploration.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Western Province",

    district: "Kalutara",

    location: "Baduraliya, Kalutara, Sri Lanka",

    coordinates: [6.5040, 80.2380],

    image:
      "images/destinations/baduraliya-waterfalls/baduraliya-waterfalls-main.jpg",

    gallery: [
      "images/destinations/baduraliya-waterfalls/baduraliya-waterfalls-01.jpg",
      "images/destinations/baduraliya-waterfalls/baduraliya-waterfalls-02.jpg",
      "images/destinations/baduraliya-waterfalls/baduraliya-waterfalls-03.jpg",
      "images/destinations/baduraliya-waterfalls/baduraliya-waterfalls-04.jpg",
    ],

    featured: false,

    rating: 4.3,

    bestTime: "November to April",
  },


  /* ========================================================
       39. WADDUWA BEACH
  ======================================================== */

  {
    id: "wadduwa-beach",

    name: "Wadduwa Beach",

    sinhalaName: "වාද්දුව වෙරළ",

    title: "Wadduwa Beach",

    shortDescription:
      "A peaceful golden beach on Sri Lanka's western coast, popular for relaxation and sunsets.",

    description:
      "Wadduwa Beach is a scenic coastal destination south of Colombo with sandy shores, palm trees and beautiful ocean views.",

    category: "beach",

    categoryName: "Beaches & Coast",

    province: "Western Province",

    district: "Kalutara",

    location: "Wadduwa, Kalutara, Sri Lanka",

    coordinates: [6.6240, 79.9290],

    image:
      "images/destinations/wadduwa-beach/wadduwa-beach-main.jpg",

    gallery: [
      "images/destinations/wadduwa-beach/wadduwa-beach-01.jpg",
      "images/destinations/wadduwa-beach/wadduwa-beach-02.jpg",
      "images/destinations/wadduwa-beach/wadduwa-beach-03.jpg",
      "images/destinations/wadduwa-beach/wadduwa-beach-04.jpg",
    ],

    featured: false,

    rating: 4.4,

    bestTime: "November to April",
  },


  /* ========================================================
       40. KUDAGANKANDA
  ======================================================== */

  {
    id: "kudagankanda",

    name: "Kudagankanda",

    sinhalaName: "කුඩාගන්කන්ද",

    title: "Kudagankanda",

    shortDescription:
      "A scenic rural destination surrounded by greenery and peaceful landscapes in Kalutara.",

    description:
      "Kudagankanda offers visitors a quieter experience of Sri Lanka's countryside, with green landscapes and natural surroundings.",

    category: "nature",

    categoryName: "Nature & Mountains",

    province: "Western Province",

    district: "Kalutara",

    location: "Kalutara, Sri Lanka",

    coordinates: [6.5700, 80.1800],

    image:
      "images/destinations/kudagankanda/kudagankanda-main.jpg",

    gallery: [
      "images/destinations/kudagankanda/kudagankanda-01.jpg",
      "images/destinations/kudagankanda/kudagankanda-02.jpg",
      "images/destinations/kudagankanda/kudagankanda-03.jpg",
      "images/destinations/kudagankanda/kudagankanda-04.jpg",
    ],

    featured: false,

    rating: 4.1,

    bestTime: "November to April",
  },


  /* ========================================================
       41. SRI MAHA BODHIYA
  ======================================================== */

  {
    id: "sri-maha-bodhiya",

    name: "Sri Maha Bodhiya",

    sinhalaName: "ශ්‍රී මහා බෝධිය",

    title: "Sri Maha Bodhiya",

    shortDescription:
      "One of the world's most sacred Buddhist trees and an important pilgrimage destination in Anuradhapura.",

    description:
      "Sri Maha Bodhiya is one of Sri Lanka's most revered Buddhist sites. The sacred Bodhi tree is believed to have grown from a sapling brought from the original Bodhi tree in India.",

    category: "religious",

    categoryName: "Culture & Religion",

    province: "North Central Province",

    district: "Anuradhapura",

    location: "Anuradhapura, Sri Lanka",

    coordinates: [8.3431, 80.3964],

    image:
      "images/destinations/sri-maha-bodhiya/sri-maha-bodhiya-main.jpg",

    gallery: [
      "images/destinations/sri-maha-bodhiya/sri-maha-bodhiya-01.jpg",
      "images/destinations/sri-maha-bodhiya/sri-maha-bodhiya-02.jpg",
      "images/destinations/sri-maha-bodhiya/sri-maha-bodhiya-03.jpg",
      "images/destinations/sri-maha-bodhiya/sri-maha-bodhiya-04.jpg",
    ],

    featured: true,

    rating: 4.9,

    bestTime: "January to December",
  },


  /* ========================================================
       42. RUWANWELI MAHA SEYA
  ======================================================== */

  {
    id: "ruwanweli-maha-seya",

    name: "Ruwanweli Maha Seya",

    sinhalaName: "රුවන්වැලි මහා සෑය",

    title: "Ruwanweli Maha Seya",

    shortDescription:
      "A magnificent ancient stupa and one of the most sacred Buddhist monuments in Sri Lanka.",

    description:
      "Ruwanweli Maha Seya is a historic Buddhist stupa in Anuradhapura and one of the most important religious landmarks of Sri Lanka.",

    category: "religious",

    categoryName: "Culture & Religion",

    province: "North Central Province",

    district: "Anuradhapura",

    location: "Anuradhapura, Sri Lanka",

    coordinates: [8.3498, 80.3967],

    image:
      "images/destinations/ruwanweli-maha-seya/ruwanweli-maha-seya-main.jpg",

    gallery: [
      "images/destinations/ruwanweli-maha-seya/ruwanweli-maha-seya-01.jpg",
      "images/destinations/ruwanweli-maha-seya/ruwanweli-maha-seya-02.jpg",
      "images/destinations/ruwanweli-maha-seya/ruwanweli-maha-seya-03.jpg",
      "images/destinations/ruwanweli-maha-seya/ruwanweli-maha-seya-04.jpg",
    ],

    featured: true,

    rating: 4.9,

    bestTime: "January to December",
  },


  /* ========================================================
       43. THUPARAMAYA
  ======================================================== */

  {
    id: "thuparamaya",

    name: "Thuparamaya",

    sinhalaName: "ථූපාරාමය",

    title: "Thuparamaya Stupa",

    shortDescription:
      "The first stupa believed to have been built in Sri Lanka after the introduction of Buddhism.",

    description:
      "Thuparamaya is one of the oldest Buddhist monuments in Sri Lanka and an important part of the ancient sacred city of Anuradhapura.",

    category: "religious",

    categoryName: "Culture & Religion",

    province: "North Central Province",

    district: "Anuradhapura",

    location: "Anuradhapura, Sri Lanka",

    coordinates: [8.3513, 80.3966],

    image:
      "images/destinations/thuparamaya/thuparamaya-main.jpg",

    gallery: [
      "images/destinations/thuparamaya/thuparamaya-01.jpg",
      "images/destinations/thuparamaya/thuparamaya-02.jpg",
      "images/destinations/thuparamaya/thuparamaya-03.jpg",
      "images/destinations/thuparamaya/thuparamaya-04.jpg",
    ],

    featured: false,

    rating: 4.8,

    bestTime: "January to December",
  },


  /* ========================================================
       44. LOVAMAHAPAYA
  ======================================================== */

  {
    id: "lovamahapaya",

    name: "Lovamahapaya",

    sinhalaName: "ලෝවාමහාපාය",

    title: "Lovamahapaya",

    shortDescription:
      "The historic Brazen Palace of Anuradhapura, once known for its enormous multi-storey structure.",

    description:
      "Lovamahapaya was an ancient monastic building in Anuradhapura associated with the Mahavihara monastery and famous for its large number of bronze-tiled roofs.",

    category: "heritage",

    categoryName: "Heritage & History",

    province: "North Central Province",

    district: "Anuradhapura",

    location: "Anuradhapura, Sri Lanka",

    coordinates: [8.3449, 80.3970],

    image:
      "images/destinations/lovamahapaya/lovamahapaya-main.jpg",

    gallery: [
      "images/destinations/lovamahapaya/lovamahapaya-01.jpg",
      "images/destinations/lovamahapaya/lovamahapaya-02.jpg",
      "images/destinations/lovamahapaya/lovamahapaya-03.jpg",
      "images/destinations/lovamahapaya/lovamahapaya-04.jpg",
    ],

    featured: false,

    rating: 4.6,

    bestTime: "January to December",
  },


  /* ========================================================
       45. ABHAYAGIRI DAGOBA
  ======================================================== */

  {
    id: "abhayagiri-dagoba",

    name: "Abhayagiri Dagoba",

    sinhalaName: "අභයගිරි දාගැබ",

    title: "Abhayagiri Dagoba",

    shortDescription:
      "A monumental ancient stupa and one of the most important archaeological sites in Anuradhapura.",

    description:
      "Abhayagiri Dagoba was the center of a major ancient Buddhist monastery complex and remains one of the most impressive monuments of Anuradhapura.",

    category: "heritage",

    categoryName: "Heritage & History",

    province: "North Central Province",

    district: "Anuradhapura",

    location: "Anuradhapura, Sri Lanka",

    coordinates: [8.3565, 80.3966],

    image:
      "images/destinations/abhayagiri-dagoba/abhayagiri-dagoba-main.jpg",

    gallery: [
      "images/destinations/abhayagiri-dagoba/abhayagiri-dagoba-01.jpg",
      "images/destinations/abhayagiri-dagoba/abhayagiri-dagoba-02.jpg",
      "images/destinations/abhayagiri-dagoba/abhayagiri-dagoba-03.jpg",
      "images/destinations/abhayagiri-dagoba/abhayagiri-dagoba-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "January to December",
  },


  /* ========================================================
       46. JETAVANARAMAYA
  ======================================================== */

  {
    id: "jetavanaramaya",

    name: "Jetavanaramaya",

    sinhalaName: "ජේතවනාරාමය",

    title: "Jetavanaramaya",

    shortDescription:
      "A massive ancient Buddhist stupa and one of the greatest engineering achievements of ancient Sri Lanka.",

    description:
      "Jetavanaramaya is one of the largest ancient brick structures in the world and forms an important part of the sacred city of Anuradhapura.",

    category: "heritage",

    categoryName: "Heritage & History",

    province: "North Central Province",

    district: "Anuradhapura",

    location: "Anuradhapura, Sri Lanka",

    coordinates: [8.3500, 80.4037],

    image:
      "images/destinations/jetavanaramaya/jetavanaramaya-main.jpg",

    gallery: [
      "images/destinations/jetavanaramaya/jetavanaramaya-01.jpg",
      "images/destinations/jetavanaramaya/jetavanaramaya-02.jpg",
      "images/destinations/jetavanaramaya/jetavanaramaya-03.jpg",
      "images/destinations/jetavanaramaya/jetavanaramaya-04.jpg",
    ],

    featured: true,

    rating: 4.8,

    bestTime: "January to December",
  },


  /* ========================================================
       47. MIRISAVETI STUPA
  ======================================================== */

  {
    id: "mirisaveti-stupa",

    name: "Mirisaveti Stupa",

    sinhalaName: "මිරිසවැටිය සෑය",

    title: "Mirisaveti Stupa",

    shortDescription:
      "An ancient Buddhist stupa located in the sacred city of Anuradhapura.",

    description:
      "Mirisaveti Stupa is one of the historic stupas of Anuradhapura and is associated with the reign of King Dutugemunu.",

    category: "heritage",

    categoryName: "Heritage & History",

    province: "North Central Province",

    district: "Anuradhapura",

    location: "Anuradhapura, Sri Lanka",

    coordinates: [8.3408, 80.3896],

    image:
      "images/destinations/mirisaveti-stupa/mirisaveti-stupa-main.jpg",

    gallery: [
      "images/destinations/mirisaveti-stupa/mirisaveti-stupa-01.jpg",
      "images/destinations/mirisaveti-stupa/mirisaveti-stupa-02.jpg",
      "images/destinations/mirisaveti-stupa/mirisaveti-stupa-03.jpg",
      "images/destinations/mirisaveti-stupa/mirisaveti-stupa-04.jpg",
    ],

    featured: false,

    rating: 4.7,

    bestTime: "January to December",
  },


  /* ========================================================
       48. LANKARAMA
  ======================================================== */

  {
    id: "lankarama",

    name: "Lankarama",

    sinhalaName: "ලංකාරාමය",

    title: "Lankarama Stupa",

    shortDescription:
      "A peaceful ancient stupa surrounded by historic stone pillars in Anuradhapura.",

    description:
      "Lankarama is an ancient Buddhist stupa in Anuradhapura surrounded by elegant stone pillars and remnants of an important historical monastery complex.",

    category: "heritage",

    categoryName: "Heritage & History",

    province: "North Central Province",

    district: "Anuradhapura",

    location: "Anuradhapura, Sri Lanka",

    coordinates: [8.3650, 80.3975],

    image:
      "images/destinations/lankarama/lankarama-main.jpg",

    gallery: [
      "images/destinations/lankarama/lankarama-01.jpg",
      "images/destinations/lankarama/lankarama-02.jpg",
      "images/destinations/lankarama/lankarama-03.jpg",
      "images/destinations/lankarama/lankarama-04.jpg",
    ],

    featured: false,

    rating: 4.6,

    bestTime: "January to December",
  },


]

