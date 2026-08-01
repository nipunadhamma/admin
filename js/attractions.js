
/* ============================================================
   LANKAQUEST
   ATTRACTIONS SYSTEM
   FINAL VERSION

   DATA SOURCE
      js/places.js
          ↓
      window.touristPlaces
          ↓
      attractions.html

   STRUCTURE

      Province
          ↓
      District
          ↓
      Attraction

   FEATURES

      • Automatic province generation
      • Automatic district generation
      • Automatic attraction cards
      • Featured attractions
      • Search
      • Province filtering
      • Sinhala name search
      • Category search
      • District search
      • Location search
      • Rating
      • Best time
      • Destination page navigation
      • Firebase My Trip
      • Mobile menu
============================================================ */


/* ============================================================
   FIREBASE
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
   DATA SOURCE CHECK
============================================================ */

const touristPlaces = Array.isArray(
    window.touristPlaces
)
    ? window.touristPlaces
    : [];


console.log(
    "🇱🇰 LankaQuest Places:",
    touristPlaces.length
);


/* ============================================================
   FIRESTORE COLLECTION
============================================================ */

const TRIP_COLLECTION =
    "lankaQuestTouristTrips";


/* ============================================================
   DOM ELEMENTS
============================================================ */

const attractionSearch =
    document.getElementById(
        "attractionSearch"
    );


const clearAttractionSearch =
    document.getElementById(
        "clearAttractionSearch"
    );


const attractionSearchInfo =
    document.getElementById(
        "attractionSearchInfo"
    );


const provinceFilter =
    document.getElementById(
        "provinceFilter"
    );


const provinceGrid =
    document.getElementById(
        "provinceGrid"
    );


const featuredAttractions =
    document.getElementById(
        "featuredAttractions"
    );


const featuredSection =
    document.getElementById(
        "featuredSection"
    );


const noProvinceResults =
    document.getElementById(
        "noProvinceResults"
    );


const resetAttractionSearch =
    document.getElementById(
        "resetAttractionSearch"
    );


const attractionsLoading =
    document.getElementById(
        "attractionsLoading"
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
   STATE
============================================================ */

let currentProvince =
    "all";


let currentSearch =
    "";


let currentUser =
    null;


let currentTrip =
    [];


/* ============================================================
   TEXT NORMALIZER
============================================================ */

function normalizeText(value) {

    return String(
        value ?? ""
    )
        .toLowerCase()
        .trim();

}


/* ============================================================
   HTML ESCAPE
============================================================ */

function escapeHTML(value) {

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
   SLUG
============================================================ */

function slugify(value) {

    return String(
        value ?? ""
    )
        .toLowerCase()
        .trim()
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
   GET PLACE IMAGE
============================================================ */

function getPlaceImage(place) {

    if (
        place &&
        place.image
    ) {

        return place.image;

    }


    return "";

}


/* ============================================================
   GET PLACE PAGE
============================================================ */

function getPlacePage(place) {

    if (
        place &&
        place.page
    ) {

        return place.page;

    }


    /*
       Fallback

       This allows future places that do not yet
       have a page field.
    */

    const id =
        place.id ||
        slugify(place.name);


    return `destinations/${id}.html`;

}


/* ============================================================
   CHECK TRIP
============================================================ */

function isPlaceInTrip(placeId) {

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
   CREATE PLACE SEARCH TEXT
============================================================ */

function getPlaceSearchText(place) {

    return [

        place.id,

        place.name,

        place.sinhalaName,

        place.title,

        place.shortDescription,

        place.description,

        place.category,

        place.categoryName,

        place.province,

        place.district,

        place.location,

        place.bestTime

    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

}


/* ============================================================
   CREATE PROVINCE DATA
============================================================ */

function getProvinceData() {

    const provinceMap =
        new Map();


    touristPlaces.forEach(
        place => {

            const provinceName =
                place.province ||
                "Unknown Province";


            const provinceSlug =
                slugify(
                    provinceName
                );


            if (
                !provinceMap.has(
                    provinceSlug
                )
            ) {

                provinceMap.set(
                    provinceSlug,
                    {

                        name:
                            provinceName,

                        slug:
                            provinceSlug,

                        places: []

                    }
                );

            }


            provinceMap
                .get(
                    provinceSlug
                )
                .places
                .push(
                    place
                );

        }
    );


    return Array.from(
        provinceMap.values()
    );

}


/* ============================================================
   CREATE PROVINCE FILTER BUTTONS
============================================================ */

function renderProvinceFilters() {

    if (!provinceFilter) {

        return;

    }


    const provinces =
        getProvinceData();


    provinceFilter.innerHTML = "";


    /*
       ALL PROVINCES
    */

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
        `All Provinces (${touristPlaces.length})`;


    provinceFilter.appendChild(
        allButton
    );


    /*
       INDIVIDUAL PROVINCES
    */

    provinces.forEach(
        province => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "province-filter-button";


            button.dataset.province =
                province.slug;


            button.textContent =
                `${province.name} (${province.places.length})`;


            provinceFilter.appendChild(
                button
            );

        }
    );


    /*
       CLICK HANDLER
    */

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

                                    item.classList
                                        .toggle(
                                            "active",
                                            item ===
                                            button
                                        );

                                }
                            );


                        renderAttractions();

                    }
                );

            }
        );

}


