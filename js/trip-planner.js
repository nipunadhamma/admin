/* ============================================================
   TRIP PLANNER
   Explore Sri Lanka

   FLOW:

   Tourist
      ↓
   Trip Planner
      ↓
   Select Destinations
      ↓
   Add Travel Details
      ↓
   Request Guide Quotation
      ↓
   Login Check
      ↓
   Tourist Account Check
      ↓
   quotation-request.html
      ↓
   Submit Request
      ↓
   find-guides.html
      ↓
   Select Registered Guide

   NOTE:

   Frontend Demo Architecture

   Later:
   Backend / API / Database
============================================================ */

/* ============================================================
   1. STORAGE KEY
============================================================ */

const MY_TRIP_KEY = "sriLankaMyTrip";

/* ============================================================
   2. TRIP PLANNER DATA KEY
============================================================ */

/*
   Travel details quotation-request.html
   එකට pass කිරීමට මෙම key භාවිතා කරයි.
*/

const TRIP_PLANNER_DATA_KEY = "sriLankaTripPlannerData";

/* ============================================================
   3. GET MY TRIP
============================================================ */

function getMyTrip() {
  const savedTrip = localStorage.getItem(MY_TRIP_KEY);

  if (!savedTrip) {
    return [];
  }

  try {
    const trip = JSON.parse(savedTrip);

    if (!Array.isArray(trip)) {
      return [];
    }

    return trip;
  } catch (error) {
    console.error("Trip data error:", error);

    return [];
  }
}

/* ============================================================
   4. SAVE MY TRIP
============================================================ */

function saveMyTrip(trip) {
  localStorage.setItem(
    MY_TRIP_KEY,

    JSON.stringify(trip),
  );
}

/* ============================================================
   5. DOM ELEMENTS
============================================================ */

const plannerDestinations = document.getElementById("plannerDestinations");

const plannerEmptyState = document.getElementById("plannerEmptyState");

const plannerPlaceCount = document.getElementById("plannerPlaceCount");

const summaryPlaceCount = document.getElementById("summaryPlaceCount");

/* ============================================================
   6. RENDER DESTINATIONS
============================================================ */

function renderPlannerDestinations() {
  const trip = getMyTrip();

  /*
       Clear old cards
    */

  if (plannerDestinations) {
    plannerDestinations.innerHTML = "";
  }

  /*
       Update counters
    */

  if (plannerPlaceCount) {
    plannerPlaceCount.textContent =
      trip.length + (trip.length === 1 ? " Place" : " Places");
  }

  if (summaryPlaceCount) {
    summaryPlaceCount.textContent = trip.length;
  }

  /*
       Empty State
    */

  if (trip.length === 0) {
    if (plannerEmptyState) {
      plannerEmptyState.style.display = "block";
    }

    return;
  }

  /*
       Hide Empty State
    */

  if (plannerEmptyState) {
    plannerEmptyState.style.display = "none";
  }

  /*
       Create Destination Cards
    */

  trip.forEach((place, index) => {
    const card = document.createElement("div");

    card.className = "planner-destination";

    card.innerHTML = `

                <img
                    src="${place.image || ""}"
                    alt="${place.name || "Destination"}"
                >


                <div
                    class="planner-destination-info"
                >

                    <h4>

                        ${index + 1}.
                        ${place.name || "Unknown Destination"}

                    </h4>


                    <p>

                        📍

                        ${place.district || ""}

                        ${place.province ? " · " + place.province : ""}

                    </p>


                    <p>

                        ⭐

                        ${place.rating || "N/A"}

                    </p>

                </div>


                <button
                    type="button"
                    class="remove-planner-place"
                    data-place-id="${place.id}"
                    title="Remove destination"
                >

                    ×

                </button>

            `;

    /*
               Remove Button
            */

    const removeButton = card.querySelector(".remove-planner-place");

    if (removeButton) {
      removeButton.addEventListener("click", () => {
        removePlannerDestination(place.id);
      });
    }

    /*
               Add Card
            */

    if (plannerDestinations) {
      plannerDestinations.appendChild(card);
    }
  });
}

