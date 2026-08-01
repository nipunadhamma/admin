/* ============================================================
   LANKAQUEST
   QUOTATION REQUEST PAGE

   FIREBASE FIRST ARCHITECTURE

   FLOW:

   Tourist Login
        |
        ↓
   Firebase Authentication
        |
        ↓
   Load Trip
        |
        ↓
   lankaQuestTouristTrips
        |
        ↓
   Create Request
        |
        ↓
   lankaQuestQuotationRequests
        |
        ↓
   Find Guides
        |
        ↓
   Select Guide
        |
        ↓
   Return to this page with requestId
        |
        ↓
   Existing Request
============================================================ */

/* ============================================================
   1. FIREBASE IMPORTS
============================================================ */

import { auth, db } from "./firebase-config.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  collection,
  addDoc,
  getDoc,
  doc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ============================================================
   2. FIRESTORE COLLECTIONS
============================================================ */

const TRIP_COLLECTION = "lankaQuestTouristTrips";

const QUOTATION_COLLECTION = "lankaQuestQuotationRequests";

/* ============================================================
   3. GLOBAL VARIABLES
============================================================ */

let currentTourist = null;

let currentTrip = null;

let currentQuotationRequest = null;

/* ============================================================
   4. DOM ELEMENTS
============================================================ */

const quotationDestinations = document.getElementById("quotationDestinations");

const quotationPlaceCount = document.getElementById("quotationPlaceCount");

const quotationStartDate = document.getElementById("quotationStartDate");

const quotationEndDate = document.getElementById("quotationEndDate");

const quotationTravelers = document.getElementById("quotationTravelers");

const quotationTravelStyle = document.getElementById("quotationTravelStyle");

const quotationTransport = document.getElementById("quotationTransport");

const quotationAccommodation = document.getElementById(
  "quotationAccommodation",
);

const quotationSpecialRequests = document.getElementById(
  "quotationSpecialRequests",
);

const submitQuotationButton = document.getElementById("submitQuotationButton");

/* ============================================================
   5. GET URL PARAMETERS
============================================================ */

function getURLParameters() {
  const params = new URLSearchParams(window.location.search);

  return {
    tripId: params.get("trip"),

    requestId: params.get("requestId"),

    guideId: params.get("guideId"),
  };
}

/* ============================================================
   6. AUTHENTICATION
============================================================ */

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html?redirect=quotation-request.html";

    return;
  }

  currentTourist = user;

  /*
           Determine which flow we are in.

           1. Initial quotation:
              ?trip=TRIP_ID

           2. Existing quotation:
              ?requestId=REQUEST_ID
        */

  const { tripId, requestId } = getURLParameters();

  try {
    if (requestId) {
      await loadExistingQuotationRequest(requestId);
    } else if (tripId) {
      await loadTrip();
    } else {
      showError("Trip not found");
    }
  } catch (error) {
    console.error("Quotation page initialization error:", error);

    showError("Unable to load quotation information.");
  }
});

/* ============================================================
   7. LOAD TOURIST TRIP
============================================================ */

async function loadTrip() {
  try {
    const { tripId } = getURLParameters();

    if (!tripId) {
      showError("Trip not found");

      return;
    }

    console.log("Loading tourist trip:", tripId);

    const tripRef = doc(db, TRIP_COLLECTION, tripId);

    const snapshot = await getDoc(tripRef);

    if (!snapshot.exists()) {
      console.error("Trip does not exist:", tripId);

      showError("Trip does not exist");

      return;
    }

    const data = snapshot.data();

    /*
           Security check.

           The trip must belong
           to the authenticated tourist.
        */

    if (data.touristId !== currentTourist.uid) {
      console.error("Trip ownership mismatch.");

      showError("Access denied");

      return;
    }

    currentTrip = {
      id: snapshot.id,

      ...data,
    };

    console.log("Tourist trip loaded:", currentTrip);

    renderQuotationData();
  } catch (error) {
    console.error("Trip loading error:", error);

    showError("Unable to load trip");
  }
}

/* ============================================================
   8. LOAD EXISTING QUOTATION REQUEST
============================================================ */

async function loadExistingQuotationRequest(requestId) {
  try {
    console.log("Loading existing quotation request:", requestId);

    const requestRef = doc(db, QUOTATION_COLLECTION, requestId);

    const snapshot = await getDoc(requestRef);

    if (!snapshot.exists()) {
      console.error("Quotation request does not exist:", requestId);

      showError("Quotation request not found");

      return;
    }

    const data = snapshot.data();

    /*
           Security check.

           Only the tourist who created
           the request can access it.
        */

    if (data.touristId !== currentTourist.uid) {
      console.error("Quotation request ownership mismatch.");

      showError("Access denied");

      return;
    }

    currentQuotationRequest = {
      id: snapshot.id,

      ...data,
    };

    console.log("Existing quotation request loaded:", currentQuotationRequest);

    /*
           The request already contains
           all trip information.

           Therefore we do NOT need to
           create another quotation request.
        */

    currentTrip = {
      id: data.tripId,

      destinations: data.destinations || [],

      startDate: data.startDate,

      endDate: data.endDate,

      travelers: data.travelers,

      travelStyle: data.travelStyle,

      transport: data.transport,

      accommodation: data.accommodation,

      specialRequests: data.specialRequests,

      touristId: data.touristId,

      touristEmail: data.touristEmail,
    };

    renderQuotationData();

    /*
           Existing request means that
           the tourist already submitted
           the quotation request.

           Therefore disable the
           "Submit Quotation Request"
           button.

           Guide selection has already
           happened or is being continued.
        */

    if (submitQuotationButton) {
      submitQuotationButton.disabled = true;

      submitQuotationButton.textContent = "Quotation Request Submitted";
    }

    /*
           Show selected guide information
           if available.
        */

    renderSelectedGuide();
  } catch (error) {
    console.error("Quotation request loading error:", error);

    showError("Unable to load quotation request");
  }
}

