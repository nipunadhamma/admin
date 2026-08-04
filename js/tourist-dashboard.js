
/* ============================================================
   LankaQuest
   TOURIST DASHBOARD

   FIREBASE FIRST ARCHITECTURE

   AUTHENTICATION
        ↓
   Firebase Authentication
        ↓
   Firebase UID
        ↓
   lankaQuestTourists/{UID}
        ↓
   Tourist Dashboard


   FIRESTORE COLLECTIONS

   lankaQuestTourists
   lankaQuestTouristTrips
   lankaQuestQuotationRequests
   lankaQuestQuotations


   CANONICAL ID ARCHITECTURE

   Tourist
      ↓
   Create Trip
      ↓
   lankaQuestTouristTrips/{tripId}
      ↓
   Generate requestId
      ↓
   lankaQuestQuotationRequests/{requestId}
      ↓
   requestId field = requestId
      ↓
   tripId field = tripId
      ↓
   lankaQuestTouristTrips/{tripId}
      ↓
   quotationRequestId = requestId
      ↓
   Select Guide
      ↓
   Guide Sends Quotation
      ↓
   lankaQuestQuotations/{quotationId}
      ↓
   requestId = requestId
      ↓
   Tourist Dashboard


   IMPORTANT

   ❌ No localStorage
   ❌ No sessionStorage
   ❌ No request.quotations[]
   ❌ No matching by quotation arrays
   ❌ No trip document ID = tourist UID assumption

   ✅ Firebase Authentication
   ✅ Firestore
   ✅ requestId is the quotation request document ID
   ✅ requestId field is stored inside request
   ✅ tripId identifies the tourist trip
   ✅ trip.quotationRequestId links trip → request
   ✅ quotation.requestId links quotation → request
   ✅ Tourist ownership checks
   ✅ Separate quotation collection


   DELETE POLICY

   Tourist can delete OWN quotation requests regardless
   of request status:

   pending             → DELETE ✅
   guide_selected      → DELETE ✅
   quotation_sent      → DELETE ✅
   quotation_accepted  → DELETE ✅
   quotation_rejected  → DELETE ✅
   completed           → DELETE ✅

   Other Tourist request → DELETE ❌
   Guide deleting Tourist request → DELETE ❌

   IMPORTANT DELETE FLOW

       requestId
          ↓
       Find request
          ↓
       Verify touristId === current Firebase UID
          ↓
       Find linked quotation by quotation.requestId
          ↓
       Try to delete linked quotation
          ↓
       Delete request
          ↓
       Refresh dashboard

   IMPORTANT

   Linked quotation deletion failure MUST NOT prevent
   deletion of the Tourist's own quotation request.

============================================================ */


/* ============================================================
   1. FIREBASE IMPORTS
============================================================ */

import {
    auth,
    db
} from "./firebase-config.js";


import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


