
/* ============================================================
   LankaWayfarer
   QUOTATION REQUEST PAGE

   FIREBASE FIRST ARCHITECTURE

   FLOW:

   Tourist
      ↓
   Firebase Authentication
      ↓
   Load Tourist Trip
      ↓
   lankaQuestTouristTrips/{tripId}
      ↓
   Verify Tourist Ownership
      ↓
   Create Quotation Request
      ↓
   lankaQuestQuotationRequests/{requestId}
      ↓
   Update Tourist Trip
      ↓
   quotationRequested = true
      ↓
   Find Guides
      ↓
   Select Guide
      ↓
   Existing Request
============================================================ */


/* ============================================================
   1. FIREBASE IMPORTS
============================================================ */

import {
    auth,
    db
} from "./firebase-config.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    doc,
    query,
    where,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* ============================================================
   2. FIRESTORE COLLECTIONS
============================================================ */

const TRIP_COLLECTION =
    "lankaQuestTouristTrips";


const QUOTATION_COLLECTION =
    "lankaQuestQuotationRequests";


/* ============================================================
   3. GLOBAL STATE
============================================================ */

let currentTourist =
    null;


let currentTrip =
    null;


let currentQuotationRequest =
    null;


let quotationSubmissionInProgress =
    false;


/* ============================================================
   4. DOM ELEMENTS
============================================================ */

const quotationDestinations =
    document.getElementById(
        "quotationDestinations"
    );


const quotationPlaceCount =
    document.getElementById(
        "quotationPlaceCount"
    );


const quotationStartDate =
    document.getElementById(
        "quotationStartDate"
    );


const quotationEndDate =
    document.getElementById(
        "quotationEndDate"
    );


const quotationTravelers =
    document.getElementById(
        "quotationTravelers"
    );


const quotationTravelStyle =
    document.getElementById(
        "quotationTravelStyle"
    );


const quotationTransport =
    document.getElementById(
        "quotationTransport"
    );


const quotationAccommodation =
    document.getElementById(
        "quotationAccommodation"
    );


const quotationSpecialRequests =
    document.getElementById(
        "quotationSpecialRequests"
    );


const submitQuotationButton =
    document.getElementById(
        "submitQuotationButton"
    );


/* ============================================================
   5. URL PARAMETERS
============================================================ */

function getURLParameters() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return {

        tripId:
            params.get("trip"),

        requestId:
            params.get("requestId"),

        guideId:
            params.get("guideId")

    };

}


/* ============================================================
   6. FIREBASE AUTH STATE
============================================================ */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            redirectToLogin();

            return;

        }


        currentTourist =
            user;


        console.log(
            "LankaWayfarer Tourist authenticated:",
            user.uid
        );


        try {

            const {
                tripId,
                requestId
            } =
                getURLParameters();


            /*
               EXISTING REQUEST FLOW
            */

            if (requestId) {

                await loadExistingQuotationRequest(
                    requestId
                );

                return;

            }


            /*
               NEW REQUEST FLOW
            */

            if (tripId) {

                await loadTrip(
                    tripId
                );

                return;

            }


            showError(
                "Trip information was not found."
            );

        } catch (error) {

            console.error(
                "Quotation page initialization error:",
                error
            );


            showError(
                "Unable to load quotation information."
            );

        }

    }
);


/* ============================================================
   7. LOGIN REDIRECT
============================================================ */

function redirectToLogin() {

    const redirect =
        encodeURIComponent(
            window.location.pathname +
            window.location.search
        );


    window.location.href =
        "login.html?redirect=" +
        redirect;

}


/* ============================================================
   8. LOAD TOURIST TRIP
============================================================ */

