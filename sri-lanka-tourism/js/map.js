
/* ============================================================
   SRI LANKA INTERACTIVE TOURIST MAP

   Features:

   🗺️ Interactive Map
   📌 Tourist Markers
   🔍 Search
   🏛️ Category Filter
   📍 Auto Zoom
   💬 Popup
============================================================ */


/* ============================================================
   1. MAP INITIALIZATION
============================================================ */

const sriLankaCenter = [
    7.8731,
    80.7718
];


const map = L.map("map").setView(
    sriLankaCenter,
    7
);


/* ============================================================
   2. OPEN STREET MAP
============================================================ */

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,

        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);


/* ============================================================
   3. GLOBAL VARIABLES
============================================================ */


/*
   සියලුම Marker මෙතැන save කරමු.

   පසුව Filter කරන විට
   Marker hide/show කරන්න මේක භාවිතා කරමු.
*/

const markers = {};


/*
   දැනට තෝරා ඇති Category එක

   Default:
   all
*/

let activeCategory = "all";


/* ============================================================
   4. CREATE POPUP
============================================================ */

function createPopup(place) {


    return `

        <div class="tourist-popup">


            <!-- Main Image -->

            <img
                src="${place.image}"
                alt="${place.name}"
            >


            <!-- Content -->

            <div class="popup-content">


                <h3>
                    📌 ${place.name}
                </h3>


                <h4>
                    ${place.sinhalaName}
                </h4>


                <p>
                    ${place.shortDescription}
                </p>


                <div class="popup-rating">

                    ⭐ ${place.rating}

                </div>


                <a
                    href="${place.page}"
                    class="view-details-btn"
                >

                    View Details →

                </a>


            </div>


        </div>

    `;

}


/* ============================================================
   5. CREATE ALL MAP MARKERS
============================================================ */

touristPlaces.forEach(place => {


    /*
       Marker එක create කිරීම
    */

    const marker = L.marker(
        place.coordinates
    );


    /*
       Popup එක attach කිරීම
    */

    marker.bindPopup(
        createPopup(place),
        {
            maxWidth: 300
        }
    );


    /*
       Marker එක save කිරීම

       Example:

       markers["sigiriya"]
       markers["kandy"]

    */

    markers[place.id] = marker;


    /*
       Map එකට add කිරීම
    */

    marker.addTo(map);

});


/* ============================================================
   6. SHOW / HIDE MARKERS
============================================================ */

function updateMapMarkers() {


    touristPlaces.forEach(place => {


        /*
           මේ Place එකේ Marker එක ලබාගැනීම
        */

        const marker =
            markers[place.id];


        /*
           Category Match කිරීම
        */

        const categoryMatch =

            activeCategory === "all" ||

            place.category === activeCategory;


        /*
           Category එකට ගැලපෙනවා නම්
           Marker පෙන්වන්න
        */

        if (categoryMatch) {

            marker.addTo(map);

        }

        /*
           ගැලපෙන්නේ නැත්නම්
           Marker ඉවත් කරන්න
        */

        else {

            map.removeLayer(marker);

        }

    });

}


/* ============================================================
   7. CATEGORY FILTER
============================================================ */

const categoryButtons =

    document.querySelectorAll(
        ".category-btn"
    );


categoryButtons.forEach(button => {


    button.addEventListener(
        "click",
        () => {


            /*
               Active Category ලබාගැනීම
            */

            activeCategory =
                button.dataset.category;


            /*
               Active Button වෙනස් කිරීම
            */

            categoryButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            /*
               Map Markers Update කිරීම
            */

            updateMapMarkers();


            /*
               Search Results Clear කිරීම
            */

            document.getElementById(
                "searchResults"
            ).innerHTML = "";

        }
    );

});


/* ============================================================
   8. LIVE SEARCH / AUTOCOMPLETE
============================================================ */


/*
   Search Input
*/

const searchInput =

    document.getElementById(
        "placeSearch"
    );


/*
   Live Suggestions Container
*/

const searchSuggestions =

    document.getElementById(
        "searchSuggestions"
    );


/*
   Clear Button
*/

const clearSearch =

    document.getElementById(
        "clearSearch"
    );


/* ============================================================
   SEARCH INPUT EVENT
============================================================ */

