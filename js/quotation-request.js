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


============================================================ */

/* ============================================================
   FIREBASE IMPORTS
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
   FIRESTORE COLLECTIONS
============================================================ */

const TRIP_COLLECTION = "lankaQuestTouristTrips";

const QUOTATION_COLLECTION = "lankaQuestQuotationRequests";

/* ============================================================
   GLOBAL VARIABLES
============================================================ */

let currentTourist = null;

let currentTrip = null;

/* ============================================================
   DOM ELEMENTS
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
   AUTH CHECK

============================================================ */

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentTourist = user;

    await loadTrip();
  } else {
    window.location.href = "login.html?redirect=quotation-request.html";
  }
});

/* ============================================================
   LOAD TOURIST TRIP

   Firestore:
   lankaQuestTouristTrips


============================================================ */

async function loadTrip() {
  try {
    const tripId = getTripIdFromURL();

    if (!tripId) {
      showError("Trip not found");

      return;
    }

    const tripRef = doc(db, TRIP_COLLECTION, tripId);

    const snapshot = await getDoc(tripRef);

    if (!snapshot.exists()) {
      showError("Trip does not exist");

      return;
    }

    const data = snapshot.data();

    if (data.touristId !== currentTourist.uid) {
      showError("Access denied");

      return;
    }

    currentTrip = {
      id: snapshot.id,

      ...data,
    };

    renderQuotationData();
  } catch (error) {
    console.error("Trip loading error:", error);

    showError("Unable to load trip");
  }
}

/* ============================================================
   GET TRIP ID

============================================================ */

function getTripIdFromURL() {
  const params = new URLSearchParams(window.location.search);

  return params.get("trip");
}

/* ============================================================
   RENDER DATA

============================================================ */

function renderQuotationData() {
  const destinations = currentTrip.destinations || [];

  if (quotationPlaceCount) {
    quotationPlaceCount.textContent =
      destinations.length + (destinations.length === 1 ? " Place" : " Places");
  }

  if (quotationDestinations) {
    quotationDestinations.innerHTML = "";

    destinations.forEach((place) => {
      const card = document.createElement("div");

      card.className = "quotation-destination-card";

      card.innerHTML = `

                    <img

                    src="${place.image || ""}"

                    alt="${place.name}"

                    >


                    <h4>

                    ${place.name}

                    </h4>


                    <p>

                    📍
                    ${place.district || ""}

                    </p>

                `;

      quotationDestinations.appendChild(card);
    });
  }

  quotationStartDate.textContent = currentTrip.startDate || "Not selected";

  quotationEndDate.textContent = currentTrip.endDate || "Not selected";

  quotationTravelers.textContent = currentTrip.travelers || "Not selected";

  quotationTravelStyle.textContent = currentTrip.travelStyle || "Not selected";

  quotationTransport.textContent = currentTrip.transport || "Not selected";

  quotationAccommodation.textContent =
    currentTrip.accommodation || "Not selected";

  quotationSpecialRequests.textContent =
    currentTrip.specialRequests || "No special requests";
}

/* ============================================================
   CREATE QUOTATION REQUEST

============================================================ */

async function submitQuotationRequest() {
  try {
    if (!currentTourist) {
      return;
    }

    if (!currentTrip) {
      alert("Trip not loaded");

      return;
    }

    const requestData = {
      touristId: currentTourist.uid,

      touristEmail: currentTourist.email,

      tripId: currentTrip.id,

      destinations: currentTrip.destinations,

      startDate: currentTrip.startDate,

      endDate: currentTrip.endDate,

      travelers: currentTrip.travelers,

      travelStyle: currentTrip.travelStyle,

      transport: currentTrip.transport,

      accommodation: currentTrip.accommodation,

      specialRequests: currentTrip.specialRequests,

      selectedGuide: null,

      status: "pending",

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, QUOTATION_COLLECTION),

      requestData,
    );

    console.log("Quotation Created:", docRef.id);

    alert("Quotation request submitted successfully");

    window.location.href = "find-guides.html";
  } catch (error) {
    console.error("Quotation error:", error);

    alert("Unable to submit quotation request");
  }
}

/* ============================================================
   BUTTON EVENT

============================================================ */

if (submitQuotationButton) {
  submitQuotationButton.addEventListener(
    "click",

    submitQuotationRequest,
  );
}

/* ============================================================
   ERROR MESSAGE

============================================================ */

function showError(message) {
  console.error(message);

  alert(message);
}
