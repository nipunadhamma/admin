
/* ============================================================
   LankaWayfarer
   ATTRACTIONS SYSTEM
   FINAL SEARCH-INDEX VERSION

   DATA SOURCE

      generator/generate-attractions.js
                    ↓
      data/generated/search-index.json
                    ↓
      js/attractions.js

   FEATURES

      ✔ Generated search index
      ✔ Live search dropdown
      ✔ English search
      ✔ Sinhala search
      ✔ Province search
      ✔ District search
      ✔ Category search
      ✔ Attraction navigation
      ✔ Province filtering
      ✔ Firebase My Trip
      ✔ Mobile menu
      ✔ No places.js dependency
      ✔ No place.page dependency
============================================================ */


/* ============================================================
   1. FIREBASE
============================================================ */

import {
    auth,
    db
} from "./firebase-config.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* ============================================================
   2. CONFIGURATION
============================================================ */

const SEARCH_INDEX_URL =
    "data/generated/search-index.json";


const TRIP_COLLECTION =
    "lankaQuestTouristTrips";


/* ============================================================
   3. STATE
============================================================ */

let places = [];

let currentProvince =
    "all";

let currentUser =
    null;

let currentTrip =
    [];

let searchTimer =
    null;


/* ============================================================
   4. DOM ELEMENTS
============================================================ */

const attractionSearch =
    document.getElementById(
        "attractionSearch"
    );


const attractionSearchResults =
    document.getElementById(
        "attractionSearchResults"
    );


const provinceFilter =
    document.getElementById(
        "provinceFilter"
    );


const provinceGrid =
    document.getElementById(
        "provinceGrid"
    );


const noProvinceResults =
    document.getElementById(
        "noProvinceResults"
    );


const mobileMenuButton =
    document.getElementById(
        "mobileMenuButton"
    );


const mainNavigation =
    document.getElementById(
        "mainNavigation"
    );


const myTripButton =
    document.getElementById(
        "myTripButton"
    );


const tripCounter =
    document.getElementById(
        "tripCounter"
    );


/* ============================================================
   5. NORMALIZE TEXT
============================================================ */

function normalizeText(
    value
) {

    return String(
        value ?? ""
    )
        .toLowerCase()
        .trim();

}


/* ============================================================
   6. ESCAPE HTML
============================================================ */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   7. SLUGIFY
============================================================ */

function slugify(
    value
) {

    return String(
        value ?? ""
    )

        .trim()

        .toLowerCase()

        .replace(
            /&/g,
            "and"
        )

        .replace(
            /[^a-z0-9]+/g,
            "-"
        )

        .replace(
            /^-+|-+$/g,
            "");

}


/* ============================================================
   8. GET ATTRACTION PATH
============================================================ */

/*
   search-index.json already contains:

   attractions-generated/
   province/
   district/
   attraction.html

   Therefore use the generated page path
   directly when available.

   This keeps the browser and generator
   architecture synchronized.
*/