searchInput.addEventListener(
    "input",
    () => {


        /*
           User type කරන text එක ලබාගන්නවා
        */

        const searchText =

            searchInput.value
                .toLowerCase()
                .trim();


        /*
           Search text තිබෙනවා නම්
           Clear button පෙන්වන්න
        */

        if (searchText.length > 0) {

            clearSearch.style.display =
                "block";

        }

        else {

            clearSearch.style.display =
                "none";

        }


        /*
           අකුරු 1ක්වත් නැත්නම්
           Suggestions hide කරන්න
        */

        if (
            searchText.length === 0
        ) {

            searchSuggestions.innerHTML =
                "";

            searchSuggestions.style.display =
                "none";

            return;

        }


        /*
           Search කිරීම
        */

        const results =

            touristPlaces.filter(
                place => {


                    /*
                       Category Filter
                    */

                    const categoryMatch =

                        activeCategory ===
                            "all"

                        ||

                        place.category ===
                            activeCategory;


                    /*
                       Search Fields

                       English Name
                       Sinhala Name
                       District
                       Province
                       Category
                    */

                    const searchMatch =

                        place.name
                            .toLowerCase()
                            .includes(
                                searchText
                            )

                        ||

                        place.sinhalaName
                            .toLowerCase()
                            .includes(
                                searchText
                            )

                        ||

                        place.district
                            .toLowerCase()
                            .includes(
                                searchText
                            )

                        ||

                        place.province
                            .toLowerCase()
                            .includes(
                                searchText
                            )

                        ||

                        place.categoryName
                            .toLowerCase()
                            .includes(
                                searchText
                            );


                    return (

                        categoryMatch &&

                        searchMatch

                    );

                }
            );


        /*
           Suggestions පෙන්වන්න
        */

        displayLiveSuggestions(
            results
        );

    }
);


/* ============================================================
   9. DISPLAY LIVE SUGGESTIONS
============================================================ */
/* ============================================================
   9. DISPLAY LIVE SUGGESTIONS
============================================================ */

function displayLiveSuggestions(results) {

    /*
       Old search results clear කිරීම
    */

    searchSuggestions.innerHTML = "";


    /*
       No Results
    */

    if (results.length === 0) {

        searchSuggestions.innerHTML = `

            <div class="no-search-results">

                <div class="no-result-icon">
                    🔍
                </div>

                <strong>
                    No destinations found
                </strong>

                <span>
                    Try another destination
                </span>

            </div>

        `;


        searchSuggestions.style.display =
            "block";


        return;

    }


    /*
       Maximum Results

       දැනට results 6ක් පෙන්වමු
    */

    const limitedResults =
        results.slice(0, 6);


    /*
       Create Search Result Cards
    */

    limitedResults.forEach(
        place => {


            /*
               Create Result Item
            */

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "search-suggestion-item";


            /*
               Check My Trip Status
            */

            const isAdded =
                isPlaceInTrip(
                    place.id
                );


            /*
               Featured Badge
            */

            const featuredBadge =

                place.featured

                ?

                `
                <span
                    class="featured-badge"
                >
                    ⭐ Featured
                </span>
                `

                :

                "";


            /*
               Result Card
            */

            item.innerHTML = `

                <!-- Destination Image -->

                <div
                    class="suggestion-image-wrapper"
                >

                    <img
                        src="${place.image || ""}"
                        alt="${place.name || ""}"
                        loading="lazy"
                    >

                    ${featuredBadge}

                </div>


                <!-- Destination Information -->

                <div
                    class="suggestion-info"
                >


                    <!-- Title -->

                    <div
                        class="suggestion-title-row"
                    >

                        <div>

                            <h4>

                                ${place.name || ""}

                            </h4>


                            <p
                                class="suggestion-sinhala"
                            >

                                ${place.sinhalaName || ""}

                            </p>

                        </div>


                        <!-- Rating -->

                        <div
                            class="suggestion-rating"
                        >

                            ⭐
                            ${place.rating || "N/A"}

                        </div>

                    </div>


                    <!-- Location -->

                    <p
                        class="suggestion-location"
                    >

                        📍

                        ${place.district || ""}

                        ·

                        ${place.province || ""}

                    </p>


                    <!-- Category -->

                    <span
                        class="suggestion-category"
                    >

                        ${place.categoryName || ""}

                    </span>


                    <!-- Actions -->

                    <div
                        class="suggestion-actions"
                    >


                        <!-- View Details -->

                        <a
                            href="${place.page || "#"}"
                            class="view-details-btn"
                            onclick="
                                event.stopPropagation();
                            "
                        >

                            View Details →

                        </a>


                        <!-- Add To My Trip -->

                        <button
                            type="button"
                            class="add-trip-btn
                            ${isAdded ? "added" : ""}"
                            data-place-id="${place.id}"
                        >

                            ${
                                isAdded

                                ?

                                "❤️ Added to Trip"

                                :

                                "♡ Add to My Trip"

                            }

                        </button>


                    </div>

                </div>

            `;


            /* =================================================
               ADD TO MY TRIP
            ================================================= */

            const addTripButton =

                item.querySelector(
                    ".add-trip-btn"
                );


            addTripButton.addEventListener(
                "click",
                event => {


                    /*
                       Prevent Card Click
                    */

                    event.stopPropagation();


                    /*
                       Toggle Trip
                    */

                    toggleTripPlace(
                        place,
                        addTripButton
                    );

                }
            );


            /* =================================================
               CARD CLICK
            ================================================= */

            item.addEventListener(
                "click",
                () => {


                    /*
                       Zoom Map
                    */

                    map.setView(
                        place.coordinates,
                        12,
                        {
                            animate: true
                        }
                    );


                    /*
                       Open Marker Popup
                    */

                    if (
                        markers[place.id]
                    ) {

                        markers[
                            place.id
                        ].openPopup();

                    }


                    /*
                       Update Search Input
                    */

                    searchInput.value =
                        place.name;


                    /*
                       Hide Suggestions
                    */

                    searchSuggestions.style.display =
                        "none";

                }
            );


            /*
               Add Result To Dropdown
            */

            searchSuggestions.appendChild(
                item
            );

        }
    );


    /*
       Show Dropdown
    */

    searchSuggestions.style.display =
        "block";

}

