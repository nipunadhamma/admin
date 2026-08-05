
/* ============================================================
   LANKAWAYFARER
   3D SRI LANKA TOURIST MAP

   IMPORTANT:

   This module is independent from:

       js/map.js

   Existing Leaflet map functionality is NOT changed.

   Destination source:

       window.touristPlaces

   from:

       js/places.js

   My Trip:

       Uses the existing My Trip system
       from js/map.js

   Existing functions used:

       getMyTrip()
       isPlaceInTrip()
       toggleTripPlace()
       refreshMyTripUI()
============================================================ */


/* ============================================================
   1. DOM ELEMENTS
============================================================ */

const open3DMapButton =
  document.getElementById(
    "open3DMapButton"
  );


const close3DMapButton =
  document.getElementById(
    "close3DMapButton"
  );


const reset3DMapButton =
  document.getElementById(
    "reset3DMapButton"
  );


const map3DSection =
  document.getElementById(
    "map3DSection"
  );


const map3DContainer =
  document.getElementById(
    "map3D"
  );


/* ============================================================
   2. 3D MAP STATE
============================================================ */

let map3D = null;

let map3DInitialized =
  false;

let map3DMarkers = [];


/* ============================================================
   3. SRI LANKA DEFAULT VIEW
============================================================ */

const SRI_LANKA_3D_VIEW = {

  center: [
    80.7718,
    7.8731
  ],

  zoom: 7.2,

  pitch: 52,

  bearing: -12,

};


/* ============================================================
   4. ESCAPE HTML
============================================================ */

