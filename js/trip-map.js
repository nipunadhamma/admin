
/* ============================================================
  LankaWayfarer
   TRIP PLANNER MAP

   GOOGLE-MAPS-STYLE JOURNEY MAP

   FEATURES:

       • Selected destination markers
       • Numbered route markers
       • Road-based route
       • Total distance
       • Estimated driving time
       • Destination popups
       • Automatic map fitting
       • Automatic updates
       • Empty-trip handling
       • Invalid-coordinate protection

   IMPORTANT:

   This file does NOT modify:

       trip-planner.js
       trip-planner.css

   It reads the existing temporary planner draft:

       localStorage
       "sriLankaMyTrip"

============================================================ */


/* ============================================================
   ROUTING IMPORTS
============================================================ */

import {

    getRoadRoute,

    formatDistance,

    formatDuration,

    normalizeDestination,

} from "./trip-routing.js";


/* ============================================================
   CONFIGURATION
============================================================ */

const MY_TRIP_KEY =
    "sriLankaMyTrip";


const DEFAULT_CENTER = [
    7.8731,
    80.7718,
];


const DEFAULT_ZOOM =
    7;


const MAP_CONTAINER_ID =
    "tripJourneyMap";


const MAP_UPDATE_INTERVAL =
    1000;


/* ============================================================
   MAP STATE
============================================================ */

let tripMap =
    null;


let routeLayer =
    null;


let markerLayer =
    null;


let lastTripSignature =
    "";


let updateTimer =
    null;


let mapInitialized =
    false;


let routeRequestId =
    0;


/* ============================================================
   DOM ELEMENTS
============================================================ */

let mapContainer =
    null;


/* ============================================================
   READ CURRENT TRIP
============================================================ */

function getCurrentTrip() {

    try {

        const savedTrip =
            localStorage.getItem(
                MY_TRIP_KEY
            );


        if (
            !savedTrip
        ) {

            return [];

        }


        const trip =
            JSON.parse(
                savedTrip
            );


        if (
            !Array.isArray(
                trip
            )
        ) {

            return [];

        }


        return trip;

    } catch (error) {

        console.error(
            "LankaWayfarer Trip Map: unable to read trip data.",
            error
        );


        return [];

    }

}


/* ============================================================
   NORMALIZE TRIP
============================================================ */

function normalizeTrip(
    trip
) {

    if (
        !Array.isArray(
            trip
        )
    ) {

        return [];

    }


    return trip
        .map(
            normalizeDestination
        )
        .filter(Boolean);

}


/* ============================================================
   TRIP SIGNATURE

   Used to detect changes without touching
   trip-planner.js.
============================================================ */

function createTripSignature(
    trip
) {

    return trip
        .map(
            (place) =>
                [
                    place.id,
                    place.name,
                    place.latitude,
                    place.longitude,
                ].join("|")
        )
        .join("||");

}


/* ============================================================
   LOAD LEAFLET CSS
============================================================ */

function loadLeafletCSS() {

    const existing =
        document.querySelector(
            'link[data-lankawayfarer-leaflet="true"]'
        );


    if (
        existing
    ) {

        return;

    }


    const stylesheet =
        document.createElement(
            "link"
        );


    stylesheet.rel =
        "stylesheet";


    stylesheet.href =
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";


    stylesheet.integrity =
        "sha256-p4NxAoJBhIINfQ3mE8kF4ZJmZk9N8Z7ZQZ5V5M5M5M=";


    /*
       The integrity value above may not be
       available for dynamically loaded resources.

       Remove it so the browser does not reject
       the stylesheet when CDN metadata changes.
    */

    stylesheet.removeAttribute(
        "integrity"
    );


    stylesheet.crossOrigin =
        "";


    stylesheet.dataset.lankaquestLeaflet =
        "true";


    document.head.appendChild(
        stylesheet
    );

}


/* ============================================================
   LOAD LEAFLET JAVASCRIPT
============================================================ */