/* ============================================================
   MY TRIP SYSTEM
   Version 1 – Local Storage

   පසුව මෙය User Account + Database
   system එකකට connect කළ හැක.
============================================================ */


/*
   Storage Key
*/

const MY_TRIP_KEY =
    "sriLankaMyTrip";


/* ============================================================
   GET MY TRIP
============================================================ */

function getMyTrip() {

    const savedTrip =
        localStorage.getItem(
            MY_TRIP_KEY
        );


    /*
       Saved trip නැත්නම්
       Empty Array
    */

    if (!savedTrip) {

        return [];

    }


    try {

        return JSON.parse(
            savedTrip
        );

    }

    catch (error) {

        console.error(
            "Trip data error:",
            error
        );

        return [];

    }

}


/* ============================================================
   SAVE MY TRIP
============================================================ */

function saveMyTrip(
    trip
) {

    localStorage.setItem(

        MY_TRIP_KEY,

        JSON.stringify(
            trip
        )

    );

}


/* ============================================================
   CHECK PLACE IN TRIP
============================================================ */

function isPlaceInTrip(
    placeId
) {

    const trip =
        getMyTrip();


    return trip.some(
        place =>

            place.id ===
            placeId

    );

}


/* ============================================================
   ADD / REMOVE PLACE
============================================================ */

function toggleTripPlace(
    place,
    button
) {

    let trip =
        getMyTrip();


    /*
       Check existing
    */

    const existingIndex =

        trip.findIndex(
            item =>

                item.id ===
                place.id

        );


    /*
       Already Added
       → Remove
    */

    if (
        existingIndex !== -1
    ) {

        trip.splice(
            existingIndex,
            1
        );


        saveMyTrip(
            trip
        );


        button.classList.remove(
            "added"
        );


        button.innerHTML =
            "♡ Add to My Trip";

        
         updateTripCounter();


        console.log(
            "Removed from trip:",
            place.name
        );


        return;

    }


    /*
       New Place
       → Add
    */

    trip.push({

        id:
            place.id,

        name:
            place.name,

        sinhalaName:
            place.sinhalaName,

        coordinates:
            place.coordinates,

        image:
            place.image,

        category:
            place.category,

        categoryName:
            place.categoryName,

        province:
            place.province,

        district:
            place.district,

        rating:
            place.rating,

        page:
            place.page

    });


    /*
       Save
    */

    saveMyTrip(
        trip
    );


    /*
       Update Button
    */

    button.classList.add(
        "added"
    );


    button.innerHTML =
        "❤️ Added to Trip";


    console.log(
        "Added to trip:",
        place.name
    );


    /*
       Future:
       Update Trip Counter
    */

    updateTripCounter();

}


/* ============================================================
   TRIP COUNTER
============================================================ */

