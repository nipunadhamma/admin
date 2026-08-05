
/* ============================================================
   LANKAQUEST
   INTERACTIVE TOURIST MAP
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

   DATA:

   Map:
   places.js

   Search:
   data/generated/search-index.json

   CONNECTION:

   searchIndex.id === touristPlaces.id

============================================================ */


/* ============================================================
   1. MAP INITIALIZATION
============================================================ */

const sriLankaCenter = [
  7.8731,
  80.7718
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
      "&copy; OpenStreetMap contributors"
  }
).addTo(map);


/* ============================================================
   3. GLOBAL STATE
============================================================ */

const markers = {};

let activeCategory = "all";

let activeSearchIndex = -1;

/* ============================================================
   MY TRIP STORAGE KEY
============================================================ */

const MY_TRIP_KEY =
  "sriLankaMyTrip";


/* ============================================================
   SEARCH INDEX STATE
============================================================ */

let searchIndex = [];

let searchIndexLoaded = false;

let searchIndexPromise = null;


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

function loadSearchIndex() {

  if (searchIndexPromise) {

    return searchIndexPromise;

  }


  searchIndexPromise =
    fetch(
      "data/generated/search-index.json",
      {
        cache: "no-cache"
      }
    )

    .then(
      (response) => {

        if (!response.ok) {

          throw new Error(
            `Search index failed to load: ${response.status}`
          );

        }

        return response.json();

      }
    )

    .then(
      (data) => {

        if (!Array.isArray(data)) {

          throw new Error(
            "Search index format is invalid."
          );

        }


        searchIndex =
          data.filter(
            (item) =>
              item &&
              item.id &&
              item.type === "attraction" &&
              item.hide !== true
          );


        searchIndexLoaded = true;


        console.log(
          "LankaQuest search index loaded:",
          searchIndex.length
        );


        return searchIndex;

      }
    )

    .catch(
      (error) => {

        searchIndexLoaded = false;


        console.error(
          "LankaQuest search index error:",
          error
        );


        if (searchSuggestions) {

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
*/

loadSearchIndex().catch(
  () => {}
);


/* ============================================================
   7. FIND MAP PLACE BY ID
============================================================ */

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
        place.id === placeId
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

  /* ----------------------------------------------------------
     SAFE SLUG CREATION
  ---------------------------------------------------------- */

  const provinceSlug =
    place.provinceSlug ||
    String(
      place.province || ""
    )
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");


  const districtSlug =
    place.districtSlug ||
    String(
      place.district || ""
    )
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");


  const placeSlug =
    place.slug ||
    place.id ||
    "";


  /* ----------------------------------------------------------
     DETAIL PAGE
  ---------------------------------------------------------- */

  const detailPage =
    provinceSlug &&
    districtSlug &&
    placeSlug

      ? `attractions-generated/${provinceSlug}/${districtSlug}/${placeSlug}.html`

      : "#";


  /* ----------------------------------------------------------
     MY TRIP STATUS
  ---------------------------------------------------------- */

  const isAdded =
    place.id
      ? isPlaceInTrip(place.id)
      : false;


  /* ----------------------------------------------------------
     POPUP
  ---------------------------------------------------------- */

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


        <!-- ==================================================
             VIEW DETAILS
        ================================================== -->

        <a
          href="${detailPage}"
          class="view-details-btn"
        >
          View Details →
        </a>


        <!-- ==================================================
             ADD TO MY TRIP
        ================================================== -->

        <button
          type="button"
          class="popup-add-trip-btn ${isAdded ? "added" : ""}"
          data-place-id="${place.id || ""}"
        >

          ${
            isAdded
              ? "❤️ Added to Trip"
              : "♡ Add to My Trip"
          }

        </button>


      </div>

    </div>

  `;

}


/* ============================================================
   9. CREATE ALL MAP MARKERS
============================================================ */

if (
  Array.isArray(
    touristPlaces
  )
) {

  touristPlaces.forEach(
    (place) => {

      /* ------------------------------------------------------
         Validate place
      ------------------------------------------------------ */

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


      /* ------------------------------------------------------
         Validate coordinates
      ------------------------------------------------------ */

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


      /* ------------------------------------------------------
         Create marker
      ------------------------------------------------------ */

      const marker =
        L.marker(
          place.coordinates
        );


      /* ------------------------------------------------------
         Popup
      ------------------------------------------------------ */

      marker.bindPopup(
        createPopup(
          place
        ),
        {
          maxWidth: 300
        }
      );


      /* ------------------------------------------------------
         Save marker by ID
      ------------------------------------------------------ */

      markers[
        place.id
      ] = marker;


      /* ------------------------------------------------------
         Add marker to map
      ------------------------------------------------------ */

      marker.addTo(
        map
      );

    }
  );


  console.log(
    "LankaQuest map markers created:",
    Object.keys(markers).length
  );

} else {

  console.error(
    "LankaQuest: touristPlaces is not available."
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


      if (!marker) {

        return;

      }


      const categoryMatch =
        activeCategory === "all" ||
        place.category === activeCategory;


      if (categoryMatch) {

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


        if (!category) {

          return;

        }


        activeCategory =
          category;


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


        updateMapMarkers();


        resetSearch();

      }
    );

  }
);


/* ============================================================
   12. RESET SEARCH
============================================================ */

function resetSearch() {

  if (searchInput) {

    searchInput.value = "";

  }


  if (searchSuggestions) {

    searchSuggestions.innerHTML = "";

    searchSuggestions.style.display =
      "none";

  }


  if (clearSearch) {

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
      : [])

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

  if (!searchIndexLoaded) {

    return [];

  }


  return searchIndex.filter(
    (item) => {

      const categoryMatch =
        activeCategory === "all" ||
        item.category === activeCategory;


      if (!categoryMatch) {

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

if (searchInput) {

  searchInput.addEventListener(
    "input",
    async () => {

      const searchText =
        normalizeSearchText(
          searchInput.value
        );


      if (clearSearch) {

        clearSearch.style.display =
          searchText
            ? "block"
            : "none";

      }


      if (!searchText) {

        if (searchSuggestions) {

          searchSuggestions.innerHTML =
            "";

          searchSuggestions.style.display =
            "none";

        }


        resetSearchKeyboard();

        return;

      }


      if (!searchIndexLoaded) {

        try {

          await loadSearchIndex();

        } catch (error) {

          return;

        }

      }


      const results =
        getSearchResults(
          searchText
        );


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

  if (!searchSuggestions) {

    return;

  }


  searchSuggestions.innerHTML =
    "";


  resetSearchKeyboard();


  /* ----------------------------------------------------------
     No results
  ---------------------------------------------------------- */

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


    searchSuggestions.style.display =
      "block";


    return;

  }


  /* ----------------------------------------------------------
     Maximum 6 suggestions
  ---------------------------------------------------------- */

  const limitedResults =
    results.slice(
      0,
      6
    );


  limitedResults.forEach(
    (searchPlace) => {

      const mapPlace =
        getMapPlaceById(
          searchPlace.id
        );


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


      if (viewDetailsButton) {

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

          if (!mapPlace) {

            if (searchInput) {

              searchInput.value =
                searchPlace.name ||
                "";

            }


            if (searchSuggestions) {

              searchSuggestions.style.display =
                "none";

            }


            resetSearchKeyboard();

            return;

          }


          const marker =
            markers[
              mapPlace.id
            ];


          /* --------------------------------------------------
             Make marker visible if category hides it
          -------------------------------------------------- */

          if (
            activeCategory !== "all" &&
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


            if (allButton) {

              allButton.classList.add(
                "active"
              );

            }


            updateMapMarkers();

          }


          /* --------------------------------------------------
             Zoom to destination
          -------------------------------------------------- */

          map.setView(
            mapPlace.coordinates,
            12,
            {
              animate: true
            }
          );


          /* --------------------------------------------------
             Open popup
          -------------------------------------------------- */

          if (marker) {

            marker.openPopup();

          }


          /* --------------------------------------------------
             Update search input
          -------------------------------------------------- */

          if (searchInput) {

            searchInput.value =
              searchPlace.name ||
              mapPlace.name ||
              "";

          }


          /* --------------------------------------------------
             Hide suggestions
          -------------------------------------------------- */

          if (searchSuggestions) {

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

if (clearSearch) {

  clearSearch.addEventListener(
    "click",
    () => {

      resetSearch();


      if (searchInput) {

        searchInput.focus();

      }

    }
  );

}


/* ============================================================
   19. CLOSE SEARCH OUTSIDE CLICK
============================================================ */

document.addEventListener(
  "click",
  (event) => {

    if (
      !event.target.closest(
        ".map-search"
      )
    ) {

      if (searchSuggestions) {

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

if (searchInput) {

  searchInput.addEventListener(
    "keydown",
    (event) => {

      const items =
        searchSuggestions
          ? searchSuggestions.querySelectorAll(
              ".search-suggestion-item"
            )
          : [];


      /* ------------------------------------------------------
         Escape
      ------------------------------------------------------ */

      if (
        event.key ===
        "Escape"
      ) {

        if (searchSuggestions) {

          searchSuggestions.style.display =
            "none";

        }


        resetSearchKeyboard();

        return;

      }


      if (items.length === 0) {

        return;

      }


      /* ------------------------------------------------------
         Arrow Down
      ------------------------------------------------------ */

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

          activeSearchIndex = 0;

        }


        updateActiveSearchItem(
          items
        );

      }


      /* ------------------------------------------------------
         Arrow Up
      ------------------------------------------------------ */

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


      /* ------------------------------------------------------
         Enter
      ------------------------------------------------------ */

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


  if (activeItem) {

    activeItem.classList.add(
      "active"
    );


    activeItem.scrollIntoView(
      {
        block: "nearest",
        behavior: "smooth"
      }
    );

  }

}


/* ============================================================
   22. RESET SEARCH KEYBOARD
============================================================ */

function resetSearchKeyboard() {

  activeSearchIndex = -1;

}





/* ============================================================
   24. GET MY TRIP
============================================================ */

function getMyTrip() {

  const savedTrip =
    localStorage.getItem(
      MY_TRIP_KEY
    );


  if (!savedTrip) {

    return [];

  }


  try {

    const parsedTrip =
      JSON.parse(
        savedTrip
      );


    return Array.isArray(
      parsedTrip
    )
      ? parsedTrip
      : [];

  } catch (error) {

    console.error(
      "Trip data error:",
      error
    );


    return [];

  }

}


/* ============================================================
   25. SAVE MY TRIP
============================================================ */

function saveMyTrip(
  trip
) {

  localStorage.setItem(
    MY_TRIP_KEY,
    JSON.stringify(
      trip
    )
  );

}


/* ============================================================
   26. CHECK PLACE IN MY TRIP
============================================================ */

function isPlaceInTrip(
  placeId
) {

  const trip =
    getMyTrip();


  return trip.some(
    (place) =>
      place.id ===
      placeId
  );

}


/* ============================================================
   27. ADD / REMOVE PLACE FROM MY TRIP
============================================================ */

function toggleTripPlace(
  place,
  button
) {

  let trip =
    getMyTrip();


  const existingIndex =
    trip.findIndex(
      (item) =>
        item.id ===
        place.id
    );


  /* ----------------------------------------------------------
     REMOVE
  ---------------------------------------------------------- */

  if (
    existingIndex !== -1
  ) {

    trip.splice(
      existingIndex,
      1
    );


    saveMyTrip(
      trip
    );


    if (button) {

      button.classList.remove(
        "added"
      );


      button.innerHTML =
        "♡ Add to My Trip";

    }


    updateTripCounter();


    console.log(
      "Removed from trip:",
      place.name
    );


    return;

  }


  /* ----------------------------------------------------------
     ADD
  ---------------------------------------------------------- */

  trip.push({

    id:
      place.id,

    name:
      place.name,

    sinhalaName:
      place.sinhalaName,

    coordinates:
      place.coordinates,

    image:
      place.image,

    category:
      place.category,

    categoryName:
      place.categoryName,

    province:
      place.province,

    district:
      place.district,

    rating:
      place.rating,

    page:
      place.page

  });


  saveMyTrip(
    trip
  );


  if (button) {

    button.classList.add(
      "added"
    );


    button.innerHTML =
      "❤️ Added to Trip";

  }


  updateTripCounter();


  console.log(
    "Added to trip:",
    place.name
  );

}


/* ============================================================
   28. UPDATE TRIP COUNTER
============================================================ */

function updateTripCounter() {

  const trip =
    getMyTrip();


  const counter =
    document.getElementById(
      "tripCounter"
    );


  if (!counter) {

    return;

  }


  counter.textContent =
    trip.length;


  if (
    trip.length ===
    0
  ) {

    counter.style.display =
      "none";

  } else {

    counter.style.display =
      "inline-flex";

  }

}


/* ============================================================
   29. REFRESH MY TRIP UI
============================================================ */

function refreshMyTripUI() {

  updateTripCounter();


  if (!searchSuggestions) {

    return;

  }


  const buttons =
    searchSuggestions.querySelectorAll(
      ".add-trip-btn"
    );


  buttons.forEach(
    (button) => {

      const placeId =
        button.dataset.placeId;


      const isAdded =
        isPlaceInTrip(
          placeId
        );


      if (isAdded) {

        button.classList.add(
          "added"
        );


        button.innerHTML =
          "❤️ Added to Trip";

      } else {

        button.classList.remove(
          "added"
        );


        button.innerHTML =
          "♡ Add to My Trip";

      }

    }
  );

}


/* ============================================================
   30. OPEN MY TRIP PANEL
============================================================ */

function openTripPlanner() {

  if (
    !tripPlannerPanel ||
    !tripPlannerOverlay
  ) {

    return;

  }


  tripPlannerPanel.classList.add(
    "active"
  );


  tripPlannerOverlay.classList.add(
    "active"
  );


  renderMyTrip();

}


/* ============================================================
   31. CLOSE MY TRIP PANEL
============================================================ */

function closeTripPlannerPanel() {

  if (tripPlannerPanel) {

    tripPlannerPanel.classList.remove(
      "active"
    );

  }


  if (tripPlannerOverlay) {

    tripPlannerOverlay.classList.remove(
      "active"
    );

  }

}


/* ============================================================
   32. MY TRIP BUTTON EVENTS
============================================================ */

if (myTripButton) {

  myTripButton.addEventListener(
    "click",
    openTripPlanner
  );

}


if (closeTripPlanner) {

  closeTripPlanner.addEventListener(
    "click",
    closeTripPlannerPanel
  );

}


if (tripPlannerOverlay) {

  tripPlannerOverlay.addEventListener(
    "click",
    closeTripPlannerPanel
  );

}


/* ============================================================
   33. RENDER MY TRIP
============================================================ */

function renderMyTrip() {

  if (
    !tripDestinations ||
    !emptyTripMessage ||
    !tripActions ||
    !tripPlaceCount
  ) {

    return;

  }


  const trip =
    getMyTrip();


  tripDestinations.innerHTML =
    "";


  tripPlaceCount.textContent =
    trip.length;


  /* ----------------------------------------------------------
     Empty
  ---------------------------------------------------------- */

  if (
    trip.length ===
    0
  ) {

    emptyTripMessage.style.display =
      "block";


    tripActions.style.display =
      "none";


    return;

  }


  /* ----------------------------------------------------------
     Has destinations
  ---------------------------------------------------------- */

  emptyTripMessage.style.display =
    "none";


  tripActions.style.display =
    "flex";


  /* ----------------------------------------------------------
     Destination cards
  ---------------------------------------------------------- */

  trip.forEach(
    (place, index) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "trip-destination-card";


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


      const removeButton =
        card.querySelector(
          ".trip-destination-remove"
        );


      if (removeButton) {

        removeButton.addEventListener(
          "click",
          () => {

            removePlaceFromTrip(
              place.id
            );

          }
        );

      }


      tripDestinations.appendChild(
        card
      );

    }
  );

}


/* ============================================================
   34. REMOVE PLACE FROM MY TRIP
============================================================ */

function removePlaceFromTrip(
  placeId
) {

  let trip =
    getMyTrip();


  trip =
    trip.filter(
      (place) =>
        place.id !==
        placeId
    );


  saveMyTrip(
    trip
  );


  updateTripCounter();


  renderMyTrip();


  refreshMyTripUI();

}


/* ============================================================
   35. CLEAR ENTIRE TRIP
============================================================ */

if (clearTripButton) {

  clearTripButton.addEventListener(
    "click",
    () => {

      const confirmed =
        confirm(
          "Are you sure you want to clear your entire trip?"
        );


      if (!confirmed) {

        return;

      }


      saveMyTrip(
        []
      );


      updateTripCounter();


      renderMyTrip();


      refreshMyTripUI();

    }
  );

}


/* ============================================================
   36. EXPLORE DESTINATIONS
============================================================ */

if (exploreDestinationsButton) {

  exploreDestinationsButton.addEventListener(
    "click",
    () => {

      closeTripPlannerPanel();


      if (searchInput) {

        searchInput.focus();

      }

    }
  );

}


/* ============================================================
   37. PLAN MY JOURNEY
============================================================ */

if (planJourneyButton) {

  planJourneyButton.addEventListener(
    "click",
    () => {

      const trip =
        getMyTrip();


      if (
        trip.length ===
        0
      ) {

        alert(
          "Please add at least one destination to your trip."
        );


        return;

      }


      window.location.href =
        "trip-planner.html";

    }
  );

}


/* ============================================================
   38. POPUP → ADD TO MY TRIP
============================================================ */

document.addEventListener(
  "click",
  (event) => {

    const button =
      event.target.closest(
        ".popup-add-trip-btn"
      );


    if (!button) {

      return;

    }


    /* --------------------------------------------------------
       Prevent popup / map click propagation
    -------------------------------------------------------- */

    event.stopPropagation();


    /* --------------------------------------------------------
       Get Place ID
    -------------------------------------------------------- */

    const placeId =
      button.dataset.placeId;


    if (!placeId) {

      console.error(
        "Popup My Trip: place ID missing."
      );


      return;

    }


    /* --------------------------------------------------------
       Find Original Place
    -------------------------------------------------------- */

    const place =
      getMapPlaceById(
        placeId
      );


    if (!place) {

      console.error(
        "Popup My Trip: destination not found:",
        placeId
      );


      return;

    }


    /* --------------------------------------------------------
       Toggle My Trip
    -------------------------------------------------------- */

    toggleTripPlace(
      place,
      button
    );


    /* --------------------------------------------------------
       Refresh UI
    -------------------------------------------------------- */

    refreshMyTripUI();

  }
);


/* ============================================================
   39. INITIALIZE TRIP COUNTER
============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    updateTripCounter();

  }
);


/* ============================================================
   40. INITIALIZE MAP MARKERS
============================================================ */

/*
   Ensure all markers follow
   current active category.

   Default category:
   all
*/

updateMapMarkers();


/* ============================================================
   DEBUG INFORMATION
============================================================ */

console.log(
  "LankaQuest map.js loaded successfully."
);


console.log(
  "Tourist places:",
  Array.isArray(touristPlaces)
    ? touristPlaces.length
    : "touristPlaces NOT FOUND"
);


console.log(
  "Map markers:",
  Object.keys(markers).length
);


/* ============================================================
   END OF MAP.JS
============================================================ */