function getAttractionPath(
    place
) {

    if (
        place &&
        place.page
    ) {

        return place.page;

    }


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
   9. SEARCH TEXT
============================================================ */

function getSearchText(
    place
) {

    return [

        place.id,

        place.name,

        place.sinhalaName,

        place.title,

        place.category,

        place.categoryName,

        place.province,

        place.district,

        place.location,

        place.shortDescription,

        place.description,

        place.bestTime

    ]

        .filter(Boolean)

        .join(" ")

        .toLowerCase();

}


/* ============================================================
   10. LOAD SEARCH INDEX
============================================================ */

async function loadSearchIndex() {

    try {

        console.log(
            "🔎 Loading LankaWayfarer search index..."
        );


        const response =
            await fetch(
                SEARCH_INDEX_URL,
                {
                    cache:
                        "no-cache"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "Search index is not an array."
            );

        }


        places =
            data.filter(
                place =>
                    place &&
                    !place.hide
            );


        console.log(
          `🇱🇰 LankaWayfarer search index loaded: ${places.length} places`,
        );


        return true;

    } catch (
        error
    ) {

        console.error(
            "❌ Unable to load search index:",
            error
        );


        places =
            [];


        showSearchIndexError();


        return false;

    }

}


/* ============================================================
   11. SEARCH INDEX ERROR
============================================================ */

function showSearchIndexError() {

    if (
        noProvinceResults
    ) {

        noProvinceResults.hidden =
            false;


        const title =
            noProvinceResults.querySelector(
                "h3"
            );


        const message =
            noProvinceResults.querySelector(
                "p"
            );


        if (title) {

            title.textContent =
                "Unable to load attractions";

        }


        if (message) {

            message.textContent =
                "Please refresh the page and try again.";

        }

    }

}


/* ============================================================
   12. IS PLACE IN MY TRIP
============================================================ */

function isPlaceInTrip(
    placeId
) {

    return currentTrip.some(
        destination => {

            if (
                typeof destination ===
                "string"
            ) {

                return (
                    destination ===
                    placeId
                );

            }


            return (
                destination?.id ===
                placeId
            );

        }
    );

}


/* ============================================================
   13. UPDATE TRIP COUNTER
============================================================ */

function updateTripCounter() {

    if (
        !tripCounter
    ) {

        return;

    }


    tripCounter.textContent =
        String(
            currentTrip.length
        );


    tripCounter.style.display =
        currentTrip.length > 0
            ? ""
            : "none";

}


/* ============================================================
   14. LOAD MY TRIP
============================================================ */

async function loadTrip() {

    if (
        !currentUser
    ) {

        currentTrip =
            [];

        updateTripCounter();

        return;

    }


    try {

        const tripRef =
            doc(
                db,
                TRIP_COLLECTION,
                currentUser.uid
            );


        const snapshot =
            await getDoc(
                tripRef
            );


        if (
            snapshot.exists()
        ) {

            const data =
                snapshot.data();


            currentTrip =
                Array.isArray(
                    data.destinations
                )
                    ? data.destinations
                    : [];

        } else {

            currentTrip =
                [];

        }

    } catch (
        error
    ) {

        console.error(
            "❌ My Trip loading error:",
            error
        );


        currentTrip =
            [];

    }


    updateTripCounter();

}


/* ============================================================
   15. ADD PLACE TO MY TRIP

   FIREBASE + LOCAL PLANNER DRAFT

   Firebase:
       LANKAWAYFARERTouristTrips/{UID}

   Local temporary planner:
       sriLankaMyTrip

   Live update:
       lankaWayfarer-trip-updated
============================================================ */

/* ============================================================
   15. ADD PLACE TO MY TRIP

   PRODUCTION ARCHITECTURE

   Firebase:
       LankaWayfarerTouristTrips/{UID}

   Local planner:
       sriLankaMyTrip

   Same-tab live update:
       LankaWayfarer-trip-updated

   Cross-tab update:
       localStorage "storage" event
============================================================ */

async function addPlaceToTrip(
    place,
    button
) {

    /* ========================================================
       1. AUTHENTICATION
    ======================================================== */

    if (!currentUser) {

        const redirect =
            encodeURIComponent(
                "attractions.html"
            );

        window.location.href =
            `login.html?redirect=${redirect}`;

        return false;
    }


    /* ========================================================
       2. VALIDATE PLACE
    ======================================================== */

    if (
        !place ||
        typeof place !== "object"
    ) {

        console.error("❌ LankaWayfarer: Invalid place supplied.", place);

        return false;
    }


    /* ========================================================
       3. NORMALIZE PLACE ID
    ======================================================== */

    const placeId =
        String(
            place.id ??
            place.placeId ??
            place.slug ??
            ""
        ).trim();


    if (!placeId) {

        console.error(
            "❌ LankaWayfarer: Place has no valid ID.",
            place
        );

        return false;
    }


    /* ========================================================
       4. CHECK CURRENT TRIP DUPLICATE
    ======================================================== */

    if (
        isPlaceInTrip(
            placeId
        )
    ) {

        console.log(
            "ℹ️ LankaWayfarer: Place already exists in My Trip.",
            placeId
        );

        window.location.href =
            "trip-planner.html";

        return false;
    }


    try {

        /* ====================================================
           5. CREATE CLEAN DESTINATION OBJECT
        ==================================================== */

        const latitude =
            Number(
                place.latitude
            );


        const longitude =
            Number(
                place.longitude
            );


        const destinationData = {

            id:
                placeId,

            name:
                String(
                    place.name ?? ""
                ).trim(),

            sinhalaName:
                String(
                    place.sinhalaName ?? ""
                ).trim(),

            title:
                String(
                    place.title ?? ""
                ).trim(),

            category:
                String(
                    place.category ?? ""
                ).trim(),

            categoryName:
                String(
                    place.categoryName ?? ""
                ).trim(),

            province:
                String(
                    place.province ?? ""
                ).trim(),

            district:
                String(
                    place.district ?? ""
                ).trim(),

            location:
                String(
                    place.location ?? ""
                ).trim(),

            image:
                String(
                    place.image ?? ""
                ).trim(),

            rating:
                place.rating ?? "",

            bestTime:
                String(
                    place.bestTime ?? ""
                ).trim(),

            latitude:
                latitude,

            longitude:
                longitude,

            page:
                getAttractionPath(
                    place
                ),

            addedAt:
                new Date().toISOString()

        };


        /* ====================================================
           6. VALIDATE MAP COORDINATES
        ==================================================== */

        if (
            !Number.isFinite(
                latitude
            ) ||
            !Number.isFinite(
                longitude
            )
        ) {

            console.error(
                "❌ LankaWayfarer: Cannot add place without valid coordinates.",
                {
                    id:
                        placeId,

                    name:
                        destinationData.name,

                    latitude:
                        place.latitude,

                    longitude:
                        place.longitude
                }
            );


            alert(
                "This destination does not have valid map coordinates."
            );


            return false;
        }


        /* ====================================================
           7. READ LOCAL TRIP
        ==================================================== */

        let localTrip = [];


        try {

            const storedTrip =
                localStorage.getItem(
                    "sriLankaMyTrip"
                );


            if (storedTrip) {

                const parsedTrip =
                    JSON.parse(
                        storedTrip
                    );


                if (
                    Array.isArray(
                        parsedTrip
                    )
                ) {

                    localTrip =
                        parsedTrip;

                }

            }

        } catch (
            storageError
        ) {

            console.error(
                "❌ LankaWayfarer: Failed to read sriLankaMyTrip.",
                storageError
            );


            throw new Error(
                "Unable to read your current trip."
            );
        }


        /* ====================================================
           8. LOCAL DUPLICATE CHECK
        ==================================================== */

        const localDuplicate =
            localTrip.some(
                destination => {

                    if (
                        !destination ||
                        typeof destination !==
                        "object"
                    ) {

                        return false;
                    }


                    const existingId =
                        String(
                            destination.id ??
                            destination.placeId ??
                            destination.slug ??
                            ""
                        ).trim();


                    return (
                        existingId ===
                        placeId
                    );

                }
            );


        if (
            localDuplicate
        ) {

            console.log(
                "ℹ️ LankaWayfarer: Place already exists in sriLankaMyTrip.",
                placeId
            );


            currentTrip =
                localTrip;


            updateTripCounter();


            window.location.href =
                "trip-planner.html";


            return false;
        }


        /* ====================================================
           9. ADD TO LOCAL TRIP FIRST

           This is the source used by the Trip Planner
           live map.

           IMPORTANT:

           The custom event is dispatched only after the
           localStorage write succeeds.
        ==================================================== */

        localTrip.push(
            destinationData
        );


        localStorage.setItem(
            "sriLankaMyTrip",
            JSON.stringify(
                localTrip
            )
        );


        /* ====================================================
           10. UPDATE ATTRACTIONS PAGE STATE
        ==================================================== */

        currentTrip =
            localTrip;


        updateTripCounter();


        /* ====================================================
           11. FIREBASE SYNC
        ==================================================== */

        const tripRef =
            doc(
                db,
                TRIP_COLLECTION,
                currentUser.uid
            );


        const snapshot =
            await getDoc(
                tripRef
            );


        if (
            snapshot.exists()
        ) {

            await updateDoc(
                tripRef,
                {

                    destinations:
                        arrayUnion(
                            destinationData
                        )

                }
            );

        } else {

            await setDoc(
                tripRef,
                {

                    userId:
                        currentUser.uid,

                    destinations:
                        [
                            destinationData
                        ]

                }
            );

        }


        /* ====================================================
           12. UPDATE BUTTON
        ==================================================== */

        if (
            button
        ) {

            button.classList.add(
                "added"
            );


            button.classList.add(
                "in-trip"
            );


            button.dataset.added =
                "true";


            const textElement =
                button.querySelector(
                    ".add-trip-text"
                );


            if (
                textElement
            ) {

                textElement.textContent =
                    "Added to My Trip";

            } else {

                button.textContent =
                    "✓ Added to My Trip";

            }

        }


        /* ====================================================
           13. LIVE CUSTOM EVENT

           IMPORTANT:

           "storage" event does NOT fire in the same tab
           that changed localStorage.

           Therefore Trip Planner listens for this event.

           trip-map.js should listen for:

               lankawayfarer-trip-updated
        ==================================================== */

        window.dispatchEvent(
            new CustomEvent(
                "lankaquest-trip-updated",
                {
                    detail: {

                        action:
                            "add",

                        place:
                            destinationData,

                        trip:
                            localTrip

                    }
                }
            )
        );


        /* ====================================================
           14. PRODUCTION LOG
        ==================================================== */

        console.log("✅ LankaWayfarer: Destination added successfully.", {
          id: destinationData.id,

          name: destinationData.name,

          latitude: destinationData.latitude,

          longitude: destinationData.longitude,

          localTripCount: localTrip.length,

          firebase: true,

          localStorage: true,

          liveEvent: "LankaWayfarer-trip-updated",
        });


        return true;


    } catch (
        error
    ) {

        console.error("❌ LankaWayfarer: Unable to add destination.", error);


        /* ====================================================
           FIRESTORE PERMISSION
        ==================================================== */

        if (
            error.code ===
            "permission-denied"
        ) {

            alert(
                "You do not have permission to add this destination. Please check your account."
            );


            return false;
        }


        /* ====================================================
           NETWORK
        ==================================================== */

        if (
            error.code ===
            "unavailable"
        ) {

            alert(
                "Network error. Please check your internet connection and try again."
            );


            return false;
        }


        /* ====================================================
           DEFAULT
        ==================================================== */

        alert(
            error.message ||
            "Unable to add this destination to My Trip. Please try again."
        );


        return false;
    }

}



/* ============================================================
   16. CREATE PROVINCE FILTERS
============================================================ */

function renderProvinceFilters() {

    if (
        !provinceFilter
    ) {

        return;

    }


    const provinceMap =
        new Map();


    places.forEach(
        place => {

            const slug =
                slugify(
                    place.province
                );


            if (
                !slug
            ) {

                return;

            }


            if (
                !provinceMap.has(
                    slug
                )
            ) {

                provinceMap.set(
                    slug,
                    {

                        name:
                            place.province,

                        count:
                            0

                    }
                );

            }


            provinceMap.get(
                slug
            ).count++;

        }
    );


    provinceFilter.innerHTML =
        "";


    const allButton =
        document.createElement(
            "button"
        );


    allButton.type =
        "button";


    allButton.className =
        "province-filter-button active";


    allButton.dataset.province =
        "all";


    allButton.textContent =
        `All Provinces (${places.length})`;


    provinceFilter.appendChild(
        allButton
    );


    provinceMap.forEach(
        (
            province,
            slug
        ) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "province-filter-button";


            button.dataset.province =
                slug;


            button.textContent =
                `${province.name} (${province.count})`;


            provinceFilter.appendChild(
                button
            );

        }
    );


    provinceFilter
        .querySelectorAll(
            ".province-filter-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        currentProvince =
                            button.dataset.province ||
                            "all";


                        provinceFilter
                            .querySelectorAll(
                                ".province-filter-button"
                            )
                            .forEach(
                                item => {

                                    item.classList.toggle(
                                        "active",
                                        item ===
                                        button
                                    );

                                }
                            );


                        applyProvinceFilter();

                    }
                );

            }
        );

}


