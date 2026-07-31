/* ============================================================
   SRI LANKA INTERACTIVE TOURIST MAP
   ============================================================

   Features:

   🗺️ Interactive Leaflet Map
   📌 Automatic Tourist Markers
   🔍 Live Search / Autocomplete
   ⌨️ Keyboard Search Navigation
   🏛️ Category Filter
   📍 Automatic Map Zoom
   💬 Destination Popup
   ❤️ My Trip
   🔢 Trip Counter
   🧳 My Trip Panel
   🗑️ Remove / Clear Trip
   📅 Plan My Journey

   IMPORTANT:

   All destination data comes from:

   places.js

   Example:

   touristPlaces = [
       {
           id: "sigiriya",
           name: "Sigiriya",
           coordinates: [7.9570, 80.7603],
           ...
       }
   ]

   Adding a new destination to places.js
   automatically creates a Map Pin.
============================================================ */

/* ============================================================
   1. MAP INITIALIZATION
============================================================ */

const sriLankaCenter = [7.8731, 80.7718];

const map = L.map("map").setView(sriLankaCenter, 7);

/* ============================================================
   2. OPEN STREET MAP
============================================================ */

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,

  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

/* ============================================================
   3. GLOBAL VARIABLES
============================================================ */

/*
   සියලුම Map Markers මෙහි save කරමු.

   Example:

   markers["sigiriya"]
   markers["kandy"]
*/

const markers = {};

/*
   දැනට Active Category එක

   Default:

   all
*/

let activeCategory = "all";

/*
   Keyboard Search Active Index

   -1 = කිසිම Result එකක් select කරලා නැහැ
*/

let activeSearchIndex = -1;

/* ============================================================
   4. DOM ELEMENTS
============================================================ */

/*
   Search Input
*/

const searchInput = document.getElementById("placeSearch");

/*
   Search Suggestions
*/

const searchSuggestions = document.getElementById("searchSuggestions");

/*
   Clear Search Button
*/

const clearSearch = document.getElementById("clearSearch");

/*
   Category Buttons
*/

const categoryButtons = document.querySelectorAll(".category-btn");

/* ============================================================
   MY TRIP ELEMENTS
============================================================ */

const myTripButton = document.getElementById("myTripButton");

const tripPlannerPanel = document.getElementById("tripPlannerPanel");

const tripPlannerOverlay = document.getElementById("tripPlannerOverlay");

const closeTripPlanner = document.getElementById("closeTripPlanner");

const tripDestinations = document.getElementById("tripDestinations");

const emptyTripMessage = document.getElementById("emptyTripMessage");

const tripActions = document.getElementById("tripActions");

const tripPlaceCount = document.getElementById("tripPlaceCount");

const clearTripButton = document.getElementById("clearTripButton");

const exploreDestinationsButton = document.getElementById(
  "exploreDestinationsButton",
);

const planJourneyButton = document.getElementById("planJourneyButton");

/* ============================================================
   5. CREATE DESTINATION POPUP
============================================================ */

function createPopup(place) {
  return `

        <div class="tourist-popup">


            <!-- Destination Image -->

            <img
                src="${place.image || ""}"
                alt="${place.name || ""}"
            >


            <!-- Popup Content -->

            <div class="popup-content">


                <!-- Destination Name -->

                <h3>
                    📌
                    ${place.name || ""}
                </h3>


                <!-- Sinhala Name -->

                <h4>
                    ${place.sinhalaName || ""}
                </h4>


                <!-- Description -->

                <p>
                    ${place.shortDescription || ""}
                </p>


                <!-- Rating -->

                <div class="popup-rating">

                    ⭐
                    ${place.rating || "N/A"}

                </div>


                <!-- View Details -->

                <a
                    href="${place.page || "#"}"
                    class="view-details-btn"
                >

                    View Details →

                </a>


            </div>

        </div>

    `;
}

/* ============================================================
   6. CREATE ALL MAP MARKERS
============================================================ */

