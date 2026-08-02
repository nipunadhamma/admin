
/* ============================================================
   LANKAQUEST
   ATTRACTION GENERATOR
   FINAL TEMPLATE-BASED VERSION

   SOURCE
      js/places.js

   TEMPLATES
      pre-attractions.html
      pre-province.html

   OUTPUT
      attractions.html

      attractions-generated/
          province.html
          province/
              district/
                  attraction.html

      data/generated/search-index.json

      sitemap.xml

   FEATURES
      ✔ Template based generation
      ✔ Province pages
      ✔ Individual attraction pages
      ✔ Sponsored places
      ✔ Featured places
      ✔ Hidden places
      ✔ Search index
      ✔ Sitemap
      ✔ Automatic relative paths
      ✔ No dependency on places.page
============================================================ */


const fs = require("fs");

const path = require("path");

const vm = require("vm");


/* ============================================================
   1. PROJECT PATHS
============================================================ */

const PROJECT_ROOT =
    path.resolve(__dirname, "..");


const PLACES_FILE =
    path.join(
        PROJECT_ROOT,
        "js",
        "places.js"
    );


const ATTRACTIONS_TEMPLATE = path.join(
  PROJECT_ROOT,
  "templates",
  "pre-attractions.html",
);


const PROVINCE_TEMPLATE =
    path.join(
        PROJECT_ROOT,
        "templates",
        "pre-province.html"
    );


const OUTPUT_ROOT =
    path.join(
        PROJECT_ROOT,
        "attractions-generated"
    );


const SEARCH_DIRECTORY =
    path.join(
        PROJECT_ROOT,
        "data",
        "generated"
    );


const SEARCH_INDEX_FILE =
    path.join(
        SEARCH_DIRECTORY,
        "search-index.json"
    );


const ATTRACTIONS_OUTPUT =
    path.join(
        PROJECT_ROOT,
        "attractions.html"
    );


const SITEMAP_OUTPUT =
    path.join(
        PROJECT_ROOT,
        "sitemap.xml"
    );


/* ============================================================
   2. SITE URL
============================================================ */

/*
   For production sitemap:

   PowerShell:

   $env:LANKAQUEST_SITE_URL="https://your-domain.com"

   node generator/generate-attractions.js

   If no environment variable is supplied,
   replace the fallback below with your real
   LankaQuest domain before production deployment.
*/

const SITE_URL = (
    process.env.LANKAQUEST_SITE_URL ||
    "https://lankaquest.com"
)
    .replace(/\/+$/, "");


/* ============================================================
   3. VALIDATE REQUIRED FILES
============================================================ */

function requireFile(filePath, label) {

    if (!fs.existsSync(filePath)) {

        console.error("");

        console.error(
            `❌ ${label} was not found:`
        );

        console.error(filePath);

        process.exit(1);

    }

}


requireFile(
    PLACES_FILE,
    "places.js"
);


requireFile(
    ATTRACTIONS_TEMPLATE,
    "pre-attractions.html"
);


requireFile(
    PROVINCE_TEMPLATE,
    "pre-province.html"
);


/* ============================================================
   4. READ places.js
============================================================ */

const placesCode =
    fs.readFileSync(
        PLACES_FILE,
        "utf8"
    );


/* ============================================================
   5. LOAD touristPlaces
============================================================ */

const context = {

    window: {},

};


vm.createContext(context);


try {

    vm.runInContext(
        placesCode,
        context
    );

} catch (error) {

    console.error("");

    console.error(
        "❌ Unable to load places.js"
    );

    console.error(error);

    process.exit(1);

}


const places =
    context.window.touristPlaces;


/* ============================================================
   6. VALIDATE PLACES
============================================================ */

if (!Array.isArray(places)) {

    console.error("");

    console.error(
        "❌ window.touristPlaces is not an array."
    );

    process.exit(1);

}


console.log(
    `📍 Loaded ${places.length} places.`
);


/* ============================================================
   7. HELPER: SLUGIFY
============================================================ */

function slugify(value) {

    return String(value || "")

        .trim()

        .toLowerCase()

        .replace(/&/g, "and")

        .replace(/[^a-z0-9]+/g, "-")

        .replace(/^-+|-+$/g, "");

}


/* ============================================================
   8. HELPER: ESCAPE HTML
============================================================ */