import {
    collection,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* ============================================================
   2. FIRESTORE COLLECTIONS
============================================================ */

const TOURIST_COLLECTION =
    "lankaQuestTourists";


const TRIP_COLLECTION =
    "lankaQuestTouristTrips";


const REQUEST_COLLECTION =
    "lankaQuestQuotationRequests";


const QUOTATION_COLLECTION =
    "lankaQuestQuotations";


/* ============================================================
   3. CURRENT USER
============================================================ */

let currentFirebaseUser =
    null;


let currentTouristProfile =
    null;


/* ============================================================
   4. DOM ELEMENTS
============================================================ */

const headerUserName =
    document.getElementById(
        "headerUserName"
    );


const welcomeUserName =
    document.getElementById(
        "welcomeUserName"
    );


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


const dashboardTripCount =
    document.getElementById(
        "dashboardTripCount"
    );


const dashboardRequestCount =
    document.getElementById(
        "dashboardRequestCount"
    );


const dashboardGuideCount =
    document.getElementById(
        "dashboardGuideCount"
    );


const dashboardTripContainer =
    document.getElementById(
        "dashboardTripContainer"
    );


const quotationRequestsContainer =
    document.getElementById(
        "quotationRequestsContainer"
    );


const selectedGuideContainer =
    document.getElementById(
        "selectedGuideContainer"
    );


/* ============================================================
   5. HTML ESCAPE
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
   6. GET TOURIST PROFILE
============================================================ */

async function getTouristProfile(
    uid
) {

    if (!uid) {

        return null;

    }


    try {

        const touristRef =
            doc(
                db,
                TOURIST_COLLECTION,
                uid
            );


        const touristSnapshot =
            await getDoc(
                touristRef
            );


        if (
            !touristSnapshot.exists()
        ) {

            console.warn(
                "Tourist profile not found:",
                uid
            );


            return null;

        }


        return {

            id:
                touristSnapshot.id,

            ...touristSnapshot.data()

        };


    } catch (error) {

        console.error(
            "Tourist profile loading error:",
            error
        );


        return null;

    }

}


/* ============================================================
   7. GET TOURIST TRIPS
============================================================ */

async function getTouristTrips(
    uid
) {

    if (!uid) {

        return [];

    }


    try {

        const tripsQuery =
            query(
                collection(
                    db,
                    TRIP_COLLECTION
                ),

                where(
                    "touristId",
                    "==",
                    uid
                )
            );


        const snapshot =
            await getDocs(
                tripsQuery
            );


        const trips =
            [];


        snapshot.forEach(
            (
                tripSnapshot
            ) => {

                const data =
                    tripSnapshot.data();


                trips.push({

                    tripId:
                        tripSnapshot.id,

                    id:
                        tripSnapshot.id,

                    ...data

                });

            }
        );


        trips.sort(
            (
                a,
                b
            ) => {

                const dateA =
                    a.createdAt?.toMillis
                        ? a.createdAt.toMillis()
                        : 0;


                const dateB =
                    b.createdAt?.toMillis
                        ? b.createdAt.toMillis()
                        : 0;


                return dateB - dateA;

            }
        );


        console.log(
            "Tourist trips loaded:",
            trips
        );


        return trips;


    } catch (error) {

        console.error(
            "Firestore tourist trips loading error:",
            error
        );


        return [];

    }

}


/* ============================================================
   8. GET CURRENT TOURIST TRIP
============================================================ */

async function getCurrentTouristTrip(
    uid
) {

    const trips =
        await getTouristTrips(
            uid
        );


    if (
        trips.length === 0
    ) {

        return {

            tripId:
                null,

            id:
                null,

            destinations:
                [],

            startDate:
                "",

            endDate:
                "",

            travelers:
                "",

            travelStyle:
                "",

            transport:
                "",

            accommodation:
                "",

            specialRequests:
                "",

            quotationRequestId:
                ""

        };

    }


    return {

        tripId:
            trips[0].tripId,

        id:
            trips[0].tripId,

        destinations:
            Array.isArray(
                trips[0].destinations
            )
                ? trips[0].destinations
                : [],

        startDate:
            trips[0].startDate ||
            "",

        endDate:
            trips[0].endDate ||
            "",

        travelers:
            trips[0].travelers ||
            "",

        travelStyle:
            trips[0].travelStyle ||
            "",

        transport:
            trips[0].transport ||
            "",

        accommodation:
            trips[0].accommodation ||
            "",

        specialRequests:
            trips[0].specialRequests ||
            "",

        quotationRequestId:
            trips[0].quotationRequestId ||
            ""

    };

}


/* ============================================================
   9. UPDATE DASHBOARD USER
============================================================ */

function updateDashboardUser() {

    if (
        !currentTouristProfile
    ) {

        return;

    }


    const name =
        currentTouristProfile.fullName ||
        currentTouristProfile.email ||
        currentFirebaseUser?.displayName ||
        "Tourist";


    if (
        headerUserName
    ) {

        headerUserName.textContent =
            name;

    }


    if (
        welcomeUserName
    ) {

        welcomeUserName.textContent =
            name;

    }

}


/* ============================================================
   10. RENDER MY CURRENT TRIP
============================================================ */

async function renderDashboardTrip() {

    if (
        !dashboardTripContainer ||
        !currentFirebaseUser
    ) {

        return;

    }


    const trip =
        await getCurrentTouristTrip(
            currentFirebaseUser.uid
        );


    const destinations =
        trip.destinations ||
        [];


    if (
        dashboardTripCount
    ) {

        dashboardTripCount.textContent =
            destinations.length;

    }


    if (
        destinations.length === 0
    ) {

        dashboardTripContainer.innerHTML = `

            <div class="dashboard-empty-state">

                <div>
                    🗺️
                </div>

                <h4>
                    No Destinations Yet
                </h4>

                <p>
                    Start planning your Sri Lanka journey.
                </p>

                <a
                    href="trip-planner.html"
                    class="dashboard-action-button"
                >
                    Explore Destinations
                </a>

            </div>

        `;


        return;

    }


    dashboardTripContainer.innerHTML =
        "";


    destinations.forEach(
        (
            place
        ) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "dashboard-destination-card";


            card.innerHTML = `

                <img
                    src="${escapeHTML(
                        place.image ||
                        ""
                    )}"
                    alt="${escapeHTML(
                        place.name ||
                        "Destination"
                    )}"
                    loading="lazy"
                >


                <h4>
                    ${escapeHTML(
                        place.name ||
                        "Destination"
                    )}
                </h4>


                <p>

                    📍

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

                </p>

            `;


            dashboardTripContainer.appendChild(
                card
            );

        }
    );

}


/* ============================================================
   11. GET TOURIST QUOTATION REQUESTS
============================================================ */

async function getMyQuotationRequests() {

    if (
        !currentFirebaseUser
    ) {

        return [];

    }


    try {

        const requestsQuery =
            query(
                collection(
                    db,
                    REQUEST_COLLECTION
                ),

                where(
                    "touristId",
                    "==",
                    currentFirebaseUser.uid
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
                documentSnapshot
            ) => {

                const data =
                    documentSnapshot.data();


                const requestId =
                    documentSnapshot.id;


                requests.push({

                    ...data,

                    requestId:
                        requestId,

                    id:
                        requestId,

                    firebaseId:
                        documentSnapshot.id

                });

            }
        );


        requests.sort(
            (
                a,
                b
            ) => {

                const dateA =
                    a.createdAt?.toMillis
                        ? a.createdAt.toMillis()
                        : 0;


                const dateB =
                    b.createdAt?.toMillis
                        ? b.createdAt.toMillis()
                        : 0;


                return dateB - dateA;

            }
        );


        console.log(
            "Tourist quotation requests:",
            requests
        );


        return requests;


    } catch (error) {

        console.error(
            "Quotation request loading error:",
            error
        );


        return [];

    }

}


