
/* ============================================================
   LankaWayfarer
   GUIDE DASHBOARD

   FIREBASE-FIRST ARCHITECTURE

   Firebase Authentication
            ↓
       Firebase UID
            ↓
   lankaQuestGuides/{UID}
            ↓
      Guide Profile
            ↓
      Guide Dashboard
            ↓
   lankaQuestQuotationRequests
            ↓
      Incoming Requests

   IMPORTANT:

   Firebase Authentication = Identity

   Firestore = LankaQuest Profile + Business Data

   localStorage/sessionStorage are NOT used to determine
   the current guide account.

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
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


import {
    logoutUser
} from "./auth.js";


/* ============================================================
   2. DOM ELEMENTS
============================================================ */

const guideHeaderName =
    document.getElementById(
        "guideHeaderName"
    );


const guideWelcomeName =
    document.getElementById(
        "guideWelcomeName"
    );


const guideStatus =
    document.getElementById(
        "guideStatus"
    );


const totalRequestCount =
    document.getElementById(
        "totalRequestCount"
    );


const pendingRequestCount =
    document.getElementById(
        "pendingRequestCount"
    );


const quotationCount =
    document.getElementById(
        "quotationCount"
    );


const incomingRequestsContainer =
    document.getElementById(
        "incomingRequestsContainer"
    );


const noRequestsState =
    document.getElementById(
        "noRequestsState"
    );


const refreshRequestsButton =
    document.getElementById(
        "refreshRequestsButton"
    );


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


/* ============================================================
   3. CURRENT FIREBASE USER

   This variable contains ONLY the Firebase Auth user.

   Example:

   currentFirebaseUser.uid
   =
   rWYP3EOw6kU8bt5P89roc8eNRoC2
============================================================ */

let currentFirebaseUser =
    null;


/* ============================================================
   4. CURRENT GUIDE FIRESTORE PROFILE
============================================================ */

let currentGuide = null;

let quotationRequestsUnsubscribe = null;

/* ============================================================
   5. ESCAPE HTML
============================================================ */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
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
   6. GET GUIDE PROFILE

   Firebase Auth UID
          ↓
   lankaQuestGuides/{UID}

   This is the IMPORTANT FIX.

   We do NOT use:

   currentUser.accountType

   from Firebase Auth.

============================================================ */

async function loadCurrentGuideProfile(
    firebaseUser
) {

    if (
        !firebaseUser ||
        !firebaseUser.uid
    ) {

        console.error(
            "Guide profile load failed: Firebase UID missing."
        );

        return null;

    }


    const guideId =
        firebaseUser.uid;


    console.log(
        "Loading guide profile..."
    );


    console.log(
        "Firebase UID:",
        guideId
    );


    try {

        const guideRef =
            doc(
                db,
                "lankaQuestGuides",
                guideId
            );


        const guideSnapshot =
            await getDoc(
                guideRef
            );


        console.log(
            "Guide document exists:",
            guideSnapshot.exists()
        );


        if (
            !guideSnapshot.exists()
        ) {

            console.error(
                "Guide Firestore profile not found."
            );


            console.error(
              "Expected document:",
              `LankaWayfarerGuides/${guideId}`,
            );


            return null;

        }


        const guideData =
            guideSnapshot.data();


        const guide = {

            id:
                guideSnapshot.id,

            uid:
                guideSnapshot.id,

            ...guideData

        };


        console.log(
            "============================================"
        );


        console.log(
            "CURRENT GUIDE PROFILE"
        );


        console.log(
            guide
        );


        console.log(
            "Guide UID:",
            guide.uid
        );


        console.log(
            "Guide Name:",
            guide.fullName
        );


        console.log(
            "Guide Email:",
            guide.email
        );


        console.log(
            "Account Type:",
            guide.accountType
        );


        console.log(
            "Verification Status:",
            guide.verificationStatus
        );


        console.log(
            "Status:",
            guide.status
        );


        console.log(
            "Profile Status:",
            guide.profileStatus
        );


        console.log(
            "Is Active:",
            guide.isActive
        );


        console.log(
            "============================================"
        );


        return guide;


    } catch (error) {

        console.error(
            "Guide Firestore loading error:",
            error
        );


        return null;

    }

}


