
/* ============================================================
   LANKAQUEST
   TRIP ROUTING MODULE

   PURPOSE:

   Provide road-based routing for the LankaQuest
   Trip Planner map.

   ROUTING ENGINE:

   OSRM
   OpenStreetMap road network

   IMPORTANT:

   This module is independent from:

       trip-planner.js
       trip-planner.css

   It only receives destination coordinates
   and returns route information.

============================================================ */


/* ============================================================
   ROUTING CONFIGURATION
============================================================ */

const OSRM_BASE_URL =
    "https://router.project-osrm.org/route/v1/driving";


/* ============================================================
   REQUEST TIMEOUT
============================================================ */

const ROUTING_TIMEOUT =
    15000;


/* ============================================================
   VALIDATE COORDINATE
============================================================ */

function isValidCoordinate(
    latitude,
    longitude
) {

    const lat =
        Number(latitude);

    const lng =
        Number(longitude);


    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
    ) {

        return false;

    }


    if (
        lat < -90 ||
        lat > 90
    ) {

        return false;

    }


    if (
        lng < -180 ||
        lng > 180
    ) {

        return false;

    }


    return true;

}


/* ============================================================
   NORMALIZE DESTINATION
============================================================ */

function normalizeDestination(
    place
) {

    if (
        !place ||
        typeof place !== "object"
    ) {

        return null;

    }


    let latitude =
        place.latitude;


    let longitude =
        place.longitude;


    /*
       Support existing LankaQuest formats.

       latitude / longitude
       lat / lng
       coordinates: [latitude, longitude]
    */

    if (
        latitude === undefined ||
        latitude === null
    ) {

        latitude =
            place.lat;

    }


    if (
        longitude === undefined ||
        longitude === null
    ) {

        longitude =
            place.lng;

    }


    if (
        (
            latitude === undefined ||
            latitude === null
        ) &&
        Array.isArray(
            place.coordinates
        )
    ) {

        latitude =
            place.coordinates[0];

    }


    if (
        (
            longitude === undefined ||
            longitude === null
        ) &&
        Array.isArray(
            place.coordinates
        )
    ) {

        longitude =
            place.coordinates[1];

    }


    if (
        !isValidCoordinate(
            latitude,
            longitude
        )
    ) {

        return null;

    }


    return {

        id:
            place.id ??
            "",

        name:
            place.name ??
            "Destination",

        latitude:
            Number(latitude),

        longitude:
            Number(longitude),

    };

}


/* ============================================================
   BUILD OSRM COORDINATE STRING

   OSRM expects:

   longitude,latitude;longitude,latitude
============================================================ */

function buildCoordinateString(
    destinations
) {

    return destinations
        .map(
            (destination) =>
                `${destination.longitude},${destination.latitude}`
        )
        .join(";");

}


/* ============================================================
   FORMAT DISTANCE
============================================================ */

function formatDistance(
    meters
) {

    if (
        !Number.isFinite(
            Number(meters)
        )
    ) {

        return "—";

    }


    const distance =
        Number(meters);


    if (
        distance < 1000
    ) {

        return (
            Math.round(
                distance
            ) +
            " m"
        );

    }


    return (
        (
            distance / 1000
        ).toFixed(1) +
        " km"
    );

}


/* ============================================================
   FORMAT DURATION
============================================================ */

function formatDuration(
    seconds
) {

    if (
        !Number.isFinite(
            Number(seconds)
        )
    ) {

        return "—";

    }


    const totalMinutes =
        Math.round(
            Number(seconds) /
            60
        );


    if (
        totalMinutes < 60
    ) {

        return (
            totalMinutes +
            " min"
        );

    }


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    if (
        minutes === 0
    ) {

        return (
            hours +
            " hr"
        );

    }


    return (
        hours +
        " hr " +
        minutes +
        " min"
    );

}


/* ============================================================
   FETCH ROUTE

   Returns:

       {
           coordinates,
           distance,
           duration,
           legs
       }

============================================================ */

async function getRoadRoute(
    destinations
) {

    if (
        !Array.isArray(
            destinations
        )
    ) {

        throw new Error(
            "Routing destinations must be an array."
        );

    }


    /*
       A route requires at least
       two destinations.
    */

    if (
        destinations.length < 2
    ) {

        return {

            success:
                true,

            coordinates:
                [],

            distance:
                0,

            duration:
                0,

            legs:
                [],

        };

    }


    const normalized =
        destinations
            .map(
                normalizeDestination
            )
            .filter(Boolean);


    if (
        normalized.length !==
        destinations.length
    ) {

        throw new Error(
            "One or more destinations do not contain valid coordinates."
        );

    }


    const coordinateString =
        buildCoordinateString(
            normalized
        );


    const requestUrl =
        `${OSRM_BASE_URL}/${coordinateString}` +
        "?overview=full" +
        "&geometries=geojson" +
        "&steps=false";


    const controller =
        new AbortController();


    const timeout =
        setTimeout(
            () => {

                controller.abort();

            },
            ROUTING_TIMEOUT
        );


    try {

        const response =
            await fetch(
                requestUrl,
                {
                    method:
                        "GET",

                    headers: {
                        "Accept":
                            "application/json",
                    },

                    signal:
                        controller.signal,
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `Routing service returned HTTP ${response.status}.`
            );

        }


        const data =
            await response.json();


        if (
            !data ||
            data.code !==
                "Ok"
        ) {

            throw new Error(
                data?.message ||
                "Unable to calculate the road route."
            );

        }


        const route =
            data.routes?.[0];


        if (
            !route
        ) {

            throw new Error(
                "No road route was found between the selected destinations."
            );

        }


        return {

            success:
                true,

            coordinates:
                route.geometry?.coordinates ||
                [],

            distance:
                Number(
                    route.distance || 0
                ),

            duration:
                Number(
                    route.duration || 0
                ),

            legs:
                Array.isArray(
                    route.legs
                )
                    ? route.legs
                    : [],

        };


    } catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {

            throw new Error(
                "The routing service took too long to respond. Please try again."
            );

        }


        throw error;


    } finally {

        clearTimeout(
            timeout
        );

    }

}


/* ============================================================
   PUBLIC API
============================================================ */

export {

    getRoadRoute,

    formatDistance,

    formatDuration,

    normalizeDestination,

};