/* ============================================================
   17. APPLY PROVINCE FILTER
============================================================ */

function applyProvinceFilter() {

    if (
        !provinceGrid
    ) {

        return;

    }


    const cards =
        provinceGrid.querySelectorAll(
            ".province-card"
        );


    let visibleCount =
        0;


    cards.forEach(
        card => {

            const cardProvince =
                normalizeText(
                    card.dataset.province
                );


            const matches =
                currentProvince ===
                    "all" ||
                cardProvince ===
                    currentProvince;


            card.hidden =
                !matches;


            if (
                matches
            ) {

                visibleCount++;

            }

        }
    );


    if (
        noProvinceResults
    ) {

        noProvinceResults.hidden =
            visibleCount > 0;

    }

}


/* ============================================================
   18. SEARCH MATCH SCORE
============================================================ */

function getSearchScore(
    place,
    query
) {

    const q =
        normalizeText(
            query
        );


    const name =
        normalizeText(
            place.name
        );


    const sinhalaName =
        normalizeText(
            place.sinhalaName
        );


    const title =
        normalizeText(
            place.title
        );


    const district =
        normalizeText(
            place.district
        );


    const province =
        normalizeText(
            place.province
        );


    const category =
        normalizeText(
            place.categoryName
        );


    if (
        name === q
    ) {

        return 100;

    }


    if (
        sinhalaName === q
    ) {

        return 95;

    }


    if (
        title === q
    ) {

        return 90;

    }


    if (
        name.startsWith(q)
    ) {

        return 80;

    }


    if (
        sinhalaName.startsWith(q)
    ) {

        return 75;

    }


    if (
        district === q
    ) {

        return 70;

    }


    if (
        province === q
    ) {

        return 65;

    }


    if (
        category === q
    ) {

        return 60;

    }


    if (
        name.includes(q)
    ) {

        return 50;

    }


    if (
        title.includes(q)
    ) {

        return 45;

    }


    return 10;

}