function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* ============================================================
   9. HELPER: ESCAPE XML
============================================================ */

function escapeXML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&apos;");

}


/* ============================================================
   10. NORMALIZE PLACE
============================================================ */

function normalizePlace(place) {

    return {

        id:
            place.id ||
            slugify(place.name),

        name:
            place.name ||
            "Unnamed Attraction",

        sinhalaName:
            place.sinhalaName ||
            "",

        title:
            place.title ||
            place.name ||
            "Sri Lanka Attraction",

        shortDescription:
            place.shortDescription ||
            "",

        description:
            place.description ||
            "",

        type:
            place.type ||
            "attraction",

        category:
            place.category ||
            "other",

        categoryName:
            place.categoryName ||
            place.category ||
            "Attraction",

        province:
            place.province ||
            "Unknown Province",

        district:
            place.district ||
            "Unknown District",

        location:
            place.location ||
            "",

        coordinates:
            Array.isArray(place.coordinates)
                ? place.coordinates
                : [],

        image:
            place.image ||
            "",

        gallery:
            Array.isArray(place.gallery)
                ? place.gallery
                : [],

        featured:
            Boolean(place.featured),

        promoted:
            Boolean(place.promoted),

        hide:
            Boolean(place.hide),

        rating:
            place.rating ?? "",

        bestTime:
            place.bestTime ||
            "",

    };

}


const normalizedPlaces =
    places.map(
        normalizePlace
    );


/* ============================================================
   11. GROUP BY PROVINCE
============================================================ */

const provinces =
    new Map();


normalizedPlaces.forEach(
    (place) => {

        const provinceSlug =
            slugify(
                place.province
            );


        if (
            !provinces.has(
                provinceSlug
            )
        ) {

            provinces.set(
                provinceSlug,
                {

                    name:
                        place.province,

                    slug:
                        provinceSlug,

                    places:
                        [],

                }
            );

        }


        provinces
            .get(provinceSlug)
            .places
            .push(place);

    }
);


/* ============================================================
   12. CLEAN GENERATED OUTPUT
============================================================ */

if (
    fs.existsSync(
        OUTPUT_ROOT
    )
) {

    fs.rmSync(
        OUTPUT_ROOT,
        {
            recursive: true,
            force: true,
        }
    );

}


fs.mkdirSync(
    OUTPUT_ROOT,
    {
        recursive: true,
    }
);


/* ============================================================
   13. LOAD TEMPLATES
============================================================ */

const attractionsTemplate =
    fs.readFileSync(
        ATTRACTIONS_TEMPLATE,
        "utf8"
    );


const provinceTemplate =
    fs.readFileSync(
        PROVINCE_TEMPLATE,
        "utf8"
    );


/* ============================================================
   14. PATH HELPERS
============================================================ */

/*
   Root:

   attractions.html

   Province:

   attractions-generated/
       central-province.html

   Therefore:

   ../css/
   ../js/
   ../images/
*/


function fixProvinceTemplatePaths(
    html
) {

    return html

        .replace(
            /href="\.\.\/\.\.\/css\//g,
            'href="../css/'
        )

        .replace(
            /src="\.\.\/\.\.\/js\//g,
            'src="../js/'
        )

        .replace(
            /src="\.\.\/\.\.\/images\//g,
            'src="../images/'
        )

        .replace(
            /href="\.\.\/\.\.\/index\.html"/g,
            'href="../index.html"'
        )

        .replace(
            /href="\.\.\/\.\.\/attractions\.html"/g,
            'href="../attractions.html"'
        )

        .replace(
            /href="\.\.\/\.\.\/find-guides\.html"/g,
            'href="../find-guides.html"'
        )

        .replace(
            /href="\.\.\/\.\.\/trip-planner\.html"/g,
            'href="../trip-planner.html"'
        )

        .replace(
            /href="\.\.\/\.\.\/login\.html"/g,
            'href="../login.html"'
        );

}


/* ============================================================
   15. INDIVIDUAL PAGE PATH
============================================================ */

function getIndividualRelativePath(
    place
) {

    const provinceSlug =
        slugify(
            place.province
        );


    const districtSlug =
        slugify(
            place.district
        );


    const attractionSlug =
        slugify(
            place.id ||
            place.name
        );


    return (
        `attractions-generated/` +
        `${provinceSlug}/` +
        `${districtSlug}/` +
        `${attractionSlug}.html`
    );

}


