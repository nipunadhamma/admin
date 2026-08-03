
/* ============================================================
   LANKAQUEST
   TRIP PLANNER
   FIREBASE-FIRST ARCHITECTURE

   FLOW

   Tourist
      ↓
   Trip Planner
      ↓
   Selected Destinations
      ↓
   Travel Details
      ↓
   Firebase Authentication
      ↓
   Tourist Profile Check
      ↓
   Firestore
   lankaQuestTouristTrips/{tripId}
      ↓
   quotation-request.html?trip={tripId}

   IMPORTANT

   localStorage is used ONLY for temporary planner draft state.

   Firestore is the permanent trip database.

   After a trip is successfully created in Firestore,
   the local planner draft is cleared.
============================================================ */



/* ============================================================
   1. FIREBASE IMPORTS
============================================================ */

import {
    auth,
    db,
} from "./firebase-config.js";


import {
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


import {
    collection,
    addDoc,
    getDoc,
    doc,
    serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* ============================================================
   1A. DESTINATION DATABASE
============================================================ */

/*
   places.js is the single source of truth
   for LankaQuest destinations.

   It creates:

       window.touristPlaces

   Trip Planner search uses the same database
   that is used by the attraction generator.
*/

import "./places.js";


/* ============================================================
   2. STORAGE KEYS

   These are temporary browser draft keys.

   They are NOT the permanent database.
============================================================ */

const MY_TRIP_KEY =
    "sriLankaMyTrip";


const TRIP_PLANNER_DATA_KEY =
    "sriLankaTripPlannerData";


/* ============================================================
   3. FIRESTORE COLLECTION
============================================================ */

const TRIP_COLLECTION =
    "lankaQuestTouristTrips";


/* ============================================================
   4. DOM ELEMENTS
============================================================ */

const plannerDestinations =
    document.getElementById(
        "plannerDestinations"
    );


const plannerEmptyState =
    document.getElementById(
        "plannerEmptyState"
    );


const plannerPlaceCount =
    document.getElementById(
        "plannerPlaceCount"
    );


const summaryPlaceCount =
    document.getElementById(
        "summaryPlaceCount"
    );


const startDate =
    document.getElementById(
        "startDate"
    );


const endDate =
    document.getElementById(
        "endDate"
    );


const summaryDates =
    document.getElementById(
        "summaryDates"
    );


const travelerCount =
    document.getElementById(
        "travelerCount"
    );


const summaryTravelers =
    document.getElementById(
        "summaryTravelers"
    );


const travelStyle =
    document.getElementById(
        "travelStyle"
    );


const transportOptions =
    document.querySelectorAll(
        'input[name="transport"]'
    );


const summaryTransport =
    document.getElementById(
        "summaryTransport"
    );


const accommodationOptions =
    document.querySelectorAll(
        'input[name="accommodation"]'
    );


const summaryAccommodation =
    document.getElementById(
        "summaryAccommodation"
    );


const specialRequests =
    document.getElementById(
        "specialRequests"
    );


const requestQuoteButton =
    document.getElementById(
        "requestQuoteButton"
    );


/* ============================================================
   5. FIREBASE AUTH STATE
============================================================ */

let currentFirebaseUser =
    null;


onAuthStateChanged(
    auth,
    (user) => {

        currentFirebaseUser =
            user || null;


        if (user) {

            console.log(
                "LankaQuest Trip Planner:",
                "Firebase user authenticated.",
                user.uid
            );

        } else {

            console.log(
                "LankaQuest Trip Planner:",
                "No Firebase user."
            );

        }

    }
);


/* ============================================================
   6. GET SELECTED DESTINATIONS

   Temporary draft only.
============================================================ */

function getMyTrip() {

    const savedTrip =
        localStorage.getItem(
            MY_TRIP_KEY
        );


    if (!savedTrip) {

        return [];

    }


    try {

        const trip =
            JSON.parse(
                savedTrip
            );


        if (
            !Array.isArray(trip)
        ) {

            return [];

        }


        return trip;

    } catch (error) {

        console.error(
            "Unable to read My Trip data:",
            error
        );


        return [];

    }

}


/* ============================================================
   7. SAVE SELECTED DESTINATIONS

   Temporary draft only.
============================================================ */

function saveMyTrip(
    trip
) {

    try {

        localStorage.setItem(
            MY_TRIP_KEY,
            JSON.stringify(
                trip
            )
        );

    } catch (error) {

        console.error(
            "Unable to save My Trip:",
            error
        );

    }

}


/* ============================================================
   8. CLEAR PLANNER DRAFT

   IMPORTANT:

   This runs ONLY after Firestore trip creation succeeds.
============================================================ */

function clearPlannerDraft() {

    localStorage.removeItem(
        MY_TRIP_KEY
    );


    localStorage.removeItem(
        TRIP_PLANNER_DATA_KEY
    );


    console.log(
        "LankaQuest planner draft cleared."
    );

}


/* ============================================================
   TRIP PLANNER DESTINATION SEARCH
============================================================ */

/*
   Destination search uses the existing
   touristPlaces array from places.js.
*/

const plannerDestinationSearch =
    document.getElementById(
        "plannerDestinationSearch"
    );


const plannerDestinationResults =
    document.getElementById(
        "plannerDestinationResults"
    );


const clearPlannerDestinationSearch =
    document.getElementById(
        "clearPlannerDestinationSearch"
    );


/* ============================================================
   SEARCH DESTINATIONS
============================================================ */

function searchPlannerDestinations(
    searchTerm
) {

    if (
        !plannerDestinationResults
    ) {

        return;

    }


    const query =
        String(
            searchTerm || ""
        )
            .trim()
            .toLowerCase();


    /*
       Clear results when search is empty.
    */

    if (!query) {

        plannerDestinationResults.innerHTML =
            "";

        return;

    }


    /*
       Make sure places.js exists.
    */

    if (
        !Array.isArray(
            window.touristPlaces
        )
    ) {

        plannerDestinationResults.innerHTML = `

            <div class="planner-destination-no-results">

                Destinations are temporarily unavailable.

            </div>

        `;

        return;

    }


    /*
       Search by:

       - Name
       - Sinhala name
       - Province
       - District
       - Category
    */

    const results =
        window.touristPlaces
            .filter(
                place => {

                    if (
                        !place ||
                        place.hide === true
                    ) {

                        return false;

                    }


                    const searchableText = [

                        place.name,

                        place.sinhalaName,

                        place.title,

                        place.province,

                        place.district,

                        place.category,

                        place.categoryName,

                        place.location

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return searchableText.includes(
                        query
                    );

                }
            )
            .slice(
                0,
                8
            );


    /*
       No results.
    */

    if (
        results.length === 0
    ) {

        plannerDestinationResults.innerHTML = `

            <div class="planner-destination-no-results">

                No destinations found for
                "<strong>${escapePlannerSearchText(query)}</strong>"

            </div>

        `;

        return;

    }


    /*
       Render results.
    */

    plannerDestinationResults.innerHTML =
        results
            .map(
                createPlannerDestinationResult
            )
            .join("");


    /*
       Add button events.
    */

    plannerDestinationResults
        .querySelectorAll(
            ".planner-destination-add"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        addPlannerDestination(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


/* ============================================================
   CREATE SEARCH RESULT
============================================================ */

function createPlannerDestinationResult(
    place
) {

    return `

        <div
            class="planner-destination-result"
        >

            <img
                class="planner-destination-result-image"
                src="${place.image || ""}"
                alt="${escapePlannerSearchText(place.name || "")}"
                loading="lazy"
            >


            <div
                class="planner-destination-result-info"
            >

                <h4
                    class="planner-destination-result-name"
                >
                    ${escapePlannerSearchText(
                        place.name || "Destination"
                    )}
                </h4>


                <p
                    class="planner-destination-result-location"
                >
                    ${escapePlannerSearchText(
                        [
                            place.district,
                            place.province
                        ]
                            .filter(Boolean)
                            .join(" • ")
                    )}
                </p>

            </div>


            <button
                type="button"
                class="planner-destination-add"
                data-id="${escapePlannerSearchText(
                    place.id || ""
                )}"
            >
                + Add
            </button>

        </div>

    `;

}


/* ============================================================
   ADD DESTINATION TO EXISTING MY TRIP
============================================================ */

function addPlannerDestination(
    placeId
) {

    if (
        !placeId ||
        !Array.isArray(
            window.touristPlaces
        )
    ) {

        return;

    }


    const place =
        window.touristPlaces.find(
            item =>
                item &&
                item.id === placeId
        );


    if (!place) {

        return;

    }


    let trip =
        getMyTrip();


    /*
       Prevent duplicates.
    */

    const alreadyAdded =
        trip.some(
            item =>
                item &&
                item.id === place.id
        );


    if (
        alreadyAdded
    ) {

        alert(
            `${place.name} is already in your trip.`
        );

        return;

    }


    /*
       Add the complete destination object.

       This keeps compatibility with the
       existing Trip Planner rendering logic.
    */

    trip.push(
        place
    );


    /*
       Use the EXISTING save function.
    */

    saveMyTrip(
        trip
    );


    /*
       Use the EXISTING render function.
    */

    renderPlannerDestinations();


    /*
       Clear search after adding.
    */

    if (
        plannerDestinationSearch
    ) {

        plannerDestinationSearch.value =
            "";

    }


    if (
        plannerDestinationResults
    ) {

        plannerDestinationResults.innerHTML =
            "";

    }


    if (
        clearPlannerDestinationSearch
    ) {

        clearPlannerDestinationSearch.hidden =
            true;

    }

}


/* ============================================================
   ESCAPE SEARCH TEXT
============================================================ */

function escapePlannerSearchText(
    value
) {

    return String(
        value || ""
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
   SEARCH INPUT EVENTS
============================================================ */

if (
    plannerDestinationSearch
) {

    plannerDestinationSearch.addEventListener(
        "input",
        event => {

            const value =
                event.target.value;


            if (
                clearPlannerDestinationSearch
            ) {

                clearPlannerDestinationSearch.hidden =
                    !value;

            }


            searchPlannerDestinations(
                value
            );

        }
    );

}


/* ============================================================
   CLEAR SEARCH
============================================================ */

if (
    clearPlannerDestinationSearch
) {

    clearPlannerDestinationSearch.addEventListener(
        "click",
        () => {

            if (
                plannerDestinationSearch
            ) {

                plannerDestinationSearch.value =
                    "";

                plannerDestinationSearch.focus();

            }


            if (
                plannerDestinationResults
            ) {

                plannerDestinationResults.innerHTML =
                    "";

            }


            clearPlannerDestinationSearch.hidden =
                true;

        }
    );

}




/* ============================================================
   9. RENDER DESTINATIONS
============================================================ */

function renderPlannerDestinations() {

    const trip =
        getMyTrip();


    if (
        plannerDestinations
    ) {

        plannerDestinations.innerHTML =
            "";

    }


    /* --------------------------------------------------------
       COUNTERS
    -------------------------------------------------------- */

    if (
        plannerPlaceCount
    ) {

        plannerPlaceCount.textContent =
            trip.length +
            (
                trip.length === 1
                    ? " Place"
                    : " Places"
            );

    }


    if (
        summaryPlaceCount
    ) {

        summaryPlaceCount.textContent =
            trip.length;

    }


/* --------------------------------------------------------
   EMPTY STATE MESSAGE
-------------------------------------------------------- */

/*
   The destination search is NOT inside the empty state.

   Therefore the search box remains visible whether
   the tourist has 0, 1, or many destinations.

   Only the introductory empty-state message is hidden
   after the first destination is added.
*/

if (
    plannerEmptyState
) {

    plannerEmptyState.style.display =
        trip.length === 0
            ? "block"
            : "none";

}



    /* --------------------------------------------------------
       DESTINATION CARDS
    -------------------------------------------------------- */

    trip.forEach(
        (
            place,
            index
        ) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "planner-destination";


            card.innerHTML = `

                <img
                    src="${escapeHtml(
                        place.image || ""
                    )}"
                    alt="${escapeHtml(
                        place.name ||
                        "Destination"
                    )}"
                >


                <div
                    class="planner-destination-info"
                >

                    <h4>

                        ${index + 1}.
                        ${escapeHtml(
                            place.name ||
                            "Unknown Destination"
                        )}

                    </h4>


                    <p>

                        📍

                        ${escapeHtml(
                            place.district ||
                            ""
                        )}

                        ${
                            place.province
                                ? " · " +
                                  escapeHtml(
                                      place.province
                                  )
                                : ""
                        }

                    </p>


                    <p>

                        ⭐

                        ${escapeHtml(
                            String(
                                place.rating ||
                                "N/A"
                            )
                        )}

                    </p>

                </div>


                <button
                    type="button"
                    class="remove-planner-place"
                    data-place-id="${escapeHtml(
                        String(
                            place.id ||
                            ""
                        )
                    )}"
                    title="Remove destination"
                    aria-label="Remove destination"
                >

                    ×

                </button>

            `;


            const removeButton =
                card.querySelector(
                    ".remove-planner-place"
                );


            if (
                removeButton
            ) {

                removeButton.addEventListener(
                    "click",
                    () => {

                        removePlannerDestination(
                            place.id
                        );

                    }
                );

            }


            if (
                plannerDestinations
            ) {

                plannerDestinations.appendChild(
                    card
                );

            }

        }
    );

}


/* ============================================================
   10. REMOVE DESTINATION
============================================================ */

function removePlannerDestination(
    placeId
) {

    let trip =
        getMyTrip();


    trip =
        trip.filter(
            (place) =>
                place.id !== placeId
        );


    saveMyTrip(
        trip
    );


    renderPlannerDestinations();

}


/* ============================================================
   11. TRAVEL DATES
============================================================ */

function updateTravelDates() {

    if (
        !summaryDates
    ) {

        return;

    }


    if (
        !startDate?.value ||
        !endDate?.value
    ) {

        summaryDates.textContent =
            "Not selected";


        return;

    }


    summaryDates.textContent =
        startDate.value +
        " → " +
        endDate.value;

}


if (
    startDate
) {

    startDate.addEventListener(
        "change",
        updateTravelDates
    );

}


if (
    endDate
) {

    endDate.addEventListener(
        "change",
        updateTravelDates
    );

}


/* ============================================================
   12. TRAVELERS
============================================================ */

function updateTravelerSummary() {

    if (
        !summaryTravelers
    ) {

        return;

    }


    summaryTravelers.textContent =
        travelerCount?.value ||
        "Not selected";

}


if (
    travelerCount
) {

    travelerCount.addEventListener(
        "change",
        updateTravelerSummary
    );

}


/* ============================================================
   13. TRANSPORT
============================================================ */

transportOptions.forEach(
    (option) => {

        option.addEventListener(
            "change",
            () => {

                if (
                    option.checked &&
                    summaryTransport
                ) {

                    summaryTransport.textContent =
                        option.value;

                }

            }
        );

    }
);


/* ============================================================
   14. ACCOMMODATION
============================================================ */

accommodationOptions.forEach(
    (option) => {

        option.addEventListener(
            "change",
            () => {

                if (
                    option.checked &&
                    summaryAccommodation
                ) {

                    summaryAccommodation.textContent =
                        option.value;

                }

            }
        );

    }
);


/* ============================================================
   15. GET CURRENT TRANSPORT
============================================================ */

function getSelectedTransport() {

    return (
        document.querySelector(
            'input[name="transport"]:checked'
        )?.value ||
        ""
    );

}


/* ============================================================
   16. GET CURRENT ACCOMMODATION
============================================================ */

function getSelectedAccommodation() {

    return (
        document.querySelector(
            'input[name="accommodation"]:checked'
        )?.value ||
        ""
    );

}


/* ============================================================
   17. BUILD PLANNER DATA
============================================================ */

function buildPlannerData() {

    return {

        startDate:
            startDate?.value ||
            "",


        endDate:
            endDate?.value ||
            "",


        travelers:
            travelerCount?.value ||
            "",


        travelStyle:
            travelStyle?.value ||
            "",


        transport:
            getSelectedTransport(),


        accommodation:
            getSelectedAccommodation(),


        specialRequests:
            specialRequests?.value ||
            "",

    };

}


/* ============================================================
   18. SAVE PLANNER DRAFT

   This is temporary browser state.

   It is NOT the final Firestore trip.
============================================================ */

function saveTripPlannerDraft() {

    const data =
        buildPlannerData();


    try {

        localStorage.setItem(TRIP_PLANNER_DATA_KEY, JSON.stringify(data));

        window.dispatchEvent(new CustomEvent("lankaQuestTripUpdated"));

        console.log(
            "Trip Planner draft saved."
        );


    } catch (error) {

        console.error(
            "Unable to save planner draft:",
            error
        );

    }


    return data;

}


/* ============================================================
   19. LOAD PLANNER DRAFT
============================================================ */

function loadSavedPlannerData() {

    const savedData =
        localStorage.getItem(
            TRIP_PLANNER_DATA_KEY
        );


    if (!savedData) {

        return;

    }


    try {

        const data =
            JSON.parse(
                savedData
            );


        if (
            startDate &&
            data.startDate
        ) {

            startDate.value =
                data.startDate;

        }


        if (
            endDate &&
            data.endDate
        ) {

            endDate.value =
                data.endDate;

        }


        if (
            travelerCount &&
            data.travelers
        ) {

            travelerCount.value =
                data.travelers;

        }


        if (
            travelStyle &&
            data.travelStyle
        ) {

            travelStyle.value =
                data.travelStyle;

        }


        if (
            data.transport
        ) {

            const transport =
                document.querySelector(
                    `input[name="transport"][value="${CSS.escape(
                        data.transport
                    )}"]`
                );


            if (
                transport
            ) {

                transport.checked =
                    true;

            }

        }


        if (
            data.accommodation
        ) {

            const accommodation =
                document.querySelector(
                    `input[name="accommodation"][value="${CSS.escape(
                        data.accommodation
                    )}"]`
                );


            if (
                accommodation
            ) {

                accommodation.checked =
                    true;

            }

        }


        if (
            specialRequests &&
            data.specialRequests
        ) {

            specialRequests.value =
                data.specialRequests;

        }


        updateTravelDates();

        updateTravelerSummary();


        if (
            summaryTransport
        ) {

            summaryTransport.textContent =
                data.transport ||
                "Not selected";

        }


        if (
            summaryAccommodation
        ) {

            summaryAccommodation.textContent =
                data.accommodation ||
                "Not selected";

        }


    } catch (error) {

        console.error(
            "Unable to load planner draft:",
            error
        );

    }

}


/* ============================================================
   20. AUTO-SAVE PLANNER INPUT

   Saves only temporary draft state.
============================================================ */

[
    startDate,
    endDate,
    travelerCount,
    travelStyle,
    specialRequests,
]
    .filter(Boolean)
    .forEach(
        (element) => {

            element.addEventListener(
                "input",
                saveTripPlannerDraft
            );


            element.addEventListener(
                "change",
                saveTripPlannerDraft
            );

        }
    );


transportOptions.forEach(
    (option) => {

        option.addEventListener(
            "change",
            saveTripPlannerDraft
        );

    }
);


accommodationOptions.forEach(
    (option) => {

        option.addEventListener(
            "change",
            saveTripPlannerDraft
        );

    }
);


/* ============================================================
   21. FIRESTORE DESTINATION DATA
============================================================ */

function buildFirestoreDestinations(
    trip
) {

    return trip.map(
        (place) => ({

            id:
                place.id ||
                "",


            name:
                place.name ||
                "",


            image:
                place.image ||
                "",


            district:
                place.district ||
                "",


            province:
                place.province ||
                "",


            category:
                place.category ||
                "",


            rating:
                place.rating ??
                "",


            bestTime:
                place.bestTime ||
                "",


            latitude:
                place.latitude ??
                place.lat ??
                (
                    Array.isArray(
                        place.coordinates
                    )
                        ? place.coordinates[0] ??
                          null
                        : null
                ),


            longitude:
                place.longitude ??
                place.lng ??
                (
                    Array.isArray(
                        place.coordinates
                    )
                        ? place.coordinates[1] ??
                          null
                        : null
                ),

        })
    );

}


/* ============================================================
   22. CHECK TOURIST PROFILE
============================================================ */

async function verifyTouristProfile(
    firebaseUser
) {

    const touristRef =
        doc(
            db,
            "lankaQuestTourists",
            firebaseUser.uid
        );


    const touristSnapshot =
        await getDoc(
            touristRef
        );


    if (
        !touristSnapshot.exists()
    ) {

        return {

            exists: false,

            profile: null,

        };

    }


    const profile =
        touristSnapshot.data();


    if (
        profile.accountType &&
        profile.accountType !==
            "tourist"
    ) {

        return {

            exists: false,

            profile,

        };

    }


    return {

        exists: true,

        profile,

    };

}


/* ============================================================
   23. BUILD FIRESTORE TRIP
============================================================ */

function buildFirestoreTripData(
    trip,
    plannerData,
    firebaseUser
) {

    return {

        touristId:
            firebaseUser.uid,


        touristEmail:
            firebaseUser.email ||
            "",


        touristName:
            firebaseUser.displayName ||
            "",


        destinations:
            buildFirestoreDestinations(
                trip
            ),


        startDate:
            plannerData.startDate ||
            "",


        endDate:
            plannerData.endDate ||
            "",


        travelers:
            plannerData.travelers ||
            "",


        travelStyle:
            plannerData.travelStyle ||
            "",


        transport:
            plannerData.transport ||
            "",


        accommodation:
            plannerData.accommodation ||
            "",


        specialRequests:
            plannerData.specialRequests ||
            "",


        status:
            "draft",


        quotationRequested:
            false,


        createdAt:
            serverTimestamp(),


        updatedAt:
            serverTimestamp(),

    };

}


/* ============================================================
   24. SAVE TRIP TO FIRESTORE
============================================================ */

async function saveTripToFirestore(
    trip,
    plannerData,
    firebaseUser
) {

    const tripData =
        buildFirestoreTripData(
            trip,
            plannerData,
            firebaseUser
        );


    console.log(
        "Saving LankaQuest trip:",
        tripData
    );


    const tripReference =
        await addDoc(
            collection(
                db,
                TRIP_COLLECTION
            ),
            tripData
        );


    console.log(
        "LankaQuest trip created:",
        tripReference.id
    );


    return {

        id:
            tripReference.id,

        data:
            tripData,

    };

}


/* ============================================================
   25. REQUEST GUIDE QUOTATION
============================================================ */

let quotationRequestInProgress =
    false;


if (
    requestQuoteButton
) {

    requestQuoteButton.addEventListener(
        "click",
        async () => {

            if (
                quotationRequestInProgress
            ) {

                return;

            }


            quotationRequestInProgress =
                true;


            const originalText =
                requestQuoteButton.textContent;


            requestQuoteButton.disabled =
                true;


            requestQuoteButton.textContent =
                "Saving Trip...";


            try {

                /* --------------------------------------------
                   STEP 1
                   DESTINATIONS
                -------------------------------------------- */

                const trip =
                    getMyTrip();


                if (
                    trip.length === 0
                ) {

                    alert(
                        "Please add at least one destination before requesting a quotation."
                    );


                    return;

                }


                /* --------------------------------------------
                   STEP 2
                   PLANNER DATA
                -------------------------------------------- */

                const plannerData =
                    saveTripPlannerDraft();


                /* --------------------------------------------
                   STEP 3
                   FIREBASE AUTH
                -------------------------------------------- */

                const firebaseUser =
                    auth.currentUser ||
                    currentFirebaseUser;


                if (
                    !firebaseUser
                ) {

                    alert(
                        "Please login as a Tourist before requesting a guide quotation."
                    );


                    window.location.href =
                        "login.html?redirect=trip-planner.html";


                    return;

                }


                currentFirebaseUser =
                    firebaseUser;


                /* --------------------------------------------
                   STEP 4
                   TOURIST PROFILE
                -------------------------------------------- */

                const touristCheck =
                    await verifyTouristProfile(
                        firebaseUser
                    );


                if (
                    !touristCheck.exists
                ) {

                    alert(
                        "A LankaQuest Tourist profile was not found. Please complete Tourist registration first."
                    );


                    return;

                }


                /* --------------------------------------------
                   STEP 5
                   FIRESTORE
                -------------------------------------------- */

                requestQuoteButton.textContent =
                    "Saving to Firebase...";


                const savedTrip =
                    await saveTripToFirestore(
                        trip,
                        plannerData,
                        firebaseUser
                    );


                /* --------------------------------------------
                   STEP 6
                   CLEAR TEMPORARY DRAFT

                   IMPORTANT:

                   Firestore save succeeded.

                   Therefore the temporary planner
                   state can now be removed.
                -------------------------------------------- */

                clearPlannerDraft();


                /* --------------------------------------------
                   STEP 7
                   OPEN QUOTATION PAGE
                -------------------------------------------- */

                console.log(
                    "LankaQuest Trip ID:",
                    savedTrip.id
                );


                window.location.href =
                    "quotation-request.html?trip=" +
                    encodeURIComponent(
                        savedTrip.id
                    );


            } catch (error) {

                console.error(
                    "Trip Planner / Firestore Error:",
                    error
                );


                /* --------------------------------------------
                   PERMISSION ERROR
                -------------------------------------------- */

                if (
                    error.code ===
                    "permission-denied"
                ) {

                    alert(
                        "Firestore denied access to save this trip. Please make sure you are logged in with your Tourist account."
                    );


                    return;

                }


                /* --------------------------------------------
                   AUTH ERROR
                -------------------------------------------- */

                if (
                    error.code &&
                    error.code.startsWith(
                        "auth/"
                    )
                ) {

                    alert(
                        "Your Firebase login session is not available. Please login again."
                    );


                    window.location.href =
                        "login.html?redirect=trip-planner.html";


                    return;

                }


                /* --------------------------------------------
                   GENERAL ERROR
                -------------------------------------------- */

                alert(
                    error.message ||
                    "Unable to save your trip. Please try again."
                );

            } finally {

                quotationRequestInProgress =
                    false;


                requestQuoteButton.disabled =
                    false;


                requestQuoteButton.textContent =
                    originalText;

            }

        }
    );

}


/* ============================================================
   26. HTML ESCAPE
============================================================ */

function escapeHtml(
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
   27. INITIALIZE
============================================================ */

function initializeTripPlanner() {

    renderPlannerDestinations();

    loadSavedPlannerData();

    updateTravelDates();

    updateTravelerSummary();


    console.log(
        "LankaQuest Trip Planner initialized."
    );

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeTripPlanner
    );

} else {

    initializeTripPlanner();

}


/* ============================================================
   28. GLOBAL REFRESH

   Useful when returning from another page.
============================================================ */

window.refreshTripPlanner =
    function () {

        renderPlannerDestinations();

        updateTravelDates();

        updateTravelerSummary();

    };


/* ============================================================
   END
============================================================ */