function loadLeaflet() {

    if (
        window.L
    ) {

        return Promise.resolve(
            window.L
        );

    }


    const existing =
        document.querySelector(
            'script[data-lankaquest-leaflet="true"]'
        );


    if (
        existing
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                existing.addEventListener(
                    "load",
                    () => {

                        resolve(
                            window.L
                        );

                    }
                );


                existing.addEventListener(
                    "error",
                    () => {

                        reject(
                            new Error(
                                "Leaflet could not be loaded."
                            )
                        );

                    }
                );

            }
        );

    }


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const script =
                document.createElement(
                    "script"
                );


            script.src =
                "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";


            script.async =
                true;


            script.dataset.lankaquestLeaflet =
                "true";


            script.onload =
                () => {

                    if (
                        window.L
                    ) {

                        resolve(
                            window.L
                        );

                    } else {

                        reject(
                            new Error(
                                "Leaflet loaded but was not available."
                            )
                        );

                    }

                };


            script.onerror =
                () => {

                    reject(
                        new Error(
                            "Unable to load Leaflet."
                        )
                    );

                };


            document.head.appendChild(
                script
            );

        }
    );

}


/* ============================================================
   INITIALIZE MAP
============================================================ */

async function initializeMap() {

    if (
        mapInitialized
    ) {

        return true;

    }


    mapContainer =
        document.getElementById(
            MAP_CONTAINER_ID
        );


    if (
        !mapContainer
    ) {

        console.warn(
          `LankaWayfarer Trip Map: #${MAP_CONTAINER_ID} was not found.`,
        );


        return false;

    }


    try {

        loadLeafletCSS();


        const L =
            await loadLeaflet();


        tripMap =
            L.map(
                mapContainer,
                {
                    zoomControl:
                        true,

                    attributionControl:
                        true,

                    scrollWheelZoom:
                        true,

                    doubleClickZoom:
                        true,

                    dragging:
                        true,

                    touchZoom:
                        true,

                }
            );


        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {

                maxZoom:
                    19,

                attribution:
                    '&copy; OpenStreetMap contributors',

            }
        ).addTo(
            tripMap
        );


        markerLayer =
            L.layerGroup()
                .addTo(
                    tripMap
                );


        routeLayer =
            L.layerGroup()
                .addTo(
                    tripMap
                );


        tripMap.setView(
            DEFAULT_CENTER,
            DEFAULT_ZOOM
        );


        mapInitialized =
            true;


        /*
           Leaflet sometimes calculates its size
           before the container becomes visible.
        */

        setTimeout(
            () => {

                if (
                    tripMap
                ) {

                    tripMap.invalidateSize();

                }

            },
            150
        );


        console.log("LankaWayfarer Trip Map initialized.");


        return true;


    } catch (error) {

        console.error(
            "LankaWayfarer Trip Map initialization failed:",
            error
        );


        showMapError(
            "The journey map could not be loaded. Please refresh the page and try again."
        );


        return false;

    }

}


/* ============================================================
   CREATE NUMBERED MARKER
============================================================ */

function createNumberedIcon(
    number
) {

    const L =
        window.L;


    return L.divIcon(
        {

            className:
                "lankaquest-trip-marker-wrapper",

            html:
                `
                <div class="lankaquest-trip-marker">
                    <span>${number}</span>
                </div>
                `,

            iconSize:
                [42, 52],

            iconAnchor:
                [21, 52],

            popupAnchor:
                [0, -46],

        }
    );

}


/* ============================================================
   CREATE POPUP HTML
============================================================ */

function createPopupHTML(
    place,
    index
) {

    const name =
        escapeHtml(
            place.name ||
            "Destination"
        );


    const district =
        escapeHtml(
            place.district ||
            ""
        );


    const province =
        escapeHtml(
            place.province ||
            ""
        );


    const image =
        escapeHtml(
            place.image ||
            ""
        );


    const locationText =
        [
            district,
            province,
        ]
            .filter(Boolean)
            .join(
                " · "
            );


    return `
        <div class="lankaquest-trip-popup">

            ${
                image
                    ? `
                        <img
                            src="${image}"
                            alt="${name}"
                            class="lankaquest-trip-popup-image"
                            loading="lazy"
                        >
                      `
                    : ""
            }

            <div class="lankaquest-trip-popup-content">

                <span class="lankaquest-trip-popup-number">
                    Stop ${index + 1}
                </span>

                <h4>
                    ${name}
                </h4>

                ${
                    locationText
                        ? `
                            <p>
                                📍 ${locationText}
                            </p>
                          `
                        : ""
                }

            </div>

        </div>
    `;

}


/* ============================================================
   RENDER MARKERS
============================================================ */