/* ============================================================
   16. RELATIVE PATH FROM PROVINCE PAGE
============================================================ */

function getAttractionPathFromProvince(
    place
) {

    const districtSlug =
        slugify(
            place.district
        );


    const attractionSlug =
        slugify(
            place.id ||
            place.name
        );


    return (
        `${slugify(place.province)}/` +
        `${districtSlug}/` +
        `${attractionSlug}.html`
    );

}


/* ============================================================
   17. CREATE SPONSORED CARD
============================================================ */

function createSponsoredCard(
    place
) {

    const provinceSlug =
        slugify(
            place.province
        );


    const districtSlug =
        slugify(
            place.district
        );


    const attractionSlug =
        slugify(
            place.id ||
            place.name
        );


    const link =
        `attractions-generated/` +
        `${provinceSlug}/` +
        `${districtSlug}/` +
        `${attractionSlug}.html`;


    const image =
        place.image
            ? `
                <img
                    src="${escapeHTML(place.image)}"
                    alt="${escapeHTML(place.name)}"
                    loading="lazy"
                >
              `
            : "";


    return `

        <article
            class="sponsored-card"
            data-place-id="${escapeHTML(place.id)}"
        >

            <div class="sponsored-card-image">

                ${image}

            </div>


            <div class="sponsored-card-content">

                <span class="sponsored-label">
                    Sponsored
                </span>


                <h3>
                    ${escapeHTML(place.name)}
                </h3>


                <p>
                    ${escapeHTML(
                        place.shortDescription ||
                        place.description
                    )}
                </p>


                <a
                    href="${escapeHTML(link)}"
                    class="sponsored-view-button"
                >
                    View →
                </a>

            </div>

        </article>

    `;

}


/* ============================================================
   18. CREATE PROVINCE FILTER
============================================================ */

function createProvinceFilter(
    province
) {

    return `

        <button
            type="button"
            class="province-filter-button"
            data-province="${escapeHTML(
                province.slug
            )}"
        >

            ${escapeHTML(
                province.name
            )}

        </button>

    `;

}


/* ============================================================
   19. CREATE PROVINCE CARD
============================================================ */

function createProvinceCard(
    province
) {

    const visiblePlaces =
        province.places.filter(
            place =>
                !place.hide
        );


    if (
        visiblePlaces.length === 0
    ) {

        return "";

    }


    const firstImage =
        visiblePlaces.find(
            place =>
                place.image
        );


    const image =
        firstImage?.image || "";


    const featuredCount =
        visiblePlaces.filter(
            place =>
                place.featured
        ).length;


    return `

        <article
            class="province-card"
            data-province="${escapeHTML(
                province.slug
            )}"
            data-search="${escapeHTML(
                [
                    province.name,

                    ...visiblePlaces.map(
                        place =>
                            [
                                place.name,
                                place.sinhalaName,
                                place.district,
                                place.categoryName,
                            ]
                        .filter(Boolean)
                        .join(" ")
                    ),

                ]
                    .join(" ")
                    .toLowerCase()
            )}"
        >

            <div class="province-card-image">

                ${
                    image
                        ? `
                            <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(
                                    province.name
                                )}"
                                loading="lazy"
                            >
                          `
                        : `
                            <div
                                class="province-placeholder"
                                aria-hidden="true"
                            >
                                🇱🇰
                            </div>
                          `
                }


                <span class="province-card-badge">

                    ${visiblePlaces.length}
                    Attractions

                </span>

            </div>


            <div class="province-card-content">

                <span class="province-label">
                    Province
                </span>


                <h3>
                    ${escapeHTML(
                        province.name
                    )}
                </h3>


                <p>
                    Explore tourist attractions
                    across
                    ${escapeHTML(
                        province.name
                    )}.
                </p>


                <div class="province-card-meta">

                    <span>
                        📍
                        ${visiblePlaces.length}
                        Places
                    </span>


                    ${
                        featuredCount
                            ? `
                                <span>
                                    ⭐
                                    ${featuredCount}
                                    Featured
                                </span>
                              `
                            : ""
                    }

                </div>


                <a
                    href="attractions-generated/${escapeHTML(
                        province.slug
                    )}.html"
                    class="province-view-button"
                >

                    <span>
                        Explore Province
                    </span>

                    <span>
                        →
                    </span>

                </a>

            </div>

        </article>

    `;

}