/* ============================================================
   CREATE FEATURED CARD
============================================================ */

function createAttractionCard(
    place
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "attraction-card";


    article.dataset.placeId =
        place.id || "";


    article.dataset.search =
        getPlaceSearchText(
            place
        );


    const image =
        getPlaceImage(
            place
        );


    const page =
        getPlacePage(
            place
        );


    const rating =
        place.rating !==
            undefined &&
        place.rating !==
            null &&
        place.rating !==
            ""
            ? `⭐ ${escapeHTML(place.rating)}`
            : "";


    const featuredBadge =
        place.featured
            ? `
                <span class="featured">
                    ⭐ Featured
                </span>
              `
            : "";


    const sinhalaName =
        place.sinhalaName
            ? `
                <div class="attraction-sinhala-name">
                    ${escapeHTML(
                        place.sinhalaName
                    )}
                </div>
              `
            : "";


    const bestTime =
        place.bestTime
            ? `
                <span>
                    🗓️ ${escapeHTML(
                        place.bestTime
                    )}
                </span>
              `
            : "";


    const tripAdded =
        isPlaceInTrip(
            place.id
        );


    const tripButtonText =
        tripAdded
            ? "✓ Added to My Trip"
            : "❤️ Add to My Trip";


    const imageHTML =
        image
            ? `
                <div class="attraction-image">

                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(
                            place.name
                        )}"
                        loading="lazy"
                    >

                </div>
              `
            : `
                <div class="attraction-image">

                    <div class="province-placeholder">
                        🇱🇰
                    </div>

                </div>
              `;


    article.innerHTML = `

        ${imageHTML}


        <div class="attraction-content">


            ${featuredBadge}


            <span class="attraction-category">

                ${escapeHTML(
                    place.categoryName ||
                    place.category ||
                    "Attraction"
                )}

            </span>


            <h3>

                ${escapeHTML(
                    place.name ||
                    "Unnamed Attraction"
                )}

            </h3>


            ${sinhalaName}


            <p>

                ${escapeHTML(
                    place.shortDescription ||
                    place.description ||
                    ""
                )}

            </p>


            <div class="attraction-meta">


                <span>

                    📍
                    ${escapeHTML(
                        place.district ||
                        ""
                    )}

                </span>


                ${
                    rating
                        ? `
                            <span>
                                ${rating}
                            </span>
                          `
                        : ""
                }


            </div>


            ${
                bestTime
                    ? `
                        <div class="attraction-best-time">
                            ${bestTime}
                        </div>
                      `
                    : ""
            }


            <div class="attraction-actions">


                <a
                    href="${escapeHTML(page)}"
                    class="attraction-action view-place"
                >

                    View Details →

                </a>


                <button
                    type="button"
                    class="attraction-action trip-button ${
                        tripAdded
                            ? "added"
                            : ""
                    }"
                    data-place-id="${escapeHTML(
                        place.id ||
                        ""
                    )}"
                >

                    ${tripButtonText}

                </button>


            </div>


        </div>

    `;


    /*
       ADD TO TRIP
    */

    const tripButton =
        article.querySelector(
            ".trip-button"
        );


    if (tripButton) {

        tripButton.addEventListener(
            "click",
            async () => {

                await addPlaceToTrip(
                    place,
                    tripButton
                );

            }
        );

    }


    return article;

}


