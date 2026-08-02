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
   LANKAQUEST
   INTERACTIVE TOURIST MAP + SEARCH

   DATA ARCHITECTURE:

   Search:
   data/generated/search-index.json

   Map:
   places.js

   Connection:
   searchIndex.id === touristPlaces.id

   IMPORTANT:

   Search data and Map data are intentionally separated.

   search-index.json
        ↓
      Search
        ↓
       ID
        ↓
   places.js
        ↓
   coordinates
        ↓
   Map Marker / Popup / My Trip
============================================================ */


/* ============================================================
   1. MAP INITIALIZATION
============================================================ */

const sriLankaCenter = [
  7.8731,
  80.7718,
];


const map =
  L.map("map").setView(
    sriLankaCenter,
    7
  );


/* ============================================================
   2. OPEN STREET MAP
============================================================ */

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,

    attribution:
      "&copy; OpenStreetMap contributors",
  }
).addTo(map);


/* ============================================================
   3. GLOBAL STATE
============================================================ */


/*
   All Leaflet markers.

   Example:

   markers["sigiriya"]
*/

const markers = {};


/*
   Current active category.

   Default:
   all
*/

let activeCategory =
  "all";


/*
   Keyboard search index.
*/

let activeSearchIndex =
  -1;


/*
   Search index data.

   This is NOT the map database.

   It comes from:

   data/generated/search-index.json
*/

let searchIndex = [];


/*
   Search index loading state.
*/

let searchIndexLoaded =
  false;


/*
   Search loading promise.

   This allows the search input to wait
   until the JSON database is ready.
*/

let searchIndexPromise =
  null;


/* ============================================================
   4. DOM ELEMENTS
============================================================ */

const searchInput =
  document.getElementById(
    "placeSearch"
  );


const searchSuggestions =
  document.getElementById(
    "searchSuggestions"
  );


const clearSearch =
  document.getElementById(
    "clearSearch"
  );


/*
   IMPORTANT:

   Only actual category buttons are selected.

   This prevents:

   <a class="category-btn">

   such as "Explore All Attractions"
   from being treated as a filter button.
*/

const categoryButtons =
  document.querySelectorAll(
    'button.category-btn[data-category]'
  );


/* ============================================================
   5. MY TRIP ELEMENTS
============================================================ */

const myTripButton =
  document.getElementById(
    "myTripButton"
  );


const tripPlannerPanel =
  document.getElementById(
    "tripPlannerPanel"
  );


const tripPlannerOverlay =
  document.getElementById(
    "tripPlannerOverlay"
  );


const closeTripPlanner =
  document.getElementById(
    "closeTripPlanner"
  );


const tripDestinations =
  document.getElementById(
    "tripDestinations"
  );


const emptyTripMessage =
  document.getElementById(
    "emptyTripMessage"
  );


const tripActions =
  document.getElementById(
    "tripActions"
  );


const tripPlaceCount =
  document.getElementById(
    "tripPlaceCount"
  );


const clearTripButton =
  document.getElementById(
    "clearTripButton"
  );


const exploreDestinationsButton =
  document.getElementById(
    "exploreDestinationsButton"
  );


const planJourneyButton =
  document.getElementById(
    "planJourneyButton"
  );


/* ============================================================
   6. LOAD SEARCH INDEX
============================================================ */


/*
   IMPORTANT:

   Do NOT use places.js for search.

   Search source:

   data/generated/search-index.json
*/