/* ============================================================
   7. VERIFY GUIDE ACCOUNT TYPE

   Firestore profile is checked.

============================================================ */

function isGuideProfile(
    guide
) {

    if (!guide) {

        return false;

    }


    /*
       If accountType exists, it MUST be guide.

       If older Firestore documents do not contain
       accountType, we still allow the profile because
       the document itself is inside lankaQuestGuides.
    */

    if (
        guide.accountType &&
        guide.accountType !== "guide"
    ) {

        console.error(
            "Firestore accountType is not guide:",
            guide.accountType
        );


        return false;

    }


    return true;

}


/* ============================================================
   8. CHECK GUIDE DASHBOARD ACCESS

   Approved + Active guide only.

============================================================ */

function canAccessGuideDashboard(
    guide
) {

    if (!guide) {

        return false;

    }


    /*
       Verification status
    */

    const verificationStatus =
        String(
            guide.verificationStatus || ""
        )
        .trim()
        .toLowerCase();


    /*
       Account status
    */

    const status =
        String(
            guide.status || ""
        )
        .trim()
        .toLowerCase();


    /*
       Profile status
    */

    const profileStatus =
        String(
            guide.profileStatus || ""
        )
        .trim()
        .toLowerCase();


    /*
       Active flag
    */

    const isActive =
        guide.isActive === true;


    console.log(
        "Guide Dashboard Access Check:",
        {
            verificationStatus,
            status,
            profileStatus,
            isActive
        }
    );


    /*
       Verification must be approved.
    */

    if (
        verificationStatus !==
        "approved"
    ) {

        return false;

    }


    /*
       If status exists, it must be approved.
    */

    if (
        status &&
        status !== "approved"
    ) {

        return false;

    }


    /*
       If profileStatus exists, it must be active.
    */

    if (
        profileStatus &&
        profileStatus !== "active"
    ) {

        return false;

    }


    /*
       If isActive is explicitly present,
       it must be true.

       This allows older guide documents that
       do not yet contain isActive.
    */

    if (
        typeof guide.isActive !==
        "undefined" &&
        isActive !== true
    ) {

        return false;

    }


    return true;

}


/* ============================================================
   9. UPDATE GUIDE NAME
============================================================ */

function updateGuideName(
    guide
) {

    if (!guide) {

        return;

    }


    const name =
        guide.fullName ||
        guide.name ||
        guide.email ||
        "Guide";


    if (
        guideHeaderName
    ) {

        guideHeaderName.textContent =
            name;

    }


    if (
        guideWelcomeName
    ) {

        guideWelcomeName.textContent =
            name;

    }

}


/* ============================================================
   10. GET GUIDE ACCOUNT STATUS
============================================================ */

function getGuideAccountStatus(
    guide
) {

    if (!guide) {

        return {

            text:
                "Unknown",

            className:
                "status-unknown"

        };

    }


    const verificationStatus =
        String(
            guide.verificationStatus || ""
        )
        .trim()
        .toLowerCase();


    const status =
        String(
            guide.status || ""
        )
        .trim()
        .toLowerCase();


    const profileStatus =
        String(
            guide.profileStatus || ""
        )
        .trim()
        .toLowerCase();


    /*
       Rejected
    */

    if (
        verificationStatus ===
        "rejected"
        ||
        status ===
        "rejected"
    ) {

        return {

            text:
                "Rejected",

            className:
                "status-rejected"

        };

    }


    /*
       Active
    */

    if (
        verificationStatus ===
        "approved"
        &&
        (
            !status ||
            status === "approved"
        )
        &&
        (
            !profileStatus ||
            profileStatus === "active"
        )
        &&
        (
            typeof guide.isActive ===
            "undefined"
            ||
            guide.isActive === true
        )
    ) {

        return {

            text:
                "Active",

            className:
                "status-active"

        };

    }


    /*
       Pending
    */

    if (
        verificationStatus ===
        "pending"
        ||
        status ===
        "pending"
    ) {

        return {

            text:
                "Pending Review",

            className:
                "status-pending"

        };

    }


    /*
       Inactive
    */

    if (
        guide.isActive === false
        ||
        profileStatus ===
        "inactive"
    ) {

        return {

            text:
                "Inactive",

            className:
                "status-inactive"

        };

    }


    return {

        text:
            guide.status ||
            guide.verificationStatus ||
            "Unknown",

        className:
            "status-unknown"

    };

}