/* ============================================================
   12. GET TOURIST QUOTATIONS
============================================================ */

async function getMyQuotations() {

    const quotationMap =
        new Map();


    if (
        !currentFirebaseUser
    ) {

        return quotationMap;

    }


    try {

        const quotationsQuery =
            query(
                collection(
                    db,
                    QUOTATION_COLLECTION
                ),

                where(
                    "touristId",
                    "==",
                    currentFirebaseUser.uid
                )
            );


        const snapshot =
            await getDocs(
                quotationsQuery
            );


        snapshot.forEach(
            (
                documentSnapshot
            ) => {

                const quotationData =
                    documentSnapshot.data();


                const quotation = {

                    quotationId:
                        documentSnapshot.id,

                    id:
                        documentSnapshot.id,

                    ...quotationData

                };


                if (
                    quotation.requestId
                ) {

                    quotationMap.set(
                        String(
                            quotation.requestId
                        ),
                        quotation
                    );

                }

            }
        );


        console.log(
            "Tourist quotations:",
            Array.from(
                quotationMap.values()
            )
        );


        return quotationMap;


    } catch (error) {

        console.error(
            "Quotation loading error:",
            error
        );


        return quotationMap;

    }

}


/* ============================================================
   13. FIND QUOTATION FOR REQUEST
============================================================ */

function getQuotationForRequest(
    request,
    quotationMap
) {

    if (
        !request ||
        !quotationMap ||
        !request.requestId
    ) {

        return null;

    }


    return (
        quotationMap.get(
            String(
                request.requestId
            )
        ) || null
    );

}


/* ============================================================
   14. FORMAT DATE
============================================================ */

function formatDashboardDate(
    value
) {

    if (!value) {

        return "Not specified";

    }


    try {

        if (
            typeof value.toDate ===
            "function"
        ) {

            return value
                .toDate()
                .toLocaleDateString();

        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                value
            );

        }


        return date.toLocaleDateString();


    } catch (error) {

        return "Not specified";

    }

}


/* ============================================================
   15. FORMAT REQUEST STATUS
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
            "Quotation Received",

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
   16. FORMAT GUIDE LANGUAGES
============================================================ */

function formatGuideLanguages(
    languages
) {

    if (
        Array.isArray(
            languages
        )
    ) {

        return languages
            .map(
                language =>
                    String(
                        language
                    )
            )
            .join(
                ", "
            );

    }


    if (
        typeof languages ===
            "string" &&
        languages.trim()
    ) {

        return languages;

    }


    return "Not specified";

}


/* ============================================================
   17. RENDER QUOTATION
============================================================ */

