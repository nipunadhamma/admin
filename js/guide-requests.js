
/* ============================================================
   LANKAQUEST
   GUIDE REQUESTS & QUOTATION SYSTEM

   FIRESTORE-FIRST ARCHITECTURE

   FLOW:

   Guide Dashboard
        ↓
   Incoming Trip Request
        ↓
   guide-requests.html?requestId=FIRESTORE_DOC_ID
        ↓
   Firebase Auth State
        ↓
   Verify Current Guide
        ↓
   Load Request from Firestore
        ↓
   Verify Request belongs to Guide
        ↓
   Create Quotation
        ↓
   Save Quotation
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
   ❌ No sessionStorage
   ❌ No demo request storage
   ❌ No old Explore Sri Lanka storage

   ✅ Firebase Authentication
   ✅ Firestore
   ✅ Firebase UID
============================================================ */


/* ============================================================
   1. FIREBASE IMPORTS
============================================================ */

import {
    db,
    auth
} from "./firebase-config.js";


import {
    logoutUser
} from "./auth.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


import {
    collection,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";



/* ============================================================
   2. FIRESTORE COLLECTIONS
============================================================ */

const GUIDE_COLLECTION =
    "lankaQuestGuides";


const REQUEST_COLLECTION =
    "lankaQuestQuotationRequests";


const QUOTATION_COLLECTION =
    "lankaQuestQuotations";



/* ============================================================
   3. DOM ELEMENTS
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
        "touristFullName"
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
   4. GLOBAL STATE
============================================================ */

let currentRequest =
    null;


let currentGuide =
    null;


let authReady =
    false;


let pageInitialized =
    false;



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
   6. GET CURRENT FIREBASE USER
============================================================ */

function getAuthenticatedUser() {

    return (
        auth.currentUser ||
        null
    );

}



/* ============================================================
   7. SHOW REQUEST ERROR
============================================================ */

function showRequestError(
    message
) {

    console.error(
        "Guide Request Error:",
        message
    );


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
   9. FORMAT REQUEST STATUS
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
   11. HTML ESCAPE
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
   12. RENDER DESTINATIONS
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
                            src="${escapeHTML(
                                place.image
                            )}"
                            alt="${escapeHTML(
                                place.name ||
                                "Destination"
                            )}"
                            onerror="
                                this.style.display='none';
                            "
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
   13. RENDER REQUEST DETAILS
============================================================ */

