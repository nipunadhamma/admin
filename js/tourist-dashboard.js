/* ============================================================
   LankaWayfarer
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


   QUOTATION FLOW

   Tourist
      ↓
   Create Trip
      ↓
   lankaQuestTouristTrips
      ↓
   Create Quotation Request
      ↓
   lankaQuestQuotationRequests
      ↓
   Select Guide
      ↓
   Guide Sends Quotation
      ↓
   lankaQuestQuotations
      ↓
   requestId links quotation to request
      ↓
   Tourist Dashboard
      ↓
   Accept / Reject


   IMPORTANT

   ❌ No localStorage
   ❌ No sessionStorage
   ❌ No request.quotations[]
   ❌ No old quotation architecture

   ✅ Firebase Authentication
   ✅ Firestore
   ✅ Separate quotation collection
============================================================ */

/* ============================================================
   1. FIREBASE IMPORTS
============================================================ */

import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
/* ============================================================
   2. FIRESTORE COLLECTIONS
============================================================ */

const TOURIST_COLLECTION = "lankaQuestTourists";

const TRIP_COLLECTION = "lankaQuestTouristTrips";

const REQUEST_COLLECTION = "lankaQuestQuotationRequests";

const QUOTATION_COLLECTION = "lankaQuestQuotations";

/* ============================================================
   3. CURRENT USER
============================================================ */

let currentFirebaseUser = null;

let currentTouristProfile = null;

/* ============================================================
   4. DOM ELEMENTS
============================================================ */

const headerUserName = document.getElementById("headerUserName");

const welcomeUserName = document.getElementById("welcomeUserName");

const logoutButton = document.getElementById("logoutButton");

const dashboardTripCount = document.getElementById("dashboardTripCount");

const dashboardRequestCount = document.getElementById("dashboardRequestCount");

const dashboardGuideCount = document.getElementById("dashboardGuideCount");

const dashboardTripContainer = document.getElementById(
  "dashboardTripContainer",
);

const quotationRequestsContainer = document.getElementById(
  "quotationRequestsContainer",
);

const selectedGuideContainer = document.getElementById(
  "selectedGuideContainer",
);

/* ============================================================
   5. HTML ESCAPE
============================================================ */

function escapeHTML(value) {
  const div = document.createElement("div");

  div.textContent = value == null ? "" : String(value);

  return div.innerHTML;
}

/* ============================================================
   6. GET TOURIST PROFILE
============================================================ */

async function getTouristProfile(uid) {
  if (!uid) {
    return null;
  }

  try {
    const touristRef = doc(db, TOURIST_COLLECTION, uid);

    const touristSnapshot = await getDoc(touristRef);

    if (!touristSnapshot.exists()) {
      console.warn("Tourist profile not found:", uid);

      return null;
    }

    return {
      id: touristSnapshot.id,

      ...touristSnapshot.data(),
    };
  } catch (error) {
    console.error("Tourist profile loading error:", error);

    return null;
  }
}

/* ============================================================
   7. GET TOURIST TRIP
============================================================ */

async function getTouristTrip(uid) {
  if (!uid) {
    return {
      destinations: [],
    };
  }

  try {
    const tripRef = doc(db, TRIP_COLLECTION, uid);

    const tripSnapshot = await getDoc(tripRef);

    if (!tripSnapshot.exists()) {
      return {
        destinations: [],

        startDate: "",

        endDate: "",

        travelers: "",

        travelStyle: "",

        transport: "",

        accommodation: "",

        specialRequests: "",
      };
    }

    const data = tripSnapshot.data();

    return {
      id: tripSnapshot.id,

      destinations: Array.isArray(data.destinations) ? data.destinations : [],

      startDate: data.startDate || "",

      endDate: data.endDate || "",

      travelers: data.travelers || "",

      travelStyle: data.travelStyle || "",

      transport: data.transport || "",

      accommodation: data.accommodation || "",

      specialRequests: data.specialRequests || "",
    };
  } catch (error) {
    console.error("Firestore trip loading error:", error);

    return {
      destinations: [],
    };
  }
}