function loadSearchIndex() {

  if (
    searchIndexPromise
  ) {

    return searchIndexPromise;

  }


  searchIndexPromise =
    fetch(
      "data/generated/search-index.json",
      {
        cache: "no-cache",
      }
    )
    .then(
      (response) => {

        if (
          !response.ok
        ) {

          throw new Error(
            `Search index failed to load: ${response.status}`
          );

        }


        return response.json();

      }
    )
    .then(
      (data) => {

        if (
          !Array.isArray(data)
        ) {

          throw new Error(
            "Search index format is invalid."
          );

        }


        /*
           Keep only valid attraction records.
        */

        searchIndex =
          data.filter(
            (item) =>
              item &&
              item.id &&
              item.type ===
                "attraction" &&
              item.hide !== true
          );


        searchIndexLoaded =
          true;


        console.log(
          "LankaQuest search index loaded:",
          searchIndex.length
        );


        return searchIndex;

      }
    )
    .catch(
      (error) => {

        searchIndexLoaded =
          false;


        console.error(
          "LankaQuest search index error:",
          error
        );


        if (
          searchSuggestions
        ) {

          searchSuggestions.innerHTML = `
            <div class="no-search-results">

              <div class="no-result-icon">
                ⚠️
              </div>

              <strong>
                Search is temporarily unavailable
              </strong>

              <span>
                Please try again later.
              </span>

            </div>
          `;


          searchSuggestions.style.display =
            "block";

        }


        throw error;

      }
    );


  return searchIndexPromise;

}


/*
   Start loading immediately.

   Search does not need to wait for user input.
*/

loadSearchIndex().catch(
  () => {}
);


/* ============================================================
   7. FIND MAP PLACE BY ID
============================================================ */


/*
   Search index contains:

   id

   places.js contains:

   id + coordinates + full map data

   The ID connects the two systems.
*/

function getMapPlaceById(
  placeId
) {

  if (
    !placeId ||
    !Array.isArray(
      touristPlaces
    )
  ) {

    return null;

  }


  return (
    touristPlaces.find(
      (place) =>
        place &&
        place.id ===
          placeId
    ) ||
    null
  );

}


/* ============================================================
   8. CREATE DESTINATION POPUP
============================================================ */