/* ============================================================
   11. UPDATE GUIDE STATUS UI
============================================================ */

function updateGuideStatus(
    guide
) {

    if (!guideStatus) {

        return;

    }


    const statusInfo =
        getGuideAccountStatus(
            guide
        );


    guideStatus.textContent =
        statusInfo.text;


    guideStatus.classList.remove(

        "status-active",

        "status-pending",

        "status-rejected",

        "status-inactive",

        "status-unknown"

    );


    guideStatus.classList.add(
        statusInfo.className
    );

}


/* ============================================================
   12. GET GUIDE REQUESTS

   FIRESTORE REAL-TIME LISTENER

   Collection:

   lankaQuestQuotationRequests

   Query:

   guideId == Firebase UID

   IMPORTANT:

   onSnapshot() keeps the dashboard synchronized
   with Firestore automatically.

============================================================ */

function listenToGuideRequests(
    guide,
    callback
) {

    if (!guide) {

        return null;

    }


    const guideId =
        guide.uid ||
        guide.id ||
        "";


    if (!guideId) {

        console.error(
            "Guide UID missing while listening for requests."
        );


        return null;

    }


    console.log(
        "Starting real-time request listener for guide:",
        guideId
    );


    const requestsRef =
        collection(
            db,
            "lankaQuestQuotationRequests"
        );


    const requestsQuery =
        query(
            requestsRef,
            where(
                "guideId",
                "==",
                guideId
            )
        );


    const unsubscribe =
        onSnapshot(
            requestsQuery,

            (
                snapshot
            ) => {

                const requests =
                    [];


                snapshot.forEach(
                    (
                        requestSnapshot
                    ) => {

                        requests.push({

                            id:
                                requestSnapshot.id,

                            ...requestSnapshot.data()

                        });

                    }
                );


                console.log(
                    "Real-time guide requests:",
                    requests.length
                );


                console.log(
                    "Guide requests:",
                    requests
                );


                callback(
                    requests
                );

            },

            (
                error
            ) => {

                console.error(
                    "Real-time quotation request listener error:",
                    error
                );


                callback(
                    []
                );

            }
        );


    return unsubscribe;

}


/* ============================================================
   13. LOAD GUIDE QUOTATIONS

   Collection:

   lankaQuestQuotations

============================================================ */

async function getCurrentGuideQuotations(
    guide
) {

    if (!guide) {

        return [];

    }


    const guideId =
        guide.uid ||
        guide.id ||
        "";


    if (!guideId) {

        return [];

    }


    try {

        const quotationsRef =
            collection(
                db,
                "lankaQuestQuotations"
            );


        const quotationsQuery =
            query(
                quotationsRef,
                where(
                    "guideId",
                    "==",
                    guideId
                )
            );


        const snapshot =
            await getDocs(
                quotationsQuery
            );


        const quotations =
            [];


        snapshot.forEach(
            (
                quotationSnapshot
            ) => {

                quotations.push({

                    id:
                        quotationSnapshot.id,

                    ...quotationSnapshot.data()

                });

            }
        );


        console.log(
            "Guide quotations found:",
            quotations.length
        );


        return quotations;


    } catch (error) {

        console.error(
            "Quotation loading error:",
            error
        );


        return [];

    }

}


/* ============================================================
   14. GET REQUEST STATUS
============================================================ */

function getRequestStatus(
    request
) {

    return String(
        request.status ||
        request.requestStatus ||
        "pending"
    )
    .trim()
    .toLowerCase();

}