/* ============================================================
   19. FIND SEARCH RESULTS
============================================================ */

function findSearchResults(
    query
) {

    const q =
        normalizeText(
            query
        );


    if (
        !q
    ) {

        return [];

    }


    const results =
        places

            .filter(
                place => {

                    const provinceMatch =
                        currentProvince ===
                            "all" ||
                        slugify(
                            place.province
                        ) ===
                            currentProvince;


                    if (
                        !provinceMatch
                    ) {

                        return false;

                    }


                    return getSearchText(
                        place
                    ).includes(
                        q
                    );

                }
            )

            .map(
                place => ({

                    place,

                    score:
                        getSearchScore(
                            place,
                            q
                        )

                })
            )

            .sort(
                (
                    a,
                    b
                ) =>
                    b.score -
                    a.score
            )

            .slice(
                0,
                8
            );


    return results;

}


/* ============================================================
   20. RENDER SEARCH DROPDOWN
============================================================ */

function renderSearchResults(
    query
) {

    if (
        !attractionSearchResults
    ) {

        return;

    }


    const q =
        normalizeText(
            query
        );


    if (
        !q
    ) {

        attractionSearchResults.innerHTML =
            "";


        attractionSearchResults.hidden =
            true;


        return;

    }


    const results =
        findSearchResults(
            q
        );


    attractionSearchResults.innerHTML =
        "";


    if (
        results.length ===
        0
    ) {

        attractionSearchResults.innerHTML = `

            <div class="search-no-results">

                <span>
                    🔍
                </span>

                <p>
                    No attractions found
                </p>

            </div>

        `;


        attractionSearchResults.hidden =
            false;


        return;

    }


    results.forEach(
        ({
            place
        }) => {

            const item =
                document.createElement(
                    "a"
                );


            item.className =
                "attraction-search-result";


            item.href =
                getAttractionPath(
                    place
                );


            const image =
                place.image
                    ? `
                        <img
                            src="${escapeHTML(
                                place.image
                            )}"
                            alt="${escapeHTML(
                                place.name
                            )}"
                            loading="lazy"
                        >
                      `
                    : `
                        <div
                            class="search-result-placeholder"
                        >
                            🇱🇰
                        </div>
                      `;


            item.innerHTML = `

                <div
                    class="search-result-image"
                >

                    ${image}

                </div>


                <div
                    class="search-result-content"
                >

                    <strong>
                        ${escapeHTML(
                            place.name
                        )}
                    </strong>


                    ${
                        place.sinhalaName
                            ? `
                                <span>
                                    ${escapeHTML(
                                        place.sinhalaName
                                    )}
                                </span>
                              `
                            : ""
                    }


                    <small>

                        ${escapeHTML(
                            place.district ||
                            ""
                        )}

                        ·

                        ${escapeHTML(
                            place.province ||
                            ""
                        )}

                    </small>

                </div>


                <span
                    class="search-result-arrow"
                >
                    →
                </span>

            `;


            item.addEventListener(
                "click",
                () => {

                    hideSearchResults();

                }
            );


            attractionSearchResults.appendChild(
                item
            );

        }
    );


    attractionSearchResults.hidden =
        false;

}


