
/* ============================================================
   QUOTATION REQUEST PAGE LOGIC
   Explore Sri Lanka

   FLOW:

   Tourist
      ↓
   Trip Planner
      ↓
   Save Planner Data
      ↓
   Login Check
      ↓
   Login
      ↓
   Quotation Request
      ↓
   Submit Request
      ↓
   Save Request to localStorage
      ↓
   Find Registered Guides
      ↓
   Tourist Selects Guide
      ↓
   Guide Dashboard

   FRONTEND DEMO ARCHITECTURE
============================================================ */


/* ============================================================
   1. STORAGE KEYS
============================================================ */

const MY_TRIP_KEY =
    "sriLankaMyTrip";

const PLANNER_DATA_KEY =
    "sriLankaTripPlannerData";

const QUOTATION_REQUESTS_KEY =
    "exploreSriLankaQuotationRequests";


/* ============================================================
   2. DOM ELEMENTS
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


const summaryQuotationPlaces =
    document.getElementById(
        "summaryQuotationPlaces"
    );


const summaryQuotationDates =
    document.getElementById(
        "summaryQuotationDates"
    );


const summaryQuotationTravelers =
    document.getElementById(
        "summaryQuotationTravelers"
    );


const submitQuotationButton =
    document.getElementById(
        "submitQuotationButton"
    );


/* ============================================================
   3. GET MY TRIP
============================================================ */

function getQuotationTrip() {

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


        return Array.isArray(trip)

            ? trip

            : [];

    }

    catch (error) {

        console.error(
            "My Trip data error:",
            error
        );


        return [];

    }

}


/* ============================================================
   4. GET PLANNER DATA
============================================================ */

function getPlannerData() {

    const savedData =
        localStorage.getItem(
            PLANNER_DATA_KEY
        );


    if (!savedData) {

        return {};

    }


    try {

        return JSON.parse(
            savedData
        );

    }

    catch (error) {

        console.error(
            "Planner data error:",
            error
        );


        return {};

    }

}


/* ============================================================
   5. GET QUOTATION REQUESTS
============================================================ */

function getQuotationRequests() {

    const savedRequests =
        localStorage.getItem(
            QUOTATION_REQUESTS_KEY
        );


    if (!savedRequests) {

        return [];

    }


    try {

        const requests =
            JSON.parse(
                savedRequests
            );


        return Array.isArray(requests)

            ? requests

            : [];

    }

    catch (error) {

        console.error(
            "Quotation request data error:",
            error
        );


        return [];

    }

}


/* ============================================================
   6. SAVE QUOTATION REQUESTS
============================================================ */

function saveQuotationRequests(
    requests
) {

    localStorage.setItem(

        QUOTATION_REQUESTS_KEY,

        JSON.stringify(
            requests
        )

    );

}


/* ============================================================
   7. RENDER DESTINATIONS
============================================================ */

function renderQuotationDestinations() {

    const trip =
        getQuotationTrip();


    /*
       Clear Existing
    */

    if (
        quotationDestinations
    ) {

        quotationDestinations.innerHTML =
            "";

    }


    /*
       Update Place Count
    */

    if (
        quotationPlaceCount
    ) {

        quotationPlaceCount.textContent =

            trip.length +

            (
                trip.length === 1

                    ? " Place"

                    : " Places"

            );

    }


    /*
       Update Summary Count
    */

    if (
        summaryQuotationPlaces
    ) {

        summaryQuotationPlaces.textContent =
            trip.length;

    }


    /*
       Empty Trip
    */

    if (
        trip.length === 0
    ) {

        if (
            quotationDestinations
        ) {

            quotationDestinations.innerHTML = `

                <div class="quotation-empty-state">

                    <div>
                        🗺️
                    </div>

                    <h3>
                        No destinations selected
                    </h3>

                    <p>
                        Please return to My Trip
                        and select destinations.
                    </p>

                    <a
                        href="trip-planner.html"
                        class="quotation-back-trip-button"
                    >

                        ← Back to My Trip

                    </a>

                </div>

            `;

        }


        return;

    }


    /*
       Create Destination Cards
    */

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
                "quotation-destination-card";


            card.innerHTML = `

                <div class="quotation-destination-number">

                    ${index + 1}

                </div>


                <img
                    src="${place.image || ""}"
                    alt="${place.name || "Destination"}"
                >


                <div class="quotation-destination-info">

                    <h4>

                        ${place.name || "Unknown Destination"}

                    </h4>


                    <p>

                        📍

                        ${place.district || ""}

                        ${
                            place.province

                                ? " · " +
                                  place.province

                                : ""
                        }

                    </p>


                    <p>

                        ⭐

                        ${place.rating || "N/A"}

                    </p>

                </div>

            `;


            if (
                quotationDestinations
            ) {

                quotationDestinations.appendChild(
                    card
                );

            }

        }

    );

}


/* ============================================================
   8. LOAD TRAVEL DETAILS
============================================================ */