/* ============================================================
   8. UPDATE DASHBOARD USER
============================================================ */

function updateDashboardUser() {
  if (!currentTouristProfile) {
    return;
  }

  const name =
    currentTouristProfile.fullName ||
    currentTouristProfile.email ||
    currentFirebaseUser?.displayName ||
    "Tourist";

  if (headerUserName) {
    headerUserName.textContent = name;
  }

  if (welcomeUserName) {
    welcomeUserName.textContent = name;
  }
}

/* ============================================================
   9. RENDER MY TRIP
============================================================ */

async function renderDashboardTrip() {
  if (!dashboardTripContainer || !currentFirebaseUser) {
    return;
  }

  const trip = await getTouristTrip(currentFirebaseUser.uid);

  const destinations = trip.destinations || [];

  if (dashboardTripCount) {
    dashboardTripCount.textContent = destinations.length;
  }

  if (destinations.length === 0) {
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

  dashboardTripContainer.innerHTML = "";

  destinations.forEach((place) => {
    const card = document.createElement("article");

    card.className = "dashboard-destination-card";

    card.innerHTML = `

                <img
                    src="${escapeHTML(place.image || "")}"
                    alt="${escapeHTML(place.name || "Destination")}"
                    loading="lazy"
                >

                <h4>
                    ${escapeHTML(place.name || "Destination")}
                </h4>

                <p>
                    📍

                    ${escapeHTML(place.district || "")}

                    ${place.province ? " · " + escapeHTML(place.province) : ""}
                </p>

            `;

    dashboardTripContainer.appendChild(card);
  });
}

/* ============================================================
   10. GET TOURIST QUOTATION REQUESTS

   IMPORTANT

   Requests are loaded from:

       lankaQuestQuotationRequests

   Only requests belonging to the current
   Firebase tourist UID are loaded.
============================================================ */

async function getMyQuotationRequests() {
  if (!currentFirebaseUser) {
    return [];
  }

  try {
    const requestsQuery = query(
      collection(db, REQUEST_COLLECTION),

      where("touristId", "==", currentFirebaseUser.uid),
    );

    const snapshot = await getDocs(requestsQuery);

    const requests = [];

    snapshot.forEach((documentSnapshot) => {
      requests.push({
        firebaseId: documentSnapshot.id,

        id: documentSnapshot.id,

        ...documentSnapshot.data(),
      });
    });

    /*
           Sort newest first.

           We intentionally do this in JavaScript
           instead of:

           orderBy("createdAt", "desc")

           This avoids requiring a composite
           Firestore index.
        */

    requests.sort((a, b) => {
      const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;

      const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;

      return dateB - dateA;
    });

    console.log("Tourist quotation requests:", requests);

    return requests;
  } catch (error) {
    console.error("Quotation request loading error:", error);

    return [];
  }
}

/* ============================================================
   11. GET TOURIST QUOTATIONS

   IMPORTANT

   Quotations are stored separately:

       lankaQuestQuotations

   NOT:

       request.quotations[]
============================================================ */

async function getMyQuotations() {
  const quotationMap = new Map();

  if (!currentFirebaseUser) {
    return quotationMap;
  }

  try {
    const quotationsQuery = query(
      collection(db, QUOTATION_COLLECTION),

      where("touristId", "==", currentFirebaseUser.uid),
    );

    const snapshot = await getDocs(quotationsQuery);

    snapshot.forEach((documentSnapshot) => {
      const quotationData = documentSnapshot.data();

      const quotation = {
        firebaseId: documentSnapshot.id,

        id: documentSnapshot.id,

        ...quotationData,
      };

      /*
                   Primary connection:

                   quotation.requestId
                */

      if (quotation.requestId) {
        quotationMap.set(String(quotation.requestId), quotation);
      }

      /*
                   Backup connection:

                   quotation.requestFirestoreId
                */

      if (quotation.requestFirestoreId) {
        quotationMap.set(String(quotation.requestFirestoreId), quotation);
      }
    });

    console.log("Tourist quotations:", Array.from(quotationMap.values()));

    return quotationMap;
  } catch (error) {
    console.error("Quotation loading error:", error);

    return quotationMap;
  }
}

/* ============================================================
   12. FIND QUOTATION FOR REQUEST
============================================================ */

function getQuotationForRequest(request, quotationMap) {
  if (!request || !quotationMap) {
    return null;
  }

  /*
       1. request.requestId
    */

  if (request.requestId) {
    const quotation = quotationMap.get(String(request.requestId));

    if (quotation) {
      return quotation;
    }
  }

  /*
       2. Firestore request document ID
    */

  if (request.firebaseId) {
    const quotation = quotationMap.get(String(request.firebaseId));

    if (quotation) {
      return quotation;
    }
  }

  /*
       3. request.id
    */

  if (request.id) {
    const quotation = quotationMap.get(String(request.id));

    if (quotation) {
      return quotation;
    }
  }

  return null;
}

/* ============================================================
   13. FORMAT DATE
============================================================ */

function formatDashboardDate(value) {
  if (!value) {
    return "Not specified";
  }

  try {
    /*
           Firestore Timestamp
        */

    if (typeof value.toDate === "function") {
      return value.toDate().toLocaleDateString();
    }

    /*
           Date object / string
        */

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString();
  } catch (error) {
    return "Not specified";
  }
}

/* ============================================================
   14. FORMAT REQUEST STATUS
============================================================ */

function formatRequestStatus(status) {
  const statusMap = {
    pending: "Pending",

    guide_selected: "Guide Selected",

    quotation_sent: "Quotation Received",

    quotation_accepted: "Quotation Accepted",

    quotation_rejected: "Quotation Rejected",

    completed: "Completed",
  };

  return statusMap[status] || status || "Pending";
}

/* ============================================================
   15. FORMAT GUIDE LANGUAGES
============================================================ */

function formatGuideLanguages(languages) {
  if (Array.isArray(languages)) {
    return languages.map((language) => String(language)).join(", ");
  }

  if (typeof languages === "string" && languages.trim()) {
    return languages;
  }

  return "Not specified";
}

/* ============================================================
   16. RENDER QUOTATION

   Reads directly from:

       lankaQuestQuotations
============================================================ */

function renderQuotation(request, quotation) {
  /*
       No quotation yet
    */

  if (!quotation) {
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

  /*
       Guide information

       Current quotation document stores:

       guideName
       guideEmail
       guidePhone
    */

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
    quotation.guide?.district || request.selectedGuide?.district || "Sri Lanka";

  const guideLanguages = formatGuideLanguages(
    quotation.guide?.languages || request.selectedGuide?.languages,
  );

  const quotationStatus = quotation.status || "sent";

  /*
       Accept / Reject buttons
    */

  const actionButtons =
    quotationStatus === "sent"
      ? `

                <div class="quotation-actions">

                    <button
                        type="button"
                        class="accept-quotation-button"
                        data-request-id="${escapeHTML(
                          request.requestId ||
                            request.firebaseId ||
                            request.id ||
                            "",
                        )}"
                        data-quotation-id="${escapeHTML(
                          quotation.firebaseId || quotation.id || "",
                        )}"
                    >
                        ✓ Accept
                    </button>


                    <button
                        type="button"
                        class="reject-quotation-button"
                        data-request-id="${escapeHTML(
                          request.requestId ||
                            request.firebaseId ||
                            request.id ||
                            "",
                        )}"
                        data-quotation-id="${escapeHTML(
                          quotation.firebaseId || quotation.id || "",
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

                        ${escapeHTML(guideName)}

                    </h4>


                    <p>

                        📧

                        ${escapeHTML(guideEmail)}

                    </p>


                    <p>

                        📞

                        ${escapeHTML(guidePhone)}

                    </p>

                </div>


                <span class="request-status">

                    ${escapeHTML(
                      formatRequestStatus(
                        request.status === "quotation_sent"
                          ? "quotation_sent"
                          : quotationStatus,
                      ),
                    )}

                </span>

            </div>


            <div class="quotation-price">

                ${escapeHTML(quotation.amount ?? "0")}

                ${escapeHTML(quotation.currency || "")}

            </div>


            <div class="quotation-details">

                <p>

                    📍

                    ${escapeHTML(guideDistrict)}

                </p>


                <p>

                    🗣️

                    ${escapeHTML(guideLanguages)}

                </p>


                <p>

                    📅

                    Valid Until:

                    ${escapeHTML(formatDashboardDate(quotation.validUntil))}

                </p>


                ${
                  quotation.included
                    ? `

                            <div>

                                <strong>
                                    ✅ What's Included
                                </strong>

                                <p>
                                    ${escapeHTML(quotation.included)}
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
                                    ${escapeHTML(quotation.excluded)}
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
                                    ${escapeHTML(quotation.notes)}
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
   17. UPDATE REQUEST STATUS
============================================================ */

async function updateQuotationRequestStatus(request, status) {
  if (!request?.firebaseId) {
    throw new Error("Quotation request Firestore ID is missing.");
  }

  const requestRef = doc(db, REQUEST_COLLECTION, request.firebaseId);

  await updateDoc(requestRef, {
    status: status,

    updatedAt: serverTimestamp(),
  });
}

/* ============================================================
   18. UPDATE QUOTATION STATUS
============================================================ */

async function updateQuotationStatus(quotation, status) {
  if (!quotation?.firebaseId) {
    throw new Error("Quotation Firestore ID is missing.");
  }

  const quotationRef = doc(db, QUOTATION_COLLECTION, quotation.firebaseId);

  await updateDoc(quotationRef, {
    status: status,

    updatedAt: serverTimestamp(),
  });
}

/* ============================================================
   19. FIND REQUEST BY ID
============================================================ */

async function findRequestById(requestId) {
  const requests = await getMyQuotationRequests();

  return (
    requests.find(
      (request) =>
        String(request.requestId || "") === String(requestId) ||
        String(request.firebaseId || "") === String(requestId) ||
        String(request.id || "") === String(requestId),
    ) || null
  );
}

/* ============================================================
   20. ACCEPT QUOTATION
============================================================ */

async function acceptQuotation(requestId, quotationId) {
  try {
    if (!currentFirebaseUser) {
      alert("Please login again.");

      return;
    }

    const request = await findRequestById(requestId);

    if (!request) {
      alert("Quotation request not found.");

      return;
    }

    let quotation = null;

    /*
           Direct quotation lookup
        */

    if (quotationId) {
      const quotationRef = doc(db, QUOTATION_COLLECTION, quotationId);

      const quotationSnapshot = await getDoc(quotationRef);

      if (quotationSnapshot.exists()) {
        quotation = {
          firebaseId: quotationSnapshot.id,

          id: quotationSnapshot.id,

          ...quotationSnapshot.data(),
        };
      }
    }

    /*
           Fallback quotation lookup
        */

    if (!quotation) {
      const quotationMap = await getMyQuotations();

      quotation = getQuotationForRequest(request, quotationMap);
    }

    if (!quotation) {
      alert("Quotation not found.");

      return;
    }

    /*
           Security check
        */

    if (
      quotation.touristId &&
      quotation.touristId !== currentFirebaseUser.uid
    ) {
      alert("Access denied.");

      return;
    }

    /*
           Update quotation
        */

    await updateQuotationStatus(quotation, "accepted");

    /*
           Update request
        */

    await updateQuotationRequestStatus(request, "quotation_accepted");

    alert("Quotation accepted successfully.");

    await renderQuotationRequests();

    await renderSelectedGuide();
  } catch (error) {
    console.error("Accept quotation error:", error);

    alert(error.message || "Unable to accept quotation.");
  }
}

/* ============================================================
   21. REJECT QUOTATION
============================================================ */

async function rejectQuotation(requestId, quotationId) {
  try {
    if (!currentFirebaseUser) {
      alert("Please login again.");

      return;
    }

    const request = await findRequestById(requestId);

    if (!request) {
      alert("Quotation request not found.");

      return;
    }

    let quotation = null;

    /*
           Direct quotation lookup
        */

    if (quotationId) {
      const quotationRef = doc(db, QUOTATION_COLLECTION, quotationId);

      const quotationSnapshot = await getDoc(quotationRef);

      if (quotationSnapshot.exists()) {
        quotation = {
          firebaseId: quotationSnapshot.id,

          id: quotationSnapshot.id,

          ...quotationSnapshot.data(),
        };
      }
    }

    /*
           Fallback lookup
        */

    if (!quotation) {
      const quotationMap = await getMyQuotations();

      quotation = getQuotationForRequest(request, quotationMap);
    }

    if (!quotation) {
      alert("Quotation not found.");

      return;
    }

    /*
           Security check
        */

    if (
      quotation.touristId &&
      quotation.touristId !== currentFirebaseUser.uid
    ) {
      alert("Access denied.");

      return;
    }

    /*
           Update quotation
        */

    await updateQuotationStatus(quotation, "rejected");

    /*
           Update request
        */

    await updateQuotationRequestStatus(request, "quotation_rejected");

    alert("Quotation rejected.");

    await renderQuotationRequests();

    await renderSelectedGuide();
  } catch (error) {
    console.error("Reject quotation error:", error);

    alert(error.message || "Unable to reject quotation.");
  }
}

/* ============================================================
   21-B. DELETE LINKED QUOTATION
============================================================ */

async function deleteLinkedQuotation(requestId) {

  if (!requestId || !currentFirebaseUser) {
    return {
      found: false,
      deleted: false,
    };
  }

  try {

    const quotationsQuery = query(
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


    if (snapshot.empty) {

      return {
        found: false,
        deleted: false,
      };

    }


    let deletedCount = 0;


    for (
      const quotationSnapshot
      of snapshot.docs
    ) {

      const quotationData =
        quotationSnapshot.data();


      /*
         Extra ownership check
      */

      if (
        quotationData.touristId !==
        currentFirebaseUser.uid
      ) {

        continue;

      }


      try {

        await deleteDoc(
          doc(
            db,
            QUOTATION_COLLECTION,
            quotationSnapshot.id
          )
        );


        deletedCount++;

      } catch (error) {

        /*
           IMPORTANT

           Quotation deletion failure
           must NOT stop request deletion.
        */

        console.error(
          "Linked quotation deletion failed:",
          error
        );

      }

    }


    return {

      found: true,

      deleted:
        deletedCount > 0,

      deletedCount:
        deletedCount,

    };


  } catch (error) {

    /*
       Do NOT block request deletion
       if quotation lookup fails.
    */

    console.error(
      "Linked quotation lookup failed:",
      error
    );


    return {

      found: false,

      deleted: false,

      error: error,

    };

  }

}


/* ============================================================
   21-C. DELETE TOURIST QUOTATION REQUEST
============================================================ */

async function deleteQuotationRequest(
  requestId
) {

  try {

    if (!currentFirebaseUser) {

      alert(
        "Please login again."
      );

      return;

    }


    if (!requestId) {

      alert(
        "Quotation request ID is missing."
      );

      return;

    }


    /*
       Find request through the
       current Tourist's own requests.
    */

    const request =
      await findRequestById(
        requestId
      );


    if (!request) {

      alert(
        "Quotation request not found, or you do not have permission to delete it."
      );

      return;

    }


    /*
       FINAL OWNERSHIP CHECK
    */

    if (
      request.touristId !==
      currentFirebaseUser.uid
    ) {

      alert(
        "Access denied. You can only delete your own request."
      );

      return;

    }


    /*
       Confirmation
    */

    const confirmed =
      window.confirm(
        "Delete this quotation request?\n\n" +
        "This will remove the request from your dashboard.\n\n" +
        "This action cannot be undone."
      );


    if (!confirmed) {

      return;

    }


    /*
       Try deleting linked quotation first.

       Failure here MUST NOT prevent
       the main request from being deleted.
    */

    const quotationResult =
      await deleteLinkedQuotation(
        requestId
      );


    console.log(
      "Linked quotation deletion result:",
      quotationResult
    );


    /*
       Delete the main request.

       firebaseId is the actual
       Firestore document ID.
    */

    const requestRef =
      doc(
        db,
        REQUEST_COLLECTION,
        request.firebaseId
      );


    await deleteDoc(
      requestRef
    );


    console.log(
      "Quotation request deleted:",
      request.firebaseId
    );


    /*
       Refresh dashboard
    */

    await renderQuotationRequests();

    await renderSelectedGuide();

    await updateDashboardSummary();


    alert(
      "Quotation request deleted successfully."
    );


  } catch (error) {

    console.error(
      "Delete quotation request error:",
      error
    );


    if (
      error?.code ===
      "permission-denied"
    ) {

      alert(
        "Firestore denied permission to delete this request."
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
   22. RENDER QUOTATION REQUESTS
============================================================ */

async function renderQuotationRequests() {
  if (!quotationRequestsContainer) {
    return;
  }

  if (!currentFirebaseUser) {
    return;
  }

  /*
       Load requests
    */

  const requests = await getMyQuotationRequests();

  /*
       Load quotations separately
    */

  const quotationMap = await getMyQuotations();

  console.log("Requests loaded:", requests);

  console.log("Quotation map:", quotationMap);

  if (dashboardRequestCount) {
    dashboardRequestCount.textContent = requests.length;
  }

  if (requests.length === 0) {
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

  quotationRequestsContainer.innerHTML = "";

  requests.forEach((request) => {
    const card = document.createElement("article");

    card.className = "quotation-request-card";

    const destinations = Array.isArray(request.destinations)
      ? request.destinations
      : [];

    const destinationNames = destinations
      .map((place) => place.name || "Destination")
      .join(", ");

    /*
               Find quotation belonging
               to this request.
            */

    const quotation = getQuotationForRequest(request, quotationMap);

    card.innerHTML = `

                <div class="request-card-header">

                    <h4>

                        🧾

                        ${escapeHTML(
                          request.requestId || request.firebaseId || "Request",
                        )}

                    </h4>


                    <span class="request-status">

                        ${escapeHTML(formatRequestStatus(request.status))}

                    </span>

                </div>
            <div class="quotation-request-delete-area">

              <button
                     type="button"
                     class="delete-quotation-request-button"
                     data-request-id="${escapeHTML(
                      request.requestId || request.firebaseId || request.id || "",
                    )}"
                >
                   🗑️ Delete Request
                 </button>

            </div>  


                <div class="request-details-grid">

                    <div>

                        <span>
                            Destinations
                        </span>

                        <strong>

                            ${escapeHTML(destinationNames || "None")}

                        </strong>

                    </div>


                    <div>

                        <span>
                            Travel Dates
                        </span>

                        <strong>

                            ${
                              request.startDate && request.endDate
                                ? escapeHTML(
                                    request.startDate + " → " + request.endDate,
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

                            ${escapeHTML(request.travelers || "Not selected")}

                        </strong>

                    </div>

                </div>


                <div class="request-quotation-area">

                    ${renderQuotation(request, quotation)}

                </div>

            `;

    quotationRequestsContainer.appendChild(card);
  });

  attachQuotationButtons();
}

/* ============================================================
   23. ATTACH ACCEPT / REJECT BUTTONS
============================================================ */

function attachQuotationButtons() {
  document.querySelectorAll(".accept-quotation-button").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;

      await acceptQuotation(
        button.dataset.requestId,

        button.dataset.quotationId,
      );
    });
  });

  document.querySelectorAll(".reject-quotation-button").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;

      await rejectQuotation(
        button.dataset.requestId,

        button.dataset.quotationId,
      );
    });
  });

  /* =========================================================
   DELETE REQUEST BUTTONS
========================================================= */

  document
    .querySelectorAll(".delete-quotation-request-button")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        if (button.disabled) {
          return;
        }

        button.disabled = true;

        const originalText = button.textContent;

        button.textContent = " Deleting...";

        try {
          await deleteQuotationRequest(button.dataset.requestId);
        } finally {
          button.disabled = false;

          button.textContent = originalText;
        }
      });
    });
}

