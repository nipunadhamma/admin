
/* ============================================================
   LANKAQUEST
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
            "🔎 Loading LankaQuest search index..."
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
            `🇱🇰 LankaQuest search index loaded: ${places.length} places`
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
============================================================ */

async function addPlaceToTrip(
    place,
    button
) {

    if (
        !currentUser
    ) {

        const redirect =
            encodeURIComponent(
                "attractions.html"
            );


        window.location.href =
            `login.html?redirect=${redirect}`;


        return;

    }


    if (
        isPlaceInTrip(
            place.id
        )
    ) {

        window.location.href =
            "trip-planner.html";


        return;

    }


    try {

        const tripRef =
            doc(
                db,
                TRIP_COLLECTION,
                currentUser.uid
            );


        const destinationData = {

            id:
                place.id ||
                "",

            name:
                place.name ||
                "",

            sinhalaName:
                place.sinhalaName ||
                "",

            title:
                place.title ||
                "",

            category:
                place.category ||
                "",

            categoryName:
                place.categoryName ||
                "",

            province:
                place.province ||
                "",

            district:
                place.district ||
                "",

            location:
                place.location ||
                "",

            image:
                place.image ||
                "",

            rating:
                place.rating ??
                "",

            bestTime:
                place.bestTime ||
                "",

            page:
                getAttractionPath(
                    place
                ),

            addedAt:
                new Date().toISOString()

        };


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


        currentTrip.push(
            destinationData
        );


        updateTripCounter();


        if (
            button
        ) {

            button.classList.add(
                "added"
            );


            button.textContent =
                "✓ Added to My Trip";

        }


        console.log(
            "✅ Added to My Trip:",
            place.name
        );

    } catch (
        error
    ) {

        console.error(
            "❌ Unable to add destination:",
            error
        );


        alert(
            "Unable to add this destination to My Trip. Please try again."
        );

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
        "🇱🇰 LankaQuest Attractions initializing..."
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
        "✅ LankaQuest Attractions ready."
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

