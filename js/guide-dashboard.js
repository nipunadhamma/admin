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
Firestore = Guide Profile + Business Data

localStorage/sessionStorage are NOT used.
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
document.getElementById("guideHeaderName");

const guideWelcomeName =
document.getElementById("guideWelcomeName");

const guideStatus =
document.getElementById("guideStatus");

const totalRequestCount =
document.getElementById("totalRequestCount");

const pendingRequestCount =
document.getElementById("pendingRequestCount");

const quotationCount =
document.getElementById("quotationCount");

const incomingRequestsContainer =
document.getElementById("incomingRequestsContainer");

const noRequestsState =
document.getElementById("noRequestsState");

const refreshRequestsButton =
document.getElementById("refreshRequestsButton");

const logoutButton =
document.getElementById("logoutButton");

/* ============================================================
3. CURRENT USER / GUIDE
============================================================ */

let currentFirebaseUser = null;

let currentGuide = null;

let quotationRequestsUnsubscribe = null;

/* ============================================================
4. ESCAPE HTML
============================================================ */

function escapeHTML(value) {


if (
    value === null ||
    value === undefined
) {
    return "";
}

return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");


}

/* ============================================================
5. LOAD CURRENT GUIDE PROFILE

Firebase Auth UID
↓
lankaQuestGuides/{UID}
============================================================ */