/* ============================================================
   CREATE DISTRICT SECTION
============================================================ */

function createDistrictSection(
    district
) {

    const section =
        document.createElement(
            "section"
        );


    section.className =
        "district-section";


    section.dataset.district =
        district.slug;


    section.innerHTML = `

        <div class="district-header">


            <h2>

                📍
                ${escapeHTML(
                    district.name
                )}

            </h2>


            <p>

                ${district.places.length}
                attraction${
                    district.places.length ===
                    1
                        ? ""
                        : "s"
                }

            </p>


        </div>


        <div class="attraction-grid">

        </div>

    `;


    const grid =
        section.querySelector(
            ".attraction-grid"
        );


    district.places.forEach(
        place => {

            grid.appendChild(
                createAttractionCard(
                    place
                )
            );

        }
    );


    return section;

}


/* ============================================================
   CREATE PROVINCE SECTION
============================================================ */

function createProvinceSection(
    province
) {

    const section =
        document.createElement(
            "section"
        );


    section.className =
        "province-section";


    section.dataset.province =
        province.slug;


    const districtMap =
        new Map();


    province.places.forEach(
        place => {

            const districtName =
                place.district ||
                "Unknown District";


            const districtSlug =
                slugify(
                    districtName
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
                            districtName,

                        slug:
                            districtSlug,

                        places: []

                    }
                );

            }


            districtMap
                .get(
                    districtSlug
                )
                .places
                .push(
                    place
                );

        }
    );


    const districts =
        Array.from(
            districtMap.values()
        );


    section.innerHTML = `

        <div class="province-detail-hero">


            <h2>

                ${escapeHTML(
                    province.name
                )}

            </h2>


            <p>

                Explore
                ${province.places.length}
                attractions across
                ${districts.length}
                district${
                    districts.length ===
                    1
                        ? ""
                        : "s"
                }.

            </p>


        </div>


        <div class="province-districts">

        </div>

    `;


    const districtsContainer =
        section.querySelector(
            ".province-districts"
        );


    districts.forEach(
        district => {

            districtsContainer.appendChild(
                createDistrictSection(
                    district
                )
            );

        }
    );


    return section;

}


/* ============================================================
   FILTER PLACES
============================================================ */

function getFilteredPlaces() {

    return touristPlaces.filter(
        place => {

            /*
               PROVINCE
            */

            const provinceMatch =
                currentProvince ===
                    "all" ||
                slugify(
                    place.province
                ) ===
                    currentProvince;


            if (!provinceMatch) {

                return false;

            }


            /*
               SEARCH
            */

            if (
                !currentSearch
            ) {

                return true;

            }


            const searchableText =
                getPlaceSearchText(
                    place
                );


            return searchableText
                .includes(
                    currentSearch
                );

        }
    );

}


/* ============================================================
   RENDER FEATURED
============================================================ */

function renderFeatured() {

    if (
        !featuredAttractions
    ) {

        return;

    }


    const featured =
        touristPlaces
            .filter(
                place =>
                    Boolean(
                        place.featured
                    )
            )
            .slice(
                0,
                12
            );


    featuredAttractions.innerHTML =
        "";


    if (
        featured.length ===
        0
    ) {

        if (
            featuredSection
        ) {

            featuredSection.hidden =
                true;

        }

        return;

    }


    if (
        featuredSection
    ) {

        featuredSection.hidden =
            false;

    }


    featured.forEach(
        place => {

            featuredAttractions.appendChild(
                createAttractionCard(
                    place
                )
            );

        }
    );

}


/* ============================================================
   RENDER MAIN ATTRACTIONS
============================================================ */

