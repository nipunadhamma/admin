/* ============================================================
   MY TRIP / TRIP PLANNER

   Data Source:
   localStorage

   Storage Key:
   sriLankaMyTrip
============================================================ */

/* ============================================================
   STORAGE
============================================================ */

const MY_TRIP_KEY = "sriLankaMyTrip";

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

/* ============================================================
   GET TRIP
============================================================ */

function getMyTrip() {
  const savedTrip = localStorage.getItem(MY_TRIP_KEY);

  if (!savedTrip) {
    return [];
  }

  try {
    return JSON.parse(savedTrip);
  } catch (error) {
    console.error("Unable to load trip:", error);

    return [];
  }
}

/* ============================================================
   SAVE TRIP
============================================================ */

function saveMyTrip(trip) {
  localStorage.setItem(
    MY_TRIP_KEY,

    JSON.stringify(trip),
  );
}

/* ============================================================
   DISPLAY DESTINATIONS
============================================================ */

function renderDestinations() {
  const trip = getMyTrip();

  /*
       Update Count
    */

  destinationCount.textContent = trip.length;

  /*
       Empty Trip
    */

  if (trip.length === 0) {
    tripDestinations.style.display = "none";

    emptyTrip.style.display = "block";

    tripStatus.textContent = "Empty";

    return;
  }

  /*
       Trip has places
    */

  tripDestinations.style.display = "grid";

  emptyTrip.style.display = "none";

  tripStatus.textContent = "Draft";

  /*
       Clear old cards
    */

  tripDestinations.innerHTML = "";

  /*
       Create cards
    */

  trip.forEach((place) => {
    const card = document.createElement("article");

    card.className = "destination-card";

    card.innerHTML = `

                <img
                    src="${place.image}"
                    alt="${place.name}"
                    loading="lazy"
                >


                <div
                    class="destination-info"
                >

                    <h3>
                        ${place.name}
                    </h3>


                    <div>
                        ${place.sinhalaName}
                    </div>


                    <p
                        class="destination-location"
                    >

                        📍

                        ${place.district}

                        ·

                        ${place.province}

                    </p>


                    <button
                        type="button"
                        class="remove-trip-btn"
                        data-place-id="${place.id}"
                    >

                        Remove

                    </button>

                </div>

            `;

    /*
               Remove Button
            */

    const removeButton = card.querySelector(".remove-trip-btn");

    removeButton.addEventListener("click", () => {
      removeFromTrip(place.id);
    });

    tripDestinations.appendChild(card);
  });
}

/* ============================================================
   REMOVE FROM TRIP
============================================================ */

function removeFromTrip(placeId) {
  let trip = getMyTrip();

  trip = trip.filter((place) => place.id !== placeId);

  saveMyTrip(trip);

  /*
       Refresh UI
    */

  renderDestinations();

  renderItinerary();
}

/* ============================================================
   CREATE ITINERARY
============================================================ */

function renderItinerary() {
  const days = Number(travelDays.value);

  dayCount.textContent = days;

  const itineraryContainer = document.getElementById("itineraryContainer");

  itineraryContainer.innerHTML = "";

  /*
       Create each day
    */

  for (let day = 1; day <= days; day++) {
    const dayElement = document.createElement("div");

    dayElement.className = "itinerary-day";

    dayElement.innerHTML = `

            <div
                class="itinerary-day-header"
            >

                <h3>

                    Day ${day}

                </h3>


                <span>

                    📅

                </span>

            </div>


            <div
                class="day-destinations"
            >

                Drag destinations here

            </div>

        `;

    itineraryContainer.appendChild(dayElement);
  }
}

/* ============================================================
   TRAVEL DAYS CHANGE
============================================================ */

travelDays.addEventListener("change", () => {
  renderItinerary();
});

/* ============================================================
   REQUEST GUIDE QUOTE
============================================================ */

requestQuoteBtn.addEventListener("click", () => {
  const trip = getMyTrip();

  /*
           Prevent empty request
        */

  if (trip.length === 0) {
    alert("Please add at least one destination to your trip.");

    return;
  }

  /*
           Temporary version

           Later:

           Login
           ↓
           User Account
           ↓
           Guide Search
           ↓
           Quote Request
        */

  alert(
    "Your trip plan is ready!\n\n" +
      "Guide quote request system " +
      "will be connected soon.",
  );
});

/* ============================================================
   INITIALIZE
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  renderDestinations();

  renderItinerary();
});