/* ============================================================
   9. RENDER QUOTATION DATA
============================================================ */

function renderQuotationData() {
  if (!currentTrip) {
    return;
  }

  const destinations = currentTrip.destinations || [];

  /* --------------------------------------------------------
       PLACE COUNT
    -------------------------------------------------------- */

  if (quotationPlaceCount) {
    quotationPlaceCount.textContent =
      destinations.length + (destinations.length === 1 ? " Place" : " Places");
  }

  /* --------------------------------------------------------
       DESTINATIONS
    -------------------------------------------------------- */

  if (quotationDestinations) {
    quotationDestinations.innerHTML = "";

    destinations.forEach((place) => {
      const card = document.createElement("div");

      card.className = "quotation-destination-card";

      const image = place.image || "";

      const name = place.name || "Destination";

      const district = place.district || "";

      card.innerHTML = `

                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(name)}"
                    >

                    <h4>
                        ${escapeHTML(name)}
                    </h4>

                    <p>
                        📍
                        ${escapeHTML(district)}
                    </p>

                `;

      quotationDestinations.appendChild(card);
    });
  }

  /* --------------------------------------------------------
       TRAVEL DETAILS
    -------------------------------------------------------- */

  if (quotationStartDate) {
    quotationStartDate.textContent = currentTrip.startDate || "Not selected";
  }

  if (quotationEndDate) {
    quotationEndDate.textContent = currentTrip.endDate || "Not selected";
  }

  if (quotationTravelers) {
    quotationTravelers.textContent = currentTrip.travelers || "Not selected";
  }

  if (quotationTravelStyle) {
    quotationTravelStyle.textContent =
      currentTrip.travelStyle || "Not selected";
  }

  if (quotationTransport) {
    quotationTransport.textContent = currentTrip.transport || "Not selected";
  }

  if (quotationAccommodation) {
    quotationAccommodation.textContent =
      currentTrip.accommodation || "Not selected";
  }

  if (quotationSpecialRequests) {
    quotationSpecialRequests.textContent =
      currentTrip.specialRequests || "No special requests";
  }
}

/* ============================================================
   10. RENDER SELECTED GUIDE
============================================================ */

function renderSelectedGuide() {
  if (!currentQuotationRequest) {
    return;
  }

  const selectedGuide = currentQuotationRequest.selectedGuide;

  if (!selectedGuide) {
    return;
  }

  console.log("Selected guide:", selectedGuide);

  /*
       We intentionally do not create
       a new data source here.

       selectedGuide comes directly
       from Firestore quotation request.
    */
}

/* ============================================================
   11. CREATE QUOTATION REQUEST
============================================================ */

async function submitQuotationRequest() {
  try {
    if (!currentTourist) {
      alert("Please login first.");

      return;
    }

    if (!currentTrip) {
      alert("Trip not loaded");

      return;
    }

    /*
           IMPORTANT:

           If this page was opened with
           an existing requestId, NEVER
           create another request.
        */

    const { requestId } = getURLParameters();

    if (requestId) {
      console.warn("Quotation request already exists:", requestId);

      alert("This quotation request has already been submitted.");

      return;
    }

    /*
           Create a NEW quotation request.

           IMPORTANT:

           guideId is NOT added here.

           Guide will be selected later
           from Find Guides.
        */

    const requestData = {
      touristId: currentTourist.uid,

      touristName: currentTourist.fullName || "",

      touristEmail: currentTourist.email || "",

      tripId: currentTrip.id,

      destinations: currentTrip.destinations || [],

      startDate: currentTrip.startDate || "",

      endDate: currentTrip.endDate || "",

      travelers: currentTrip.travelers || "",

      travelStyle: currentTrip.travelStyle || "",

      transport: currentTrip.transport || "",

      accommodation: currentTrip.accommodation || "",

      specialRequests: currentTrip.specialRequests || "",

      /*
               No guideId here.

               No guideName here.

               No guideEmail here.

               No selected guide yet.
            */

      status: "pending",

      quotationRequested: false,

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, QUOTATION_COLLECTION),
      requestData,
    );

    console.log("Quotation Request Created:", docRef.id);

    alert("Quotation request created successfully.");

    /*
           IMPORTANT

           Pass the Firestore request ID
           to Find Guides.

           Find Guides will use this exact
           document and update it after
           guide selection.
        */

    window.location.href = `find-guides.html?requestId=${encodeURIComponent(
      docRef.id,
    )}`;
  } catch (error) {
    console.error("Quotation error:", error);

    alert(error.message || "Unable to submit quotation request");
  }
}

/* ============================================================
   12. BUTTON EVENT
============================================================ */

if (submitQuotationButton) {
  submitQuotationButton.addEventListener("click", submitQuotationRequest);
}

/* ============================================================
   13. HTML ESCAPE
============================================================ */

function escapeHTML(value) {
  const div = document.createElement("div");

  div.textContent = value == null ? "" : String(value);

  return div.innerHTML;
}

/* ============================================================
   14. ERROR MESSAGE
============================================================ */

function showError(message) {
  console.error(message);

  alert(message);
}

/* ============================================================
   END QUOTATION-REQUEST.JS
============================================================ */
