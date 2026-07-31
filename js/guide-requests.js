/* ============================================================
GUIDE REQUESTS & QUOTATION SYSTEM
Explore Sri Lanka

FLOW:

Guide Dashboard
↓
Incoming Trip Requests
↓
Send Quotation
↓
guide-requests.html?requestId=...
↓
Load Tourist Request
↓
Guide Creates Quotation
↓
Disclaimer Accepted
↓
Save Quotation
↓
Tourist Can Review Quotation

FRONTEND DEMO ARCHITECTURE

Storage:

exploreSriLankaQuotationRequests

Later:

Backend API
Database
Secure Authentication
============================================================ */

/* ============================================================

1. STORAGE KEY
   ============================================================ */

const GUIDE_QUOTATION_REQUESTS_KEY =
"exploreSriLankaQuotationRequests";

/* ============================================================
2. DOM ELEMENTS
============================================================ */

const guideRequestContent =
document.getElementById(
"guideRequestContent"
);

const requestErrorState =
document.getElementById(
"requestErrorState"
);

const requestStatusBadge =
document.getElementById(
"requestStatusBadge"
);

const touristName =
document.getElementById(
"touristName"
);

const touristEmail =
document.getElementById(
"touristEmail"
);

const requestStartDate =
document.getElementById(
"requestStartDate"
);

const requestEndDate =
document.getElementById(
"requestEndDate"
);

const requestTravelers =
document.getElementById(
"requestTravelers"
);

const requestTravelStyle =
document.getElementById(
"requestTravelStyle"
);

const requestTransport =
document.getElementById(
"requestTransport"
);

const requestAccommodation =
document.getElementById(
"requestAccommodation"
);

const requestDestinations =
document.getElementById(
"requestDestinations"
);

const requestSpecialRequests =
document.getElementById(
"requestSpecialRequests"
);

const requestIdDisplay =
document.getElementById(
"requestIdDisplay"
);

const quotationForm =
document.getElementById(
"quotationForm"
);

const quotationAmount =
document.getElementById(
"quotationAmount"
);

const quotationCurrency =
document.getElementById(
"quotationCurrency"
);

const quotationIncluded =
document.getElementById(
"quotationIncluded"
);

const quotationExcluded =
document.getElementById(
"quotationExcluded"
);

const quotationValidUntil =
document.getElementById(
"quotationValidUntil"
);

const quotationNotes =
document.getElementById(
"quotationNotes"
);

const disclaimerAccepted =
document.getElementById(
"disclaimerAccepted"
);

const quotationFormMessage =
document.getElementById(
"quotationFormMessage"
);

const cancelQuotationButton =
document.getElementById(
"cancelQuotationButton"
);

const backToGuideDashboardButton =
document.getElementById(
"backToGuideDashboardButton"
);

const logoutButton =
document.getElementById(
"logoutButton"
);

const guideHeaderName =
document.getElementById(
"guideHeaderName"
);

/* ============================================================
3. CURRENT REQUEST
============================================================ */

/*
Currently opened request.

URL Example:

guide-requests.html?requestId=REQ-123456
*/

let currentRequest = null;

/* ============================================================
4. GET REQUEST ID FROM URL
============================================================ */

function getRequestIdFromURL() {


const urlParams =
    new URLSearchParams(
        window.location.search
    );


return urlParams.get(
    "requestId"
);


}

/* ============================================================
5. GET ALL QUOTATION REQUESTS
============================================================ */