/* ============================================================
   20. CREATE DISTRICT SECTION
============================================================ */

function createDistrictSections(
    province
) {

    const districtMap =
        new Map();


    province.places
        .filter(
            place =>
                !place.hide
        )
        .forEach(
            place => {

                const districtSlug =
                    slugify(
                        place.district
                    );


                if (
                    !districtMap.has(
                        districtSlug
                    )
                ) {

                    districtMap.set(
                        districtSlug,
                        {

                            name:
                                place.district,

                            slug:
                                districtSlug,

                            places:
                                [],

                        }
                    );

                }


                districtMap
                    .get(districtSlug)
                    .places
                    .push(place);

            }
        );


    let output = "";


    districtMap.forEach(
        district => {

            let cards = "";


            district.places.forEach(
                place => {

                    const link =
                        getAttractionPathFromProvince(
                            place
                        );


                    const rating =
                        place.rating !== ""
                            ? `
                                <span>
                                    ⭐
                                    ${escapeHTML(
                                        place.rating
                                    )}
                                </span>
                              `
                            : "";


                    const featured =
                        place.featured
                            ? `
                                <span class="featured">
                                    ⭐ Featured
                                </span>
                              `
                            : "";


                    const image =
                        place.image
                            ? `
                                <img
                                    src="../${escapeHTML(
                                        place.image
                                    )}"
                                    alt="${escapeHTML(
                                        place.name
                                    )}"
                                    loading="lazy"
                                >
                              `
                            : "";


                    cards += `

                        <article
                            class="attraction-card"
                            data-place-id="${escapeHTML(
                                place.id
                            )}"
                        >

                            <div class="attraction-image">

                                ${image}

                            </div>


                            <div class="attraction-content">

                                ${featured}


                                <span class="attraction-category">

                                    ${escapeHTML(
                                        place.categoryName
                                    )}

                                </span>


                                <h3>

                                    ${escapeHTML(
                                        place.name
                                    )}

                                </h3>


                                <p>

                                    ${escapeHTML(
                                        place.shortDescription ||
                                        place.description
                                    )}

                                </p>


                                <div class="attraction-actions">

                                    <a
                                        href="${escapeHTML(
                                            link
                                        )}"
                                        class="attraction-action trip-button"
                                    >
                                        View Details →
                                    </a>

                                </div>


                                ${
                                    rating
                                        ? `
                                            <div class="attraction-rating">
                                                ${rating}
                                            </div>
                                          `
                                        : ""
                                }

                            </div>

                        </article>

                    `;

                }
            );


            output += `

                <section
                    class="district-section"
                    id="${escapeHTML(
                        district.slug
                    )}"
                >

                    <div class="section-container">

                        <div class="district-header">

                            <h2>

                                📍
                                ${escapeHTML(
                                    district.name
                                )}

                            </h2>


                            <p>

                                Explore
                                ${district.places.length}
                                attraction${
                                    district.places.length === 1
                                        ? ""
                                        : "s"
                                }
                                in
                                ${escapeHTML(
                                    district.name
                                )}.

                            </p>

                        </div>


                        <div class="attraction-grid">

                            ${cards}

                        </div>

                    </div>

                </section>

            `;

        }
    );


    return output;

}


/* ============================================================
   21. GENERATE INDIVIDUAL ATTRACTION PAGE
============================================================ */