function renderQuotation(
    request,
    quotation
) {

    if (
        !quotation
    ) {

        return `

            <div class="quotation-not-received">

                <h4>
                    ⏳ Waiting for Guide Quotation
                </h4>

                <p>
                    Your selected guide has not
                    sent a quotation yet.
                </p>

            </div>

        `;

    }


    const guideName =
        quotation.guideName ||
        request.guideName ||
        request.selectedGuide?.fullName ||
        "Registered Guide";


    const guideEmail =
        quotation.guideEmail ||
        request.guideEmail ||
        request.selectedGuide?.email ||
        "Email not available";


    const guidePhone =
        quotation.guidePhone ||
        request.guidePhone ||
        request.selectedGuide?.phone ||
        "Phone not available";


    const guideDistrict =
        quotation.guide?.district ||
        request.selectedGuide?.district ||
        "Sri Lanka";


    const guideLanguages =
        formatGuideLanguages(
            quotation.guide?.languages ||
            request.selectedGuide?.languages
        );


    const quotationStatus =
        quotation.status ||
        "sent";


    const actionButtons =
        quotationStatus ===
        "sent"

            ? `

                <div class="quotation-actions">

                    <button
                        type="button"
                        class="accept-quotation-button"
                        data-request-id="${escapeHTML(
                            request.requestId ||
                            ""
                        )}"
                        data-quotation-id="${escapeHTML(
                            quotation.quotationId ||
                            quotation.id ||
                            ""
                        )}"
                    >
                        ✓ Accept
                    </button>


                    <button
                        type="button"
                        class="reject-quotation-button"
                        data-request-id="${escapeHTML(
                            request.requestId ||
                            ""
                        )}"
                        data-quotation-id="${escapeHTML(
                            quotation.quotationId ||
                            quotation.id ||
                            ""
                        )}"
                    >
                        ✕ Reject
                    </button>

                </div>

            `

            : "";


    return `

        <div class="tourist-quotation-card">

            <div class="quotation-card-header">

                <div>

                    <h4>

                        🧑‍💼

                        ${escapeHTML(
                            guideName
                        )}

                    </h4>


                    <p>

                        📧

                        ${escapeHTML(
                            guideEmail
                        )}

                    </p>


                    <p>

                        📞

                        ${escapeHTML(
                            guidePhone
                        )}

                    </p>

                </div>


                <span class="request-status">

                    ${escapeHTML(
                        formatRequestStatus(
                            request.status ===
                            "quotation_sent"
                                ? "quotation_sent"
                                : quotationStatus
                        )
                    )}

                </span>

            </div>


            <div class="quotation-price">

                ${escapeHTML(
                    quotation.amount ?? "0"
                )}

                ${escapeHTML(
                    quotation.currency ||
                    ""
                )}

            </div>


            <div class="quotation-details">

                <p>

                    📍

                    ${escapeHTML(
                        guideDistrict
                    )}

                </p>


                <p>

                    🗣️

                    ${escapeHTML(
                        guideLanguages
                    )}

                </p>


                <p>

                    📅

                    Valid Until:

                    ${escapeHTML(
                        formatDashboardDate(
                            quotation.validUntil
                        )
                    )}

                </p>


                ${
                    quotation.included
                        ? `

                            <div>

                                <strong>
                                    ✅ What's Included
                                </strong>

                                <p>
                                    ${escapeHTML(
                                        quotation.included
                                    )}
                                </p>

                            </div>

                        `
                        : ""
                }


                ${
                    quotation.excluded
                        ? `

                            <div>

                                <strong>
                                    ❌ What's Not Included
                                </strong>

                                <p>
                                    ${escapeHTML(
                                        quotation.excluded
                                    )}
                                </p>

                            </div>

                        `
                        : ""
                }


                ${
                    quotation.notes
                        ? `

                            <div>

                                <strong>
                                    💬 Message from Guide
                                </strong>

                                <p>
                                    ${escapeHTML(
                                        quotation.notes
                                    )}
                                </p>

                            </div>

                        `
                        : ""
                }

            </div>


            ${actionButtons}

        </div>

    `;

}


/* ============================================================
   18. UPDATE REQUEST STATUS
============================================================ */

async function updateQuotationRequestStatus(
    request,
    status
) {

    if (
        !request?.requestId
    ) {

        throw new Error(
            "Quotation request ID is missing."
        );

    }


    const requestRef =
        doc(
            db,
            REQUEST_COLLECTION,
            request.requestId
        );


    await updateDoc(
        requestRef,
        {

            status:
                status,

            updatedAt:
                serverTimestamp()

        }
    );

}


/* ============================================================
   19. UPDATE QUOTATION STATUS
============================================================ */

async function updateQuotationStatus(
    quotation,
    status
) {

    if (
        !quotation?.quotationId
    ) {

        throw new Error(
            "Quotation Firestore ID is missing."
        );

    }


    const quotationRef =
        doc(
            db,
            QUOTATION_COLLECTION,
            quotation.quotationId
        );


    await updateDoc(
        quotationRef,
        {

            status:
                status,

            updatedAt:
                serverTimestamp()

        }
    );

}


/* ============================================================
   20. FIND REQUEST BY REQUEST ID
============================================================ */

async function findRequestById(
    requestId
) {

    if (
        !requestId ||
        !currentFirebaseUser
    ) {

        return null;

    }


    try {

        const requestRef =
            doc(
                db,
                REQUEST_COLLECTION,
                requestId
            );


        const snapshot =
            await getDoc(
                requestRef
            );


        if (
            !snapshot.exists()
        ) {

            return null;

        }


        const data =
            snapshot.data();


        /*
           SECURITY CHECK

           The request MUST belong to
           the currently authenticated Tourist.
        */

        if (
            data.touristId !==
            currentFirebaseUser.uid
        ) {

            console.warn(
                "Request ownership mismatch:",
                requestId
            );


            return null;

        }


        return {

            requestId:
                snapshot.id,

            id:
                snapshot.id,

            firebaseId:
                snapshot.id,

            ...data

        };


    } catch (error) {

        console.error(
            "Find request by ID error:",
            error
        );


        return null;

    }

}


/* ============================================================
   21. ACCEPT QUOTATION
============================================================ */