function renderMarkers(
    trip
) {

    if (
        !markerLayer ||
        !window.L
    ) {

        return;

    }


    markerLayer.clearLayers();


    trip.forEach(
        (
            place,
            index
        ) => {

            const marker =
                window.L.marker(
                    [
                        place.latitude,
                        place.longitude,
                    ],
                    {
                        icon:
                            createNumberedIcon(
                                index + 1
                            ),

                        title:
                            place.name ||
                            `Stop ${index + 1}`,

                    }
                );


            marker.bindPopup(
                createPopupHTML(
                    place,
                    index
                ),
                {
                    maxWidth:
                        280,

                    closeButton:
                        true,

                }
            );


            marker.addTo(
                markerLayer
            );

        }
    );

}


/* ============================================================
   CLEAR ROUTE
============================================================ */

function clearRoute() {

    if (
        routeLayer
    ) {

        routeLayer.clearLayers();

    }

}


/* ============================================================
   DRAW ROUTE
============================================================ */

async function drawRoute(
    trip
) {

    clearRoute();


    if (
        trip.length < 2
    ) {

        updateRouteSummary(
            null
        );


        return;

    }


    const currentRequestId =
        ++routeRequestId;


    showRouteLoading();


    try {

        const route =
            await getRoadRoute(
                trip
            );


        /*
           Ignore an old request if the user
           changed the trip while routing was
           still in progress.
        */

        if (
            currentRequestId !==
            routeRequestId
        ) {

            return;

        }


        if (
            !route.coordinates ||
            route.coordinates.length === 0
        ) {

            updateRouteSummary(
                null
            );


            return;

        }


        /*
           OSRM returns:

           [longitude, latitude]

           Leaflet expects:

           [latitude, longitude]
        */

        const leafletCoordinates =
            route.coordinates.map(
                (
                    coordinate
                ) => [
                    coordinate[1],
                    coordinate[0],
                ]
            );


        const routeLine =
            window.L.polyline(
                leafletCoordinates,
                {

                    className:
                        "lankaquest-trip-route",

                    weight:
                        6,

                    opacity:
                        0.85,

                    lineJoin:
                        "round",

                    lineCap:
                        "round",

                }
            );


        routeLine.addTo(
            routeLayer
        );


        updateRouteSummary(
            route
        );


        /*
           Fit the map to the complete
           road route.
        */

        const routeBounds =
            routeLine.getBounds();


        if (
            routeBounds.isValid()
        ) {

            tripMap.fitBounds(
                routeBounds,
                {

                    padding:
                        [45, 45],

                    maxZoom:
                        12,

                }
            );

        }


    } catch (error) {

        if (
            currentRequestId !==
            routeRequestId
        ) {

            return;

        }


        console.error(
            "LankaQuest road routing error:",
            error
        );


        updateRouteSummary(
            null,
            error.message
        );

    }

}


/* ============================================================
   FIT MAP TO MARKERS
============================================================ */

function fitMapToTrip(
    trip
) {

    if (
        !tripMap ||
        !window.L ||
        trip.length === 0
    ) {

        return;

    }


    const bounds =
        window.L.latLngBounds(
            trip.map(
                (place) => [
                    place.latitude,
                    place.longitude,
                ]
            )
        );


    if (
        !bounds.isValid()
    ) {

        return;

    }


    if (
        trip.length === 1
    ) {

        tripMap.setView(
            [
                trip[0].latitude,
                trip[0].longitude,
            ],
            12
        );


        return;

    }


    tripMap.fitBounds(
        bounds,
        {

            padding:
                [45, 45],

            maxZoom:
                12,

        }
    );

}


/* ============================================================
   UPDATE MAP
============================================================ */

async function updateTripMap(
    force = false
) {

    if (
        !mapInitialized
    ) {

        const ready =
            await initializeMap();


        if (
            !ready
        ) {

            return;

        }

    }


    const trip =
        normalizeTrip(
            getCurrentTrip()
        );


    const signature =
        createTripSignature(
            trip
        );


    if (
        !force &&
        signature ===
            lastTripSignature
    ) {

        return;

    }


    lastTripSignature =
        signature;


    renderMarkers(
        trip
    );


    clearRoute();


    if (
        trip.length === 0
    ) {

        tripMap.setView(
            DEFAULT_CENTER,
            DEFAULT_ZOOM
        );


        updateRouteSummary(
            null
        );


        showEmptyMapState();


        return;

    }


    hideEmptyMapState();


    /*
       Immediately show all selected
       destinations.

       Route fitting happens after
       routing succeeds.
    */

    fitMapToTrip(
        trip
    );


    await drawRoute(
        trip
    );

}