/* ============================================================
   15. UPDATE DASHBOARD COUNTS

   Uses the latest real-time request data.

============================================================ */

async function updateDashboardCounts(
    guide,
    requests = null
) {

    /*
       If requests were not supplied,
       load them once as fallback.
    */

    if (!requests) {

        requests =
            await getCurrentGuideRequestsOnce(
                guide
            );

    }


    const quotations =
        await getCurrentGuideQuotations(
            guide
        );


    /*
       Total requests
    */

    if (
        totalRequestCount
    ) {

        totalRequestCount.textContent =
            requests.length;

    }


    /*
       Pending requests

       guide_selected is also an
       incoming request for the guide.
    */

    const pendingRequests =
        requests.filter(
            (
                request
            ) => {

                const status =
                    getRequestStatus(
                        request
                    );


                return (

                    status ===
                    "pending"

                    ||

                    status ===
                    "new"

                    ||

                    status ===
                    "guide_selected"

                );

            }
        );


    if (
        pendingRequestCount
    ) {

        pendingRequestCount.textContent =
            pendingRequests.length;

    }


    /*
       Quotations
    */

    if (
        quotationCount
    ) {

        quotationCount.textContent =
            quotations.length;

    }

}

/* ============================================================
   15A. GET GUIDE REQUESTS ONCE

   Used only as a fallback.

   Real-time dashboard updates use
   listenToGuideRequests().

============================================================ */

async function getCurrentGuideRequestsOnce(
    guide
) {

    if (!guide) {

        return [];

    }


    const guideId =
        guide.uid ||
        guide.id ||
        "";


    if (!guideId) {

        return [];

    }


    try {

        const requestsRef =
            collection(
                db,
                "lankaQuestQuotationRequests"
            );


        const requestsQuery =
            query(
                requestsRef,
                where(
                    "guideId",
                    "==",
                    guideId
                )
            );


        const snapshot =
            await getDocs(
                requestsQuery
            );


        const requests =
            [];


        snapshot.forEach(
            (
                requestSnapshot
            ) => {

                requests.push({

                    id:
                        requestSnapshot.id,

                    ...requestSnapshot.data()

                });

            }
        );


        return requests;


    } catch (error) {

        console.error(
            "Guide request loading error:",
            error
        );


        return [];

    }

}


/* ============================================================
   16. FORMAT REQUEST DATE
============================================================ */

function formatRequestDate(
    dateValue
) {

    if (!dateValue) {

        return "Date not available";

    }


    let date;


    /*
       Firestore Timestamp
    */

    if (
        dateValue &&
        typeof dateValue.toDate ===
        "function"
    ) {

        date =
            dateValue.toDate();

    }


    /*
       Firestore Timestamp object
    */

    else if (
        dateValue &&
        typeof dateValue.seconds ===
        "number"
    ) {

        date =
            new Date(
                dateValue.seconds *
                1000
            );

    }


    /*
       JavaScript Date
    */

    else if (
        dateValue instanceof Date
    ) {

        date =
            dateValue;

    }


    /*
       String / number
    */

    else {

        date =
            new Date(
                dateValue
            );

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Invalid Date";

    }


    return date.toLocaleDateString(
        "en-US",
        {

            year:
                "numeric",

            month:
                "short",

            day:
                "numeric"

        }
    );

}


/* ============================================================
   17. CREATE REQUEST CARD
============================================================ */