/* ============================================================
   24. RENDER SELECTED GUIDE
============================================================ */

async function renderSelectedGuide() {
  if (!selectedGuideContainer) {
    return;
  }

  const requests = await getMyQuotationRequests();

  /*
       Find request with selected guide
    */

  const selectedRequest = requests.find(
    (request) => request.selectedGuide || request.guideId,
  );

  if (!selectedRequest) {
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

    if (dashboardGuideCount) {
      dashboardGuideCount.textContent = 0;
    }

    return;
  }

  /*
       Selected guide snapshot
    */

  const guide = selectedRequest.selectedGuide || {
    uid: selectedRequest.guideId,

    fullName: selectedRequest.guideName,

    email: selectedRequest.guideEmail,

    phone: selectedRequest.guidePhone,
  };

  selectedGuideContainer.innerHTML = `

        <div class="selected-guide-card">

            <h4>

                🧑‍💼

                ${escapeHTML(
                  guide.fullName || selectedRequest.guideName || "Guide",
                )}

            </h4>


            ${
              guide.email || selectedRequest.guideEmail
                ? `

                        <p>

                            📧

                            ${escapeHTML(
                              guide.email || selectedRequest.guideEmail,
                            )}

                        </p>

                    `
                : ""
            }


            ${
              guide.phone || selectedRequest.guidePhone
                ? `

                        <p>

                            📞

                            ${escapeHTML(
                              guide.phone || selectedRequest.guidePhone,
                            )}

                        </p>

                    `
                : ""
            }


            <p>

                📍

                ${escapeHTML(guide.district || "Sri Lanka")}

            </p>


            <p>

                🗣️

                ${escapeHTML(formatGuideLanguages(guide.languages))}

            </p>


            <span>
                ✓ Guide Selected
            </span>

        </div>

    `;

  if (dashboardGuideCount) {
    dashboardGuideCount.textContent = 1;
  }
}