/*
   IMPORTANT:

   places.js එකේ touristPlaces[]
   array එකේ තියෙන සියලුම Places
   මෙතැනදී automatically process වෙනවා.

   ඒ නිසා අලුත් Place එකක් places.js
   එකට add කළාම Map Pin එක
   automatically create වෙනවා.
*/

touristPlaces.forEach((place) => {
  /*
           Coordinates තිබේද check කරන්න
        */

  if (!place.coordinates || place.coordinates.length !== 2) {
    console.warn("Invalid coordinates:", place);

    return;
  }

  /*
           Marker Create
        */

  const marker = L.marker(place.coordinates);

  /*
           Popup Attach
        */

  marker.bindPopup(
    createPopup(place),

    {
      maxWidth: 300,
    },
  );

  /*
           Marker Save

           Example:

           markers["sigiriya"]
        */

  markers[place.id] = marker;

  /*
           Add Marker To Map
        */

  marker.addTo(map);
});

/* ============================================================
   7. UPDATE MAP MARKERS
============================================================ */

function updateMapMarkers() {
  touristPlaces.forEach((place) => {
    /*
               Place Marker ලබාගන්නවා
            */

    const marker = markers[place.id];

    /*
               Marker එක නොමැති නම්
               Skip කරන්න
            */

    if (!marker) {
      return;
    }

    /*
               Category Match
            */

    const categoryMatch =
      activeCategory === "all" || place.category === activeCategory;

    /*
               Show Marker
            */

    if (categoryMatch) {
      marker.addTo(map);
    } else {
      /*
               Hide Marker
            */
      map.removeLayer(marker);
    }
  });
}

/* ============================================================
   8. CATEGORY FILTER
============================================================ */

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    /*
                   Active Category ලබාගන්නවා
                */

    activeCategory = button.dataset.category;

    /*
                   Active Button Update
                */

    categoryButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    /*
                   Update Map Markers
                */

    updateMapMarkers();

    /*
                   Reset Search
                */

    resetSearch();
  });
});

/* ============================================================
   9. RESET SEARCH
============================================================ */

function resetSearch() {
  /*
       Search Input Clear
    */

  if (searchInput) {
    searchInput.value = "";
  }

  /*
       Suggestions Clear
    */

  if (searchSuggestions) {
    searchSuggestions.innerHTML = "";

    searchSuggestions.style.display = "none";
  }

  /*
       Clear Button Hide
    */

  if (clearSearch) {
    clearSearch.style.display = "none";
  }

  /*
       Keyboard Index Reset
    */

  resetSearchKeyboard();
}

/* ============================================================
   10. LIVE SEARCH
============================================================ */

if (searchInput) {
  searchInput.addEventListener("input", () => {
    /*
               User Search Text
            */

    const searchText = searchInput.value.toLowerCase().trim();

    /*
               Clear Button State
            */

    if (clearSearch) {
      clearSearch.style.display = searchText.length > 0 ? "block" : "none";
    }

    /*
               Empty Search
            */

    if (searchText.length === 0) {
      if (searchSuggestions) {
        searchSuggestions.innerHTML = "";

        searchSuggestions.style.display = "none";
      }

      resetSearchKeyboard();

      return;
    }

    /*
               Search Results
            */

    const results = touristPlaces.filter((place) => {
      /*
                           Category Filter
                        */

      const categoryMatch =
        activeCategory === "all" || place.category === activeCategory;

      /*
                           Safe Search Values
                        */

      const name = String(place.name || "").toLowerCase();

      const sinhalaName = String(place.sinhalaName || "").toLowerCase();

      const district = String(place.district || "").toLowerCase();

      const province = String(place.province || "").toLowerCase();

      const categoryName = String(place.categoryName || "").toLowerCase();

      /*
                           Search Match
                        */

      const searchMatch =
        name.includes(searchText) ||
        sinhalaName.includes(searchText) ||
        district.includes(searchText) ||
        province.includes(searchText) ||
        categoryName.includes(searchText);

      return categoryMatch && searchMatch;
    });

    /*
               Display Results
            */

    displayLiveSuggestions(results);
  });
}