async function loadCurrentGuideProfile(firebaseUser) {


if (
    !firebaseUser ||
    !firebaseUser.uid
) {

    console.error(
        "Guide profile load failed: Firebase UID missing."
    );

    return null;
}

const guideId = firebaseUser.uid;

console.log("Loading guide profile...");
console.log("Firebase UID:", guideId);

try {

    const guideRef =
        doc(
            db,
            "lankaQuestGuides",
            guideId
        );

    const guideSnapshot =
        await getDoc(guideRef);

    console.log(
        "Guide document exists:",
        guideSnapshot.exists()
    );

    if (!guideSnapshot.exists()) {

        console.error(
            "Guide Firestore profile not found."
        );

        console.error(
            "Expected document:",
            `lankaQuestGuides/${guideId}`
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
6. VERIFY GUIDE ACCOUNT TYPE
============================================================ */

function isGuideProfile(guide) {


if (!guide) {
    return false;
}

/*
   If accountType exists, it must be guide.

   Older guide documents without accountType
   are still accepted because they exist inside
   lankaQuestGuides.
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
7. CHECK GUIDE DASHBOARD ACCESS
============================================================ */

function canAccessGuideDashboard(guide) {


if (!guide) {
    return false;
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
    verificationStatus !== "approved"
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
   If isActive exists, it must be true.
*/

if (
    typeof guide.isActive !== "undefined" &&
    isActive !== true
) {

    return false;
}

return true;


}

/* ============================================================
   8. UPDATE GUIDE NAME + PROFILE PHOTO
============================================================ */

function updateGuideName(
    guide
) {

    if (!guide) {

        return;

    }


    /*
       Guide display name
    */

    const name =
        guide.fullName ||
        guide.name ||
        guide.email ||
        "Guide";


    /*
       Update header name
    */

    if (
        guideHeaderName
    ) {

        guideHeaderName.textContent =
            name;

    }


    /*
       Update welcome name
    */

    if (
        guideWelcomeName
    ) {

        guideWelcomeName.textContent =
            name;

    }


    /*
       Guide profile photo

       Firestore may contain the photo URL
       under different field names depending
       on the existing guide profile structure.

       Primary field:
       profilePhotoUrl
    */

    const profilePhotoUrl =
        guide.profilePhotoUrl ||
        guide.profilePhotoURL ||
        guide.photoURL ||
        guide.photoUrl ||
        "";


    /*
       Debug information
    */

    console.log(
        "Guide profile photo URL:",
        profilePhotoUrl
    );


    /*
       Update Guide Hero Icon
    */

    if (
        guideHeroIcon
    ) {

        /*
           Profile photo available
        */

        if (
            profilePhotoUrl
        ) {

            guideHeroIcon.innerHTML = `

                <img
                    src="${escapeHTML(profilePhotoUrl)}"
                    alt="${escapeHTML(name)}"
                    class="guide-profile-photo"
                    loading="eager"
                >

            `;

        }

        /*
           No profile photo available

           Keep the existing Guide emoji.
        */

        else {

            guideHeroIcon.innerHTML =
                "🧑‍💼";

        }

    }

}

/* ============================================================
9. GET GUIDE ACCOUNT STATUS
============================================================ */

function getGuideAccountStatus(guide) {


if (!guide) {

    return {
        text: "Unknown",
        className: "status-unknown"
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
    verificationStatus === "rejected" ||
    status === "rejected"
) {

    return {
        text: "Rejected",
        className: "status-rejected"
    };
}


/*
   Active
*/

if (
    verificationStatus === "approved" &&
    (
        !status ||
        status === "approved"
    ) &&
    (
        !profileStatus ||
        profileStatus === "active"
    ) &&
    (
        typeof guide.isActive === "undefined" ||
        guide.isActive === true
    )
) {

    return {
        text: "Active",
        className: "status-active"
    };
}


/*
   Pending
*/

if (
    verificationStatus === "pending" ||
    status === "pending"
) {

    return {
        text: "Pending Review",
        className: "status-pending"
    };
}


/*
   Inactive
*/

if (
    guide.isActive === false ||
    profileStatus === "inactive"
) {

    return {
        text: "Inactive",
        className: "status-inactive"
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
10. UPDATE GUIDE STATUS UI
============================================================ */

function updateGuideStatus(guide) {


if (!guideStatus) {
    return;
}

const statusInfo =
    getGuideAccountStatus(guide);

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
11. REQUEST STATUS
============================================================ */

function getRequestStatus(request) {


return String(
    request.status ||
    request.requestStatus ||
    "pending"
)
.trim()
.toLowerCase();


}

/* ============================================================
12. TIMESTAMP → MILLISECONDS
============================================================ */

function getTimestampMilliseconds(value) {


if (!value) {
    return 0;
}

/*
   Firestore Timestamp
*/

if (
    typeof value.toDate === "function"
) {

    return value
        .toDate()
        .getTime();
}

/*
   Firestore Timestamp object
*/

if (
    typeof value.seconds === "number"
) {

    return value.seconds * 1000;
}

/*
   JavaScript Date
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
    new Date(value);

const time =
    date.getTime();

return Number.isNaN(time)
    ? 0
    : time;


}

/* ============================================================
13. FORMAT REQUEST DATE
============================================================ */

function formatRequestDate(dateValue) {


if (!dateValue) {
    return "Date not available";
}

let date;

if (
    dateValue &&
    typeof dateValue.toDate === "function"
) {

    date =
        dateValue.toDate();

} else if (
    dateValue &&
    typeof dateValue.seconds === "number"
) {

    date =
        new Date(
            dateValue.seconds * 1000
        );

} else if (
    dateValue instanceof Date
) {

    date =
        dateValue;

} else {

    date =
        new Date(dateValue);
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
        year: "numeric",
        month: "short",
        day: "numeric"
    }
);


}

/* ============================================================
14. LOAD GUIDE QUOTATIONS
============================================================ */

async function getCurrentGuideQuotations(guide) {


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

    const quotations = [];

    snapshot.forEach(
        quotationSnapshot => {

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
15. CREATE REQUEST CARD
============================================================ */

function createRequestCard(request) {


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
   Destination array
*/

if (
    Array.isArray(destination)
) {

    destination =
        destination
            .map(item => {

                if (
                    typeof item === "string"
                ) {

                    return item;
                }

                return (
                    item?.name ||
                    item?.title ||
                    item?.id ||
                    ""
                );

            })
            .filter(Boolean)
            .join(", ");
}


const status =
    getRequestStatus(request);


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
    document.createElement("article");


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

            ${escapeHTML(
                formatRequestDate(requestDate)
            )}
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
16. RENDER INCOMING REQUESTS
============================================================ */

function renderIncomingRequests(requests) {


if (!incomingRequestsContainer) {
    return;
}

incomingRequestsContainer.innerHTML = "";


/*
   No requests
*/

if (
    !requests ||
    requests.length === 0
) {

    incomingRequestsContainer.style.display =
        "none";

    if (noRequestsState) {

        noRequestsState.style.display =
            "block";
    }

    return;
}


/*
   Requests available
*/

incomingRequestsContainer.style.display =
    "grid";

if (noRequestsState) {

    noRequestsState.style.display =
        "none";
}


/*
   Newest first
*/

const sortedRequests =
    [...requests].sort(
        (a, b) => {

            const dateA =
                getTimestampMilliseconds(
                    a.createdAt
                );

            const dateB =
                getTimestampMilliseconds(
                    b.createdAt
                );

            return dateB - dateA;
        }
    );


/*
   Dashboard shows latest 5
*/

const latestRequests =
    sortedRequests.slice(0, 5);


latestRequests.forEach(
    request => {

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
17. UPDATE DASHBOARD COUNTS
============================================================ */

async function updateDashboardCounts(
guide,
requests
) {


if (!guide) {
    return;
}

const safeRequests =
    Array.isArray(requests)
        ? requests
        : [];


/*
   Total requests
*/

if (totalRequestCount) {

    totalRequestCount.textContent =
        safeRequests.length;
}


/*
   Pending requests
*/

const pendingRequests =
    safeRequests.filter(
        request => {

            const status =
                getRequestStatus(
                    request
                );

            return (
                status === "pending" ||
                status === "new" ||
                status === "guide_selected"
            );
        }
    );


if (pendingRequestCount) {

    pendingRequestCount.textContent =
        pendingRequests.length;
}


/*
   Quotations
*/

const quotations =
    await getCurrentGuideQuotations(
        guide
    );


if (quotationCount) {

    quotationCount.textContent =
        quotations.length;
}


}

/* ============================================================
18. REAL-TIME GUIDE REQUEST LISTENER
============================================================ */

function listenToGuideRequests(
guide,
onData,
onError
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
    "Starting real-time request listener:",
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


return onSnapshot(

    requestsQuery,

    snapshot => {

        const requests = [];

        snapshot.forEach(
            requestSnapshot => {

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


        onData(requests);
    },

    error => {

        console.error(
            "Real-time quotation request listener error:",
            error
        );


        if (typeof onError === "function") {

            onError(error);
        }
    }
);


}

/* ============================================================
19. START / RESTART REQUEST LISTENER
============================================================ */

function startGuideRequestListener(guide) {


/*
   Remove previous listener.
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

        async requests => {

            console.log(
                "Guide Dashboard received live update:",
                requests.length
            );


            /*
               Update request counters
            */

            await updateDashboardCounts(
                guide,
                requests
            );


            /*
               Render latest requests
            */

            renderIncomingRequests(
                requests
            );

        },

        error => {

            console.error(
                "Guide request listener failed:",
                error
            );

            showDashboardError(
                "Unable to load guide requests."
            );
        }
    );


console.log(
    "Guide quotation request real-time listener started."
);


}

/* ============================================================
20. DASHBOARD ERROR
============================================================ */

function showDashboardError(message) {


console.error(message);

if (guideHeaderName) {

    guideHeaderName.textContent =
        "Guide Dashboard";
}

if (guideWelcomeName) {

    guideWelcomeName.textContent =
        "Unable to load dashboard";
}

if (guideStatus) {

    guideStatus.textContent =
        message;

    guideStatus.classList.remove(
        "status-active",
        "status-pending",
        "status-rejected",
        "status-inactive",
        "status-unknown"
    );

    guideStatus.classList.add(
        "status-unknown"
    );
}


}

/* ============================================================
21. LOAD GUIDE DASHBOARD
============================================================ */

async function loadGuideDashboard(firebaseUser) {


console.log(
    "============================================"
);

console.log(
    "LankaWayfarer GUIDE DASHBOARD INITIALIZING"
);

console.log(
    "Firebase User:",
    firebaseUser
);


/*
   Authentication
*/

if (!firebaseUser) {

    console.error(
        "No Firebase authenticated user."
    );

    window.location.href =
        "login.html";

    return;
}


currentFirebaseUser =
    firebaseUser;


console.log(
    "Firebase UID:",
    firebaseUser.uid
);

console.log(
    "Firebase Email:",
    firebaseUser.email
);


/*
   Load guide profile
*/

const guide =
    await loadCurrentGuideProfile(
        firebaseUser
    );


currentGuide =
    guide;


if (!guide) {

    showDashboardError(
        "Guide profile not found."
    );

    return;
}


/*
   Verify account type
*/

if (
    !isGuideProfile(guide)
) {

    showDashboardError(
        "This account is not registered as a guide."
    );

    return;
}


/*
   Check access
*/

const accessAllowed =
    canAccessGuideDashboard(
        guide
    );


if (!accessAllowed) {

    console.warn(
        "Guide dashboard access denied.",
        guide
    );


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


    const explicitlyInactive =
        guide.isActive === false;


    /*
       Rejected / inactive guide
    */

    if (
        verificationStatus === "rejected" ||
        status === "rejected" ||
        profileStatus === "inactive" ||
        explicitlyInactive
    ) {

        window.location.href =
            "guide-verification.html";

        return;
    }


    /*
       Pending approval
    */

    showDashboardError(
        "Guide account is not approved for dashboard access."
    );

    return;
}


/*
   Update guide information
*/

updateGuideName(
    guide
);

updateGuideStatus(
    guide
);


/*
   Start real-time requests
*/

startGuideRequestListener(
    guide
);


console.log(
    "============================================"
);

console.log(
    "GUIDE DASHBOARD READY"
);

console.log(
    "Firebase UID:",
    firebaseUser.uid
);

console.log(
    "Firestore Guide UID:",
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
    "============================================"
);


}

/* ============================================================
22. REFRESH REQUESTS

IMPORTANT:

Only ONE click listener.

The previous code accidentally created a
second click listener inside the first one.
============================================================ */

if (refreshRequestsButton) {


refreshRequestsButton.addEventListener(
    "click",
    async () => {

        if (!currentFirebaseUser) {

            console.warn(
                "Cannot refresh: Firebase user unavailable."
            );

            return;
        }


        console.log(
            "Refreshing Guide Dashboard..."
        );


        /*
           Reload the latest guide profile.

           This allows Admin status changes
           to be reflected without a full page reload.
        */

        const latestGuide =
            await loadCurrentGuideProfile(
                currentFirebaseUser
            );


        if (!latestGuide) {

            showDashboardError(
                "Unable to refresh guide profile."
            );

            return;
        }


        currentGuide =
            latestGuide;


        /*
           Update UI
        */

        updateGuideName(
            latestGuide
        );

        updateGuideStatus(
            latestGuide
        );


        /*
           Restart request listener
        */

        startGuideRequestListener(
            latestGuide
        );


        console.log(
            "Guide Dashboard refreshed."
        );
    }
);


}

/* ============================================================
23. LOGOUT
============================================================ */

if (logoutButton) {


logoutButton.addEventListener(
    "click",
    async () => {

        try {

            console.log(
                "Guide logout started..."
            );


            /*
               Stop Firestore listener
            */

            if (
                quotationRequestsUnsubscribe
            ) {

                quotationRequestsUnsubscribe();

                quotationRequestsUnsubscribe =
                    null;
            }


            /*
               Firebase logout
            */

            await logoutUser();

        } catch (error) {

            console.error(
                "Guide logout error:",
                error
            );


            window.location.href =
                "index.html";
        }
    }
);


}

/* ============================================================
24. FIREBASE AUTH STATE LISTENER
============================================================ */

onAuthStateChanged(
auth,


async firebaseUser => {

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


    /*
       User logged out
    */

    if (!firebaseUser) {

        console.warn(
            "No authenticated Firebase user."
        );

        window.location.href =
            "login.html";

        return;
    }


    /*
       Load dashboard
    */

    await loadGuideDashboard(
        firebaseUser
    );
}


);

/* ============================================================
END GUIDE-DASHBOARD.JS
============================================================ */
