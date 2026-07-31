
/* ============================================================
   LANKAQUEST
   GUIDE REQUESTS & QUOTATION SYSTEM

   FIRESTORE-ONLY ARCHITECTURE

   FLOW:

   Guide Dashboard
        ↓
   Incoming Trip Request
        ↓
   guide-requests.html?requestId=FIRESTORE_DOC_ID
        ↓
   Load Request from Firestore
        ↓
   Verify Current Guide
        ↓
   Create Quotation
        ↓
   Save Quotation to Firestore
        ↓
   Update Request
        ↓
   status = "quotation_sent"
        ↓
   Guide Dashboard


   FIRESTORE COLLECTIONS:

   lankaQuestQuotationRequests
   lankaQuestQuotations
   lankaQuestGuides


   IMPORTANT:

   ❌ No localStorage
   ❌ No demo request storage
   ❌ No old Explore Sri Lanka storage

   ✅ Firebase Authentication
   ✅ Firestore
============================================================ */


/* ============================================================
   1. FIREBASE IMPORTS
============================================================ */

import {
    db
} from "./firebase-config.js";

import { getCurrentUser, logoutUser } from "./auth.js";

import {
    collection,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";




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

let currentRequest = null;


/* ============================================================
   4. CURRENT GUIDE
============================================================ */

let currentGuide = null;


/* ============================================================
   5. GET REQUEST ID FROM URL
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
   GET AUTHENTICATED FIREBASE USER
============================================================ */

function getAuthenticatedUser() {

    try {

        const user =
            getCurrentUser();

        return user || null;

    }
    catch (error) {

        console.error(
            "Unable to get authenticated user:",
            error
        );

        return null;

    }
}



/* ============================================================
   7. SHOW REQUEST ERROR
============================================================ */

function showRequestError(
    message
) {

    if (
        guideRequestContent
    ) {

        guideRequestContent.style.display =
            "none";
    }


    if (
        requestErrorState
    ) {

        requestErrorState.style.display =
            "block";
    }


    const errorParagraph =
        requestErrorState?.querySelector(
            "p"
        );


    if (
        errorParagraph
    ) {

        errorParagraph.textContent =
            message;
    }

}


/* ============================================================
   8. SHOW REQUEST CONTENT
============================================================ */

function showRequestContent() {

    if (
        requestErrorState
    ) {

        requestErrorState.style.display =
            "none";
    }


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
            "Quotation Rejected",

        completed:
            "Completed"

    };


    return (
        statusMap[status] ||
        status ||
        "Pending"
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


    requestStatusBadge.className =
        "request-status-badge";


    requestStatusBadge.classList.add(
        "status-" + status
    );

}


/* ============================================================
   11. RENDER DESTINATIONS
============================================================ */

function renderRequestDestinations(
    destinations
) {

    if (
        !requestDestinations
    ) {

        return;
    }


    requestDestinations.innerHTML =
        "";


    if (
        !Array.isArray(
            destinations
        ) ||
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


            const imageHTML =
                place.image
                    ? `

                        <img
                            src="${escapeHTML(place.image)}"
                            alt="${escapeHTML(
                                place.name ||
                                "Destination"
                            )}"
                        >

                    `
                    : `

                        <div class="request-destination-placeholder">
                            📍
                        </div>

                    `;


            destination.innerHTML = `

                <div class="request-destination-number">
                    ${index + 1}
                </div>

                ${imageHTML}

                <div>

                    <strong>
                        ${escapeHTML(
                            place.name ||
                            "Unknown Destination"
                        )}
                    </strong>

                    <span>

                        ${escapeHTML(
                            place.district ||
                            ""
                        )}

                        ${
                            place.province
                                ? " · " +
                                  escapeHTML(
                                      place.province
                                  )
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
   12. HTML ESCAPE
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
   13. RENDER REQUEST DETAILS
============================================================ */

function renderRequestDetails(
    request
) {

    /*
       Current Firestore request can use
       either direct tourist fields or
       nested tourist object.

       Support both so existing documents
       continue to work.
    */

    const tourist =
        request.tourist ||
        {};


    const fullName =
        tourist.fullName ||
        request.touristName ||
        "Unknown Tourist";


    const email =
        tourist.email ||
        request.touristEmail ||
        "Email not available";


    if (
        touristName
    ) {

        touristName.textContent =
            fullName;
    }


    if (
        touristEmail
    ) {

        touristEmail.textContent =
            email;
    }


    if (
        requestStartDate
    ) {

        requestStartDate.textContent =
            request.startDate ||
            "Not selected";
    }


    if (
        requestEndDate
    ) {

        requestEndDate.textContent =
            request.endDate ||
            "Not selected";
    }


    if (
        requestTravelers
    ) {

        requestTravelers.textContent =
            request.travelers ||
            "Not selected";
    }


    if (
        requestTravelStyle
    ) {

        requestTravelStyle.textContent =
            request.travelStyle ||
            "Not selected";
    }


    if (
        requestTransport
    ) {

        requestTransport.textContent =
            request.transport ||
            "Not selected";
    }


    if (
        requestAccommodation
    ) {

        requestAccommodation.textContent =
            request.accommodation ||
            "Not selected";
    }


    if (
        requestSpecialRequests
    ) {

        requestSpecialRequests.textContent =
            request.specialRequests ||
            "No special requests provided.";
    }


    if (
        requestIdDisplay
    ) {

        requestIdDisplay.textContent =
            request.requestId ||
            request.id ||
            "N/A";
    }


    renderRequestDestinations(
        request.destinations ||
        []
    );


    renderRequestStatus(
        request
    );

}


/* ============================================================
   14. GET CURRENT GUIDE FROM FIRESTORE
============================================================ */

async function getGuideProfile(
    firebaseUser
) {

    if (
        !firebaseUser
    ) {

        return null;
    }


    try {

        const guideRef =
            doc(
                db,
                "lankaQuestGuides",
                firebaseUser.uid
            );


        const guideSnapshot =
            await getDoc(
                guideRef
            );


        if (
            !guideSnapshot.exists()
        ) {

            return null;
        }


        return {

            uid:
                firebaseUser.uid,

            ...guideSnapshot.data()

        };

    }
    catch (
        error
    ) {

        console.error(
            "Guide profile error:",
            error
        );


        return null;

    }

}


/* ============================================================
   15. VERIFY CURRENT GUIDE
============================================================ */

async function verifyGuide() {

    const user =
        getAuthenticatedUser();


    if (
        !user
    ) {

        showRequestError(
            "Please login as a guide."
        );


        return false;
    }


    /*
       Account type check
    */

    if (
        user.accountType &&
        user.accountType !==
        "guide"
    ) {

        showRequestError(
            "This account is not registered as a guide."
        );


        return false;
    }


    const firebaseUser =
        user.firebaseUser ||
        user.authUser ||
        user;


    /*
       Firebase UID
    */

    const uid =
        firebaseUser.uid ||
        user.uid;


    if (
        !uid
    ) {

        showRequestError(
            "Firebase authentication information is missing."
        );


        return false;
    }


    const guide =
        await getGuideProfile(
            {
                uid
            }
        );


    if (
        !guide
    ) {

        showRequestError(
            "Guide profile was not found."
        );


        return false;
    }


    if (
        guide.accountType &&
        guide.accountType !==
        "guide"
    ) {

        showRequestError(
            "This account is not registered as a guide."
        );


        return false;
    }


    /*
       Only approved guides can
       send quotations.
    */

    if (
        guide.verificationStatus !==
        "approved"
    ) {

        showRequestError(
            "Your guide account has not been approved yet."
        );


        return false;
    }


    currentGuide =
        guide;


    if (
        guideHeaderName
    ) {

        guideHeaderName.textContent =
            guide.fullName ||
            "Guide";
    }


    return true;

}


/* ============================================================
   16. LOAD REQUEST FROM FIRESTORE
============================================================ */

async function loadRequestById(
    requestId
) {

    if (
        !requestId
    ) {

        showRequestError(
            "No request ID was provided. Please return to the Guide Dashboard."
        );


        return null;
    }


    try {

        /*
           requestId from the URL is the
           Firestore document ID.
        */

        const requestRef =
            doc(
                db,
                "lankaQuestQuotationRequests",
                requestId
            );


        const requestSnapshot =
            await getDoc(
                requestRef
            );


        if (
            !requestSnapshot.exists()
        ) {

            showRequestError(
                "The requested trip quotation request could not be found."
            );


            return null;
        }


        const requestData =
            requestSnapshot.data();


        /*
           Keep Firestore document ID.
        */

        const request = {

            id:
                requestSnapshot.id,

            requestId:
                requestData.requestId ||
                requestSnapshot.id,

            ...requestData

        };


        /*
           SECURITY CHECK

           The request should belong to
           this guide.
        */

        if (
            request.guideId &&
            currentGuide &&
            request.guideId !==
            currentGuide.uid
        ) {

            showRequestError(
                "This quotation request is not assigned to your guide account."
            );


            return null;
        }


        /*
           If no guideId exists, allow old
           guide-selected documents where
           selectedGuide.uid matches.
        */

        if (
            !request.guideId &&
            request.selectedGuide?.uid &&
            currentGuide &&
            request.selectedGuide.uid !==
            currentGuide.uid
        ) {

            showRequestError(
                "This quotation request is assigned to another guide."
            );


            return null;
        }


        currentRequest =
            request;


        renderRequestDetails(
            request
        );


        showRequestContent();


        return request;

    }
    catch (
        error
    ) {

        console.error(
            "Load quotation request error:",
            error
        );


        showRequestError(
            "Unable to load the quotation request from Firestore."
        );


        return null;

    }

}


/* ============================================================
   17. SHOW QUOTATION MESSAGE
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


    quotationFormMessage.classList.remove(
        "message-error",
        "message-success"
    );


    quotationFormMessage.classList.add(
        type === "success"
            ? "message-success"
            : "message-error"
    );

}


/* ============================================================
   18. CLEAR QUOTATION MESSAGE
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
   19. VALIDATE QUOTATION
============================================================ */

function validateQuotationForm() {

    clearQuotationMessage();


    /*
       Amount
    */

    const amount =
        quotationAmount
            ? Number(
                quotationAmount.value
            )
            : 0;


    if (
        !amount ||
        amount <= 0
    ) {

        showQuotationMessage(
            "Please enter a valid quotation amount."
        );


        quotationAmount?.focus();


        return false;
    }


    /*
       Currency
    */

    if (
        !quotationCurrency ||
        !quotationCurrency.value
    ) {

        showQuotationMessage(
            "Please select a quotation currency."
        );


        quotationCurrency?.focus();


        return false;
    }


    /*
       Valid Until
    */

    if (
        !quotationValidUntil ||
        !quotationValidUntil.value
    ) {

        showQuotationMessage(
            "Please select a quotation validity date."
        );


        quotationValidUntil?.focus();


        return false;
    }


    /*
       Date validation
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
        !disclaimerAccepted ||
        !disclaimerAccepted.checked
    ) {

        showQuotationMessage(
            "Please read and accept the disclaimer before sending the quotation."
        );


        disclaimerAccepted?.focus();


        return false;
    }


    return true;

}


/* ============================================================
   20. CREATE QUOTATION DATA
============================================================ */

function createQuotation(
    guide
) {

    const quotationId =
        "QUO-" +
        Date.now();


    return {

        quotationId:


            quotationId,


        requestId:

            currentRequest.requestId ||
            currentRequest.id,


        requestFirestoreId:

            currentRequest.id ||
            currentRequest.requestId,


        /*
           Tourist
        */

        touristId:

            currentRequest.touristId ||
            currentRequest.tourist?.uid ||
            "",


        touristName:

            currentRequest.touristName ||
            currentRequest.tourist?.fullName ||
            "",


        touristEmail:

            currentRequest.touristEmail ||
            currentRequest.tourist?.email ||
            "",


        /*
           Guide
        */

        guideId:

            guide.uid ||
            "",


        guideName:

            guide.fullName ||
            "Guide",


        guideEmail:

            guide.email ||
            "",


        guidePhone:

            guide.phone ||
            "",


        /*
           Trip
        */

        destinations:

            currentRequest.destinations ||
            [],


        startDate:

            currentRequest.startDate ||
            "",


        endDate:

            currentRequest.endDate ||
            "",


        travelers:

            currentRequest.travelers ||
            "",


        travelStyle:

            currentRequest.travelStyle ||
            "",


        transport:

            currentRequest.transport ||
            "",


        accommodation:

            currentRequest.accommodation ||
            "",


        specialRequests:

            currentRequest.specialRequests ||
            "",


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

            quotationIncluded
                ? quotationIncluded.value.trim()
                : "",


        excluded:

            quotationExcluded
                ? quotationExcluded.value.trim()
                : "",


        /*
           Validity
        */

        validUntil:

            quotationValidUntil.value,


        /*
           Guide message
        */

        notes:

            quotationNotes
                ? quotationNotes.value.trim()
                : "",


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

            serverTimestamp(),


        /*
           Created
        */

        createdAt:

            serverTimestamp(),


        updatedAt:

            serverTimestamp()

    };

}


/* ============================================================
   21. SAVE QUOTATION TO FIRESTORE
============================================================ */

async function saveQuotationToFirestore(
    quotation
) {

    try {

        /*
           Create quotation document
        */

        const quotationRef =
            await addDoc(
                collection(
                    db,
                    "lankaQuestQuotations"
                ),
                quotation
            );


        console.log(
            "Quotation saved:",
            quotationRef.id
        );


        return {

            success:
                true,

            id:
                quotationRef.id

        };

    }
    catch (
        error
    ) {

        console.error(
            "Save quotation error:",
            error
        );


        return {

            success:
                false,

            error:
                error.message

        };

    }

}


/* ============================================================
   22. UPDATE ORIGINAL REQUEST
============================================================ */

async function updateQuotationRequest(
    quotationFirestoreId
) {

    if (
        !currentRequest?.id
    ) {

        return {

            success:
                false,

            error:
                "Request Firestore ID is missing."

        };

    }


    try {

        const requestRef =
            doc(
                db,
                "lankaQuestQuotationRequests",
                currentRequest.id
            );


        await updateDoc(
            requestRef,
            {

                status:
                    "quotation_sent",


                quotationRequested:
                    true,


                quotationId:
                    quotationFirestoreId,


                quotationSentAt:
                    serverTimestamp(),


                updatedAt:
                    serverTimestamp()

            }
        );


        /*
           Update local current request
           only in memory.
        */

        currentRequest.status =
            "quotation_sent";


        currentRequest.quotationRequested =
            true;


        currentRequest.quotationId =
            quotationFirestoreId;


        return {

            success:
                true

        };

    }
    catch (
        error
    ) {

        console.error(
            "Update quotation request error:",
            error
        );


        return {

            success:
                false,

            error:
                error.message

        };

    }

}


/* ============================================================
   23. SEND QUOTATION
============================================================ */

async function sendQuotation(
    guide
) {

    if (
        !currentRequest
    ) {

        showQuotationMessage(
            "The trip request could not be loaded."
        );


        return;
    }


    if (
        !validateQuotationForm()
    ) {

        return;
    }


    /*
       Prevent duplicate quotation
    */

    if (
        currentRequest.status ===
        "quotation_sent"
    ) {

        showQuotationMessage(
            "A quotation has already been sent for this request."
        );


        return;
    }


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
            "Sending...";

    }


    try {

        /*
           Create quotation
        */

        const quotation =
            createQuotation(
                guide
            );


        /*
           Save quotation
        */

        const quotationResult =
            await saveQuotationToFirestore(
                quotation
            );


        if (
            !quotationResult.success
        ) {

            throw new Error(
                quotationResult.error ||
                "Quotation could not be saved."
            );

        }


        /*
           Update request
        */

        const updateResult =
            await updateQuotationRequest(
                quotationResult.id
            );


        if (
            !updateResult.success
        ) {

            /*
               Quotation already exists.

               We don't silently pretend
               the request update succeeded.
            */

            throw new Error(
                updateResult.error ||
                "Quotation was saved but the trip request could not be updated."
            );

        }


        /*
           Success
        */

        showQuotationMessage(
            "Quotation sent successfully. The tourist can now review your quotation.",
            "success"
        );


        renderRequestStatus(
            currentRequest
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
           Return to dashboard
        */

        setTimeout(
            () => {

                window.location.href =
                    "guide-dashboard.html";

            },
            1500
        );

    }
    catch (
        error
    ) {

        console.error(
            "Send quotation error:",
            error
        );


        showQuotationMessage(
            error.message ||
            "Unable to send quotation."
        );


        if (
            sendButton
        ) {

            sendButton.disabled =
                false;


            sendButton.textContent =
                "Send Quotation";

        }

    }

}


/* ============================================================
   24. QUOTATION FORM SUBMIT
============================================================ */

if (
    quotationForm
) {

    quotationForm.addEventListener(
        "submit",
        async (
            event
        ) => {

            event.preventDefault();


            const verified =
                await verifyGuide();


            if (
                !verified
            ) {

                return;
            }


            await sendQuotation(
                currentGuide
            );

        }
    );

}


/* ============================================================
   25. BACK TO GUIDE DASHBOARD
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
   26. CANCEL QUOTATION
============================================================ */

if (
    cancelQuotationButton
) {

    cancelQuotationButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "guide-dashboard.html";

        }
    );

}


/* ============================================================
   27. LOGOUT
============================================================ */

if (
    logoutButton
) {

    logoutButton.addEventListener(
        "click",
        async () => {

            if (
                typeof window.logoutUser ===
                "function"
            ) {

                try {

                    await window.logoutUser();

                }
                catch (
                    error
                ) {

                    console.error(
                        "Logout error:",
                        error
                    );


                    window.location.href =
                        "index.html";

                }

            }
            else {

                window.location.href =
                    "index.html";

            }

        }
    );

}


/* ============================================================
   28. INITIALIZE GUIDE REQUEST PAGE
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "Guide Requests Page Loading..."
        );


        /*
           Verify Guide
        */

        const verified =
            await verifyGuide();


        if (
            !verified
        ) {

            return;
        }


        /*
           Get Firestore Request ID
        */

        const requestId =
            getRequestIdFromURL();


        if (
            !requestId
        ) {

            showRequestError(
                "No request ID was provided. Please return to the Guide Dashboard."
            );


            return;
        }


        /*
           Load request
        */

        await loadRequestById(
            requestId
        );


        console.log(
            "Guide Requests Page Loaded",
            {

                requestId:
                    requestId,

                guideId:
                    currentGuide?.uid

            }
        );

    }
);