/* ============================================================
   21. HIDE SEARCH RESULTS
============================================================ */

function hideSearchResults() {

    if (
        !attractionSearchResults
    ) {

        return;

    }


    attractionSearchResults.hidden =
        true;

}


/* ============================================================
   22. SEARCH INPUT
============================================================ */

function initializeSearch() {

    if (
        !attractionSearch
    ) {

        return;

    }


    attractionSearch.addEventListener(
        "input",
        event => {

            const value =
                event.target.value;


            clearTimeout(
                searchTimer
            );


            searchTimer =
                setTimeout(
                    () => {

                        renderSearchResults(
                            value
                        );

                    },
                    80
                );

        }
    );


    attractionSearch.addEventListener(
        "focus",
        () => {

            if (
                attractionSearch.value.trim()
            ) {

                renderSearchResults(
                    attractionSearch.value
                );

            }

        }
    );


    attractionSearch.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                hideSearchResults();


                attractionSearch.blur();

            }


            if (
                event.key ===
                "Enter"
            ) {

                const firstResult =
                    attractionSearchResults
                        ?.querySelector(
                            ".attraction-search-result"
                        );


                if (
                    firstResult
                ) {

                    event.preventDefault();


                    firstResult.click();

                }

            }

        }
    );

}


/* ============================================================
   23. CLICK OUTSIDE SEARCH
============================================================ */