/* ============================================================
   11. DISPLAY LIVE SEARCH SUGGESTIONS
============================================================ */

function displayLiveSuggestions(results) {
  /*
       Old Results Clear
    */

  if (!searchSuggestions) {
    return;
  }

  searchSuggestions.innerHTML = "";

  /*
       Reset Keyboard Selection
    */

  resetSearchKeyboard();

  /*
       No Results
    */

  if (results.length === 0) {
    searchSuggestions.innerHTML = `

            <div class="no-search-results">

                <div class="no-result-icon">
                    🔍
                </div>

                <strong>
                    No destinations found
                </strong>

                <span>
                    Try another destination
                </span>

            </div>

        `;

    searchSuggestions.style.display = "block";

    return;
  }

  /*
       Maximum 6 Results
    */

  const limitedResults = results.slice(0, 6);

  /*
       Create Result Cards
    */

  limitedResults.forEach((place) => {
    /*
               Create Result Item
            */

    const item = document.createElement("div");

    item.className = "search-suggestion-item";

    /*
               Check My Trip
            */

    const isAdded = isPlaceInTrip(place.id);

    /*
               Featured Badge
            */

    const featuredBadge = place.featured
      ? `
                <span
                    class="featured-badge"
                >
                    ⭐ Featured
                </span>
                `
      : "";

    /*
               Create Card
            */

    item.innerHTML = `

                <div
                    class="suggestion-image-wrapper"
                >

                    <img
                        src="${place.image || ""}"
                        alt="${place.name || ""}"
                        loading="lazy"
                    >

                    ${featuredBadge}

                </div>


                <div
                    class="suggestion-info"
                >

                    <div
                        class="suggestion-title-row"
                    >

                        <div>

                            <h4>
                                ${place.name || ""}
                            </h4>


                            <p
                                class="suggestion-sinhala"
                            >

                                ${place.sinhalaName || ""}

                            </p>

                        </div>


                        <div
                            class="suggestion-rating"
                        >

                            ⭐
                            ${place.rating || "N/A"}

                        </div>

                    </div>


                    <p
                        class="suggestion-location"
                    >

                        📍

                        ${place.district || ""}

                        ·

                        ${place.province || ""}

                    </p>


                    <span
                        class="suggestion-category"
                    >

                        ${place.categoryName || ""}

                    </span>


                    <div
                        class="suggestion-actions"
                    >


                        <a
                            href="${place.page || "#"}"
                            class="view-details-btn"
                        >

                            View Details →

                        </a>


                        <button
                            type="button"
                            class="add-trip-btn ${isAdded ? "added" : ""}"
                            data-place-id="${place.id}"
                        >

                            ${isAdded ? "❤️ Added to Trip" : "♡ Add to My Trip"}

                        </button>


                    </div>

                </div>

            `;

    /* =================================================
               VIEW DETAILS
            ================================================= */

    const viewDetailsButton = item.querySelector(".view-details-btn");

    if (viewDetailsButton) {
      viewDetailsButton.addEventListener("click", (event) => {
        event.stopPropagation();
      });
    }

    /* =================================================
               ADD TO MY TRIP
            ================================================= */

    const addTripButton = item.querySelector(".add-trip-btn");

    if (addTripButton) {
      addTripButton.addEventListener("click", (event) => {
        /*
                           Prevent Card Click
                        */

        event.stopPropagation();

        /*
                           Toggle Trip
                        */

        toggleTripPlace(place, addTripButton);

        /*
                           Update All Trip UI
                        */

        refreshMyTripUI();
      });
    }

    /* =================================================
               CARD CLICK
            ================================================= */

    item.addEventListener("click", () => {
      /*
                       Map Zoom
                    */

      map.setView(place.coordinates, 12, {
        animate: true,
      });

      /*
                       Open Marker Popup
                    */

      if (markers[place.id]) {
        markers[place.id].openPopup();
      }

      /*
                       Update Search Input
                    */

      if (searchInput) {
        searchInput.value = place.name;
      }

      /*
                       Hide Suggestions
                    */

      if (searchSuggestions) {
        searchSuggestions.style.display = "none";
      }

      /*
                       Reset Keyboard Index
                    */

      resetSearchKeyboard();
    });

    /*
               Add Card
            */

    searchSuggestions.appendChild(item);
  });

  /*
       Show Dropdown
    */

  searchSuggestions.style.display = "block";
}