function getGuideQuotationRequests() {


const savedRequests =
    localStorage.getItem(
        GUIDE_QUOTATION_REQUESTS_KEY
    );


/*
   No requests
*/

if (!savedRequests) {

    return [];

}


/*
   Parse Requests
*/

try {

    const requests =
        JSON.parse(
            savedRequests
        );


    /*
       Validate Array
    */

    if (
        !Array.isArray(
            requests
        )
    ) {

        return [];

    }


    return requests;

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
   6. SAVE GUIDE QUOTATION REQUEST
   FIRESTORE VERSION

   Collection:

   lankaQuestQuotationRequests

============================================================ */


import {
    collection,
    addDoc,
    serverTimestamp
}
from
"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


import {
    db
}
from
"./firebase-config.js";





async function saveGuideQuotationRequest(
    requestData
){


    try{


        const docRef =

            await addDoc(

                collection(
                    db,
                    "lankaQuestQuotationRequests"
                ),

                {


                    ...requestData,


                    createdAt:
                    serverTimestamp(),


                    updatedAt:
                    serverTimestamp(),


                    status:
                    "pending"


                }

            );



        console.log(

            "Quotation Request Saved:",

            docRef.id

        );



        return {

            success:true,

            id:docRef.id

        };


    }


    catch(error){


        console.error(

            "Save quotation request error:",

            error

        );



        return {


            success:false,


            error:error.message


        };


    }


}

/* ============================================================
7. SHOW ERROR STATE
============================================================ */

function showRequestError(
message
) {


/*
   Hide Main Content
*/

if (
    guideRequestContent
) {

    guideRequestContent.style.display =
        "none";

}


/*
   Show Error State
*/

if (
    requestErrorState
) {

    requestErrorState.style.display =
        "block";

}


/*
   Update Error Message
   if available
*/

const errorParagraph =
    requestErrorState
        ?.querySelector(
            "p"
        );


if (
    errorParagraph &&
    message
) {

    errorParagraph.textContent =
        message;

}


}

/* ============================================================
8. SHOW REQUEST CONTENT
============================================================ */

function showRequestContent() {

/*
   Hide Error
*/

if (
    requestErrorState
) {

    requestErrorState.style.display =
        "none";

}


/*
   Show Content
*/

if (
    guideRequestContent
) {

    guideRequestContent.style.display =
        "block";

}


}

/* ============================================================
9. FORMAT STATUS
============================================================ */

function formatRequestStatus(
status
) {


if (
    !status
) {

    return "Pending";

}


const statusMap = {

    pending:
        "Pending",

    guide_selected:
        "Guide Selected",

    quotation_sent:
        "Quotation Sent",

    quotation_accepted:
        "Quotation Accepted",

    quotation_rejected:
        "Quotation Rejected"

};


return (

    statusMap[
        status
    ]

    ||

    status

);


}

/* ============================================================
10. RENDER REQUEST STATUS
============================================================ */

function renderRequestStatus(
request
) {


if (
    !requestStatusBadge
) {

    return;

}


const status =
    request.status ||
    "pending";


requestStatusBadge.textContent =
    formatRequestStatus(
        status
    );


/*
   Add Status Class
*/

requestStatusBadge.className =
    "request-status-badge";


requestStatusBadge.classList.add(

    "status-" +

    status

);


}

/* ============================================================
11. RENDER REQUEST DESTINATIONS
============================================================ */

function renderRequestDestinations(
destinations
) {

if (
    !requestDestinations
) {

    return;

}


/*
   Clear Existing
*/

requestDestinations.innerHTML =
    "";


/*
   No Destinations
*/

if (
    !Array.isArray(
        destinations
    )

    ||

    destinations.length === 0
) {

    requestDestinations.innerHTML = `

        <div class="request-destination-item">

            <span>
                No destinations selected.
            </span>

        </div>

    `;


    return;

}


/*
   Render Destination Cards
*/

destinations.forEach(

    (
        place,
        index
    ) => {

        const destination =
            document.createElement(
                "div"
            );


        destination.className =
            "request-destination-item";


        destination.innerHTML = `

            <div class="request-destination-number">

                ${index + 1}

            </div>


            ${
                place.image

                    ? `

                        <img
                            src="${place.image}"
                            alt="${place.name || "Destination"}"
                        >

                    `

                    : `

                        <div class="request-destination-placeholder">

                            📍

                        </div>

                    `
            }


            <div>

                <strong>

                    ${place.name || "Unknown Destination"}

                </strong>


                <span>

                    ${
                        place.district
                            || ""
                    }

                    ${
                        place.province

                            ? " · " +
                              place.province

                            : ""
                    }

                </span>

            </div>

        `;


        requestDestinations.appendChild(
            destination
        );

    }

);


}

/* ============================================================
12. RENDER REQUEST DETAILS
============================================================ */

function renderRequestDetails(
request
) {


const tourist =
    request.tourist ||
    {};


/*
   Tourist
*/

if (
    touristName
) {

    touristName.textContent =

        tourist.fullName

        ||

        "Unknown Tourist";

}


/*
   Email
*/

if (
    touristEmail
) {

    touristEmail.textContent =

        tourist.email

        ||

        "Email not available";

}


/*
   Dates
*/

if (
    requestStartDate
) {

    requestStartDate.textContent =

        request.startDate

        ||

        "Not selected";

}


if (
    requestEndDate
) {

    requestEndDate.textContent =

        request.endDate

        ||

        "Not selected";

}


/*
   Travelers
*/

if (
    requestTravelers
) {

    requestTravelers.textContent =

        request.travelers

        ||

        "Not selected";

}


/*
   Travel Style
*/

if (
    requestTravelStyle
) {

    requestTravelStyle.textContent =

        request.travelStyle

        ||

        "Not selected";

}


/*
   Transport
*/

if (
    requestTransport
) {

    requestTransport.textContent =

        request.transport

        ||

        "Not selected";

}


/*
   Accommodation
*/

if (
    requestAccommodation
) {

    requestAccommodation.textContent =

        request.accommodation

        ||

        "Not selected";

}


/*
   Special Requests
*/

if (
    requestSpecialRequests
) {

    requestSpecialRequests.textContent =

        request.specialRequests

        ||

        "No special requests provided.";

}


/*
   Request ID
*/

if (
    requestIdDisplay
) {

    requestIdDisplay.textContent =

        request.requestId

        ||

        "N/A";

}


/*
   Destinations
*/

renderRequestDestinations(

    request.destinations

        ||

    []

);


/*
   Status
*/

renderRequestStatus(
    request
);


}

/* ============================================================
13. LOAD REQUEST BY ID
============================================================ */

function loadRequestById(
requestId
) {


/*
   Validate Request ID
*/

if (
    !requestId
) {

    showRequestError(

        "No request ID was provided. Please return to the Guide Dashboard."

    );


    return null;

}


/*
   Get Requests
*/

const requests =
    getGuideQuotationRequests();


/*
   Find Request
*/

const request =
    requests.find(

        item =>

            String(
                item.requestId
            )

            ===

            String(
                requestId
            )

    );


/*
   Request Not Found
*/

if (
    !request
) {

    showRequestError(

        "The requested trip quotation request could not be found."

    );


    return null;

}


/*
   Store Current Request
*/

currentRequest =
    request;


/*
   Render
*/

renderRequestDetails(
    request
);


showRequestContent();


return request;


}

/* ============================================================
14. GET GUIDE PROFILE
============================================================ */

function getCurrentGuide() {


/*
   auth.js
   getCurrentUser()
*/

const user =

    typeof getCurrentUser ===
    "function"

        ?

    getCurrentUser()

        :

    null;


/*
   No User
*/

if (
    !user
) {

    window.location.href =
        "login.html";


    return null;

}


/*
   Must Be Guide
*/

if (
    user.accountType !==
    "guide"
) {

    if (
        typeof redirectAfterLogin ===
        "function"
    ) {

        redirectAfterLogin(
            user
        );

    }

    else {

        window.location.href =
            "index.html";

    }


    return null;

}


/*
   Guide Verification
*/

if (
    user.verificationStatus !==
    "approved"
) {

    window.location.href =
        "guide-verification.html";


    return null;

}


/*
   Display Guide Name
*/

if (
    guideHeaderName
) {

    guideHeaderName.textContent =

        user.fullName

        ||

        "Guide";

}


return user;


}

/* ============================================================
15. SHOW FORM MESSAGE
============================================================ */

function showQuotationMessage(
message,
type = "error"
) {


if (
    !quotationFormMessage
) {

    return;

}


quotationFormMessage.textContent =
    message;


quotationFormMessage.style.display =
    "block";


/*
   Remove Old Classes
*/

quotationFormMessage.classList.remove(

    "message-error",

    "message-success"

);


/*
   Add Current Class
*/

quotationFormMessage.classList.add(

    type === "success"

        ?

    "message-success"

        :

    "message-error"

);


}

/* ============================================================
16. CLEAR FORM MESSAGE
============================================================ */

function clearQuotationMessage() {


if (
    quotationFormMessage
) {

    quotationFormMessage.textContent =
        "";


    quotationFormMessage.style.display =
        "none";

}


}

/* ============================================================
17. VALIDATE QUOTATION
============================================================ */

function validateQuotationForm() {


/*
   Amount
*/

const amount =
    quotationAmount
        ? Number(
            quotationAmount.value
        )

        :

        0;


if (
    !amount

    ||

    amount <= 0
) {

    showQuotationMessage(

        "Please enter a valid quotation amount."

    );


    if (
        quotationAmount
    ) {

        quotationAmount.focus();

    }


    return false;

}


/*
   Currency
*/

if (
    !quotationCurrency

    ||

    !quotationCurrency.value
) {

    showQuotationMessage(

        "Please select a quotation currency."

    );


    if (
        quotationCurrency
    ) {

        quotationCurrency.focus();

    }


    return false;

}


/*
   Valid Until
*/

if (
    !quotationValidUntil

    ||

    !quotationValidUntil.value
) {

    showQuotationMessage(

        "Please select a quotation validity date."

    );


    if (
        quotationValidUntil
    ) {

        quotationValidUntil.focus();

    }


    return false;

}


/*
   Check Validity Date
*/

const today =
    new Date();


today.setHours(
    0,
    0,
    0,
    0
);


const validUntil =
    new Date(

        quotationValidUntil.value

    );


if (
    validUntil <
    today
) {

    showQuotationMessage(

        "Quotation validity date cannot be in the past."

    );


    quotationValidUntil.focus();


    return false;

}


/*
   Disclaimer
*/

if (
    !disclaimerAccepted

    ||

    !disclaimerAccepted.checked
) {

    showQuotationMessage(

        "Please read and accept the disclaimer before sending the quotation."

    );


    if (
        disclaimerAccepted
    ) {

        disclaimerAccepted.focus();

    }


    return false;

}


return true;


}

/* ============================================================
18. CREATE QUOTATION OBJECT
============================================================ */

function createQuotation(
guide
) {


return {

    /*
       Unique Quotation ID
    */

    quotationId:

        "QUO-" +

        Date.now(),


    /*
       Request ID
    */

    requestId:

        currentRequest.requestId,


    /*
       Guide Information
    */

    guide: {

        id:

            guide.id

            ||

            "",


        fullName:

            guide.fullName

            ||

            "Guide",


        email:

            guide.email

            ||

            "",


        phone:

            guide.phone

            ||

            "",


        district:

            guide.district

            ||

            "",


        province:

            guide.province

            ||

            "",


        languages:

            guide.languages

            ||

            ""

    },


    /*
       Pricing
    */

    amount:

        Number(
            quotationAmount.value
        ),


    currency:

        quotationCurrency.value,


    /*
       Services
    */

    included:

        quotationIncluded.value.trim(),


    excluded:

        quotationExcluded.value.trim(),


    /*
       Validity
    */

    validUntil:

        quotationValidUntil.value,


    /*
       Message
    */

    notes:

        quotationNotes.value.trim(),


    /*
       Status
    */

    status:

        "sent",


    /*
       Disclaimer
    */

    disclaimerAccepted:

        true,


    disclaimerAcceptedAt:

        new Date().toISOString(),


    /*
       Created Time
    */

    createdAt:

        new Date().toISOString()

};


}

/* ============================================================
19. SEND QUOTATION
============================================================ */

function sendQuotation(
guide
) {


/*
   Validate Current Request
*/

if (
    !currentRequest
) {

    showQuotationMessage(

        "The trip request could not be loaded."

    );


    return;

}


/*
   Validate Form
*/

if (
    !validateQuotationForm()
) {

    return;

}


/*
   Create Quotation
*/

const quotation =
    createQuotation(
        guide
    );


/*
   Get All Requests
*/

const requests =
    getGuideQuotationRequests();


/*
   Find Current Request
*/

const requestIndex =
    requests.findIndex(

        request =>

            String(
                request.requestId
            )

            ===

            String(
                currentRequest.requestId
            )

    );


/*
   Request Not Found
*/

if (
    requestIndex === -1
) {

    showQuotationMessage(

        "Unable to update the trip request."

    );


    return;

}


/*
   Initialize Quotations
*/

if (
    !Array.isArray(
        requests[
            requestIndex
        ].quotations
    )
) {

    requests[
        requestIndex
    ].quotations = [];

}


/*
   Add Quotation
*/

requests[
    requestIndex
].quotations.push(
    quotation
);


/*
   Update Request Status
*/

requests[
    requestIndex
].status =

    "quotation_sent";


/*
   Update Timestamp
*/

requests[
    requestIndex
].updatedAt =

    new Date().toISOString();


/*
   Save Requests
*/

saveGuideQuotationRequests(
    requests
);


/*
   Success Message
*/

showQuotationMessage(

    "Quotation sent successfully. The tourist can now review your quotation.",

    "success"

);


/*
   Disable Submit Button
*/

const sendButton =
    document.getElementById(
        "sendQuotationButton"
    );


if (
    sendButton
) {

    sendButton.disabled =
        true;


    sendButton.textContent =
        "✓ Quotation Sent";

}


/*
   Redirect After Short Delay
*/

setTimeout(

    () => {

        window.location.href =
            "guide-dashboard.html";

    },

    1500

);


}

/* ============================================================
20. QUOTATION FORM SUBMIT
============================================================ */

if (
quotationForm
) {

quotationForm.addEventListener(

    "submit",

    event => {

        /*
           Prevent Page Reload
        */

        event.preventDefault();


        /*
           Get Current Guide
        */

        const guide =
            getCurrentGuide();


        /*
           Guide Not Available
        */

        if (
            !guide
        ) {

            return;

        }


        /*
           Send Quotation
        */

        sendQuotation(
            guide
        );

    }

);


}

/* ============================================================
21. BACK TO GUIDE DASHBOARD
============================================================ */

if (
backToGuideDashboardButton
) {


backToGuideDashboardButton.addEventListener(

    "click",

    () => {

        window.location.href =
            "guide-dashboard.html";

    }

);


}

/* ============================================================
22. CANCEL QUOTATION
============================================================ */

if (
cancelQuotationButton
) {


cancelQuotationButton.addEventListener(

    "click",

    () => {

        /*
           Return to Dashboard
        */

        window.location.href =
            "guide-dashboard.html";

    }

);


}

/* ============================================================
23. LOGOUT
============================================================ */

if (
logoutButton
) {


logoutButton.addEventListener(

    "click",

    () => {

        if (
            typeof logoutUser ===
            "function"
        ) {

            logoutUser();

        }

        else {

            window.location.href =
                "index.html";

        }

    }

);


}

/* ============================================================
24. INITIALIZE GUIDE REQUEST PAGE
============================================================ */

document.addEventListener(


"DOMContentLoaded",

() => {

    console.log(

        "Guide Requests Page Loading..."

    );


    /*
       Check Guide Authentication
    */

    const guide =
        getCurrentGuide();


    if (
        !guide
    ) {

        return;

    }


    /*
       Get Request ID
    */

    const requestId =
        getRequestIdFromURL();


    /*
       Load Request
    */

    loadRequestById(
        requestId
    );


    console.log(

        "Guide Requests Page Loaded",

        {

            requestId:

                requestId

        }

    );

}


);