function createPopup(
  place
) {

  return `
    <div class="tourist-popup">

      <img
        src="${place.image || ""}"
        alt="${place.name || ""}"
        loading="lazy"
      >

      <div class="popup-content">

        <h3>
          📌
          ${place.name || ""}
        </h3>


        <h4>
          ${place.sinhalaName || ""}
        </h4>


        <p>
          ${place.shortDescription || ""}
        </p>


        <div class="popup-rating">
          ⭐
          ${place.rating || "N/A"}
        </div>


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
   9. CREATE ALL MAP MARKERS
============================================================ */


/*
   IMPORTANT:

   Map markers ONLY come from places.js.

   Therefore:

   Add place to places.js
        ↓
   coordinates
        ↓
   automatic Map Pin
*/

if (
  Array.isArray(
    touristPlaces
  )
) {

  touristPlaces.forEach(
    (place) => {

      /*
         Validate ID.
      */

      if (
        !place ||
        !place.id
      ) {

        console.warn(
          "Map place has no valid ID:",
          place
        );

        return;

      }


      /*
         Validate coordinates.
      */

      if (
        !Array.isArray(
          place.coordinates
        ) ||
        place.coordinates.length !== 2
      ) {

        console.warn(
          "Invalid coordinates:",
          place
        );

        return;

      }


      /*
         Create marker.
      */

      const marker =
        L.marker(
          place.coordinates
        );


      /*
         Attach popup.
      */

      marker.bindPopup(
        createPopup(
          place
        ),
        {
          maxWidth: 300,
        }
      );


      /*
         Save by unique ID.
      */

      markers[
        place.id
      ] = marker;


      /*
         Add to map.
      */

      marker.addTo(
        map
      );

    }
  );

}


/* ============================================================
   10. UPDATE MAP MARKERS
============================================================ */

function updateMapMarkers() {

  if (
    !Array.isArray(
      touristPlaces
    )
  ) {

    return;

  }


  touristPlaces.forEach(
    (place) => {

      const marker =
        markers[
          place.id
        ];


      if (
        !marker
      ) {

        return;

      }


      const categoryMatch =
        activeCategory ===
          "all" ||
        place.category ===
          activeCategory;


      if (
        categoryMatch
      ) {

        marker.addTo(
          map
        );

      } else {

        if (
          map.hasLayer(
            marker
          )
        ) {

          map.removeLayer(
            marker
          );

        }

      }

    }
  );

}


/* ============================================================
   11. CATEGORY FILTER
============================================================ */

categoryButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        const category =
          button.dataset.category;


        if (
          !category
        ) {

          return;

        }


        activeCategory =
          category;


        /*
           Active button.
        */

        categoryButtons.forEach(
          (btn) => {

            btn.classList.remove(
              "active"
            );

          }
        );


        button.classList.add(
          "active"
        );


        /*
           Update map pins.
        */

        updateMapMarkers();


        /*
           Reset search.
        */

        resetSearch();

      }
    );

  }
);


/* ============================================================
   12. RESET SEARCH
============================================================ */

function resetSearch() {

  if (
    searchInput
  ) {

    searchInput.value =
      "";

  }


  if (
    searchSuggestions
  ) {

    searchSuggestions.innerHTML =
      "";

    searchSuggestions.style.display =
      "none";

  }


  if (
    clearSearch
  ) {

    clearSearch.style.display =
      "none";

  }


  resetSearchKeyboard();

}


/* ============================================================
   13. NORMALIZE SEARCH TEXT
============================================================ */

function normalizeSearchText(
  value
) {

  return String(
    value || ""
  )
    .toLocaleLowerCase()
    .trim();

}


/* ============================================================
   14. SEARCH INDEX MATCH
============================================================ */

function searchIndexMatch(
  item,
  searchText
) {

  /*
     Search all important generated fields.
  */

  const searchableValues = [

    item.name,

    item.sinhalaName,

    item.title,

    item.category,

    item.categoryName,

    item.province,

    item.district,

    item.location,

    item.description,

    item.shortDescription,

    ...(Array.isArray(
      item.keywords
    )
      ? item.keywords
      : []),

  ];


  return searchableValues.some(
    (value) =>
      normalizeSearchText(
        value
      ).includes(
        searchText
      )
  );

}


/* ============================================================
   15. GET SEARCH RESULTS
============================================================ */

function getSearchResults(
  searchText
) {

  if (
    !searchIndexLoaded
  ) {

    return [];

  }


  return searchIndex.filter(
    (item) => {

      /*
         Category filtering is based on
         search-index.json.

         This keeps Search and Attractions
         using the same data source.
      */

      const categoryMatch =
        activeCategory ===
          "all" ||
        item.category ===
          activeCategory;


      if (
        !categoryMatch
      ) {

        return false;

      }


      return searchIndexMatch(
        item,
        searchText
      );

    }
  );

}


/* ============================================================
   16. LIVE SEARCH
============================================================ */

if (
  searchInput
) {

  searchInput.addEventListener(
    "input",
    async () => {

      const searchText =
        normalizeSearchText(
          searchInput.value
        );


      /*
         Clear button.
      */

      if (
        clearSearch
      ) {

        clearSearch.style.display =
          searchText
            ? "block"
            : "none";

      }


      /*
         Empty search.
      */

      if (
        !searchText
      ) {

        if (
          searchSuggestions
        ) {

          searchSuggestions.innerHTML =
            "";

          searchSuggestions.style.display =
            "none";

        }


        resetSearchKeyboard();

        return;

      }


      /*
         Wait for search index.
      */

      if (
        !searchIndexLoaded
      ) {

        try {

          await loadSearchIndex();

        } catch (
          error
        ) {

          return;

        }

      }


      /*
         Search JSON index.
      */

      const results =
        getSearchResults(
          searchText
        );


      /*
         Render suggestions.
      */

      displayLiveSuggestions(
        results
      );

    }
  );

}


/* ============================================================
   17. DISPLAY LIVE SEARCH SUGGESTIONS
============================================================ */

function displayLiveSuggestions(
  results
) {

  if (
    !searchSuggestions
  ) {

    return;

  }


  searchSuggestions.innerHTML =
    "";


  resetSearchKeyboard();


  /*
     No results.
  */

  if (
    results.length === 0
  ) {

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


    searchSuggestions.style.display =
      "block";


    return;

  }


  /*
     Maximum 6 suggestions.
  */

  const limitedResults =
    results.slice(
      0,
      6
    );


  limitedResults.forEach(
    (searchPlace) => {

      /*
         Connect search result to map data.
      */

      const mapPlace =
        getMapPlaceById(
          searchPlace.id
        );


      /*
         If the place exists in search index
         but not in places.js, it cannot
         be shown as a map result.

         Still allow Details link.
      */

      const isAdded =
        mapPlace
          ? isPlaceInTrip(
              mapPlace.id
            )
          : false;


      const featuredBadge =
        searchPlace.featured
          ? `
              <span
                class="featured-badge"
              >
                ⭐ Featured
              </span>
            `
          : "";


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "search-suggestion-item";


      item.setAttribute(
        "role",
        "option"
      );


      item.dataset.placeId =
        searchPlace.id;


      item.innerHTML = `

        <div
          class="suggestion-image-wrapper"
        >

          <img
            src="${searchPlace.image || ""}"
            alt="${searchPlace.name || ""}"
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
                ${searchPlace.name || ""}
              </h4>

              <p
                class="suggestion-sinhala"
              >
                ${searchPlace.sinhalaName || ""}
              </p>

            </div>


            <div
              class="suggestion-rating"
            >
              ⭐
              ${searchPlace.rating || "N/A"}
            </div>

          </div>


          <p
            class="suggestion-location"
          >
            📍
            ${searchPlace.district || ""}
            ·
            ${searchPlace.province || ""}
          </p>


          <span
            class="suggestion-category"
          >
            ${searchPlace.categoryName || ""}
          </span>


          <div
            class="suggestion-actions"
          >

            <a
              href="${searchPlace.page || "#"}"
              class="view-details-btn"
            >
              View Details →
            </a>


            ${
              mapPlace
                ? `
                  <button
                    type="button"
                    class="add-trip-btn ${
                      isAdded
                        ? "added"
                        : ""
                    }"
                    data-place-id="${mapPlace.id}"
                  >
                    ${
                      isAdded
                        ? "❤️ Added to Trip"
                        : "♡ Add to My Trip"
                    }
                  </button>
                `
                : ""
            }

          </div>

        </div>

      `;


      /* ======================================================
         VIEW DETAILS
      ====================================================== */

      const viewDetailsButton =
        item.querySelector(
          ".view-details-btn"
        );


      if (
        viewDetailsButton
      ) {

        viewDetailsButton.addEventListener(
          "click",
          (event) => {

            event.stopPropagation();

          }
        );

      }


      /* ======================================================
         ADD TO MY TRIP
      ====================================================== */

      const addTripButton =
        item.querySelector(
          ".add-trip-btn"
        );


      if (
        addTripButton &&
        mapPlace
      ) {

        addTripButton.addEventListener(
          "click",
          (event) => {

            event.stopPropagation();


            toggleTripPlace(
              mapPlace,
              addTripButton
            );


            refreshMyTripUI();

          }
        );

      }


      /* ======================================================
         SEARCH RESULT CLICK
      ====================================================== */

      item.addEventListener(
        "click",
        () => {

          /*
             Search index record exists,
             but map record is required
             for map navigation.
          */

          if (
            !mapPlace
          ) {

            /*
               No coordinates in places.js.

               Do not break the search.
               The Details link still works.
            */

            if (
              searchInput
            ) {

              searchInput.value =
                searchPlace.name ||
                "";

            }


            if (
              searchSuggestions
            ) {

              searchSuggestions.style.display =
                "none";

            }


            resetSearchKeyboard();

            return;

          }


          /*
             Check marker.
          */

          const marker =
            markers[
              mapPlace.id
            ];


          /*
             If category currently hides
             this marker, make it visible.
          */

          if (
            activeCategory !==
              "all" &&
            mapPlace.category !==
              activeCategory
          ) {

            activeCategory =
              "all";


            categoryButtons.forEach(
              (button) => {

                button.classList.remove(
                  "active"
                );

              }
            );


            const allButton =
              document.querySelector(
                'button.category-btn[data-category="all"]'
              );


            if (
              allButton
            ) {

              allButton.classList.add(
                "active"
              );

            }


            updateMapMarkers();

          }


          /*
             Map zoom.
          */

          map.setView(
            mapPlace.coordinates,
            12,
            {
              animate: true,
            }
          );


          /*
             Open popup.
          */

          if (
            marker
          ) {

            marker.openPopup();

          }


          /*
             Update input.
          */

          if (
            searchInput
          ) {

            searchInput.value =
              searchPlace.name ||
              mapPlace.name ||
              "";

          }


          /*
             Hide suggestions.
          */

          if (
            searchSuggestions
          ) {

            searchSuggestions.style.display =
              "none";

          }


          resetSearchKeyboard();

        }
      );


      searchSuggestions.appendChild(
        item
      );

    }
  );


  searchSuggestions.style.display =
    "block";

}


/* ============================================================
   18. CLEAR SEARCH BUTTON
============================================================ */

if (
  clearSearch
) {

  clearSearch.addEventListener(
    "click",
    () => {

      resetSearch();


      if (
        searchInput
      ) {

        searchInput.focus();

      }

    }
  );

}


/* ============================================================
   19. CLOSE SEARCH WHEN CLICKING OUTSIDE
============================================================ */

document.addEventListener(
  "click",
  (event) => {

    if (
      !event.target.closest(
        ".map-search"
      )
    ) {

      if (
        searchSuggestions
      ) {

        searchSuggestions.style.display =
          "none";

      }


      resetSearchKeyboard();

    }

  }
);


/* ============================================================
   20. SEARCH KEYBOARD NAVIGATION
============================================================ */

if (
  searchInput
) {

  searchInput.addEventListener(
    "keydown",
    (event) => {

      const items =
        searchSuggestions
          ? searchSuggestions.querySelectorAll(
              ".search-suggestion-item"
            )
          : [];


      /*
         Escape
      */

      if (
        event.key ===
        "Escape"
      ) {

        if (
          searchSuggestions
        ) {

          searchSuggestions.style.display =
            "none";

        }


        resetSearchKeyboard();

        return;

      }


      if (
        items.length === 0
      ) {

        return;

      }


      /*
         Arrow Down
      */

      if (
        event.key ===
        "ArrowDown"
      ) {

        event.preventDefault();


        activeSearchIndex++;


        if (
          activeSearchIndex >=
          items.length
        ) {

          activeSearchIndex =
            0;

        }


        updateActiveSearchItem(
          items
        );

      }


      /*
         Arrow Up
      */

      else if (
        event.key ===
        "ArrowUp"
      ) {

        event.preventDefault();


        activeSearchIndex--;


        if (
          activeSearchIndex < 0
        ) {

          activeSearchIndex =
            items.length - 1;

        }


        updateActiveSearchItem(
          items
        );

      }


      /*
         Enter
      */

      else if (
        event.key ===
        "Enter"
      ) {

        if (
          activeSearchIndex >=
          0
        ) {

          event.preventDefault();


          items[
            activeSearchIndex
          ].click();

        }

      }

    }
  );

}


/* ============================================================
   21. UPDATE ACTIVE SEARCH ITEM
============================================================ */

function updateActiveSearchItem(
  items
) {

  items.forEach(
    (item) => {

      item.classList.remove(
        "active"
      );

    }
  );


  const activeItem =
    items[
      activeSearchIndex
    ];


  if (
    activeItem
  ) {

    activeItem.classList.add(
      "active"
    );


    activeItem.scrollIntoView(
      {
        block: "nearest",

        behavior: "smooth",
      }
    );

  }

}


/* ============================================================
   22. RESET SEARCH KEYBOARD INDEX
============================================================ */

function resetSearchKeyboard() {

  activeSearchIndex =
    -1;

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