async function acceptQuotation(
    requestId,
    quotationId
) {

    try {

        if (
            !currentFirebaseUser
        ) {

            alert(
                "Please login again."
            );


            return;

        }


        const request =
            await findRequestById(
                requestId
            );


        if (
            !request
        ) {

            alert(
                "Quotation request not found."
            );


            return;

        }


        let quotation =
            null;


        if (
            quotationId
        ) {

            const quotationRef =
                doc(
                    db,
                    QUOTATION_COLLECTION,
                    quotationId
                );


            const quotationSnapshot =
                await getDoc(
                    quotationRef
                );


            if (
                quotationSnapshot.exists()
            ) {

                const data =
                    quotationSnapshot.data();


                if (
                    data.touristId !==
                    currentFirebaseUser.uid
                ) {

                    alert(
                        "Access denied."
                    );


                    return;

                }


                if (
                    String(
                        data.requestId ||
                        ""
                    ) !==
                    String(
                        request.requestId
                    )
                ) {

                    alert(
                        "Quotation does not belong to this request."
                    );


                    return;

                }


                quotation = {

                    quotationId:
                        quotationSnapshot.id,

                    id:
                        quotationSnapshot.id,

                    ...data

                };

            }

        }


        if (
            !quotation
        ) {

            const quotationMap =
                await getMyQuotations();


            quotation =
                getQuotationForRequest(
                    request,
                    quotationMap
                );

        }


        if (
            !quotation
        ) {

            alert(
                "Quotation not found."
            );


            return;

        }


        await updateQuotationStatus(
            quotation,
            "accepted"
        );


        await updateQuotationRequestStatus(
            request,
            "quotation_accepted"
        );


        alert(
            "Quotation accepted successfully."
        );


        await renderQuotationRequests();

        await renderSelectedGuide();


    } catch (error) {

        console.error(
            "Accept quotation error:",
            error
        );


        alert(
            error.message ||
            "Unable to accept quotation."
        );

    }

}


/* ============================================================
   22. REJECT QUOTATION
============================================================ */

async function rejectQuotation(
    requestId,
    quotationId
) {

    try {

        if (
            !currentFirebaseUser
        ) {

            alert(
                "Please login again."
            );


            return;

        }


        const request =
            await findRequestById(
                requestId
            );


        if (
            !request
        ) {

            alert(
                "Quotation request not found."
            );


            return;

        }


        let quotation =
            null;


        if (
            quotationId
        ) {

            const quotationRef =
                doc(
                    db,
                    QUOTATION_COLLECTION,
                    quotationId
                );


            const quotationSnapshot =
                await getDoc(
                    quotationRef
                );


            if (
                quotationSnapshot.exists()
            ) {

                const data =
                    quotationSnapshot.data();


                if (
                    data.touristId !==
                    currentFirebaseUser.uid
                ) {

                    alert(
                        "Access denied."
                    );


                    return;

                }


                if (
                    String(
                        data.requestId ||
                        ""
                    ) !==
                    String(
                        request.requestId
                    )
                ) {

                    alert(
                        "Quotation does not belong to this request."
                    );


                    return;

                }


                quotation = {

                    quotationId:
                        quotationSnapshot.id,

                    id:
                        quotationSnapshot.id,

                    ...data

                };

            }

        }


        if (
            !quotation
        ) {

            const quotationMap =
                await getMyQuotations();


            quotation =
                getQuotationForRequest(
                    request,
                    quotationMap
                );

        }


        if (
            !quotation
        ) {

            alert(
                "Quotation not found."
            );


            return;

        }


        await updateQuotationStatus(
            quotation,
            "rejected"
        );


        await updateQuotationRequestStatus(
            request,
            "quotation_rejected"
        );


        alert(
            "Quotation rejected."
        );


        await renderQuotationRequests();

        await renderSelectedGuide();


    } catch (error) {

        console.error(
            "Reject quotation error:",
            error
        );


        alert(
            error.message ||
            "Unable to reject quotation."
        );

    }

}


/* ============================================================
   23. DELETE LINKED QUOTATION
============================================================ */

/*
   IMPORTANT

   This function ONLY deletes a quotation if:

       quotation.touristId
              ===
       currentFirebaseUser.uid

   Therefore a Tourist cannot use this function to
   delete another Tourist's quotation.

   If quotation deletion fails, the error is returned
   to the caller but the main request can still be deleted.
============================================================ */

async function deleteLinkedQuotation(
    requestId
) {

    if (
        !requestId ||
        !currentFirebaseUser
    ) {

        return {

            deleted:
                false,

            found:
                false

        };

    }


    try {

        /*
           Find quotations belonging to the
           currently authenticated Tourist.
        */

        const quotationsQuery =
            query(
                collection(
                    db,
                    QUOTATION_COLLECTION
                ),

                where(
                    "touristId",
                    "==",
                    currentFirebaseUser.uid
                ),

                where(
                    "requestId",
                    "==",
                    requestId
                )
            );


        const snapshot =
            await getDocs(
                quotationsQuery
            );


        if (
            snapshot.empty
        ) {

            console.log(
                "No linked quotation found for request:",
                requestId
            );


            return {

                deleted:
                    false,

                found:
                    false

            };

        }


        let deletedCount =
            0;


        for (
            const quotationSnapshot
            of snapshot.docs
        ) {

            const quotationData =
                quotationSnapshot.data();


            /*
               Extra client-side ownership check.
            */

            if (
                quotationData.touristId !==
                currentFirebaseUser.uid
            ) {

                console.warn(
                    "Skipping quotation belonging to another Tourist:",
                    quotationSnapshot.id
                );


                continue;

            }


            const quotationRef =
                doc(
                    db,
                    QUOTATION_COLLECTION,
                    quotationSnapshot.id
                );


            try {

                await deleteDoc(
                    quotationRef
                );


                deletedCount++;


                console.log(
                    "Linked quotation deleted:",
                    quotationSnapshot.id
                );


            } catch (quotationDeleteError) {

                /*
                   IMPORTANT

                   Do NOT throw here.

                   Even if the quotation cannot be deleted,
                   the parent Tourist request must still be
                   allowed to continue to deletion.
                */

                console.error(
                    "Linked quotation deletion failed:",
                    quotationSnapshot.id,
                    quotationDeleteError
                );

            }

        }


        return {

            deleted:
                deletedCount > 0,

            found:
                true,

            deletedCount:
                deletedCount

        };


    } catch (error) {

        /*
           IMPORTANT

           Quotation lookup itself failed.

           Do not block deletion of the Tourist request.
        */

        console.error(
            "Linked quotation lookup error:",
            error
        );


        return {

            deleted:
                false,

            found:
                false,

            error:
                error

        };

    }

}


