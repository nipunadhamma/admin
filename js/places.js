
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


const touristPlaces = [


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

        coordinates: [7.9570, 80.7603],

        image:
            "images/destinations/sigiriya/sigiriya-main.jpg",

        gallery: [
            "images/destinations/sigiriya/sigiriya-01.jpg",
            "images/destinations/sigiriya/sigiriya-02.jpg",
            "images/destinations/sigiriya/sigiriya-03.jpg",
            "images/destinations/sigiriya/sigiriya-04.jpg"
        ],

        featured: true,

        rating: 4.9,

        bestTime: "January to April",

        page: "destinations/sigiriya.html"
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
            "images/destinations/kandy/kandy-04.jpg"
        ],

        featured: true,

        rating: 4.8,

        bestTime: "December to April",

        page: "destinations/kandy.html"
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
            "images/destinations/ella/ella-04.jpg"
        ],

        featured: true,

        rating: 4.9,

        bestTime: "January to March",

        page: "destinations/ella.html"
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

        coordinates: [6.0269, 80.2170],

        image:
            "images/destinations/galle-fort/galle-fort-main.jpg",

        gallery: [
            "images/destinations/galle-fort/galle-fort-01.jpg",
            "images/destinations/galle-fort/galle-fort-02.jpg",
            "images/destinations/galle-fort/galle-fort-03.jpg",
            "images/destinations/galle-fort/galle-fort-04.jpg"
        ],

        featured: true,

        rating: 4.8,

        bestTime: "December to April",

        page: "destinations/galle-fort.html"
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
            "images/destinations/yala/yala-04.jpg"
        ],

        featured: true,

        rating: 4.7,

        bestTime: "February to June",

        page: "destinations/yala.html"
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
            "images/destinations/anuradhapura/anuradhapura-04.jpg"
        ],

        featured: true,

        rating: 4.8,

        bestTime: "May to September",

        page: "destinations/anuradhapura.html"
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
            "images/destinations/polonnaruwa/polonnaruwa-04.jpg"
        ],

        featured: true,

        rating: 4.8,

        bestTime: "May to September",

        page: "destinations/polonnaruwa.html"
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
            "images/destinations/nuwara-eliya/nuwara-eliya-04.jpg"
        ],

        featured: true,

        rating: 4.7,

        bestTime: "January to April",

        page: "destinations/nuwara-eliya.html"
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
            "images/destinations/mirissa/mirissa-04.jpg"
        ],

        featured: true,

        rating: 4.8,

        bestTime: "December to April",

        page: "destinations/mirissa.html"
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
            "images/destinations/unawatuna/unawatuna-04.jpg"
        ],

        featured: false,

        rating: 4.7,

        bestTime: "December to April",

        page: "destinations/unawatuna.html"
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
            "images/destinations/bentota/bentota-04.jpg"
        ],

        featured: false,

        rating: 4.6,

        bestTime: "November to April",

        page: "destinations/bentota.html"
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
            "images/destinations/arugam-bay/arugam-bay-04.jpg"
        ],

        featured: true,

        rating: 4.8,

        bestTime: "May to September",

        page: "destinations/arugam-bay.html"
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

        image:
            "images/destinations/trincomalee/trincomalee-main.jpg",

        gallery: [
            "images/destinations/trincomalee/trincomalee-01.jpg",
            "images/destinations/trincomalee/trincomalee-02.jpg",
            "images/destinations/trincomalee/trincomalee-03.jpg",
            "images/destinations/trincomalee/trincomalee-04.jpg"
        ],

        featured: true,

        rating: 4.8,

        bestTime: "May to September",

        page: "destinations/trincomalee.html"
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

        coordinates: [6.8021, 80.8030],

        image:
            "images/destinations/horton-plains/horton-plains-main.jpg",

        gallery: [
            "images/destinations/horton-plains/horton-plains-01.jpg",
            "images/destinations/horton-plains/horton-plains-02.jpg",
            "images/destinations/horton-plains/horton-plains-03.jpg",
            "images/destinations/horton-plains/horton-plains-04.jpg"
        ],

        featured: true,

        rating: 4.8,

        bestTime: "January to March",

        page: "destinations/horton-plains.html"
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

        image:
            "images/destinations/adams-peak/adams-peak-main.jpg",

        gallery: [
            "images/destinations/adams-peak/adams-peak-01.jpg",
            "images/destinations/adams-peak/adams-peak-02.jpg",
            "images/destinations/adams-peak/adams-peak-03.jpg",
            "images/destinations/adams-peak/adams-peak-04.jpg"
        ],

        featured: true,

        rating: 4.8,

        bestTime: "December to May",

        page: "destinations/adams-peak.html"
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

        image:
            "images/destinations/dambulla/dambulla-main.jpg",

        gallery: [
            "images/destinations/dambulla/dambulla-01.jpg",
            "images/destinations/dambulla/dambulla-02.jpg",
            "images/destinations/dambulla/dambulla-03.jpg",
            "images/destinations/dambulla/dambulla-04.jpg"
        ],

        featured: true,

        rating: 4.8,

        bestTime: "January to April",

        page: "destinations/dambulla.html"
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

        image:
            "images/destinations/minneriya/minneriya-main.jpg",

        gallery: [
            "images/destinations/minneriya/minneriya-01.jpg",
            "images/destinations/minneriya/minneriya-02.jpg",
            "images/destinations/minneriya/minneriya-03.jpg",
            "images/destinations/minneriya/minneriya-04.jpg"
        ],

        featured: true,

        rating: 4.7,

        bestTime: "June to September",

        page: "destinations/minneriya.html"
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

        image:
            "images/destinations/udawalawe/udawalawe-main.jpg",

        gallery: [
            "images/destinations/udawalawe/udawalawe-01.jpg",
            "images/destinations/udawalawe/udawalawe-02.jpg",
            "images/destinations/udawalawe/udawalawe-03.jpg",
            "images/destinations/udawalawe/udawalawe-04.jpg"
        ],

        featured: true,

        rating: 4.7,

        bestTime: "May to September",

        page: "destinations/udawalawe.html"
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

        image:
            "images/destinations/bundala/bundala-main.jpg",

        gallery: [
            "images/destinations/bundala/bundala-01.jpg",
            "images/destinations/bundala/bundala-02.jpg",
            "images/destinations/bundala/bundala-03.jpg",
            "images/destinations/bundala/bundala-04.jpg"
        ],

        featured: false,

        rating: 4.5,

        bestTime: "November to March",

        page: "destinations/bundala.html"
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

        coordinates: [6.4040, 80.4550],

        image:
            "images/destinations/sinharaja/sinharaja-main.jpg",

        gallery: [
            "images/destinations/sinharaja/sinharaja-01.jpg",
            "images/destinations/sinharaja/sinharaja-02.jpg",
            "images/destinations/sinharaja/sinharaja-03.jpg",
            "images/destinations/sinharaja/sinharaja-04.jpg"
        ],

        featured: true,

        rating: 4.8,

        bestTime: "January to April",

        page: "destinations/sinharaja.html"
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

        image:
            "images/destinations/knuckles/knuckles-main.jpg",

        gallery: [
            "images/destinations/knuckles/knuckles-01.jpg",
            "images/destinations/knuckles/knuckles-02.jpg",
            "images/destinations/knuckles/knuckles-03.jpg",
            "images/destinations/knuckles/knuckles-04.jpg"
        ],

        featured: true,

        rating: 4.8,

        bestTime: "January to April",

        page: "destinations/knuckles.html"
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

        image:
            "images/destinations/ravana-falls/ravana-falls-main.jpg",

        gallery: [
            "images/destinations/ravana-falls/ravana-falls-01.jpg",
            "images/destinations/ravana-falls/ravana-falls-02.jpg",
            "images/destinations/ravana-falls/ravana-falls-03.jpg",
            "images/destinations/ravana-falls/ravana-falls-04.jpg"
        ],

        featured: false,

        rating: 4.6,

        bestTime: "October to April",

        page: "destinations/ravana-falls.html"
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

        image:
            "images/destinations/nine-arch-bridge/nine-arch-bridge-main.jpg",

        gallery: [
            "images/destinations/nine-arch-bridge/nine-arch-bridge-01.jpg",
            "images/destinations/nine-arch-bridge/nine-arch-bridge-02.jpg",
            "images/destinations/nine-arch-bridge/nine-arch-bridge-03.jpg",
            "images/destinations/nine-arch-bridge/nine-arch-bridge-04.jpg"
        ],

        featured: true,

        rating: 4.8,

        bestTime: "January to March",

        page: "destinations/nine-arch-bridge.html"
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

        coordinates: [6.1395, 80.1460],

        image:
            "images/destinations/hikkaduwa/hikkaduwa-main.jpg",

        gallery: [
            "images/destinations/hikkaduwa/hikkaduwa-01.jpg",
            "images/destinations/hikkaduwa/hikkaduwa-02.jpg",
            "images/destinations/hikkaduwa/hikkaduwa-03.jpg",
            "images/destinations/hikkaduwa/hikkaduwa-04.jpg"
        ],

        featured: false,

        rating: 4.6,

        bestTime: "November to April",

        page: "destinations/hikkaduwa.html"
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

        coordinates: [7.9239, 81.5600],

        image:
            "images/destinations/pasikudah/pasikudah-main.jpg",

        gallery: [
            "images/destinations/pasikudah/pasikudah-01.jpg",
            "images/destinations/pasikudah/pasikudah-02.jpg",
            "images/destinations/pasikudah/pasikudah-03.jpg",
            "images/destinations/pasikudah/pasikudah-04.jpg"
        ],

        featured: true,

        rating: 4.7,

        bestTime: "May to September",

        page: "destinations/pasikudah.html"
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

        image:
            "images/destinations/jaffna/jaffna-main.jpg",

        gallery: [
            "images/destinations/jaffna/jaffna-01.jpg",
            "images/destinations/jaffna/jaffna-02.jpg",
            "images/destinations/jaffna/jaffna-03.jpg",
            "images/destinations/jaffna/jaffna-04.jpg"
        ],

        featured: true,

        rating: 4.6,

        bestTime: "January to September",

        page: "destinations/jaffna.html"
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

        image:
            "images/destinations/negombo/negombo-main.jpg",

        gallery: [
            "images/destinations/negombo/negombo-01.jpg",
            "images/destinations/negombo/negombo-02.jpg",
            "images/destinations/negombo/negombo-03.jpg",
            "images/destinations/negombo/negombo-04.jpg"
        ],

        featured: false,

        rating: 4.5,

        bestTime: "December to April",

        page: "destinations/negombo.html"
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

        image:
            "images/destinations/kalpitiya/kalpitiya-main.jpg",

        gallery: [
            "images/destinations/kalpitiya/kalpitiya-01.jpg",
            "images/destinations/kalpitiya/kalpitiya-02.jpg",
            "images/destinations/kalpitiya/kalpitiya-03.jpg",
            "images/destinations/kalpitiya/kalpitiya-04.jpg"
        ],

        featured: false,

        rating: 4.6,

        bestTime: "May to September",

        page: "destinations/kalpitiya.html"
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

        image:
            "images/destinations/pidurangala/pidurangala-main.jpg",

        gallery: [
            "images/destinations/pidurangala/pidurangala-01.jpg",
            "images/destinations/pidurangala/pidurangala-02.jpg",
            "images/destinations/pidurangala/pidurangala-03.jpg",
            "images/destinations/pidurangala/pidurangala-04.jpg"
        ],

        featured: true,

        rating: 4.8,

        bestTime: "January to April",

        page: "destinations/pidurangala.html"
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

        image:
            "images/destinations/colombo/colombo-main.jpg",

        gallery: [
            "images/destinations/colombo/colombo-01.jpg",
            "images/destinations/colombo/colombo-02.jpg",
            "images/destinations/colombo/colombo-03.jpg",
            "images/destinations/colombo/colombo-04.jpg"
        ],

        featured: true,

        rating: 4.5,

        bestTime: "January to April",

        page: "destinations/colombo.html"
    }

];