function renderAttractions() {

    if (
        !provinceGrid
    ) {

        return;

    }


    provinceGrid.innerHTML =
        "";


    const filteredPlaces =
        getFilteredPlaces();


    /*
       SEARCH INFO
    */

    if (
        attractionSearchInfo
    ) {

        if (
            currentSearch
        ) {

            attractionSearchInfo.textContent =
                `${filteredPlaces.length} attraction${
                    filteredPlaces.length ===
                    1
                        ? ""
                        : "s"
                } found for "${currentSearch}"`;

        } else {

            attractionSearchInfo.textContent =
                `${filteredPlaces.length} attractions`;

        }

    }


    /*
       NO RESULTS
    */

    if (
        filteredPlaces.length ===
        0
    ) {

        if (
            noProvinceResults
        ) {

            noProvinceResults.hidden =
                false;

        }


        return;

    }


    if (
        noProvinceResults
    ) {

        noProvinceResults.hidden =
            true;

    }


    /*
       GROUP BY PROVINCE
    */

    const provinceMap =
        new Map();


    filteredPlaces.forEach(
        place => {

            const provinceName =
                place.province ||
                "Unknown Province";


            const provinceSlug =
                slugify(
                    provinceName
                );


            if (
                !provinceMap.has(
                    provinceSlug
                )
            ) {

                provinceMap.set(
                    provinceSlug,
                    {

                        name:
                            provinceName,

                        slug:
                            provinceSlug,

                        places: []

                    }
                );

            }


            provinceMap
                .get(
                    provinceSlug
                )
                .places
                .push(
                    place
                );

        }
    );


    /*
       CREATE PROVINCE SECTIONS
    */

    provinceMap.forEach(
        province => {

            provinceGrid.appendChild(
                createProvinceSection(
                    province
                )
            );

        }
    );


    /*
       SEARCH RESULT SCROLL

       If user searched, move to
       results instead of staying
       at the top of the page.
    */

    if (
        currentSearch
    ) {

        setTimeout(
            () => {

                provinceGrid.scrollIntoView(
                    {
                        behavior:
                            "smooth",

                        block:
                            "start"

                    }
                );

            },
            50
        );

    }

}


/* ============================================================
   SEARCH
============================================================ */

function handleSearch(
    value
) {

    currentSearch =
        normalizeText(
            value
        );


    if (
        clearAttractionSearch
    ) {

        clearAttractionSearch.hidden =
            !currentSearch;

    }


    renderAttractions();

}


/* ============================================================
   CLEAR SEARCH
============================================================ */

function clearSearch() {

    currentSearch =
        "";


    if (
        attractionSearch
    ) {

        attractionSearch.value =
            "";

    }


    if (
        clearAttractionSearch
    ) {

        clearAttractionSearch.hidden =
            true;

    }


    renderAttractions();

}


/* ============================================================
   RESET ALL FILTERS
============================================================ */

function resetFilters() {

    currentProvince =
        "all";


    currentSearch =
        "";


    if (
        attractionSearch
    ) {

        attractionSearch.value =
            "";

    }


    if (
        clearAttractionSearch
    ) {

        clearAttractionSearch.hidden =
            true;

    }


    if (
        provinceFilter
    ) {

        provinceFilter
            .querySelectorAll(
                ".province-filter-button"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",

                        button.dataset.province ===
                            "all"
                    );

                }
            );

    }


    renderAttractions();

}


/* ============================================================
   FIREBASE TRIP
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


        const tripSnapshot =
            await getDoc(
                tripRef
            );


        if (
            !tripSnapshot.exists()
        ) {

            currentTrip =
                [];

        } else {

            const data =
                tripSnapshot.data();


            currentTrip =
                Array.isArray(
                    data.destinations
                )
                    ? data.destinations
                    : [];

        }


    } catch (
        error
    ) {

        console.error(
            "❌ Trip loading error:",
            error
        );


        currentTrip =
            [];

    }


    updateTripCounter();

}


/* ============================================================
   UPDATE TRIP COUNTER
============================================================ */

function updateTripCounter() {

    if (
        !tripCounter
    ) {

        return;

    }


    tripCounter.textContent =
        currentTrip.length;


    tripCounter.style.display =
        currentTrip.length > 0
            ? ""
            : "none";

}


/* ============================================================
   ADD PLACE TO TRIP
============================================================ */