function createRequestCard(
    request
) {

    const touristName =
        request.touristName ||
        request.fullName ||
        request.customerName ||
        request.touristEmail ||
        "Tourist";


    let destination =
        request.destination ||
        request.destinations ||
        request.location ||
        "Sri Lanka";


    /*
       Convert destination objects
       into readable names.
    */

    if (
        Array.isArray(
            destination
        )
    ) {

        destination =
            destination
                .map(
                    (
                        item
                    ) => {

                        if (
                            typeof item ===
                            "string"
                        ) {

                            return item;

                        }


                        return (
                            item?.name ||
                            item?.title ||
                            item?.id ||
                            ""
                        );

                    }
                )
                .filter(Boolean)
                .join(", ");

    }


    const status =
        getRequestStatus(
            request
        );


    const requestDate =
        request.createdAt ||
        request.requestedAt ||
        "";


    const requestId =
        request.id ||
        "N/A";


    const travelers =
        request.travelers ||
        "Not specified";


    const startDate =
        request.startDate ||
        "Not selected";


    const endDate =
        request.endDate ||
        "Not selected";


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "incoming-request-card";


    card.innerHTML = `

        <div class="request-card-header">

            <div>

                <span class="request-card-label">
                    TRIP REQUEST
                </span>

                <h3>
                    ${escapeHTML(touristName)}
                </h3>

            </div>


            <span
                class="request-status ${escapeHTML(status)}"
            >
                ${escapeHTML(status)}
            </span>

        </div>


        <div class="request-card-body">

            <p>

                <strong>
                    Destination:
                </strong>

                ${escapeHTML(destination)}

            </p>


            <p>

                <strong>
                    Travelers:
                </strong>

                ${escapeHTML(travelers)}

            </p>


            <p>

                <strong>
                    Travel Dates:
                </strong>

                ${escapeHTML(startDate)}

                →

                ${escapeHTML(endDate)}

            </p>


            <p>

                <strong>
                    Request ID:
                </strong>

                ${escapeHTML(requestId)}

            </p>


            <p>

                <strong>
                    Received:
                </strong>

                ${escapeHTML(formatRequestDate(requestDate))}

            </p>

        </div>


        <div class="request-card-actions">

            <a
               href="guide-requests.html?requestId=${encodeURIComponent(requestId)}"
                class="view-request-button"
            >
                View Request →
            </a>

        </div>

    `;


    return card;

}


/* ============================================================
   18. RENDER INCOMING REQUESTS

   Receives requests directly from
   the real-time Firestore listener.

============================================================ */

function renderIncomingRequests(
    requests
) {

    if (
        !incomingRequestsContainer
    ) {

        return;

    }


    /*
       Clear old cards
    */

    incomingRequestsContainer.innerHTML =
        "";


    /*
       No requests
    */

    if (
        !requests ||
        requests.length === 0
    ) {

        incomingRequestsContainer.style.display =
            "none";


        if (
            noRequestsState
        ) {

            noRequestsState.style.display =
                "block";

        }


        return;

    }


    /*
       Show container
    */

    incomingRequestsContainer.style.display =
        "grid";


    if (
        noRequestsState
    ) {

        noRequestsState.style.display =
            "none";

    }


    /*
       Sort newest first
    */

    const sortedRequests =
        [...requests].sort(
            (
                a,
                b
            ) => {

                const dateA =
                    getTimestampMilliseconds(
                        a.createdAt
                    );


                const dateB =
                    getTimestampMilliseconds(
                        b.createdAt
                    );


                return (
                    dateB -
                    dateA
                );

            }
        );


    /*
       Dashboard shows latest 5
    */

    const latestRequests =
        sortedRequests.slice(
            0,
            5
        );


    latestRequests.forEach(
        (
            request
        ) => {

            const card =
                createRequestCard(
                    request
                );


            incomingRequestsContainer.appendChild(
                card
            );

        }
    );

}

/* ============================================================
   19. TIMESTAMP TO MILLISECONDS
============================================================ */

function getTimestampMilliseconds(
    value
) {

    if (!value) {

        return 0;

    }


    /*
       Firestore Timestamp
    */

    if (
        typeof value.toDate ===
        "function"
    ) {

        return value
            .toDate()
            .getTime();

    }


    /*
       Firestore Timestamp object
    */

    if (
        typeof value.seconds ===
        "number"
    ) {

        return (
            value.seconds *
            1000
        );

    }


    /*
       Date
    */

    if (
        value instanceof Date
    ) {

        return value.getTime();

    }


    /*
       String / number
    */

    const date =
        new Date(
            value
        );


    const time =
        date.getTime();


    return Number.isNaN(
        time
    )
        ? 0
        : time;

}