function renderRequestDetails(
    request
) {

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
   14. GET GUIDE PROFILE
============================================================ */

async function getGuideProfile(
    firebaseUser
) {

    if (
        !firebaseUser?.uid
    ) {

        console.error(
            "getGuideProfile(): Firebase UID missing."
        );


        return null;

    }


    try {

        const guideRef =
            doc(
                db,
                GUIDE_COLLECTION,
                firebaseUser.uid
            );


        const guideSnapshot =
            await getDoc(
                guideRef
            );


        if (
            !guideSnapshot.exists()
        ) {

            console.error(
                "Guide profile not found:",
                firebaseUser.uid
            );


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

async function verifyGuide(
    firebaseUser = null
) {

    const user =
        firebaseUser ||
        getAuthenticatedUser();


    /* ========================================================
       FIREBASE AUTH CHECK
    ======================================================== */

    if (
        !user
    ) {

        showRequestError(
            "Please login as a guide."
        );


        return false;

    }


    console.log(
        "Firebase Guide UID:",
        user.uid
    );


    console.log(
        "Firebase Guide Email:",
        user.email
    );


    /* ========================================================
       LOAD GUIDE PROFILE
    ======================================================== */

    const guide =
        await getGuideProfile(
            user
        );


    if (
        !guide
    ) {

        showRequestError(
            "Guide profile was not found for this Firebase account."
        );


        return false;

    }


    /* ========================================================
       ACCOUNT TYPE
    ======================================================== */

    if (
        guide.accountType &&
        guide.accountType !==
        "guide"
    ) {

        showRequestError(
            "This Firebase account is not registered as a guide."
        );


        return false;

    }


    /* ========================================================
       VERIFICATION STATUS
    ======================================================== */

    if (
        guide.verificationStatus !==
        "approved"
    ) {

        showRequestError(
            "Your guide account has not been approved yet."
        );


        return false;

    }


    /* ========================================================
       STATUS
    ======================================================== */

    if (
        guide.status &&
        guide.status !==
        "approved"
    ) {

        showRequestError(
            "Your guide account is not currently approved."
        );


        return false;

    }


    /* ========================================================
       ACTIVE PROFILE
    ======================================================== */

    if (
        guide.profileStatus &&
        guide.profileStatus !==
        "active"
    ) {

        showRequestError(
            "Your guide profile is not currently active."
        );


        return false;

    }


    /* ========================================================
       ACTIVE FLAG
    ======================================================== */

    if (
        guide.isActive !== undefined &&
        guide.isActive !== true
    ) {

        showRequestError(
            "Your guide account is currently inactive."
        );


        return false;

    }


    /* ========================================================
       SAVE CURRENT GUIDE
    ======================================================== */

    currentGuide =
        guide;


    if (
        guideHeaderName
    ) {

        guideHeaderName.textContent =
            guide.fullName ||
            "Guide";

    }


    console.log(
        "Verified Guide:",
        currentGuide
    );


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


    if (
        !currentGuide
    ) {

        showRequestError(
            "Guide authentication has not been verified."
        );


        return null;

    }


    try {

        console.log(
            "Loading Firestore request:",
            requestId
        );


        const requestRef =
            doc(
                db,
                REQUEST_COLLECTION,
                requestId
            );


        const requestSnapshot =
            await getDoc(
                requestRef
            );


        /* ====================================================
           REQUEST DOES NOT EXIST
        ==================================================== */

        if (
            !requestSnapshot.exists()
        ) {

            showRequestError(
                "The requested trip quotation request could not be found."
            );


            console.error(
                "Firestore request not found:",
                requestId
            );


            return null;

        }


        const requestData =
            requestSnapshot.data();


        /* ====================================================
           CREATE REQUEST OBJECT
        ==================================================== */

        const request = {

            id:
                requestSnapshot.id,

            requestId:
                requestSnapshot.id,

            ...requestData

        };


        /*
           If Firestore contains a custom requestId,
           preserve it.
        */

        if (
            requestData.requestId
        ) {

            request.requestId =
                requestData.requestId;

        }


        /* ====================================================
           SECURITY CHECK 1
           guideId
        ==================================================== */

        if (
            request.guideId
        ) {

            if (
                request.guideId !==
                currentGuide.uid
            ) {

                showRequestError(
                    "This quotation request is not assigned to your guide account."
                );


                console.error(
                    "Guide ID mismatch.",
                    {

                        requestGuideId:
                            request.guideId,

                        currentGuideId:
                            currentGuide.uid

                    }
                );


                return null;

            }

        }


        /* ====================================================
           SECURITY CHECK 2
           selectedGuide.uid
        ==================================================== */

        if (
            request.selectedGuide?.uid
        ) {

            if (
                request.selectedGuide.uid !==
                currentGuide.uid
            ) {

                showRequestError(
                    "This quotation request is assigned to another guide."
                );


                console.error(
                    "Selected guide UID mismatch.",
                    {

                        selectedGuideUid:
                            request.selectedGuide.uid,

                        currentGuideId:
                            currentGuide.uid

                    }
                );


                return null;

            }

        }


        /* ====================================================
           SECURITY CHECK 3
           GUIDE ID MISSING
        ==================================================== */

        if (
            !request.guideId &&
            !request.selectedGuide?.uid
        ) {

            showRequestError(
                "This quotation request has not been assigned to a guide yet."
            );


            return null;

        }


        /* ====================================================
           SAVE CURRENT REQUEST
        ==================================================== */

        currentRequest =
            request;


        console.log(
            "Current quotation request:",
            currentRequest
        );


        /* ====================================================
           RENDER
        ==================================================== */

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


        quotationFormMessage.classList.remove(
            "message-error",
            "message-success"
        );

    }

}



/* ============================================================
   19. VALIDATE QUOTATION
============================================================ */

function validateQuotationForm() {

    clearQuotationMessage();


    /* ========================================================
       AMOUNT
    ======================================================== */

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


    /* ========================================================
       CURRENCY
    ======================================================== */

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


    /* ========================================================
       VALID UNTIL
    ======================================================== */

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


    /* ========================================================
       DATE VALIDATION
    ======================================================== */

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


    /* ========================================================
       DISCLAIMER
    ======================================================== */

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


        /* ====================================================
           TOURIST
        ==================================================== */

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


        /* ====================================================
           GUIDE
        ==================================================== */

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


        /* ====================================================
           TRIP
        ==================================================== */

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


        /* ====================================================
           PRICING
        ==================================================== */

        amount:

            Number(
                quotationAmount.value
            ),


        currency:

            quotationCurrency.value,


        /* ====================================================
           SERVICES
        ==================================================== */

        included:

            quotationIncluded
                ? quotationIncluded.value.trim()
                : "",


        excluded:

            quotationExcluded
                ? quotationExcluded.value.trim()
                : "",


        /* ====================================================
           VALIDITY
        ==================================================== */

        validUntil:

            quotationValidUntil.value,


        /* ====================================================
           GUIDE NOTES
        ==================================================== */

        notes:

            quotationNotes
                ? quotationNotes.value.trim()
                : "",


        /* ====================================================
           STATUS
        ==================================================== */

        status:
            "sent",


        /* ====================================================
           DISCLAIMER
        ==================================================== */

        disclaimerAccepted:
            true,


        disclaimerAcceptedAt:
            serverTimestamp(),


        /* ====================================================
           TIMESTAMPS
        ==================================================== */

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

        const quotationRef =
            await addDoc(
                collection(
                    db,
                    QUOTATION_COLLECTION
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
                REQUEST_COLLECTION,
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


        /* ====================================================
           UPDATE MEMORY ONLY
        ==================================================== */

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
        !guide
    ) {

        showQuotationMessage(
            "Guide authentication could not be verified."
        );


        return;

    }


    if (
        !validateQuotationForm()
    ) {

        return;

    }


    /* ========================================================
       PREVENT DUPLICATE QUOTATION
    ======================================================== */

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

        /* ====================================================
           CREATE QUOTATION
        ==================================================== */

        const quotation =
            createQuotation(
                guide
            );


        /* ====================================================
           SAVE QUOTATION
        ==================================================== */

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


        /* ====================================================
           UPDATE ORIGINAL REQUEST
        ==================================================== */

        const updateResult =
            await updateQuotationRequest(
                quotationResult.id
            );


        if (
            !updateResult.success
        ) {

            throw new Error(
                updateResult.error ||
                "Quotation was saved but the trip request could not be updated."
            );

        }


        /* ====================================================
           SUCCESS
        ==================================================== */

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


        /* ====================================================
           RETURN TO DASHBOARD
        ==================================================== */

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


            /*
               Firebase Auth state should already
               be ready by this point.

               But verify again before sending.
            */

            const firebaseUser =
                getAuthenticatedUser();


            if (
                !firebaseUser
            ) {

                showQuotationMessage(
                    "Your guide login session has expired. Please login again."
                );


                return;

            }


            const verified =
                await verifyGuide(
                    firebaseUser
                );


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

            try {

                await logoutUser();

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
    );

}



/* ============================================================
   28. INITIALIZE GUIDE REQUEST PAGE

   IMPORTANT FIX:

   DO NOT use:

       document.addEventListener(
           "DOMContentLoaded",
           ...
       );

   to authenticate the guide.

   Firebase Authentication may still be restoring
   the Google login session at DOMContentLoaded.

   We therefore WAIT for:

       onAuthStateChanged()

   before verifying the guide and loading the request.
============================================================ */

onAuthStateChanged(
    auth,
    async (
        firebaseUser
    ) => {

        console.log(
            "Guide Requests Auth State:",
            firebaseUser
        );


        /* ====================================================
           AUTH STATE READY
        ==================================================== */

        authReady =
            true;


        /* ====================================================
           NO FIREBASE USER
        ==================================================== */

        if (
            !firebaseUser
        ) {

            showRequestError(
                "Please login as a guide."
            );


            console.error(
                "Guide Requests: Firebase user is not authenticated."
            );


            return;

        }


        /* ====================================================
           FIREBASE USER FOUND
        ==================================================== */

        console.log(
            "Authenticated Firebase UID:",
            firebaseUser.uid
        );


        console.log(
            "Authenticated Firebase Email:",
            firebaseUser.email
        );


        /* ====================================================
           VERIFY GUIDE
        ==================================================== */

        const verified =
            await verifyGuide(
                firebaseUser
            );


        if (
            !verified
        ) {

            return;

        }


        /* ====================================================
           GET REQUEST ID
        ==================================================== */

        const requestId =
            getRequestIdFromURL();


        if (
            !requestId
        ) {

            showRequestError(
                "No request ID was provided. Please return to the Guide Dashboard."
            );


            console.error(
                "Guide Requests: requestId missing from URL."
            );


            return;

        }


        console.log(
            "Requested Firestore Request ID:",
            requestId
        );


        /* ====================================================
           LOAD EXACT REQUEST
        ==================================================== */

        const request =
            await loadRequestById(
                requestId
            );


        if (
            !request
        ) {

            return;

        }


        /* ====================================================
           PAGE INITIALIZED
        ==================================================== */

        pageInitialized =
            true;


        console.log(
            "Guide Requests Page Loaded Successfully:",
            {

                requestId:
                    request.id,

                guideId:
                    currentGuide?.uid,

                guideName:
                    currentGuide?.fullName,

                guideEmail:
                    currentGuide?.email

            }
        );

    }
);