/* ============================================================
   7. REMOVE DESTINATION
============================================================ */

function removePlannerDestination(placeId) {
  let trip = getMyTrip();

  /*
       Remove selected place
    */

  trip = trip.filter((place) => place.id !== placeId);

  /*
       Save updated trip
    */

  saveMyTrip(trip);

  /*
       Re-render
    */

  renderPlannerDestinations();
}

/* ============================================================
   8. TRAVEL DATES
============================================================ */

const startDate = document.getElementById("startDate");

const endDate = document.getElementById("endDate");

const summaryDates = document.getElementById("summaryDates");

function updateTravelDates() {
  if (!startDate || !endDate || !summaryDates) {
    return;
  }

  if (!startDate.value || !endDate.value) {
    summaryDates.textContent = "Not selected";

    return;
  }

  summaryDates.textContent = startDate.value + " → " + endDate.value;
}

if (startDate) {
  startDate.addEventListener("change", updateTravelDates);
}

if (endDate) {
  endDate.addEventListener("change", updateTravelDates);
}

/* ============================================================
   9. TRAVELERS
============================================================ */

const travelerCount = document.getElementById("travelerCount");

const summaryTravelers = document.getElementById("summaryTravelers");

if (travelerCount) {
  travelerCount.addEventListener("change", () => {
    if (summaryTravelers) {
      summaryTravelers.textContent = travelerCount.value
        ? travelerCount.value
        : "Not selected";
    }
  });
}

/* ============================================================
   10. TRANSPORT
============================================================ */

const transportOptions = document.querySelectorAll('input[name="transport"]');

const summaryTransport = document.getElementById("summaryTransport");

transportOptions.forEach((option) => {
  option.addEventListener("change", () => {
    if (summaryTransport) {
      summaryTransport.textContent = option.value;
    }
  });
});

/* ============================================================
   11. ACCOMMODATION
============================================================ */

const accommodationOptions = document.querySelectorAll(
  'input[name="accommodation"]',
);

const summaryAccommodation = document.getElementById("summaryAccommodation");

accommodationOptions.forEach((option) => {
  option.addEventListener("change", () => {
    if (summaryAccommodation) {
      summaryAccommodation.textContent = option.value;
    }
  });
});

/* ============================================================
   12. SAVE PLANNER DATA
============================================================ */

/*
   Trip Planner එකේ
   Travel Details save කරයි.

   quotation-request.html
   එකෙන් මේ data load කරයි.
*/

function saveTripPlannerData() {
  const tripPlannerData = {
    startDate: startDate ? startDate.value : "",

    endDate: endDate ? endDate.value : "",

    travelers: travelerCount ? travelerCount.value : "",

    travelStyle: document.getElementById("travelStyle")?.value || "",

    transport:
      document.querySelector('input[name="transport"]:checked')?.value || "",

    accommodation:
      document.querySelector('input[name="accommodation"]:checked')?.value ||
      "",

    specialRequests: document.getElementById("specialRequests")?.value || "",

    updatedAt: new Date().toISOString(),
  };

  /*
       Save to localStorage
    */

  localStorage.setItem(
    TRIP_PLANNER_DATA_KEY,

    JSON.stringify(tripPlannerData),
  );

  console.log("Trip Planner Data Saved:", tripPlannerData);
}

/* ============================================================
   13. REQUEST GUIDE QUOTATION
============================================================ */

const requestQuoteButton = document.getElementById("requestQuoteButton");