function createIndividualPage(
    place
) {

    const provinceSlug =
        slugify(
            place.province
        );


    const districtSlug =
        slugify(
            place.district
        );


    const attractionSlug =
        slugify(
            place.id ||
            place.name
        );


    const outputDirectory =
        path.join(
            OUTPUT_ROOT,
            provinceSlug,
            districtSlug
        );


    fs.mkdirSync(
        outputDirectory,
        {
            recursive: true,
        }
    );


    const outputFile =
        path.join(
            outputDirectory,
            `${attractionSlug}.html`
        );


    const image =
        place.image
            ? `
                <img
                    src="../../../../${escapeHTML(
                        place.image
                    )}"
                    alt="${escapeHTML(
                        place.name
                    )}"
                >
              `
            : "";


    const gallery =
        place.gallery
            .map(
                galleryImage => `

                    <img
                        src="../../../../${escapeHTML(
                            galleryImage
                        )}"
                        alt="${escapeHTML(
                            place.name
                        )}"
                        loading="lazy"
                    >

                `
            )
            .join("");


    const html = `<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <meta
        name="description"
        content="${escapeHTML(place.shortDescription || place.description)}"
    >

    <title>
        ${escapeHTML(place.title || place.name)}
        | LankaQuest
    </title>


    <link
        rel="stylesheet"
        href="../../../../css/style.css"
    >

    <link
        rel="stylesheet"
        href="../../../../css/attractions.css"
    >
     <link
        rel="stylesheet"
        href="../../../../css/place-attractions.css"
    >

</head>


<body>


<header class="site-header">

    <div class="site-brand">

        <a href="../../../../index.html" class="brand-link">
          <div class="brand-icon">
            <img src="../../../../images/logo.png" alt="LankaQuest Logo">
          </div>

            <div class="brand-text">
        
                <h1>
                    LankaQuest
                </h1>
        
                <p>
                    Discover the Wonder of Sri Lanka
                 </p>
        
            </div>

        </a>
    
    </div>

    <div class="header-actions">

        <button type="button" id="mobileMenuButton" class="mobile-menu-button" aria-label="Open Menu" aria-expanded="false">
            ☰
        </button>

        <nav id="mobileMenu" class="mobile-menu" aria-label="Main Navigation">

        

            <a href="../../../../index.html">
                Home
            </a>

            <a href="../../../../attractions.html">
                Attractions
            </a>

            <a href="../../../../find-guides.html">
                Find Guides
            </a>

            <a href="../../../../trip-planner.html">
                 <span>
                    ❤️ My Trip
                </span>
            </a>

        </nav>

    </div>

</header>


<main>


<section class="province-detail-hero">

    <a
        href="../../${escapeHTML(provinceSlug)}.html"
        class="back-button"
    >
        ← ${escapeHTML(place.province)}
    </a>


    <h1>
        ${escapeHTML(place.name)}
    </h1>


    ${
      place.sinhalaName
        ? `
                <p>
                    ${escapeHTML(place.sinhalaName)}
                </p>
              `
        : ""
    }

</section>


<section class="district-section">

    <div class="section-container">


        <article class="attraction-card">


            <div class="attraction-image">

                ${image}

            </div>


            <div class="attraction-content">


                ${
                  place.featured
                    ? `
                            <span class="featured">
                                ⭐ Featured
                            </span>
                          `
                    : ""
                }


                ${
                  place.promoted
                    ? `
                            <span class="featured">
                                Sponsored
                            </span>
                          `
                    : ""
                }


                <span class="attraction-category">

                    ${escapeHTML(place.categoryName)}

                </span>


                <h2>

                    ${escapeHTML(place.title || place.name)}

                </h2>


                <p>

                    ${escapeHTML(place.description || place.shortDescription)}

                </p>


                <div class="province-card-meta">

                    <span>
                        📍
                        ${escapeHTML(place.location)}
                    </span>


                    <span>
                        🗺️
                        ${escapeHTML(place.district)}
                    </span>


                    ${
                      place.rating !== ""
                        ? `
                                <span>
                                    ⭐
                                    ${escapeHTML(place.rating)}
                                </span>
                              `
                        : ""
                    }


                    ${
                      place.bestTime
                        ? `
                                <span>
                                    🌤️
                                    Best:
                                    ${escapeHTML(place.bestTime)}
                                </span>
                              `
                        : ""
                    }

                </div>


                ${
                  gallery
                    ? `
                            <div class="attraction-grid">

                                ${gallery}

                            </div>
                          `
                    : ""
                }


                
               <div class="attraction-actions">

                   <button
                        type="button"
                        class="attraction-action trip-button"
                        id="addToMyTripButton"
                        data-place-id="${escapeHTML(place.id)}"
                        data-place-name="${escapeHTML(place.name)}"
                        data-place-image="${escapeHTML(place.image)}"
                        data-place-province="${escapeHTML(place.province)}"
                        data-place-district="${escapeHTML(place.district)}"
                        data-place-location="${escapeHTML(place.location)}"
                        data-place-rating="${escapeHTML(
                         place.rating !== ""
                          ? String(place.rating)
                           : ""
                      )}"
                     >
                       ❤️ Add to My Trip
                  </button>


                   <a
                    href="../../${escapeHTML(provinceSlug)}.html"
                    class="attraction-action map-button" >
                    ← Back to Province
                   </a>

                </div>




            </div>

        </article>

    </div>

</section>


</main>


<footer class="province-footer">

    <p>
        © 2026 LankaQuest.
    </p>

</footer>

<script src="../../../../js/mobile-menu.js"></script>



<script src="../../../../js/attraction-trip.js"></script>




</body>

</html>`;


    fs.writeFileSync(
        outputFile,
        html,
        "utf8"
    );


    console.log(
        `   📄 attractions-generated/${provinceSlug}/${districtSlug}/${attractionSlug}.html`
    );


    return (
        `attractions-generated/` +
        `${provinceSlug}/` +
        `${districtSlug}/` +
        `${attractionSlug}.html`
    );

}


