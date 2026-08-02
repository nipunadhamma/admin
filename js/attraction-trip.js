
/* ============================================================
   LANKAQUEST
   ATTRACTION → MY TRIP

   PURPOSE

   Attraction Page
        ↓
   Add to My Trip
        ↓
   localStorage
        ↓
   sriLankaMyTrip
        ↓
   Trip Planner
        ↓
   📍 My Destinations


   IMPORTANT

   This uses the SAME storage key used by
   trip-planner.js:

       sriLankaMyTrip

   Do NOT create another My Trip storage key.
============================================================ */


/* ============================================================
   1. STORAGE KEY
============================================================ */

const MY_TRIP_KEY =
    "sriLankaMyTrip";


/* ============================================================
   2. GET CURRENT MY TRIP
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
            "LankaQuest My Trip data error:",
            error
        );


        return [];

    }

}


/* ============================================================
   3. SAVE MY TRIP
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
   4. GET BUTTON
============================================================ */

const addToMyTripButton =
    document.getElementById(
        "addToMyTripButton"
    );


/* ============================================================
   5. CHECK IF ALREADY ADDED
============================================================ */

function isAlreadyInMyTrip(
    placeId
) {

    const trip =
        getMyTrip();


    return trip.some(
        place =>
            String(place.id) ===
            String(placeId)
    );

}


/* ============================================================
   6. CREATE DESTINATION OBJECT
============================================================ */

function getAttractionData() {

    if (
        !addToMyTripButton
    ) {

        return null;

    }


    return {

        id:
            addToMyTripButton.dataset.placeId ||
            "",


        name:
            addToMyTripButton.dataset.placeName ||
            "",


        image:
            addToMyTripButton.dataset.placeImage ||
            "",


        province:
            addToMyTripButton.dataset.placeProvince ||
            "",


        district:
            addToMyTripButton.dataset.placeDistrict ||
            "",


        location:
            addToMyTripButton.dataset.placeLocation ||
            "",


        rating:
            addToMyTripButton.dataset.placeRating ||
            "",


        page:
            window.location.pathname,

    };

}


/* ============================================================
   7. ADD DESTINATION
============================================================ */

function addAttractionToMyTrip() {

    const place =
        getAttractionData();


    if (!place) {

        console.error(
            "LankaQuest: Attraction data not found."
        );

        return;

    }


    if (!place.id) {

        console.error(
            "LankaQuest: Attraction ID is missing."
        );

        return;

    }


    const trip =
        getMyTrip();


    /* ========================================================
       ALREADY EXISTS
    ======================================================== */

    const exists =
        trip.some(
            item =>
                String(item.id) ===
                String(place.id)
        );


    if (exists) {

        updateButtonAlreadyAdded();

        return;

    }


    /* ========================================================
       ADD DESTINATION
    ======================================================== */

    trip.push(
        place
    );


    saveMyTrip(
        trip
    );


    console.log(
        "LankaQuest destination added:",
        place
    );


    updateButtonAdded();


    /* ========================================================
       GO TO TRIP PLANNER

       The planner will read the SAME
       sriLankaMyTrip storage and display
       the destination under:

       📍 My Destinations
    ======================================================== */

    setTimeout(
        () => {

            window.location.href =
                "../../../../trip-planner.html";

        },
        250
    );

}


/* ============================================================
   8. BUTTON — ADDED
============================================================ */

function updateButtonAdded() {

    if (
        !addToMyTripButton
    ) {

        return;

    }


    addToMyTripButton.textContent =
        "✓ Added to My Trip";


    addToMyTripButton.classList.add(
        "added"
    );


    addToMyTripButton.disabled =
        true;

}


/* ============================================================
   9. BUTTON — ALREADY ADDED
============================================================ */

function updateButtonAlreadyAdded() {

    if (
        !addToMyTripButton
    ) {

        return;

    }


    addToMyTripButton.textContent =
        "✓ Already in My Trip";


    addToMyTripButton.classList.add(
        "added"
    );


    addToMyTripButton.disabled =
        true;

}


/* ============================================================
   10. INITIAL BUTTON STATE
============================================================ */

function updateInitialButtonState() {

    if (
        !addToMyTripButton
    ) {

        return;

    }


    const placeId =
        addToMyTripButton.dataset.placeId;


    if (
        !placeId
    ) {

        return;

    }


    if (
        isAlreadyInMyTrip(
            placeId
        )
    ) {

        updateButtonAlreadyAdded();

    }

}


/* ============================================================
   11. CLICK EVENT
============================================================ */

if (
    addToMyTripButton
) {

    addToMyTripButton.addEventListener(
        "click",
        addAttractionToMyTrip
    );

}


/* ============================================================
   12. INITIALIZE
============================================================ */

updateInitialButtonState();