/* ============================================================
   20. SHOW DASHBOARD ERROR
============================================================ */

function showDashboardError(
    message
) {

    console.error(
        message
    );


    if (
        guideHeaderName
    ) {

        guideHeaderName.textContent =
            "Guide Dashboard";

    }


    if (
        guideWelcomeName
    ) {

        guideWelcomeName.textContent =
            "Unable to load dashboard";

    }


    if (
        guideStatus
    ) {

        guideStatus.textContent =
            message;


        guideStatus.classList.remove(

            "status-active",

            "status-pending",

            "status-rejected",

            "status-inactive"

        );


        guideStatus.classList.add(
            "status-unknown"
        );

    }

}

/* ============================================================
   21A. START REAL-TIME GUIDE REQUEST LISTENER

   Firestore changes are automatically pushed
   to the Guide Dashboard.

============================================================ */

function startGuideRequestListener(
    guide
) {

    /*
       Remove previous listener first.

       Prevents duplicate listeners when
       dashboard is refreshed/reloaded.
    */

    if (
        quotationRequestsUnsubscribe
    ) {

        quotationRequestsUnsubscribe();

        quotationRequestsUnsubscribe =
            null;

    }


    if (!guide) {

        return;

    }


    quotationRequestsUnsubscribe =
        listenToGuideRequests(
            guide,

            async (
                requests
            ) => {

                console.log(
                    "Guide Dashboard received live request update:",
                    requests.length
                );


                /*
                   Update counts immediately
                */

                const quotations =
                    await getCurrentGuideQuotations(
                        guide
                    );


                /*
                   Total requests
                */

                if (
                    totalRequestCount
                ) {

                    totalRequestCount.textContent =
                        requests.length;

                }


                /*
                   Pending requests
                */

                const pendingRequests =
                    requests.filter(
                        (
                            request
                        ) => {

                            const status =
                                getRequestStatus(
                                    request
                                );


                            return (

                                status ===
                                "pending"

                                ||

                                status ===
                                "new"

                                ||

                                status ===
                                "guide_selected"

                            );

                        }
                    );


                if (
                    pendingRequestCount
                ) {

                    pendingRequestCount.textContent =
                        pendingRequests.length;

                }


                /*
                   Quotation count
                */

                if (
                    quotationCount
                ) {

                    quotationCount.textContent =
                        quotations.length;

                }


                /*
                   Render latest requests
                */

                renderIncomingRequests(
                    requests
                );

            }
        );


    console.log(
        "Guide quotation request real-time listener started."
    );

}


/* ============================================================
   21B. LOAD GUIDE DASHBOARD

   IMPORTANT FIX

   OLD:

   getCurrentUser()
        ↓
   currentUser.accountType
        ↓
   redirect

   NEW:

   Firebase Auth
        ↓
   firebaseUser.uid
        ↓
   lankaQuestGuides/{uid}
        ↓
   Guide Profile
        ↓
   Dashboard

============================================================ */