/* ============================================================
   12. CLEAR SEARCH BUTTON
============================================================ */

if (clearSearch) {
  clearSearch.addEventListener("click", () => {
    resetSearch();

    /*
               Return Focus
            */

    if (searchInput) {
      searchInput.focus();
    }
  });
}

/* ============================================================
   13. CLOSE SEARCH WHEN CLICKING OUTSIDE
============================================================ */

document.addEventListener("click", (event) => {
  /*
           Search Box එකෙන් පිට Click කළොත්
        */

  if (!event.target.closest(".map-search")) {
    if (searchSuggestions) {
      searchSuggestions.style.display = "none";
    }

    resetSearchKeyboard();
  }
});

/* ============================================================
   14. SEARCH KEYBOARD NAVIGATION
============================================================ */

if (searchInput) {
  searchInput.addEventListener("keydown", (event) => {
    /*
               Current Search Results
            */

    const items = searchSuggestions
      ? searchSuggestions.querySelectorAll(".search-suggestion-item")
      : [];

    /*
               Escape
            */

    if (event.key === "Escape") {
      if (searchSuggestions) {
        searchSuggestions.style.display = "none";
      }

      resetSearchKeyboard();

      return;
    }

    /*
               No Results
            */

    if (items.length === 0) {
      return;
    }

    /* =================================================
               ARROW DOWN
            ================================================= */

    if (event.key === "ArrowDown") {
      event.preventDefault();

      activeSearchIndex++;

      if (activeSearchIndex >= items.length) {
        activeSearchIndex = 0;
      }

      updateActiveSearchItem(items);
    } else if (event.key === "ArrowUp") {
      /* =================================================
               ARROW UP
            ================================================= */
      event.preventDefault();

      activeSearchIndex--;

      if (activeSearchIndex < 0) {
        activeSearchIndex = items.length - 1;
      }

      updateActiveSearchItem(items);
    } else if (event.key === "Enter") {
      /* =================================================
               ENTER
            ================================================= */
      if (activeSearchIndex >= 0) {
        event.preventDefault();

        items[activeSearchIndex].click();
      }
    }
  });
}

/* ============================================================
   15. UPDATE ACTIVE SEARCH ITEM
============================================================ */

function updateActiveSearchItem(items) {
  /*
       Remove Active Class
       From All Results
    */

  items.forEach((item) => {
    item.classList.remove("active");
  });

  /*
       Get Current Active Item
    */

  const activeItem = items[activeSearchIndex];

  /*
       Add Active Class
    */

  if (activeItem) {
    activeItem.classList.add("active");

    /*
           Keep Active Item Visible
        */

    activeItem.scrollIntoView({
      block: "nearest",

      behavior: "smooth",
    });
  }
}

/* ============================================================
   16. RESET SEARCH KEYBOARD INDEX
============================================================ */

function resetSearchKeyboard() {
  activeSearchIndex = -1;
}

/* ============================================================
   17. MY TRIP LOCAL STORAGE SYSTEM
============================================================ */

const MY_TRIP_KEY = "sriLankaMyTrip";

/* ============================================================
   GET MY TRIP
============================================================ */

function getMyTrip() {
  const savedTrip = localStorage.getItem(MY_TRIP_KEY);

  /*
       No Saved Trip
    */

  if (!savedTrip) {
    return [];
  }

  try {
    const parsedTrip = JSON.parse(savedTrip);

    /*
           Ensure Array
        */

    return Array.isArray(parsedTrip) ? parsedTrip : [];
  } catch (error) {
    console.error("Trip data error:", error);

    return [];
  }
}

/* ============================================================
   SAVE MY TRIP
============================================================ */

function saveMyTrip(trip) {
  localStorage.setItem(
    MY_TRIP_KEY,

    JSON.stringify(trip),
  );
}