function escapeMap3DHTML(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


/* ============================================================
   5. GET TOURIST PLACES
============================================================ */

function get3DTouristPlaces() {

  if (
    !Array.isArray(
      window.touristPlaces
    )
  ) {

    console.warn(
      "LankaWayfarer 3D Map: touristPlaces not available."
    );

    return [];

  }


  return window.touristPlaces.filter(
    (place) => {

      return (

        place &&

        place.id &&

        Array.isArray(
          place.coordinates
        ) &&

        place.coordinates.length === 2

      );

    }
  );

}


/* ============================================================
   6. CREATE DESTINATION DETAIL PAGE
============================================================ */

function get3DDetailPage(
  place
) {

  /*
     Existing explicit slugs
     are preferred.
  */

  const provinceSlug =
    place.provinceSlug ||

    String(
      place.province || ""
    )

      .trim()

      .toLowerCase()

      .replace(
        /\s+/g,
        "-"
      )

      .replace(
        /[^a-z0-9-]/g,
        ""
      );


  const districtSlug =
    place.districtSlug ||

    String(
      place.district || ""
    )

      .trim()

      .toLowerCase()

      .replace(
        /\s+/g,
        "-"
      )

      .replace(
        /[^a-z0-9-]/g,
        ""
      );


  const placeSlug =
    place.slug ||
    place.id ||
    "";


  /*
     Only create the path when
     all required values exist.
  */

  if (
    !provinceSlug ||
    !districtSlug ||
    !placeSlug
  ) {

    return "#";

  }


  return (
    `attractions-generated/` +
    `${provinceSlug}/` +
    `${districtSlug}/` +
    `${placeSlug}.html`
  );

}


/* ============================================================
   7. CREATE 3D POPUP
============================================================ */

function create3DPopup(
  place
) {

  const name =
    escapeMap3DHTML(
      place.name
    );


  const sinhalaName =
    escapeMap3DHTML(
      place.sinhalaName
    );


  const description =
    escapeMap3DHTML(
      place.shortDescription
    );


  const rating =
    escapeMap3DHTML(
      place.rating || "N/A"
    );


  const image =
    escapeMap3DHTML(
      place.image || ""
    );


  const province =
    escapeMap3DHTML(
      place.province || ""
    );


  const district =
    escapeMap3DHTML(
      place.district || ""
    );


  const detailPage =
    get3DDetailPage(
      place
    );


  const safeDetailPage =
    escapeMap3DHTML(
      detailPage
    );


  /*
     Existing My Trip status.

     IMPORTANT:

     Do NOT create another
     localStorage system here.

     Use the existing system
     from map.js.
  */

  let isAdded = false;


  if (
    typeof isPlaceInTrip ===
    "function"
  ) {

    isAdded =
      isPlaceInTrip(
        place.id
      );

  }


  return `

    <div class="map-3d-popup">


      ${
        image
          ? `

            <img
              src="${image}"
              alt="${name}"
              class="map-3d-popup-image"
              loading="lazy"
            >

          `
          : ""
      }


      <h3>

        📍 ${name}

      </h3>


      ${
        sinhalaName
          ? `

            <p
              class="map-3d-popup-sinhala"
            >

              ${sinhalaName}

            </p>

          `
          : ""
      }


      ${
        district || province
          ? `

            <p>

              📍

              ${district}

              ${
                district && province
                  ? " · "
                  : ""
              }

              ${province}

            </p>

          `
          : ""
      }


      ${
        description
          ? `

            <p>

              ${description}

            </p>

          `
          : ""
      }


      <div
        class="map-3d-popup-rating"
      >

        ⭐ ${rating}

      </div>


      <!-- ====================================================
           VIEW DETAILS
      ==================================================== -->

      <a
        href="${safeDetailPage}"
        class="map-3d-popup-link"
      >

        View Details →

      </a>


      <!-- ====================================================
           ADD TO MY TRIP
      ==================================================== -->

      <button
        type="button"
        class="map-3d-popup-add-trip ${
          isAdded
            ? "added"
            : ""
        }"
        data-place-id="${escapeMap3DHTML(
          place.id
        )}"
      >

        ${
          isAdded
            ? "❤️ Added to Trip"
            : "♡ Add to My Trip"
        }

      </button>


    </div>

  `;

}


/* ============================================================
   8. CREATE DESTINATION MARKER
============================================================ */

function create3DMarker(
  place
) {

  const markerElement =
    document.createElement(
      "div"
    );


  markerElement.className =
    "map-3d-marker";


  if (
    place.featured
  ) {

    markerElement.classList.add(
      "featured"
    );

  }


  markerElement.innerHTML = `

    <span>

      📍

    </span>

  `;


  markerElement.title =
    place.name ||
    "Destination";


  return markerElement;

}


/* ============================================================
   9. ADD DESTINATION MARKERS
============================================================ */

function add3DDestinationMarkers() {

  if (!map3D) {

    return;

  }


  /*
     Remove existing markers.
  */

  map3DMarkers.forEach(
    (marker) => {

      marker.remove();

    }
  );


  map3DMarkers = [];


  const places =
    get3DTouristPlaces();


  places.forEach(
    (place) => {

      const coordinates =
        place.coordinates;


      /*
         places.js:

         [latitude, longitude]

         MapLibre:

         [longitude, latitude]
      */

      const longitude =
        Number(
          coordinates[1]
        );


      const latitude =
        Number(
          coordinates[0]
        );


      if (
        !Number.isFinite(
          longitude
        ) ||

        !Number.isFinite(
          latitude
        )
      ) {

        console.warn(
          "Invalid 3D coordinates:",
          place
        );

        return;

      }


      /*
         Create marker element.
      */

      const markerElement =
        create3DMarker(
          place
        );


      /*
         Create popup.
      */

      const popup =
        new maplibregl.Popup({

          offset: 25,

          maxWidth:
            "320px",

        })

          .setHTML(
            create3DPopup(
              place
            )
          );


      /*
         Create MapLibre marker.
      */

      const marker =
        new maplibregl.Marker({

          element:
            markerElement,

          anchor:
            "bottom",

        })

          .setLngLat([
            longitude,
            latitude
          ])

          .setPopup(
            popup
          )

          .addTo(
            map3D
          );


      /*
         Save marker.
      */

      map3DMarkers.push(
        marker
      );

    }
  );


  console.log(
    "LankaWayfarer 3D destination markers loaded:",
    map3DMarkers.length
  );

}


/* ============================================================
   10. 3D POPUP → ADD TO MY TRIP
============================================================ */

document.addEventListener(
  "click",
  (event) => {

    const button =
      event.target.closest(
        ".map-3d-popup-add-trip"
      );


    if (
      !button
    ) {

      return;

    }


    /*
       Prevent popup/map click
       propagation.
    */

    event.stopPropagation();


    /*
       Get destination ID.
    */

    const placeId =
      button.dataset.placeId;


    if (
      !placeId
    ) {

      console.error(
        "3D Popup My Trip: place ID missing."
      );

      return;

    }


    /*
       Get original destination
       from places.js.
    */

    const places =
      get3DTouristPlaces();


    const place =
      places.find(
        (item) =>
          item.id ===
          placeId
      );


    if (
      !place
    ) {

      console.error(
        "3D Popup My Trip: destination not found:",
        placeId
      );

      return;

    }


    /*
       Use existing My Trip system.
    */

    if (
      typeof toggleTripPlace !==
      "function"
    ) {

      console.error(
        "3D Map: toggleTripPlace() is not available."
      );

      return;

    }


    toggleTripPlace(
      place,
      button
    );


    /*
       Refresh existing
       My Trip UI.
    */

    if (
      typeof refreshMyTripUI ===
      "function"
    ) {

      refreshMyTripUI();

    }


    /*
       Refresh the current
       popup button text.

       This is useful because
       MapLibre popup HTML is
       separate from the main map.
    */

    const added =
      typeof isPlaceInTrip ===
      "function"
        ? isPlaceInTrip(
            place.id
          )
        : false;


    button.classList.toggle(
      "added",
      added
    );


    button.innerHTML =
      added
        ? "❤️ Added to Trip"
        : "♡ Add to My Trip";


    console.log(
      added
        ? "3D Map: Added to trip:"
        : "3D Map: Removed from trip:",
      place.name
    );

  }
);


/* ============================================================
   11. INITIALIZE 3D MAP
============================================================ */

function initialize3DMap() {

  if (
    map3DInitialized
  ) {

    return;

  }


  if (
    !map3DContainer
  ) {

    console.error(
      "LankaWayfarer 3D Map: map3D container not found."
    );

    return;

  }


  if (
    typeof maplibregl ===
    "undefined"
  ) {

    show3DMapError(
      "The 3D map library could not be loaded. Please check your internet connection and try again."
    );

    return;

  }


  try {

    map3D =
      new maplibregl.Map({

        container:
          "map3D",

        style:
          "https://tiles.openfreemap.org/styles/liberty",

        center:
          SRI_LANKA_3D_VIEW.center,

        zoom:
          SRI_LANKA_3D_VIEW.zoom,

        pitch:
          SRI_LANKA_3D_VIEW.pitch,

        bearing:
          SRI_LANKA_3D_VIEW.bearing,

        antialias:
          true,

        dragRotate:
          true,

        touchZoomRotate:
          true,

        cooperativeGestures:
          false,

      });


    /*
       Navigation controls.
    */

    map3D.addControl(

      new maplibregl.NavigationControl({

        visualizePitch:
          true,

        showCompass:
          true,

      }),

      "top-right"

    );


    /*
       Map loaded.
    */

    map3D.on(
      "load",
      () => {

        try {

          if (
            typeof map3D.setProjection ===
            "function"
          ) {

            map3D.setProjection({

              type:
                "globe",

            });

          }

        } catch (
          projectionError
        ) {

          console.warn(
            "3D globe projection could not be enabled:",
            projectionError
          );

        }


        /*
           Add destination markers.
        */

        add3DDestinationMarkers();


        map3DInitialized =
          true;


        console.log(
          "LankaWayfarer 3D map initialized."
        );

      }
    );


    map3D.on(
      "error",
      (event) => {

        console.warn(
          "LankaWayfarer 3D map error:",
          event
        );

      }
    );


  } catch (
    error
  ) {

    console.error(
      "LankaWayfarer 3D map initialization failed:",
      error
    );


    show3DMapError(
      "The 3D map could not be initialized on this device. Please make sure hardware acceleration / WebGL is enabled."
    );

  }

}


/* ============================================================
   12. SHOW MAP ERROR
============================================================ */

function show3DMapError(
  message
) {

  if (
    !map3DContainer
  ) {

    return;

  }


  map3DContainer.innerHTML = `

    <div class="map-3d-error">

      <div class="map-3d-error-card">

        <div
          style="
            font-size:42px;
            margin-bottom:12px;
          "
        >

          🌍

        </div>


        <h3>

          3D Map Unavailable

        </h3>


        <p>

          ${escapeMap3DHTML(
            message
          )}

        </p>

      </div>

    </div>

  `;

}


/* ============================================================
   13. OPEN 3D MAP
============================================================ */

function open3DMap() {

  if (
    !map3DSection
  ) {

    return;

  }


  map3DSection.classList.add(
    "active"
  );


  map3DSection.setAttribute(
    "aria-hidden",
    "false"
  );


  /*
     Initialize only when opened.
  */

  if (
    !map3DInitialized
  ) {

    initialize3DMap();

  }


  /*
     Scroll to 3D map.
  */

  setTimeout(
    () => {

      map3DSection.scrollIntoView({

        behavior:
          "smooth",

        block:
          "start",

      });


      /*
         MapLibre needs resize
         after becoming visible.
      */

      if (
        map3D
      ) {

        map3D.resize();

      }

    },
    100
  );

}


/* ============================================================
   14. CLOSE 3D MAP
============================================================ */

function close3DMap() {

  if (
    !map3DSection
  ) {

    return;

  }


  map3DSection.classList.remove(
    "active"
  );


  map3DSection.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* ============================================================
   15. RESET 3D MAP
============================================================ */

function reset3DMap() {

  if (
    !map3D
  ) {

    return;

  }


  map3D.flyTo({

    center:
      SRI_LANKA_3D_VIEW.center,

    zoom:
      SRI_LANKA_3D_VIEW.zoom,

    pitch:
      SRI_LANKA_3D_VIEW.pitch,

    bearing:
      SRI_LANKA_3D_VIEW.bearing,

    duration:
      1200,

    essential:
      true,

  });

}


/* ============================================================
   16. BUTTON EVENTS
============================================================ */

if (
  open3DMapButton
) {

  open3DMapButton.addEventListener(
    "click",
    open3DMap
  );

}


if (
  close3DMapButton
) {

  close3DMapButton.addEventListener(
    "click",
    close3DMap
  );

}


if (
  reset3DMapButton
) {

  reset3DMapButton.addEventListener(
    "click",
    reset3DMap
  );

}


/* ============================================================
   17. WINDOW RESIZE
============================================================ */

window.addEventListener(
  "resize",
  () => {

    if (
      map3D &&

      map3DSection &&

      map3DSection.classList.contains(
        "active"
      )
    ) {

      map3D.resize();

    }

  }
);


/* ============================================================
   18. INITIAL LOG
============================================================ */

console.log(
  "LankaWayfarer 3D Map module loaded."
);


/* ============================================================
   END OF 3D MAP JS
============================================================ */

