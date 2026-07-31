/* ============================================================
   LANKAQUEST
   MY TRIP SYSTEM

   Firebase First Architecture

   Authentication:
   Firebase Authentication

   Database:
   Firebase Firestore

   Collection:
   lankaQuestTouristTrips

============================================================ */

/* ============================================================
   FIREBASE IMPORTS
============================================================ */

import { auth, db } from "./firebase-config.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ============================================================
   GLOBAL VARIABLES
============================================================ */

let currentTourist = null;

let currentTrips = [];

/* ============================================================
   DOM ELEMENTS
============================================================ */

const tripDestinations = document.getElementById("tripDestinations");

const emptyTrip = document.getElementById("emptyTrip");

const destinationCount = document.getElementById("destinationCount");

const dayCount = document.getElementById("dayCount");

const tripStatus = document.getElementById("tripStatus");

const travelDays = document.getElementById("travelDays");

const requestQuoteBtn = document.getElementById("requestQuoteBtn");

let selectedTripId = null;

/* ============================================================
   AUTH CHECK

============================================================ */

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentTourist = user;

    console.log("Tourist:", user.uid);

    await loadMyTrips();
  } else {
    showLoginRequired();
  }
});

/* ============================================================
   LOAD TOURIST TRIPS

   Firestore:
   lankaQuestTouristTrips

============================================================ */

async function loadMyTrips() {
  try {
    const tripsRef = collection(db, "lankaQuestTouristTrips");

    const q = query(
      tripsRef,

      where("touristId", "==", currentTourist.uid),
    );

    const snapshot = await getDocs(q);

    currentTrips = [];

    snapshot.forEach((item) => {
      currentTrips.push({
        id: item.id,

        ...item.data(),
      });
    });

    renderTrips();
  } catch (error) {
    console.error("Load Trips Error:", error);

    showMessage("Unable to load trips");
  }
}

/* ============================================================
   RENDER TRIPS

============================================================ */

function renderTrips() {
  if (!tripDestinations) {
    return;
  }

  tripDestinations.innerHTML = "";

  if (currentTrips.length === 0) {
    tripDestinations.style.display = "none";

    if (emptyTrip) {
      emptyTrip.style.display = "block";
    }

    if (tripStatus) {
      tripStatus.textContent = "Empty";
    }

    destinationCount.textContent = 0;

    return;
  }

  tripDestinations.style.display = "grid";

  if (emptyTrip) {
    emptyTrip.style.display = "none";
  }

  tripStatus.textContent = "Draft";

  const trip = currentTrips[0];

  selectedTripId = trip.id;

  const destinations = trip.destinations || [];

  destinationCount.textContent = destinations.length;

  destinations.forEach((place) => {
    const card = document.createElement("article");

    card.className = "destination-card";

    card.innerHTML = `


                <img

                    src="${place.image || ""}"

                    alt="${place.name}"

                    loading="lazy"

                >



                <div class="destination-info">


                    <h3>

                        ${place.name}

                    </h3>



                    <p>

                    📍
                    ${place.district || ""}

                    ·

                    ${place.province || ""}

                    </p>


                    <button

                        class="remove-trip-btn"

                        data-id="${place.id}"

                    >

                        Remove

                    </button>



                </div>


            `;

    const removeBtn = card.querySelector(".remove-trip-btn");

    removeBtn.addEventListener("click", () => {
      removeDestination(place.id);
    });

    tripDestinations.appendChild(card);
  });

  renderItinerary(trip.travelDays || 1);
}

/* ============================================================
   REMOVE DESTINATION

   Firestore Update Migration
   will be connected here

============================================================ */

async function removeDestination(placeId) {
  console.log("Remove destination:", placeId);

  alert("Destination update will be connected with Firestore update.");
}

/* ============================================================
   ITINERARY GENERATOR

============================================================ */

function renderItinerary(days) {
  if (!travelDays) {
    return;
  }

  travelDays.value = days;

  dayCount.textContent = days;

  const container = document.getElementById("itineraryContainer");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  for (let i = 1; i <= days; i++) {
    const div = document.createElement("div");

    div.className = "itinerary-day";

    div.innerHTML = `

            <h3>

                Day ${i}

            </h3>


            <div>

                Drag destinations here

            </div>

        `;

    container.appendChild(div);
  }
}

/* ============================================================
   REQUEST GUIDE QUOTATION

============================================================ */

if (requestQuoteBtn) {
  requestQuoteBtn.addEventListener("click", () => {
    if (!selectedTripId) {
      alert("Please create a trip first.");

      return;
    }

    window.location.href = `quotation-request.html?trip=${selectedTripId}`;
  });
}

/* ============================================================
   LOGIN REQUIRED

============================================================ */

function showLoginRequired() {
  if (tripDestinations) {
    tripDestinations.innerHTML = `


            <div class="login-required">


                <h2>

                🔐 Login Required

                </h2>


                <p>

                Please login to view your trips.

                </p>


                <a href="login.html">

                Login

                </a>


            </div>


        `;
  }
}

/* ============================================================
   MESSAGE

============================================================ */

function showMessage(message) {
  console.log(message);
}
