/* ============================================================
MAP TOGGLE SYSTEM

Features:

🗺️ Open Map
✕ Hide Map
🔄 Leaflet Map Resize Fix
============================================================ */

/* ============================================================

1. MAP TOGGLE ELEMENTS
   ============================================================ */

const mapSection = document.getElementById("mapSection");

const toggleMapButton = document.getElementById("toggleMapButton");

/* ============================================================
2. CHECK REQUIRED ELEMENTS
============================================================ */

if (mapSection && toggleMapButton) {
  
/* ========================================================
   3. OPEN / HIDE MAP
======================================================== */

toggleMapButton.addEventListener(
    "click",
    () => {


        /*
           Map Show / Hide
        */

        mapSection.classList.toggle(
            "hidden"
        );


        /*
           Check Current State
        */

        const isMapHidden =
            mapSection.classList.contains(
                "hidden"
            );


        /*
           Update Button Text
        */

        if (
            isMapHidden
        ) {

            toggleMapButton.innerHTML =
                "🗺️ Open Map";

        }

        else {

            toggleMapButton.innerHTML =
                "✕ Hide Map";


            /*
               Leaflet Map Resize Fix

               Map එක hidden වෙලා තිබිලා
               නැවත open කළාම
               Leaflet map එකේ tiles
               හරියට display කිරීම සඳහා
            */

            setTimeout(
                () => {

                    if (
                        typeof map !==
                        "undefined"
                    ) {

                        map.invalidateSize();

                    }

                },
                100
            );

        }

    }
);

}
