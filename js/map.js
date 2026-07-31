/* ============================================================
   LankaQuest
   Interactive Tourist Map

   Version 01

   Features:
   ✅ Leaflet Map
   ✅ Destination Markers
   ✅ Popup

============================================================ */

/* ============================================================
   CHECK DATABASE
============================================================ */

console.log("MAP JS LOADED");

if (typeof touristPlaces === "undefined") {
  console.error("touristPlaces database not found");
} else {
  console.log("Tourist Places:", touristPlaces.length);
}

/* ============================================================
   INITIALIZE MAP
============================================================ */

document.addEventListener(
  "DOMContentLoaded",

  () => {
    const mapContainer = document.getElementById("map");

    if (!mapContainer) {
      console.error("Map container missing");

      return;
    }

    const map = L.map("map");

    map.setView(
      [7.8731, 80.7718],

      7,
    );

    L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",

      {
        maxZoom: 19,

        attribution: "&copy; OpenStreetMap contributors",
      },
    ).addTo(map);

    /* ============================================================
   CREATE MARKERS
============================================================ */

    touristPlaces.forEach((place) => {
      const marker = L.marker(place.coordinates)

        .addTo(map);

      marker.bindPopup(`


<div class="tourist-popup">


<h3>
📍 ${place.name}
</h3>


<p>
${place.shortDescription}
</p>


<p>
⭐ ${place.rating}
</p>


<a href="${place.page}">
View Details →
</a>


</div>


`);
    });

    console.log("MAP READY WITH MARKERS");
  },
);