/* ============================================================
   ROUTE SUMMARY
============================================================ */

function updateRouteSummary(
    route,
    errorMessage = ""
) {

    const distanceElement =
        document.getElementById(
            "tripMapDistance"
        );


    const durationElement =
        document.getElementById(
            "tripMapDuration"
        );


    const statusElement =
        document.getElementById(
            "tripMapRouteStatus"
        );


    if (
        !route
    ) {

        if (
            distanceElement
        ) {

            distanceElement.textContent =
                "—";

        }


        if (
            durationElement
        ) {

            durationElement.textContent =
                "—";

        }


        if (
            statusElement
        ) {

            statusElement.textContent =
                errorMessage ||
                "Select at least two destinations to see the road route.";

            statusElement.classList.toggle(
                "is-error",
                Boolean(
                    errorMessage
                )
            );

        }


        return;

    }


    if (
        distanceElement
    ) {

        distanceElement.textContent =
            formatDistance(
                route.distance
            );

    }


    if (
        durationElement
    ) {

        durationElement.textContent =
            formatDuration(
                route.duration
            );

    }


    if (
        statusElement
    ) {

        statusElement.textContent =
            "Road route calculated successfully.";


        statusElement.classList.remove(
            "is-error"
        );

    }

}


/* ============================================================
   SHOW ROUTE LOADING
============================================================ */

function showRouteLoading() {

    const statusElement =
        document.getElementById(
            "tripMapRouteStatus"
        );


    if (
        statusElement
    ) {

        statusElement.textContent =
            "Calculating road route…";


        statusElement.classList.remove(
            "is-error"
        );

    }

}


/* ============================================================
   MAP EMPTY STATE
============================================================ */

function showEmptyMapState() {

    if (
        mapContainer
    ) {

        mapContainer.classList.add(
            "is-empty"
        );

    }

}


function hideEmptyMapState() {

    if (
        mapContainer
    ) {

        mapContainer.classList.remove(
            "is-empty"
        );

    }

}


/* ============================================================
   MAP ERROR
============================================================ */

function showMapError(
    message
) {

    if (
        !mapContainer
    ) {

        return;

    }


    mapContainer.innerHTML =
        `
        <div class="trip-map-error">
            <div class="trip-map-error-icon">
                🗺️
            </div>

            <strong>
                Journey Map Unavailable
            </strong>

            <p>
                ${escapeHtml(message)}
            </p>
        </div>
        `;

}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )

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
   WATCH TRIP CHANGES

   Existing trip-planner.js saves the selected
   destinations to localStorage.

   Because localStorage does not emit a "storage"
   event in the same browser tab, we also use
   a lightweight polling mechanism.

============================================================ */

function startTripWatcher() {

    if (
        updateTimer
    ) {

        return;

    }


    updateTimer =
        setInterval(
            () => {

                updateTripMap();

            },
            MAP_UPDATE_INTERVAL
        );


    window.addEventListener(
        "storage",
        (event) => {

            if (
                event.key ===
                MY_TRIP_KEY
            ) {

                updateTripMap(
                    true
                );

            }

        }
    );


    window.addEventListener(
        "pageshow",
        () => {

            updateTripMap(
                true
            );

        }
    );
    window.addEventListener(
        "lankaquest-trip-updated",
         () => {
      updateTripMap(true);
    });

}


/* ============================================================
   PUBLIC API
============================================================ */

window.LankaQuestTripMap = {

    init:
        initializeMap,

    update:
        () =>
            updateTripMap(
                true
            ),

    refresh:
        () =>
            updateTripMap(
                true
            ),

    getTrip:
        getCurrentTrip,

};


/* ============================================================
   INITIALIZE
============================================================ */

async function initializeTripMapModule() {

    /*
       Wait until the DOM exists.

       The actual map container will be added
       to trip-planner.html during the integration
       step.
    */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                initializeTripMapModule();

            },
            {
                once:
                    true,
            }
        );


        return;

    }


    mapContainer =
        document.getElementById(
            MAP_CONTAINER_ID
        );


    if (
        !mapContainer
    ) {

        console.log(
          "LankaWayfarer Trip Map module loaded. Waiting for #tripJourneyMap.",
        );


        return;

    }


    await initializeMap();


    await updateTripMap(
        true
    );


    startTripWatcher();

}


/* ============================================================
   START
============================================================ */

initializeTripMapModule();


/* ============================================================
   END TRIP-MAP.JS
============================================================ */