async function loadGuideDashboard(firebaseUser) {
  console.log("============================================");

  console.log("LankaWayfarer GUIDE DASHBOARD INITIALIZING");

  console.log("Firebase User:", firebaseUser);

  /* ========================================================
       1. AUTHENTICATION CHECK
    ======================================================== */

  if (!firebaseUser) {
    console.error("No Firebase authenticated user.");

    window.location.href = "login.html";

    return;
  }

  currentFirebaseUser = firebaseUser;

  console.log("Firebase UID:", firebaseUser.uid);

  console.log("Firebase Email:", firebaseUser.email);

  console.log("Firebase Provider:", firebaseUser.providerData);

  /* ========================================================
       2. LOAD GUIDE FIRESTORE PROFILE
    ======================================================== */

  const guide = await loadCurrentGuideProfile(firebaseUser);

  currentGuide = guide;

  if (!guide) {
    showDashboardError("Guide profile not found.");

    /*
           DO NOT redirect immediately.

           This allows the real error to remain visible
           and makes debugging possible.
        */

    return;
  }

  /* ========================================================
       3. VERIFY GUIDE ACCOUNT TYPE
    ======================================================== */

  if (!isGuideProfile(guide)) {
    console.error("This Firestore profile is not a guide.");

    showDashboardError("This account is not registered as a guide.");

    return;
  }

  /* ========================================================
       4. CHECK GUIDE APPROVAL
    ======================================================== */

  const accessAllowed = canAccessGuideDashboard(guide);

  if (!accessAllowed) {
    console.warn("Guide dashboard access denied.");

    console.warn("Guide profile:", guide);

    /*
           Only redirect when the Firestore profile
           itself clearly says the guide is not allowed.
        */

    const verificationStatus = String(guide.verificationStatus || "")
      .trim()
      .toLowerCase();

    const status = String(guide.status || "")
      .trim()
      .toLowerCase();

    const profileStatus = String(guide.profileStatus || "")
      .trim()
      .toLowerCase();

    const explicitlyInactive = guide.isActive === false;

    if (
      verificationStatus === "rejected" ||
      status === "rejected" ||
      profileStatus === "inactive" ||
      explicitlyInactive
    ) {
      window.location.href = "guide-verification.html";

      return;
    }

    /*
           Pending approval
        */

    showDashboardError("Guide account is not approved for dashboard access.");

    return;
  }

  /* ========================================================
       5. UPDATE GUIDE UI
    ======================================================== */

  updateGuideName(guide);

  updateGuideStatus(guide);

  /* ========================================================
   6. START REAL-TIME REQUEST LISTENER
======================================================== */

  startGuideRequestListener(guide);

  /* ========================================================
       8. FINAL DEBUG
    ======================================================== */

  console.log("============================================");

  console.log("GUIDE DASHBOARD READY");

  console.log("Firebase UID:", firebaseUser.uid);

  console.log("Firestore Guide UID:", guide.uid);

  console.log("Guide Name:", guide.fullName);

  console.log("Guide Email:", guide.email);

  console.log("============================================");
}


/* ============================================================
   22. REFRESH REQUESTS
============================================================ */

if (
    refreshRequestsButton
) {

    refreshRequestsButton.addEventListener(
        "click",
        async () => {

            if (
                !currentFirebaseUser
            ) {

                console.warn(
                    "Cannot refresh: Firebase user unavailable."
                );


                return;

            }


            /*
               Reload guide profile first.

               This ensures that if Admin changes
               guide status, dashboard gets the
               latest Firestore data.
            */

            if (refreshRequestsButton) {
              refreshRequestsButton.addEventListener("click", async () => {
                if (!currentGuide) {
                  console.warn("Cannot refresh: Guide profile unavailable.");

                  return;
                }

                console.log("Refreshing guide requests...");

                startGuideRequestListener(currentGuide);
              });
            }

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
        async () => {

            try {

                console.log(
                    "Guide logout started..."
                );


                await logoutUser();


            } catch (error) {

                console.error(
                    "Guide logout error:",
                    error
                );


                /*
                   Fallback
                */

                window.location.href =
                    "index.html";

            }

        }
    );

}


/* ============================================================
   24. FIREBASE AUTH STATE LISTENER

   THIS REPLACES:

   DOMContentLoaded
        ↓
   getCurrentUser()
        ↓
   currentUser.accountType

   New:

   Firebase Auth
        ↓
   Firebase User
        ↓
   Firestore Guide Profile

============================================================ */

onAuthStateChanged(
    auth,

    async (
        firebaseUser
    ) => {

        console.log(
            "============================================"
        );


        console.log(
            "Firebase Auth State Changed"
        );


        console.log(
            "User:",
            firebaseUser
        );


        console.log(
            "============================================"
        );


        if (
            !firebaseUser
        ) {

            console.warn(
                "No authenticated Firebase user."
            );


            window.location.href =
                "login.html";


            return;

        }


        await loadGuideDashboard(
            firebaseUser
        );

    }
);


/* ============================================================
   END GUIDE-DASHBOARD.JS
============================================================ */