/* ============================================================
   25. UPDATE DASHBOARD SUMMARY
============================================================ */

async function updateDashboardSummary() {
  if (!currentFirebaseUser) {
    return;
  }

  const trip = await getTouristTrip(currentFirebaseUser.uid);

  const requests = await getMyQuotationRequests();

  if (dashboardTripCount) {
    dashboardTripCount.textContent = (trip.destinations || []).length;
  }

  if (dashboardRequestCount) {
    dashboardRequestCount.textContent = requests.length;
  }
}

/* ============================================================
   26. LOGOUT
============================================================ */

async function handleLogout() {
  try {
    await signOut(auth);

    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

/* ============================================================
   27. AUTH STATE
============================================================ */

onAuthStateChanged(auth, async (user) => {
  /*
           Firebase Authentication is
           the authoritative identity source.
        */

  if (!user) {
    window.location.href = "login.html";

    return;
  }

  currentFirebaseUser = user;

  console.log("Tourist Firebase UID:", user.uid);

  console.log("Tourist Firebase Email:", user.email);

  /*
           Load tourist profile
        */

  currentTouristProfile = await getTouristProfile(user.uid);

  if (!currentTouristProfile) {
    console.error("Tourist profile missing:", user.uid);

    return;
  }

  /*
           Update user information
        */

  updateDashboardUser();

  /*
           Load dashboard
        */

  await updateDashboardSummary();

  await renderDashboardTrip();

  await renderSelectedGuide();

  await renderQuotationRequests();

  console.log("LankaWayfarer Tourist Dashboard Loaded:", user.uid);
});

/* ============================================================
   28. LOGOUT BUTTON
============================================================ */

if (logoutButton) {
  logoutButton.addEventListener("click", handleLogout);
}

/* ============================================================
   END
============================================================ */