async function loadTrip(
    tripId
) {

    if (!tripId) {

        showError(
            "Trip not found."
        );

        return;

    }


    console.log(
        "Loading tourist trip:",
        tripId
    );


    const tripRef =
        doc(
            db,
            TRIP_COLLECTION,
            tripId
        );


    const snapshot =
        await getDoc(
            tripRef
        );


    if (!snapshot.exists()) {

        console.error(
            "Trip does not exist:",
            tripId
        );


        showError(
            "This trip does not exist."
        );

        return;

    }


    const data =
        snapshot.data();


    /*
       SECURITY CHECK

       The authenticated tourist must
       own this trip.
    */

    if (
        data.touristId !==
        currentTourist.uid
    ) {

        console.error(
            "Trip ownership mismatch."
        );


        showError(
            "You do not have permission to access this trip."
        );

        return;

    }


    currentTrip = {

        id:
            snapshot.id,

        ...data

    };


    console.log(
        "Tourist trip loaded:",
        currentTrip
    );


    /*
       If the trip already has a quotation
       request, check it before allowing
       another one.
    */

    if (
        currentTrip.quotationRequestId
    ) {

        await loadExistingQuotationRequest(
            currentTrip.quotationRequestId
        );

        return;

    }


    renderQuotationData();

}


/* ============================================================
   9. LOAD EXISTING QUOTATION REQUEST
============================================================ */

async function loadExistingQuotationRequest(
    requestId
) {

    if (!requestId) {

        showError(
            "Quotation request not found."
        );

        return;

    }


    console.log(
        "Loading quotation request:",
        requestId
    );


    const requestRef =
        doc(
            db,
            QUOTATION_COLLECTION,
            requestId
        );


    const snapshot =
        await getDoc(
            requestRef
        );


    if (!snapshot.exists()) {

        console.error(
            "Quotation request does not exist:",
            requestId
        );


        showError(
            "Quotation request not found."
        );

        return;

    }


    const data =
        snapshot.data();


    /*
       SECURITY CHECK

       Only the tourist who created
       this request can access it.
    */

    if (
        data.touristId !==
        currentTourist.uid
    ) {

        console.error(
            "Quotation request ownership mismatch."
        );


        showError(
            "You do not have permission to access this quotation request."
        );

        return;

    }


    currentQuotationRequest = {

        id:
            snapshot.id,

        ...data

    };


    console.log(
        "Existing quotation request:",
        currentQuotationRequest
    );


    /*
       Build a compatible trip object
       from the quotation request.

       This allows the same renderer
       to be used.
    */

    currentTrip = {

        id:
            data.tripId || "",

        destinations:
            Array.isArray(
                data.destinations
            )
                ? data.destinations
                : [],

        startDate:
            data.startDate || "",

        endDate:
            data.endDate || "",

        travelers:
            data.travelers || "",

        travelStyle:
            data.travelStyle || "",

        transport:
            data.transport || "",

        accommodation:
            data.accommodation || "",

        specialRequests:
            data.specialRequests || "",

        touristId:
            data.touristId || "",

        touristEmail:
            data.touristEmail || "",

        touristName:
            data.touristName || ""

    };


    renderQuotationData();


    /*
       Existing request cannot be
       submitted again.
    */

    disableQuotationButton();


    /*
       Show selected guide if available.
    */

    renderSelectedGuide();

}


/* ============================================================
   10. RENDER QUOTATION DATA
============================================================ */

function renderQuotationData() {

    if (!currentTrip) {

        return;

    }


    const destinations =
        Array.isArray(
            currentTrip.destinations
        )
            ? currentTrip.destinations
            : [];


    /*
       PLACE COUNT
    */

    if (
        quotationPlaceCount
    ) {

        quotationPlaceCount.textContent =
            destinations.length +
            (
                destinations.length === 1
                    ? " Place"
                    : " Places"
            );

    }


    /*
       DESTINATIONS
    */

    if (
        quotationDestinations
    ) {

        quotationDestinations.innerHTML =
            "";


        destinations.forEach(
            (
                place,
                index
            ) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "quotation-destination-card";


                const image =
                    place.image ||
                    "";


                const name =
                    place.name ||
                    "Destination";


                const district =
                    place.district ||
                    "";


                card.innerHTML = `

                    <img
                        src="${escapeHTML(
                            image
                        )}"
                        alt="${escapeHTML(
                            name
                        )}"
                        loading="lazy"
                    >

                    <h4>
                        ${index + 1}.
                        ${escapeHTML(
                            name
                        )}
                    </h4>

                    <p>
                        📍
                        ${escapeHTML(
                            district
                        )}
                    </p>

                `;


                quotationDestinations.appendChild(
                    card
                );

            }
        );

    }


    /*
       TRAVEL DETAILS
    */

    setText(
        quotationStartDate,
        currentTrip.startDate ||
        "Not selected"
    );


    setText(
        quotationEndDate,
        currentTrip.endDate ||
        "Not selected"
    );


    setText(
        quotationTravelers,
        currentTrip.travelers ||
        "Not selected"
    );


    setText(
        quotationTravelStyle,
        currentTrip.travelStyle ||
        "Not selected"
    );


    setText(
        quotationTransport,
        currentTrip.transport ||
        "Not selected"
    );


    setText(
        quotationAccommodation,
        currentTrip.accommodation ||
        "Not selected"
    );


    setText(
        quotationSpecialRequests,
        currentTrip.specialRequests ||
        "No special requests"
    );

}