function loadTravelDetails() {

    const data =
        getPlannerData();


    /*
       Start Date
    */

    if (
        quotationStartDate
    ) {

        quotationStartDate.textContent =

            data.startDate ||

            "Not selected";

    }


    /*
       End Date
    */

    if (
        quotationEndDate
    ) {

        quotationEndDate.textContent =

            data.endDate ||

            "Not selected";

    }


    /*
       Travelers
    */

    if (
        quotationTravelers
    ) {

        quotationTravelers.textContent =

            data.travelers ||

            "Not selected";

    }


    /*
       Travel Style
    */

    if (
        quotationTravelStyle
    ) {

        quotationTravelStyle.textContent =

            data.travelStyle ||

            "Not selected";

    }


    /*
       Transport
    */

    if (
        quotationTransport
    ) {

        quotationTransport.textContent =

            data.transport ||

            "Not selected";

    }


    /*
       Accommodation
    */

    if (
        quotationAccommodation
    ) {

        quotationAccommodation.textContent =

            data.accommodation ||

            "Not selected";

    }


    /*
       Special Requests
    */

    if (
        quotationSpecialRequests
    ) {

        quotationSpecialRequests.textContent =

            data.specialRequests ||

            "No special requests provided.";

    }


    /*
       Summary Dates
    */

    if (
        summaryQuotationDates
    ) {

        if (
            data.startDate &&
            data.endDate
        ) {

            summaryQuotationDates.textContent =

                data.startDate +

                " → " +

                data.endDate;

        }

        else {

            summaryQuotationDates.textContent =

                "Not selected";

        }

    }


    /*
       Summary Travelers
    */

    if (
        summaryQuotationTravelers
    ) {

        summaryQuotationTravelers.textContent =

            data.travelers ||

            "Not selected";

    }

}


/* ============================================================
   9. CREATE QUOTATION REQUEST
============================================================ */

function createQuotationRequest() {

    /*
       Get Current User
    */

    const user =

        typeof getCurrentUser ===
        "function"

            ? getCurrentUser()

            : null;


    /*
       User Not Logged In
    */

    if (!user) {

        return null;

    }


    /*
       Get Destinations
    */

    const destinations =
        getQuotationTrip();


    /*
       Validate Destinations
    */

    if (
        destinations.length === 0
    ) {

        alert(

            "Please select at least one destination before sending a quotation request."

        );


        return null;

    }


    /*
       Get Planner Data
    */

    const plannerData =
        getPlannerData();


    /*
       Create Request
    */

    const quotationRequest = {


        /*
           Unique Request ID
        */

        requestId:

            "REQ-" +

            Date.now(),


        /*
           Tourist Information
        */

        tourist: {

            id:

                user.id ||

                "",


            fullName:

                user.fullName ||

                "",


            email:

                user.email ||

                "",


            country:

                user.country ||

                ""

        },


        /*
           Destinations
        */

        destinations:

            destinations,


        /*
           Travel Details
        */

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


        /*
           Request Status
        */

        status:

            "pending",


        /*
           Selected Guide
           
           මුලින් Guide එකක්
           Select කරලා නැත.
        */

        selectedGuide:

            null,


        /*
           Guide Quotations
        */

        quotations:

            [],


        /*
           Created Date
        */

        createdAt:

            new Date().toISOString()

    };


    return quotationRequest;

}


/* ============================================================
   10. SUBMIT QUOTATION REQUEST
============================================================ */

function submitQuotationRequest() {


    /*
       LOGIN CHECK
    */

    const user =

        typeof getCurrentUser ===
        "function"

            ? getCurrentUser()

            : null;


    /*
       User Not Logged In
    */

    if (!user) {

        window.location.href =

            "login.html?redirect=quotation-request.html";


        return;

    }


    /*
       TOURIST CHECK
    */

    if (
        user.accountType !==
        "tourist"
    ) {

        alert(

            "Only Tourist accounts can send quotation requests."

        );


        return;

    }


    /*
       CREATE REQUEST
    */

    const quotationRequest =

        createQuotationRequest();


    /*
       Stop if Failed
    */

    if (
        !quotationRequest
    ) {

        return;

    }


    /*
       GET EXISTING REQUESTS
    */

    const existingRequests =

        getQuotationRequests();


    /*
       SAVE NEW REQUEST
    */

    existingRequests.push(

        quotationRequest

    );


    /*
       Save to LocalStorage
    */

    saveQuotationRequests(

        existingRequests

    );


    /*
       Debug
    */

    console.log(

        "Quotation Request Saved:",

        quotationRequest

    );


    /*
       SUCCESS MESSAGE
    */

    alert(

        "Your quotation request has been submitted successfully. Now you can choose a registered guide."

    );


    /*
       IMPORTANT:

       මෙතැනින් පස්සේ
       Tourist Dashboard එකට
       redirect කරන්න එපා.

       Find Guides Page එකට
       පමණක් යන්න.
    */

    window.location.href =

        "find-guides.html";

}


/* ============================================================
   11. SUBMIT BUTTON EVENT
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
   12. PAGE INITIALIZATION
============================================================ */

document.addEventListener(

    "DOMContentLoaded",

    () => {


        /*
           Current User
        */

        const user =

            typeof getCurrentUser ===
            "function"

                ? getCurrentUser()

                : null;


        /*
           Login නැත්නම්
        */

        if (!user) {

            window.location.href =

                "login.html?redirect=quotation-request.html";


            return;

        }


        /*
           Tourist නොවේ නම්
        */

        if (
            user.accountType !==
            "tourist"
        ) {

            if (
                typeof redirectAfterLogin ===
                "function"
            ) {

                redirectAfterLogin(
                    user
                );

            }


            return;

        }


        /*
           Render Destinations
        */

        renderQuotationDestinations();


        /*
           Load Travel Details
        */

        loadTravelDetails();


        /*
           Debug
        */

        console.log(

            "Quotation Request Page Loaded:",

            user

        );

    }

);