if (requestQuoteButton) {
  requestQuoteButton.addEventListener("click", () => {
    /* =================================================
               STEP 1
               GET SELECTED DESTINATIONS
            ================================================= */

    const trip = getMyTrip();

    /*
               Destination check
            */

    if (trip.length === 0) {
      alert(
        "Please add at least one destination before requesting a quotation.",
      );

      return;
    }

    /* =================================================
               STEP 2
               SAVE TRAVEL DATA
            ================================================= */

    saveTripPlannerData();

    /* =================================================
               STEP 3
               LOGIN CHECK
            ================================================= */

    /*
               auth.js load වී තිබිය යුතුය.

               getCurrentUser()
               undefined නම්
               clear error එකක් පෙන්වමු.
            */

    if (typeof getCurrentUser !== "function") {
      console.error(
        "getCurrentUser() is not available. Please load auth.js before trip-planner.js.",
      );

      alert("Authentication system is not available. Please refresh the page.");

      return;
    }

    const currentUser = getCurrentUser();

    /* =================================================
               STEP 4
               NOT LOGGED IN
            ================================================= */

    if (!currentUser) {
      /*
                   Login Page

                   Login Success වූ පසු
                   quotation-request.html
                   වෙත යයි.
                */

      window.location.href = "login.html?redirect=quotation-request.html";

      return;
    }

    /* =================================================
               STEP 5
               TOURIST ACCOUNT CHECK
            ================================================= */

    /*
               Quotation Request
               කරන්න පුළුවන් Tourist
               account එකකට පමණි.
            */

    if (currentUser.accountType !== "tourist") {
      alert("Only Tourist accounts can request guide quotations.");

      /*
                   Guide නම්
                   Guide Dashboard

                   වෙනත් account නම්
                   තමන්ගේ dashboard
                */

      if (typeof redirectAfterLogin === "function") {
        redirectAfterLogin(currentUser);
      } else {
        window.location.href = "index.html";
      }

      return;
    }

    /* =================================================
               STEP 6
               OPEN QUOTATION REQUEST
            ================================================= */

    /*
               Tourist Login වී ඇත.

               දැන් quotation request
               page එකට යයි.
            */

    window.location.href = "quotation-request.html";
  });
}

/* ============================================================
   14. INITIALIZE
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /*
           Render selected destinations
        */

  renderPlannerDestinations();

  /*
           Load existing planner data
           if available
        */

  const savedPlannerData = localStorage.getItem(TRIP_PLANNER_DATA_KEY);

  if (savedPlannerData) {
    try {
      const data = JSON.parse(savedPlannerData);

      /*
                   Start Date
                */

      if (startDate && data.startDate) {
        startDate.value = data.startDate;
      }

      /*
                   End Date
                */

      if (endDate && data.endDate) {
        endDate.value = data.endDate;
      }

      /*
                   Travelers
                */

      if (travelerCount && data.travelers) {
        travelerCount.value = data.travelers;
      }

      /*
                   Travel Style
                */

      const travelStyle = document.getElementById("travelStyle");

      if (travelStyle && data.travelStyle) {
        travelStyle.value = data.travelStyle;
      }

      /*
                   Transport
                */

      if (data.transport) {
        const transport = document.querySelector(
          `input[name="transport"][value="${data.transport}"]`,
        );

        if (transport) {
          transport.checked = true;
        }
      }

      /*
                   Accommodation
                */

      if (data.accommodation) {
        const accommodation = document.querySelector(
          `input[name="accommodation"][value="${data.accommodation}"]`,
        );

        if (accommodation) {
          accommodation.checked = true;
        }
      }

      /*
                   Special Requests
                */

      const specialRequests = document.getElementById("specialRequests");

      if (specialRequests && data.specialRequests) {
        specialRequests.value = data.specialRequests;
      }

      /*
                   Update Summary
                */

      updateTravelDates();

      if (travelerCount && summaryTravelers) {
        summaryTravelers.textContent = travelerCount.value
          ? travelerCount.value
          : "Not selected";
      }

      if (summaryTransport && data.transport) {
        summaryTransport.textContent = data.transport;
      }

      if (summaryAccommodation && data.accommodation) {
        summaryAccommodation.textContent = data.accommodation;
      }
    } catch (error) {
      console.error(
        "Unable to load saved Trip Planner data:",

        error,
      );
    }
  }

  console.log("Trip Planner Loaded");
});