/* ============================================================
   22. GENERATE ALL INDIVIDUAL PAGES
============================================================ */

const individualPages = [];


normalizedPlaces.forEach(
    place => {

        const pagePath =
            createIndividualPage(
                place
            );


        individualPages.push(
            {
                place,
                path: pagePath,
            }
        );

    }
);


/* ============================================================
   23. GENERATE PROVINCE PAGES
============================================================ */

let generatedProvinceCount = 0;


provinces.forEach(
    province => {

        const visiblePlaces =
            province.places.filter(
                place =>
                    !place.hide
            );


        const districtNames =
            new Set(
                visiblePlaces.map(
                    place =>
                        place.district
                )
            );


        const districtSections =
            createDistrictSections(
                province
            );


        let html =
            fixProvinceTemplatePaths(
                provinceTemplate
            );


        html =
            html.replace(
                /__PROVINCE_NAME__/g,
                escapeHTML(
                    province.name
                )
            );


        html =
            html.replace(
                /__ATTRACTION_COUNT__/g,
                String(
                    visiblePlaces.length
                )
            );


        html =
            html.replace(
                /__DISTRICT_COUNT__/g,
                String(
                    districtNames.size
                )
            );


        html =
            html.replace(
                /__DISTRICT_SECTIONS__/g,
                districtSections
            );


        const outputFile =
            path.join(
                OUTPUT_ROOT,
                `${province.slug}.html`
            );


        fs.writeFileSync(
            outputFile,
            html,
            "utf8"
        );


        generatedProvinceCount++;


        console.log(
            `✅ Generated province: ${province.slug}.html`
        );

    }
);


/* ============================================================
   24. SPONSORED PLACES
============================================================ */

const sponsoredPlaces =
    normalizedPlaces.filter(
        place =>
            place.promoted &&
            !place.hide
    );


/* ============================================================
   25. SPONSORED CARDS
============================================================ */

const sponsoredCards =
    sponsoredPlaces
        .map(
            createSponsoredCard
        )
        .join("");


/* ============================================================
   26. PROVINCE FILTERS
============================================================ */

const provinceFilters =
    Array.from(
        provinces.values()
    )
        .map(
            createProvinceFilter
        )
        .join("");


/* ============================================================
   27. PROVINCE CARDS
============================================================ */

const provinceCards =
    Array.from(
        provinces.values()
    )
        .map(
            createProvinceCard
        )
        .join("");


/* ============================================================
   28. GENERATE attractions.html
============================================================ */

let attractionsHTML =
    attractionsTemplate;


attractionsHTML =
    attractionsHTML.replace(
        /__SPONSORED_CARDS__/g,
        sponsoredCards
    );


attractionsHTML =
    attractionsHTML.replace(
        /__PROVINCE_FILTERS__/g,
        provinceFilters
    );


attractionsHTML =
    attractionsHTML.replace(
        /__PROVINCE_CARDS__/g,
        provinceCards
    );


fs.writeFileSync(
    ATTRACTIONS_OUTPUT,
    attractionsHTML,
    "utf8"
);


console.log(
    "✅ Generated: attractions.html"
);


/* ============================================================
   29. SEARCH INDEX
============================================================ */