/* ============================================================
   11. SET TEXT HELPER
============================================================ */

function setText(
    element,
    value
) {

    if (!element) {

        return;

    }


    element.textContent =
        value;

}


/* ============================================================
   12. CHECK EXISTING REQUEST FOR TRIP
============================================================ */

async function findExistingRequestForTrip(
    tripId
) {

    if (!tripId) {

        return null;

    }


    const requestsRef =
        collection(
            db,
            QUOTATION_COLLECTION
        );


    const requestQuery =
        query(
            requestsRef,
            where(
                "tripId",
                "==",
                tripId
            ),
            where(
                "touristId",
                "==",
                currentTourist.uid
            )
        );


    const snapshot =
        await getDocs(
            requestQuery
        );


    if (
        snapshot.empty
    ) {

        return null;

    }


    /*
       Return the first existing request.

       A trip should normally have
       only one active quotation request.
    */

    const requestDoc =
        snapshot.docs[0];


    return {

        id:
            requestDoc.id,

        ...requestDoc.data()

    };

}


/* ============================================================
   13. CREATE QUOTATION REQUEST
============================================================ */

async function submitQuotationRequest() {

    if (
        quotationSubmissionInProgress
    ) {

        return;

    }


    quotationSubmissionInProgress =
        true;


    const originalButtonText =
        submitQuotationButton
            ? submitQuotationButton.textContent
            : "";


    try {

        /*
           AUTH CHECK
        */

        if (
            !currentTourist
        ) {

            redirectToLogin();

            return;

        }


        /*
           TRIP CHECK
        */

        if (
            !currentTrip ||
            !currentTrip.id
        ) {

            alert(
                "Trip information is not available."
            );

            return;

        }


        /*
           EXISTING REQUEST CHECK
        */

        if (
            currentQuotationRequest
        ) {

            alert(
                "This quotation request has already been submitted."
            );

            return;

        }


        /*
           DISABLE BUTTON
        */

        if (
            submitQuotationButton
        ) {

            submitQuotationButton.disabled =
                true;


            submitQuotationButton.textContent =
                "Checking Request...";
        }


        /*
           CHECK FIRESTORE

           This prevents duplicate quotation
           requests even if the tourist
           refreshes or clicks twice.
        */

        const existingRequest =
            await findExistingRequestForTrip(
                currentTrip.id
            );


        if (
            existingRequest
        ) {

            currentQuotationRequest =
                existingRequest;


            disableQuotationButton();


            alert(
                "A quotation request already exists for this trip."
            );


            window.location.href =
                "quotation-request.html?requestId=" +
                encodeURIComponent(
                    existingRequest.id
                );


            return;

        }


        /*
           CREATE REQUEST
        */

        if (
            submitQuotationButton
        ) {

            submitQuotationButton.textContent =
                "Sending Request...";
        }


        const requestData = {

            /*
               TOURIST
            */

            touristId:
                currentTourist.uid,

            touristName:
                currentTourist.displayName ||
                currentTourist.email ||
                "",

            touristEmail:
                currentTourist.email ||
                "",


            /*
               TRIP
            */

            tripId:
                currentTrip.id,


            /*
               DESTINATIONS
            */

            destinations:
                Array.isArray(
                    currentTrip.destinations
                )
                    ? currentTrip.destinations
                    : [],


            /*
               TRAVEL DETAILS
            */

            startDate:
                currentTrip.startDate ||
                "",

            endDate:
                currentTrip.endDate ||
                "",

            travelers:
                currentTrip.travelers ||
                "",

            travelStyle:
                currentTrip.travelStyle ||
                "",

            transport:
                currentTrip.transport ||
                "",

            accommodation:
                currentTrip.accommodation ||
                "",

            specialRequests:
                currentTrip.specialRequests ||
                "",


            /*
               GUIDE

               Guide is selected later.
            */

            guideId:
                null,

            guideName:
                "",

            guideEmail:
                "",


            /*
               WORKFLOW
            */

            status:
                "pending",

            quotationRequested:
                true,

            guideSelected:
                false,


            /*
               TIMESTAMPS
            */

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        };


        /*
           SAVE QUOTATION REQUEST
        */

        const requestRef =
            await addDoc(
                collection(
                    db,
                    QUOTATION_COLLECTION
                ),
                requestData
            );


        console.log(
            "Quotation request created:",
            requestRef.id
        );


        /*
           UPDATE TOURIST TRIP

           The Trip now knows which
           quotation request belongs to it.
        */

        const tripRef =
            doc(
                db,
                TRIP_COLLECTION,
                currentTrip.id
            );


        await updateDoc(
            tripRef,
            {

                quotationRequestId:
                    requestRef.id,

                quotationRequested:
                    true,

                status:
                    "quotation_requested",

                updatedAt:
                    serverTimestamp()

            }
        );


        console.log(
            "Tourist trip updated:",
            currentTrip.id
        );


        /*
           STORE CURRENT REQUEST
        */

        currentQuotationRequest = {

            id:
                requestRef.id,

            ...requestData

        };


        /*
           SUCCESS
        */

        alert(
            "Quotation request created successfully."
        );


        /*
           Continue to Find Guides.
        */

        window.location.href =
            "find-guides.html?requestId=" +
            encodeURIComponent(
                requestRef.id
            );

    } catch (error) {

        console.error(
            "Quotation request error:",
            error
        );


        /*
           FIRESTORE PERMISSION
        */

        if (
            error.code ===
            "permission-denied"
        ) {

            alert(
                "Firestore denied this request. Please make sure you are logged in as the correct Tourist."
            );

            return;

        }


        /*
           GENERAL ERROR
        */

        alert(
            error.message ||
            "Unable to submit quotation request."
        );

    } finally {

        quotationSubmissionInProgress =
            false;


        /*
           Only restore the button
           if we did not navigate away
           or permanently disable it.
        */

        if (
            submitQuotationButton &&
            !currentQuotationRequest
        ) {

            submitQuotationButton.disabled =
                false;


            submitQuotationButton.textContent =
                originalButtonText;

        }

    }

}