/* ============================================================
   CHECK PLACE IN MY TRIP
============================================================ */

function isPlaceInTrip(placeId) {
  const trip = getMyTrip();

  return trip.some((place) => place.id === placeId);
}

/* ============================================================
   ADD / REMOVE PLACE FROM MY TRIP
============================================================ */

function toggleTripPlace(place, button) {
  let trip = getMyTrip();

  /*
       Check Existing Place
    */

  const existingIndex = trip.findIndex((item) => item.id === place.id);

  /*
       Already Added
       → Remove
    */

  if (existingIndex !== -1) {
    trip.splice(existingIndex, 1);

    saveMyTrip(trip);

    /*
           Update Button
        */

    if (button) {
      button.classList.remove("added");

      button.innerHTML = "♡ Add to My Trip";
    }

    updateTripCounter();

    console.log("Removed from trip:", place.name);

    return;
  }

  /*
       New Place
       → Add
    */

  trip.push({
    id: place.id,

    name: place.name,

    sinhalaName: place.sinhalaName,

    coordinates: place.coordinates,

    image: place.image,

    category: place.category,

    categoryName: place.categoryName,

    province: place.province,

    district: place.district,

    rating: place.rating,

    page: place.page,
  });

  /*
       Save
    */

  saveMyTrip(trip);

  /*
       Update Button
    */

  if (button) {
    button.classList.add("added");

    button.innerHTML = "❤️ Added to Trip";
  }

  updateTripCounter();

  console.log("Added to trip:", place.name);
}

/* ============================================================
   18. UPDATE TRIP COUNTER
============================================================ */

function updateTripCounter() {
  const trip = getMyTrip();

  const counter = document.getElementById("tripCounter");

  if (!counter) {
    return;
  }

  counter.textContent = trip.length;

  /*
       Hide Counter If Empty
    */

  if (trip.length === 0) {
    counter.style.display = "none";
  } else {
    counter.style.display = "inline-flex";
  }
}

/* ============================================================
   19. REFRESH MY TRIP UI
============================================================ */

function refreshMyTripUI() {
  /*
       Update Counter
    */

  updateTripCounter();

  /*
       Search Buttons Update
    */

  if (!searchSuggestions) {
    return;
  }

  const buttons = searchSuggestions.querySelectorAll(".add-trip-btn");

  buttons.forEach((button) => {
    /*
               Get Place ID
            */

    const placeId = button.dataset.placeId;

    /*
               Check Trip
            */

    const isAdded = isPlaceInTrip(placeId);

    /*
               Update Button
            */

    if (isAdded) {
      button.classList.add("added");

      button.innerHTML = "❤️ Added to Trip";
    } else {
      button.classList.remove("added");

      button.innerHTML = "♡ Add to My Trip";
    }
  });
}

/* ============================================================
   20. OPEN MY TRIP PANEL
============================================================ */

function openTripPlanner() {
  if (!tripPlannerPanel || !tripPlannerOverlay) {
    return;
  }

  tripPlannerPanel.classList.add("active");

  tripPlannerOverlay.classList.add("active");

  /*
       Render Latest Trip
    */

  renderMyTrip();
}

/* ============================================================
   21. CLOSE MY TRIP PANEL
============================================================ */

function closeTripPlannerPanel() {
  if (tripPlannerPanel) {
    tripPlannerPanel.classList.remove("active");
  }

  if (tripPlannerOverlay) {
    tripPlannerOverlay.classList.remove("active");
  }
}

/* ============================================================
   22. MY TRIP BUTTON EVENTS
============================================================ */

if (myTripButton) {
  myTripButton.addEventListener("click", openTripPlanner);
}

if (closeTripPlanner) {
  closeTripPlanner.addEventListener("click", closeTripPlannerPanel);
}

if (tripPlannerOverlay) {
  tripPlannerOverlay.addEventListener("click", closeTripPlannerPanel);
}

/* ============================================================
   23. RENDER MY TRIP
============================================================ */