const searchIndex =
    normalizedPlaces
        .map(
            place => {

                const page =
                    getIndividualRelativePath(
                        place
                    );


                return {

                    id:
                        place.id,

                    type:
                        place.type,

                    name:
                        place.name,

                    sinhalaName:
                        place.sinhalaName,

                    title:
                        place.title,

                    category:
                        place.category,

                    categoryName:
                        place.categoryName,

                    province:
                        place.province,

                    district:
                        place.district,

                    location:
                        place.location,

                    description:
                        place.description,

                    shortDescription:
                        place.shortDescription,

                    rating:
                        place.rating,

                    featured:
                        place.featured,

                    promoted:
                        place.promoted,

                    hide:
                        place.hide,

                    image:
                        place.image,

                    page,

                    keywords: [

                        place.name,

                        place.sinhalaName,

                        place.title,

                        place.category,

                        place.categoryName,

                        place.province,

                        place.district,

                        place.location,

                    ].filter(Boolean),

                };

            }
        );


fs.mkdirSync(
    SEARCH_DIRECTORY,
    {
        recursive: true,
    }
);


fs.writeFileSync(
    SEARCH_INDEX_FILE,

    JSON.stringify(
        searchIndex,
        null,
        2
    ),

    "utf8"
);


console.log(
    "✅ Generated: data/generated/search-index.json"
);


/* ============================================================
   30. SITEMAP URL LIST
============================================================ */

const sitemapUrls = [];


/* ============================================================
   MAIN ATTRACTIONS PAGE
============================================================ */

sitemapUrls.push(
    {
        path: "/",
        priority: "1.0",
    }
);


sitemapUrls.push(
    {
        path: "/attractions.html",
        priority: "0.9",
    }
);


/* ============================================================
   PROVINCE PAGES
============================================================ */

provinces.forEach(
    province => {

        const visiblePlaces =
            province.places.filter(
                place =>
                    !place.hide
            );


        if (
            visiblePlaces.length === 0
        ) {

            return;

        }


        sitemapUrls.push(
            {
                path:
                    `/attractions-generated/${province.slug}.html`,

                priority:
                    "0.8",
            }
        );

    }
);


/* ============================================================
   INDIVIDUAL PAGES
============================================================ */

normalizedPlaces.forEach(
    place => {

        if (
            place.hide
        ) {

            return;

        }


        sitemapUrls.push(
            {
                path:
                    "/" +
                    getIndividualRelativePath(
                        place
                    ),

                priority:
                    place.featured
                        ? "0.8"
                        : "0.7",
            }
        );

    }
);


/* ============================================================
   31. CREATE SITEMAP
============================================================ */

const today =
    new Date()
        .toISOString()
        .split("T")[0];


const sitemapEntries =
    sitemapUrls
        .map(
            item => `

    <url>

        <loc>
            ${escapeXML(
                SITE_URL +
                item.path
            )}
        </loc>

        <lastmod>
            ${today}
        </lastmod>

        <changefreq>
            weekly
        </changefreq>

        <priority>
            ${item.priority}
        </priority>

    </url>

`
        )
        .join("");


const sitemap = `<?xml version="1.0" encoding="UTF-8"?>

<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>

${sitemapEntries}

</urlset>
`;


fs.writeFileSync(
    SITEMAP_OUTPUT,
    sitemap,
    "utf8"
);


console.log(
    "✅ Generated: sitemap.xml"
);


/* ============================================================
   32. SUMMARY
============================================================ */

const hiddenCount =
    normalizedPlaces.filter(
        place =>
            place.hide
    ).length;


console.log("");


console.log(
    "=============================================="
);


console.log(
    "🇱🇰 LankaQuest Attraction Generator"
);


console.log(
    "=============================================="
);


console.log(
    `Places: ${normalizedPlaces.length}`
);


console.log(
    `Hidden: ${hiddenCount}`
);


console.log(
    `Visible: ${
        normalizedPlaces.length -
        hiddenCount
    }`
);


console.log(
    `Provinces: ${generatedProvinceCount}`
);


console.log(
    `Individual pages: ${individualPages.length}`
);


console.log(
    `Sponsored: ${sponsoredPlaces.length}`
);


console.log(
    "Search index: data/generated/search-index.json"
);


console.log(
    "Main page: attractions.html"
);


console.log(
    "Generated pages: attractions-generated/"
);


console.log(
    "Sitemap: sitemap.xml"
);


console.log(
    "=============================================="
);


console.log(
    "✅ Generation completed successfully."
);


console.log(
    "=============================================="
);