async function addPlaceToTrip(
    place,
    button
) {

    /*
       LOGIN REQUIRED
    */

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


    /*
       ALREADY ADDED
    */

    if (
        isPlaceInTrip(
            place.id
        )
    ) {

        /*
           Go to My Trip instead of
           adding duplicate.
        */

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


        /*
           Store the complete destination
           snapshot.

           This means the trip planner does
           not need to search places.js
           to display the saved destination.
        */

        const destinationData = {

            id:
                place.id,

            name:
                place.name || "",

            sinhalaName:
                place.sinhalaName || "",

            title:
                place.title || "",

            category:
                place.category || "",

            categoryName:
                place.categoryName || "",

            province:
                place.province || "",

            district:
                place.district || "",

            location:
                place.location || "",

            image:
                place.image || "",

            rating:
                place.rating ?? "",

            bestTime:
                place.bestTime || "",

            page:
                place.page || "",

            addedAt:
                new Date().toISOString()

        };


        const tripSnapshot =
            await getDoc(
                tripRef
            );


        if (
            tripSnapshot.exists()
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


        /*
           Update local state
        */

        currentTrip.push(
            destinationData
        );


        updateTripCounter();


        /*
           Update button
        */

        if (button) {

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
   MOBILE MENU
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

            const isOpen =
                mainNavigation.classList.toggle(
                    "mobile-navigation-open"
                );


            mobileMenuButton.setAttribute(
                "aria-expanded",

                isOpen
                    ? "true"
                    : "false"
            );

        }
    );

}


/* ============================================================
   MY TRIP BUTTON
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
   SEARCH EVENTS
============================================================ */

function initializeSearch() {

    if (
        attractionSearch
    ) {

        attractionSearch.addEventListener(
            "input",
            event => {

                handleSearch(
                    event.target.value
                );

            }
        );

    }


    if (
        clearAttractionSearch
    ) {

        clearAttractionSearch.addEventListener(
            "click",
            clearSearch
        );

    }


    if (
        resetAttractionSearch
    ) {

        resetAttractionSearch.addEventListener(
            "click",
            resetFilters
        );

    }

}


/* ============================================================
   FIREBASE AUTH STATE
============================================================ */

function initializeAuth() {

    onAuthStateChanged(
        auth,
        async user => {

            currentUser =
                user;


            console.log(
                "Firebase user:",
                user
                    ? user.uid
                    : "Not logged in"
            );


            await loadTrip();


            /*
               Re-render cards because
               Add to My Trip buttons depend
               on current trip state.
            */

            renderFeatured();

            renderAttractions();

        }
    );

}


/* ============================================================
   HIDE LOADING
============================================================ */

function hideLoading() {

    if (
        attractionsLoading
    ) {

        attractionsLoading.hidden =
            true;

    }

}


/* ============================================================
   INITIALIZE
============================================================ */

function initializeAttractions() {

    /*
       Data check
    */

    if (
        touristPlaces.length ===
        0
    ) {

        console.error(
            "❌ No tourist places found."
        );


        if (
            attractionsLoading
        ) {

            attractionsLoading.hidden =
                true;

        }


        if (
            noProvinceResults
        ) {

            noProvinceResults.hidden =
                false;

        }


        return;

    }


    /*
       Province filters
    */

    renderProvinceFilters();


    /*
       Initial featured
    */

    renderFeatured();


    /*
       Initial attractions
    */

    renderAttractions();


    /*
       Search
    */

    initializeSearch();


    /*
       Mobile menu
    */

    initializeMobileMenu();


    /*
       My Trip
    */

    initializeMyTripButton();


    /*
       Firebase authentication
    */

    initializeAuth();


    /*
       Loading complete
    */

    hideLoading();


    console.log(
        "=============================================="
    );


    console.log(
        "🇱🇰 LankaQuest Attractions System"
    );


    console.log(
        "=============================================="
    );


    console.log(
        `Places: ${touristPlaces.length}`
    );


    console.log(
        `Provinces: ${getProvinceData().length}`
    );


    console.log(
        "Search: Ready"
    );


    console.log(
        "Firebase Trip: Ready"
    );


    console.log(
        "=============================================="
    );

}


/* ============================================================
   START
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