function renderMyTrip() {
  /*
       Required Elements Check
    */

  if (
    !tripDestinations ||
    !emptyTripMessage ||
    !tripActions ||
    !tripPlaceCount
  ) {
    return;
  }

  /*
       Get Saved Trip
    */

  const trip = getMyTrip();

  /*
       Clear Existing Cards
    */

  tripDestinations.innerHTML = "";

  /*
       Update Destination Count
    */

  tripPlaceCount.textContent = trip.length;

  /*
       Empty Trip
    */

  if (trip.length === 0) {
    emptyTripMessage.style.display = "block";

    tripActions.style.display = "none";

    return;
  }

  /*
       Trip Has Destinations
    */

  emptyTripMessage.style.display = "none";

  tripActions.style.display = "flex";

  /*
       Create Destination Cards
    */

  trip.forEach((place, index) => {
    const card = document.createElement("div");

    card.className = "trip-destination-card";

    card.innerHTML = `

                <img
                    src="${place.image || ""}"
                    alt="${place.name || ""}"
                    class="trip-destination-image"
                >


                <div
                    class="trip-destination-info"
                >

                    <h4>

                        ${index + 1}.

                        ${place.name || ""}

                    </h4>


                    <p>

                        📍

                        ${place.district || ""}

                        ·

                        ${place.province || ""}

                    </p>


                    <p>

                        ⭐

                        ${place.rating || "N/A"}

                    </p>

                </div>


                <button
                    type="button"
                    class="trip-destination-remove"
                    data-place-id="${place.id}"
                    title="Remove from My Trip"
                >

                    🗑️

                </button>

            `;

    /*
               Remove Button
            */

    const removeButton = card.querySelector(".trip-destination-remove");

    if (removeButton) {
      removeButton.addEventListener("click", () => {
        removePlaceFromTrip(place.id);
      });
    }

    /*
               Add Card
            */

    tripDestinations.appendChild(card);
  });
}

/* ============================================================
   24. REMOVE PLACE FROM MY TRIP
============================================================ */

function removePlaceFromTrip(placeId) {
  let trip = getMyTrip();

  /*
       Remove Place
    */

  trip = trip.filter((place) => place.id !== placeId);

  /*
       Save Updated Trip
    */

  saveMyTrip(trip);

  /*
       Update UI
    */

  updateTripCounter();

  renderMyTrip();

  refreshMyTripUI();
}

/* ============================================================
   25. CLEAR ENTIRE TRIP
============================================================ */

if (clearTripButton) {
  clearTripButton.addEventListener("click", () => {
    /*
               Confirm User
            */

    const confirmed = confirm(
      "Are you sure you want to clear your entire trip?",
    );

    if (!confirmed) {
      return;
    }

    /*
               Clear Trip
            */

    saveMyTrip([]);

    /*
               Update UI
            */

    updateTripCounter();

    renderMyTrip();

    refreshMyTripUI();
  });
}

/* ============================================================
   26. EXPLORE DESTINATIONS
============================================================ */

if (exploreDestinationsButton) {
  exploreDestinationsButton.addEventListener("click", () => {
    /*
               Close My Trip Panel
            */

    closeTripPlannerPanel();

    /*
               Focus Search
            */

    if (searchInput) {
      searchInput.focus();
    }
  });
}

/* ============================================================
   27. PLAN MY JOURNEY
============================================================ */

if (planJourneyButton) {
  planJourneyButton.addEventListener("click", () => {
    /*
               Get Current Trip
            */

    const trip = getMyTrip();

    /*
               No Destinations
            */

    if (trip.length === 0) {
      alert("Please add at least one destination to your trip.");

      return;
    }

    /*
               Open Trip Planner Page
            */

    window.location.href = "trip-planner.html";
  });
}

/* ============================================================
   28. INITIALIZE TRIP COUNTER
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  updateTripCounter();
});

/* ============================================================
   29. INITIALIZE MAP
============================================================ */

/*
   Ensure all markers follow
   current active category.

   Default category = all
*/

updateMapMarkers();

/* ============================================================
   END OF MAP.JS
============================================================ */