/* ============================================================
   24. DELETE QUOTATION REQUEST
============================================================ */

/*
   ============================================================
   FINAL DELETE POLICY
   ============================================================

   Tourist can delete OWN request regardless of status:

       pending
       guide_selected
       quotation_sent
       quotation_accepted
       quotation_rejected
       completed

   All are allowed.

   SECURITY:

       request.touristId
              ===
       currentFirebaseUser.uid

   If another Tourist owns the request:

       DELETE ❌

   If a Guide tries to delete it:

       DELETE ❌

   Firestore Rules remain the final authority.

   DELETE FLOW:

       1. Authenticate Tourist
       2. Validate requestId
       3. Read request
       4. Verify ownership
       5. Confirm deletion
       6. Try linked quotation deletion
       7. Delete request
       8. Refresh dashboard

   IMPORTANT:

   Linked quotation deletion failure does NOT stop
   the request deletion.
============================================================ */

async function deleteQuotationRequest(
    requestId
) {

    try {

        /* ------------------------------------------------------
           STEP 1
           Authentication
        ------------------------------------------------------ */

        if (
            !currentFirebaseUser
        ) {

            alert(
                "Please login again."
            );


            return;

        }


        /* ------------------------------------------------------
           STEP 2
           Validate request ID
        ------------------------------------------------------ */

        if (
            !requestId
        ) {

            alert(
                "Quotation request ID is missing."
            );


            return;

        }


        /* ------------------------------------------------------
           STEP 3
           Find request
        ------------------------------------------------------ */

        const request =
            await findRequestById(
                requestId
            );


        if (
            !request
        ) {

            alert(
                "Quotation request not found, or you do not have permission to delete it."
            );


            return;

        }


        /* ------------------------------------------------------
           STEP 4
           FINAL CLIENT-SIDE OWNERSHIP CHECK
        ------------------------------------------------------ */

        if (
            request.touristId !==
            currentFirebaseUser.uid
        ) {

            console.warn(
                "DELETE BLOCKED - ownership mismatch:",
                {
                    requestId:
                        requestId,

                    requestTouristId:
                        request.touristId,

                    currentUser:
                        currentFirebaseUser.uid
                }
            );


            alert(
                "Access denied. You can only delete your own request."
            );


            return;

        }


        /* ------------------------------------------------------
           IMPORTANT

           DO NOT check request.status here.

           Therefore ALL statuses can be deleted:

           pending
           guide_selected
           quotation_sent
           quotation_accepted
           quotation_rejected
           completed
        ------------------------------------------------------ */


        const confirmed =
            window.confirm(
                "Delete this quotation request?\n\n" +
                "This will remove the request from your dashboard and delete its linked quotation if one exists.\n\n" +
                "This action cannot be undone."
            );


        if (
            !confirmed
        ) {

            return;

        }


        /* ------------------------------------------------------
           STEP 5
           TRY TO DELETE LINKED QUOTATION

           IMPORTANT:

           Failure here MUST NOT stop request deletion.
        ------------------------------------------------------ */

        const quotationDeleteResult =
            await deleteLinkedQuotation(
                requestId
            );


        console.log(
            "Linked quotation deletion result:",
            quotationDeleteResult
        );


        /* ------------------------------------------------------
           STEP 6
           DELETE MAIN REQUEST

           requestId is the Firestore document ID.
        ------------------------------------------------------ */

        const requestRef =
            doc(
                db,
                REQUEST_COLLECTION,
                requestId
            );


        await deleteDoc(
            requestRef
        );


        console.log(
            "Quotation request deleted:",
            requestId
        );


        /* ------------------------------------------------------
           STEP 7
           REFRESH DASHBOARD
        ------------------------------------------------------ */

        await renderQuotationRequests();

        await renderSelectedGuide();

        await updateDashboardSummary();


        /* ------------------------------------------------------
           SUCCESS MESSAGE
        ------------------------------------------------------ */

        if (
            quotationDeleteResult.found &&
            !quotationDeleteResult.deleted
        ) {

            alert(
                "Quotation request deleted successfully.\n\n" +
                "The linked quotation could not be removed, but the request itself was deleted."
            );

        } else {

            alert(
                "Quotation request deleted successfully."
            );

        }


    } catch (error) {

        console.error(
            "Delete quotation request error:",
            error
        );


        /* ------------------------------------------------------
           FIRESTORE PERMISSION ERROR
        ------------------------------------------------------ */

        if (
            error?.code ===
            "permission-denied"
        ) {

            alert(
                "Firestore denied permission to delete this request.\n\n" +
                "Make sure the Firestore Rules allow the authenticated Tourist to delete their own request."
            );


            return;

        }


        alert(
            error?.message ||
            "Unable to delete quotation request."
        );

    }

}