function updateTripCounter() {

    const trip =
        getMyTrip();


    const counter =
        document.getElementById(
            "tripCounter"
        );


    if (!counter) {

        return;

    }


    counter.textContent =
        trip.length;


    /*
       Hide counter if empty
    */

    if (
        trip.length === 0
    ) {

        counter.style.display =
            "none";

    }

    else {

        counter.style.display =
            "inline-flex";

    }

}


/* ============================================================
   INITIALIZE TRIP COUNTER
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateTripCounter();

    }
);




/* ============================================================
   10. CLEAR SEARCH
============================================================ */

clearSearch.addEventListener(
    "click",
    () => {


        /*
           Search Input Clear
        */

        searchInput.value =
            "";


        /*
           Suggestions Clear
        */

        searchSuggestions.innerHTML =
            "";


        /*
           Suggestions Hide
        */

        searchSuggestions.style.display =
            "none";


        /*
           Clear Button Hide
        */

        clearSearch.style.display =
            "none";


        /*
           Input එකට Focus
        */

        searchInput.focus();

    }
);


/* ============================================================
   11. CLOSE SEARCH WHEN CLICKING OUTSIDE
============================================================ */

document.addEventListener(
    "click",
    event => {


        /*
           Search Box එකෙන් පිට
           click කළොත් dropdown close කරන්න
        */

        if (
            !event.target.closest(
                ".map-search"
            )
        ) {

            searchSuggestions.style.display =
                "none";

        }

    }
);


/* ============================================================
   12. CATEGORY FILTER UPDATE
============================================================ */


/*
   Category Button එක click කළාම
   Search එකත් reset කරමු.
*/

categoryButtons.forEach(
    button => {


        button.addEventListener(
            "click",
            () => {


                /*
                   Search Clear
                */

                searchInput.value =
                    "";


                /*
                   Suggestions Clear
                */

                searchSuggestions.innerHTML =
                    "";


                /*
                   Suggestions Hide
                */

                searchSuggestions.style.display =
                    "none";


                /*
                   Clear Button Hide
                */

                clearSearch.style.display =
                    "none";

            }
        );

    }
);

/* ============================================================
   13. SEARCH KEYBOARD NAVIGATION
============================================================ */

/*
   දැනට Keyboard එකෙන් select කර ඇති result එකේ index එක
*/

let activeSearchIndex = -1;


/* ============================================================
   SEARCH INPUT KEYBOARD EVENTS
============================================================ */

searchInput.addEventListener(
    "keydown",
    event => {

        /*
           Dropdown එකේ තිබෙන Results ලබාගන්නවා
        */

        const items =
            searchSuggestions.querySelectorAll(
                ".search-suggestion-item"
            );


        /*
           Results නැත්නම්
           කිසිවක් කරන්න එපා
        */

        if (
            items.length === 0
        ) {

            /*
               Escape press කළොත්
               Dropdown එක close කරන්න
            */

            if (
                event.key === "Escape"
            ) {

                searchSuggestions.style.display =
                    "none";

                activeSearchIndex =
                    -1;

            }

            return;

        }


        /* ====================================================
           ARROW DOWN
        ==================================================== */

        if (
            event.key === "ArrowDown"
        ) {

            /*
               Browser default cursor movement
               prevent කරන්න
            */

            event.preventDefault();


            /*
               Next Result
            */

            activeSearchIndex++;

            
            /*
               අවසාන Result එක පසු කළොත්
               නැවත පළමු Result එකට යන්න
            */

            if (
                activeSearchIndex >=
                items.length
            ) {

                activeSearchIndex =
                    0;

            }


            updateActiveSearchItem(
                items
            );

        }


        /* ====================================================
           ARROW UP
        ==================================================== */

        else if (
            event.key === "ArrowUp"
        ) {

            /*
               Default browser behavior stop
            */

            event.preventDefault();


            /*
               Previous Result
            */

            activeSearchIndex--;


            /*
               පළමු Result එකට පෙර ගියොත්
               අවසාන Result එකට යන්න
            */

            if (
                activeSearchIndex < 0
            ) {

                activeSearchIndex =
                    items.length - 1;

            }


            updateActiveSearchItem(
                items
            );

        }


        /* ====================================================
           ENTER
        ==================================================== */

        else if (
            event.key === "Enter"
        ) {

            /*
               Active Result එක තිබේ නම්
               එය select කරන්න
            */

            if (
                activeSearchIndex >= 0
            ) {

                event.preventDefault();


                items[
                    activeSearchIndex
                ].click();

            }

        }


        /* ====================================================
           ESCAPE
        ==================================================== */

        else if (
            event.key === "Escape"
        ) {

            /*
               Search Dropdown Close
            */

            searchSuggestions.style.display =
                "none";


            /*
               Active Index Reset
            */

            activeSearchIndex =
                -1;

        }

    }
);