/* ============================================================
   14. DISABLE SUBMIT BUTTON
============================================================ */

function disableQuotationButton() {

    if (
        !submitQuotationButton
    ) {

        return;

    }


    submitQuotationButton.disabled =
        true;


    submitQuotationButton.textContent =
        "Quotation Request Submitted";

}


/* ============================================================
   15. SELECTED GUIDE
============================================================ */

function renderSelectedGuide() {

    if (
        !currentQuotationRequest
    ) {

        return;

    }


    const selectedGuide =
        currentQuotationRequest.selectedGuide ||
        null;


    /*
       Guide information is optional here.

       Find Guides is responsible for
       selecting and updating the guide.

       This function intentionally does
       not create another Firestore source.
    */

    if (
        selectedGuide
    ) {

        console.log(
            "Selected guide:",
            selectedGuide
        );

    }


    /*
       Also support the cleaner guideId
       structure.
    */

    if (
        currentQuotationRequest.guideId
    ) {

        console.log(
            "Selected guide ID:",
            currentQuotationRequest.guideId
        );

    }

}


/* ============================================================
   16. BUTTON EVENT
============================================================ */

if (
    submitQuotationButton
) {

    submitQuotationButton.addEventListener(
        "click",
        submitQuotationRequest
    );

}


/* ============================================================
   17. HTML ESCAPE
============================================================ */

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value == null
            ? ""
            : String(value);


    return div.innerHTML;

}


/* ============================================================
   18. ERROR HANDLING
============================================================ */

function showError(
    message
) {

    console.error(
        "Quotation Request Error:",
        message
    );


    alert(
        message
    );

}


/* ============================================================
   19. INITIAL STATE
============================================================ */

console.log("LankaWayfarer Quotation Request loaded.");


/* ============================================================
   END QUOTATION-REQUEST.JS
============================================================ */