/* ============================================================
   25. RENDER QUOTATION REQUESTS
============================================================ */

async function renderQuotationRequests() {

    if (
        !quotationRequestsContainer
    ) {

        return;

    }


    if (
        !currentFirebaseUser
    ) {

        return;

    }


    const requests =
        await getMyQuotationRequests();


    const quotationMap =
        await getMyQuotations();


    console.log(
        "Requests loaded:",
        requests
    );


    console.log(
        "Quotation map:",
        quotationMap
    );


    if (
        dashboardRequestCount
    ) {

        dashboardRequestCount.textContent =
            requests.length;

    }


    if (
        requests.length === 0
    ) {

        quotationRequestsContainer.innerHTML = `

            <div class="dashboard-empty-state">

                <div>
                    📋
                </div>

                <h4>
                    No Quotation Requests Yet
                </h4>

                <p>
                    Start planning your Sri Lanka journey.
                </p>

                <a
                    href="trip-planner.html"
                    class="dashboard-action-button"
                >
                    Plan My Journey
                </a>

            </div>

        `;


        return;

    }


    quotationRequestsContainer.innerHTML =
        "";


    requests.forEach(
        (
            request
        ) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "quotation-request-card";


            const destinations =
                Array.isArray(
                    request.destinations
                )
                    ? request.destinations
                    : [];


            const destinationNames =
                destinations
                    .map(
                        place =>
                            place.name ||
                            "Destination"
                    )
                    .join(
                        ", "
                    );


            const quotation =
                getQuotationForRequest(
                    request,
                    quotationMap
                );


            const requestId =
                request.requestId ||
                "";


            card.innerHTML = `

                <div class="request-card-header">

                    <h4>

                        🧾

                        ${escapeHTML(
                            requestId
                        )}

                    </h4>


                    <span class="request-status">

                        ${escapeHTML(
                            formatRequestStatus(
                                request.status
                            )
                        )}

                    </span>

                </div>


                <!--
                    DELETE IS AVAILABLE FOR ALL REQUEST STATUSES.

                    Firestore Rules decide whether the current
                    authenticated Tourist actually owns this request.
                -->

                <div class="quotation-request-delete-area">

                    <button
                        type="button"
                        class="delete-quotation-request-button"
                        data-request-id="${escapeHTML(
                            requestId
                        )}"
                    >

                        🗑️

                        Delete Request

                    </button>

                </div>


                <div class="request-details-grid">

                    <div>

                        <span>
                            Destinations
                        </span>

                        <strong>

                            ${escapeHTML(
                                destinationNames ||
                                "None"
                            )}

                        </strong>

                    </div>


                    <div>

                        <span>
                            Travel Dates
                        </span>

                        <strong>

                            ${
                                request.startDate &&
                                request.endDate
                                    ? escapeHTML(
                                        request.startDate +
                                        " → " +
                                        request.endDate
                                    )
                                    : "Not selected"
                            }

                        </strong>

                    </div>


                    <div>

                        <span>
                            Travelers
                        </span>

                        <strong>

                            ${escapeHTML(
                                request.travelers ||
                                "Not selected"
                            )}

                        </strong>

                    </div>

                </div>


                <div class="request-quotation-area">

                    ${renderQuotation(
                        request,
                        quotation
                    )}

                </div>

            `;


            quotationRequestsContainer.appendChild(
                card
            );

        }
    );


    attachQuotationButtons();

}


/* ============================================================
   26. ATTACH ACCEPT / REJECT / DELETE BUTTONS
============================================================ */

function attachQuotationButtons() {

    /* ---------------------------------------------------------
       ACCEPT BUTTONS
    --------------------------------------------------------- */

    document
        .querySelectorAll(
            ".accept-quotation-button"
        )
        .forEach(
            (
                button
            ) => {

                button.addEventListener(
                    "click",
                    async () => {

                        if (
                            button.disabled
                        ) {

                            return;

                        }


                        button.disabled =
                            true;


                        await acceptQuotation(
                            button.dataset.requestId,
                            button.dataset.quotationId
                        );

                    }
                );

            }
        );


    /* ---------------------------------------------------------
       REJECT BUTTONS
    --------------------------------------------------------- */

    document
        .querySelectorAll(
            ".reject-quotation-button"
        )
        .forEach(
            (
                button
            ) => {

                button.addEventListener(
                    "click",
                    async () => {

                        if (
                            button.disabled
                        ) {

                            return;

                        }


                        button.disabled =
                            true;


                        await rejectQuotation(
                            button.dataset.requestId,
                            button.dataset.quotationId
                        );

                    }
                );

            }
        );


    /* ---------------------------------------------------------
       DELETE REQUEST BUTTONS
    --------------------------------------------------------- */

    document
        .querySelectorAll(
            ".delete-quotation-request-button"
        )
        .forEach(
            (
                button
            ) => {

                button.addEventListener(
                    "click",
                    async () => {

                        if (
                            button.disabled
                        ) {

                            return;

                        }


                        button.disabled =
                            true;


                        const originalText =
                            button.textContent;


                        button.textContent =
                            " Deleting...";


                        try {

                            await deleteQuotationRequest(
                                button.dataset.requestId
                            );

                        } finally {

                            button.disabled =
                                false;

                            button.textContent =
                                originalText;

                        }

                    }
                );

            }
        );

}