/* ============================================================
   UPDATE ACTIVE SEARCH ITEM
============================================================ */

function updateActiveSearchItem(
    items
) {

    /*
       සියලුම Results වලින්
       active class එක remove කරන්න
    */

    items.forEach(
        item => {

            item.classList.remove(
                "active"
            );

        }
    );


    /*
       Current Active Item එක ලබාගන්නවා
    */

    const activeItem =
        items[
            activeSearchIndex
        ];


    /*
       Active Item එකට class එක add කරන්න
    */

    if (
        activeItem
    ) {

        activeItem.classList.add(
            "active"
        );


        /*
           Active Item එක
           visible area එකේ තබන්න
        */

        activeItem.scrollIntoView({

            block:
                "nearest",

            behavior:
                "smooth"

        });

    }

}


/* ============================================================
   RESET SEARCH KEYBOARD INDEX
============================================================ */

/*
   Search Results update වන සෑම අවස්ථාවකම
   active index එක reset කිරීම
*/

function resetSearchKeyboard() {

    activeSearchIndex =
        -1;

}


/* ============================================================
   MY TRIP COUNTER LIVE UPDATE
============================================================ */

function refreshMyTripUI() {

    /*
       Counter එක update කරන්න
    */

    updateTripCounter();


    /*
       Search Dropdown එකේ
       දැනට තිබෙන Trip Buttons update කරන්න
    */

    const buttons =
        searchSuggestions.querySelectorAll(
            ".add-trip-btn"
        );


    /*
       එක් එක් Button එක check කරන්න
    */

    buttons.forEach(
        button => {

            /*
               Place ID ලබාගන්නවා
            */

            const placeId =
                button.dataset.placeId;


            /*
               Trip එකේ තිබෙනවාද?
            */

            const isAdded =
                isPlaceInTrip(
                    placeId
                );


            /*
               Button State Update
            */

            if (
                isAdded
            ) {

                button.classList.add(
                    "added"
                );


                button.innerHTML =
                    "❤️ Added to Trip";

            }

            else {

                button.classList.remove(
                    "added"
                );


                button.innerHTML =
                    "♡ Add to My Trip";

            }

        }
    );

}


/* ============================================================
   14. MY TRIP / TRIP PLANNER UI
============================================================ */


/*
   Trip Planner Elements
*/

const myTripButton =
    document.getElementById(
        "myTripButton"
    );


const tripPlannerPanel =
    document.getElementById(
        "tripPlannerPanel"
    );


const tripPlannerOverlay =
    document.getElementById(
        "tripPlannerOverlay"
    );


const closeTripPlanner =
    document.getElementById(
        "closeTripPlanner"
    );


const tripDestinations =
    document.getElementById(
        "tripDestinations"
    );


const emptyTripMessage =
    document.getElementById(
        "emptyTripMessage"
    );


const tripActions =
    document.getElementById(
        "tripActions"
    );


const tripPlaceCount =
    document.getElementById(
        "tripPlaceCount"
    );


const clearTripButton =
    document.getElementById(
        "clearTripButton"
    );


const exploreDestinationsButton =
    document.getElementById(
        "exploreDestinationsButton"
    );


/* ============================================================
   OPEN TRIP PLANNER
============================================================ */

function openTripPlanner() {

    tripPlannerPanel.classList.add(
        "active"
    );

    tripPlannerOverlay.classList.add(
        "active"
    );


    /*
       Render Latest Trip
    */

    renderMyTrip();

}


/* ============================================================
   CLOSE TRIP PLANNER
============================================================ */

function closeTripPlannerPanel() {

    tripPlannerPanel.classList.remove(
        "active"
    );

    tripPlannerOverlay.classList.remove(
        "active"
    );

}


/* ============================================================
   BUTTON EVENTS
============================================================ */

if (myTripButton) {

    myTripButton.addEventListener(
        "click",
        openTripPlanner
    );

}


if (closeTripPlanner) {

    closeTripPlanner.addEventListener(
        "click",
        closeTripPlannerPanel
    );

}


if (tripPlannerOverlay) {

    tripPlannerOverlay.addEventListener(
        "click",
        closeTripPlannerPanel
    );

}


/* ============================================================
   RENDER MY TRIP
============================================================ */