document.addEventListener(
    "click",
    event => {

        if (
            !attractionSearchResults
        ) {

            return;

        }


        if (
            attractionSearchResults.contains(
                event.target
            )
        ) {

            return;

        }


        if (
            attractionSearch &&
            attractionSearch.contains(
                event.target
            )
        ) {

            return;

        }


        hideSearchResults();

    }
);


/* ============================================================
   24. MOBILE MENU
============================================================ */

function initializeMobileMenu() {

    if (
        !mobileMenuButton ||
        !mainNavigation
    ) {

        return;

    }


    mobileMenuButton.addEventListener(
        "click",
        () => {

            const opened =
                mainNavigation.classList.toggle(
                    "mobile-navigation-open"
                );


            mobileMenuButton.setAttribute(
                "aria-expanded",
                opened
                    ? "true"
                    : "false"
            );

        }
    );


    mainNavigation
        .querySelectorAll(
            "a"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        mainNavigation.classList.remove(
                            "mobile-navigation-open"
                        );


                        mobileMenuButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            }
        );

}


/* ============================================================
   25. MY TRIP BUTTON
============================================================ */

function initializeMyTripButton() {

    if (
        !myTripButton
    ) {

        return;

    }


    myTripButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "trip-planner.html";

        }
    );

}


/* ============================================================
   26. INITIALIZE FIREBASE AUTH
============================================================ */

function initializeAuth() {

    onAuthStateChanged(
        auth,
        async user => {

            currentUser =
                user;


            console.log(
                "🔥 Firebase user:",
                user
                    ? user.uid
                    : "Not logged in"
            );


            await loadTrip();

        }
    );

}


/* ============================================================
   27. INITIALIZE
============================================================ */

async function initializeAttractions() {

    console.log(
        "🇱🇰 LankaWayfarer Attractions initializing..."
    );


    const loaded =
        await loadSearchIndex();


    if (
        !loaded
    ) {

        return;

    }


    renderProvinceFilters();


    applyProvinceFilter();


    initializeSearch();


    initializeMobileMenu();


    initializeMyTripButton();


    initializeAuth();


    console.log(
        "✅ LankaWayfarer Attractions ready."
    );

}


/* ============================================================
   28. START
============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeAttractions
    );

} else {

    initializeAttractions();

}