/* ============================================================
   27. RENDER SELECTED GUIDE
============================================================ */

async function renderSelectedGuide() {

    if (
        !selectedGuideContainer
    ) {

        return;

    }


    const requests =
        await getMyQuotationRequests();


    const selectedRequests =
        requests.filter(
            (
                request
            ) =>
                request.selectedGuide ||
                request.guideId
        );


    const selectedRequest =
        selectedRequests.length
            ? selectedRequests[0]
            : null;


    if (
        !selectedRequest
    ) {

        selectedGuideContainer.innerHTML = `

            <div class="no-selected-guide">

                <div>
                    🧑‍💼
                </div>

                <h4>
                    No Guide Selected Yet
                </h4>

                <p>
                    Select a registered guide
                    for your journey.
                </p>

                <a
                    href="find-guides.html"
                    class="dashboard-action-button"
                >
                    Find Guides
                </a>

            </div>

        `;


        if (
            dashboardGuideCount
        ) {

            dashboardGuideCount.textContent =
                0;

        }


        return;

    }


    const guide =
        selectedRequest.selectedGuide ||
        {

            uid:
                selectedRequest.guideId,

            fullName:
                selectedRequest.guideName,

            email:
                selectedRequest.guideEmail,

            phone:
                selectedRequest.guidePhone

        };


    selectedGuideContainer.innerHTML = `

        <div class="selected-guide-card">

            <h4>

                🧑‍💼

                ${escapeHTML(
                    guide.fullName ||
                    selectedRequest.guideName ||
                    "Guide"
                )}

            </h4>


            ${
                guide.email ||
                selectedRequest.guideEmail

                    ? `

                        <p>

                            📧

                            ${escapeHTML(
                                guide.email ||
                                selectedRequest.guideEmail
                            )}

                        </p>

                    `

                    : ""
            }


            ${
                guide.phone ||
                selectedRequest.guidePhone

                    ? `

                        <p>

                            📞

                            ${escapeHTML(
                                guide.phone ||
                                selectedRequest.guidePhone
                            )}

                        </p>

                    `

                    : ""
            }


            <p>

                📍

                ${escapeHTML(
                    guide.district ||
                    "Sri Lanka"
                )}

            </p>


            <p>

                🗣️

                ${escapeHTML(
                    formatGuideLanguages(
                        guide.languages
                    )
                )}

            </p>


            <span>
                ✓ Guide Selected
            </span>

        </div>

    `;


    if (
        dashboardGuideCount
    ) {

        dashboardGuideCount.textContent =
            1;

    }

}


/* ============================================================
   28. UPDATE DASHBOARD SUMMARY
============================================================ */

async function updateDashboardSummary() {

    if (
        !currentFirebaseUser
    ) {

        return;

    }


    const trip =
        await getCurrentTouristTrip(
            currentFirebaseUser.uid
        );


    const requests =
        await getMyQuotationRequests();


    if (
        dashboardTripCount
    ) {

        dashboardTripCount.textContent =
            (
                trip.destinations ||
                []
            ).length;

    }


    if (
        dashboardRequestCount
    ) {

        dashboardRequestCount.textContent =
            requests.length;

    }

}


/* ============================================================
   29. LOGOUT
============================================================ */

async function handleLogout() {

    try {

        await signOut(
            auth
        );


        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

}


/* ============================================================
   30. AUTH STATE
============================================================ */

onAuthStateChanged(
    auth,
    async (
        user
    ) => {

        if (!user) {

            window.location.href =
                "login.html";


            return;

        }


        currentFirebaseUser =
            user;


        console.log(
            "Tourist Firebase UID:",
            user.uid
        );


        console.log(
            "Tourist Firebase Email:",
            user.email
        );


        currentTouristProfile =
            await getTouristProfile(
                user.uid
            );


        if (
            !currentTouristProfile
        ) {

            console.error(
                "Tourist profile missing:",
                user.uid
            );


            return;

        }


        updateDashboardUser();


        await updateDashboardSummary();


        await renderDashboardTrip();


        await renderSelectedGuide();


        await renderQuotationRequests();


        console.log(
            "LankaQuest Tourist Dashboard Loaded:",
            user.uid
        );

    }
);


/* ============================================================
   31. LOGOUT BUTTON
============================================================ */

if (
    logoutButton
) {

    logoutButton.addEventListener(
        "click",
        handleLogout
    );

}


/* ============================================================
   END TOURIST-DASHBOARD.JS
============================================================ */