function renderMyTrip() {

    /*
       Saved Trip ලබාගන්නවා
    */

    const trip =
        getMyTrip();


    /*
       Clear Existing Cards
    */

    tripDestinations.innerHTML =
        "";


    /*
       Update Counter
    */

    tripPlaceCount.textContent =
        trip.length;


    /*
       Empty Trip
    */

    if (
        trip.length === 0
    ) {

        emptyTripMessage.style.display =
            "block";


        tripActions.style.display =
            "none";


        return;

    }


    /*
       Trip එක Empty නොවේ
    */

    emptyTripMessage.style.display =
        "none";


    tripActions.style.display =
        "flex";


    /*
       Create Destination Cards
    */

    trip.forEach(
        (place, index) => {


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "trip-destination-card";


            card.innerHTML = `

                <img
                    src="${place.image || ""}"
                    alt="${place.name || ""}"
                    class="trip-destination-image"
                >


                <div
                    class="trip-destination-info"
                >

                    <h4>
                        ${index + 1}.
                        ${place.name}
                    </h4>


                    <p>
                        📍
                        ${place.district || ""}
                        ·
                        ${place.province || ""}
                    </p>


                    <p>
                        ⭐
                        ${place.rating || "N/A"}
                    </p>

                </div>


                <button
                    type="button"
                    class="trip-destination-remove"
                    data-place-id="${place.id}"
                    title="Remove from My Trip"
                >

                    🗑️

                </button>

            `;


            /*
               Remove Button
            */

            const removeButton =
                card.querySelector(
                    ".trip-destination-remove"
                );


            removeButton.addEventListener(
                "click",
                () => {

                    removePlaceFromTrip(
                        place.id
                    );

                }
            );


            /*
               Add Card
            */

            tripDestinations.appendChild(
                card
            );

        }
    );

}


/* ============================================================
   REMOVE PLACE FROM TRIP
============================================================ */

function removePlaceFromTrip(
    placeId
) {

    let trip =
        getMyTrip();


    /*
       Remove Place
    */

    trip =
        trip.filter(
            place =>
                place.id !== placeId
        );


    /*
       Save Updated Trip
    */

    saveMyTrip(
        trip
    );


    /*
       Update UI
    */

    updateTripCounter();


    renderMyTrip();


    /*
       Search Dropdown එකේ
       Button State Update
    */

    refreshMyTripUI();

}


/* ============================================================
   CLEAR ENTIRE TRIP
============================================================ */

if (clearTripButton) {

    clearTripButton.addEventListener(
        "click",
        () => {


            /*
               Confirm User
            */

            const confirmed =
                confirm(
                    "Are you sure you want to clear your entire trip?"
                );


            if (!confirmed) {

                return;

            }


            /*
               Clear LocalStorage
            */

            saveMyTrip([]);


            /*
               Update UI
            */

            updateTripCounter();


            renderMyTrip();


            refreshMyTripUI();

        }
    );

}


/* ============================================================
   EXPLORE DESTINATIONS
============================================================ */

if (
    exploreDestinationsButton
) {

    exploreDestinationsButton.addEventListener(
        "click",
        () => {

            /*
               Close Trip Planner
            */

            closeTripPlannerPanel();


            /*
               Focus Search
            */

            if (searchInput) {

                searchInput.focus();

            }

        }
    );

}


/* ============================================================
   PLAN MY JOURNEY
============================================================ */

const planJourneyButton =
    document.getElementById(
        "planJourneyButton"
    );


if (planJourneyButton) {

    planJourneyButton.addEventListener(
        "click",
        () => {


            const trip =
                getMyTrip();


            /*
               No destinations
            */

            if (
                trip.length === 0
            ) {

                alert(
                    "Please add at least one destination to your trip."
                );

                return;

            }


            /*
               Future Journey Planner
            */

            console.log(
                "Selected Trip:",
                trip
            );


           
/* ============================================================
   PLAN MY JOURNEY
============================================================ */

const planJourneyButton =
    document.getElementById(
        "planJourneyButton"
    );


if (planJourneyButton) {

    planJourneyButton.addEventListener(
        "click",
        () => {


            const trip =
                getMyTrip();


            /*
               No destinations
            */

            if (
                trip.length === 0
            ) {

                alert(
                    "Please add at least one destination to your trip."
                );

                return;

            }


            /*
               Open Trip Planner Page
            */

            window.location.href =
                "trip-planner.html";

        }
    );

}



        }
    );

}



