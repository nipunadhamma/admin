/* ============================================================
   LANKAQUEST
   ATTRACTIONS SYSTEM

   FIREBASE VERSION


   FLOW:

   Tourist Login

        ↓

   Firebase Authentication

        ↓

   UID

        ↓

   Firestore

        ↓

   lankaQuestTouristTrips

        ↓

   destinations[]
============================================================ */

/* ============================================================
   FIREBASE IMPORT
============================================================ */

import { auth, db } from "./firebase-config.js";
console.log("Firebase Auth:", auth);

console.log("Current Firebase User:", auth.currentUser);

console.log("Firestore:", db);
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ============================================================
   DOM ELEMENTS
============================================================ */

const attractionSearch = document.getElementById("attractionSearch");

const provinceFilter = document.getElementById("provinceFilter");

const provinceCards = document.querySelectorAll(".province-card");

const noProvinceResults = document.getElementById("noProvinceResults");

const mobileMenuButton = document.getElementById("mobileMenuButton");

const mainNavigation = document.getElementById("mainNavigation");

const myTripButton = document.getElementById("myTripButton");

const tripCounter = document.getElementById("tripCounter");

/* ============================================================
   FIRESTORE
============================================================ */

const TRIP_COLLECTION = "lankaQuestTouristTrips";

/* ============================================================
   FILTER STATE
============================================================ */

let currentProvince = "all";

let currentSearch = "";

/* ============================================================
   GET FIREBASE TRIP
============================================================ */

async function getAttractionsTrip() {
  const user = auth.currentUser;

  if (!user) {
    return [];
  }

  try {
    const tripRef = doc(
      db,

      TRIP_COLLECTION,

      user.uid,
    );

    const tripSnap = await getDoc(tripRef);

    if (!tripSnap.exists()) {
      return [];
    }

    const data = tripSnap.data();

    return Array.isArray(data.destinations) ? data.destinations : [];
  } catch (error) {
    console.error(
      "Firebase trip loading error:",

      error,
    );

    return [];
  }
}

/* ============================================================
   UPDATE TRIP COUNTER
============================================================ */

async function updateAttractionsTripCounter() {
  if (!tripCounter) {
    return;
  }

  const trip = await getAttractionsTrip();

  tripCounter.textContent = trip.length;
}

/* ============================================================
   FILTER PROVINCES
============================================================ */

function filterProvinces() {
  let visibleCount = 0;

  provinceCards.forEach((card) => {
    const province = card.dataset.province || "";

    const searchData = (card.dataset.search || "").toLowerCase();

    const provinceMatch =
      currentProvince === "all" || province === currentProvince;

    const searchMatch = !currentSearch || searchData.includes(currentSearch);

    const show = provinceMatch && searchMatch;

    if (show) {
      card.style.display = "";

      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  if (noProvinceResults) {
    noProvinceResults.hidden = visibleCount !== 0;
  }
}

/* ============================================================
   PROVINCE PAGE NAVIGATION
============================================================ */

if (provinceFilter) {
  const filterButtons = provinceFilter.querySelectorAll(
    ".province-filter-button",
  );

  const provincePages = {
    western: "western-province.html",

    central: "central-province.html",

    southern: "southern-province.html",

    northern: "northern-province.html",

    eastern: "eastern-province.html",

    "north-central": "north-central-province.html",

    "north-western": "north-western-province.html",

    uva: "uva-province.html",

    sabaragamuwa: "sabaragamuwa-province.html",
  };

  filterButtons.forEach((button) => {
    button.addEventListener(
      "click",

      () => {
        const province = button.dataset.province || "all";

        if (province === "all") {
          window.location.href = "attractions.html";

          return;
        }

        const page = provincePages[province];

        if (page) {
          window.location.href = "attractions/" + page;
        }
      },
    );
  });
}

/* ============================================================
   SEARCH
============================================================ */

if (attractionSearch) {
  attractionSearch.addEventListener(
    "input",

    (event) => {
      currentSearch = event.target.value

        .trim()

        .toLowerCase();

      filterProvinces();
    },
  );
}

/* ============================================================
   MOBILE MENU
============================================================ */

if (mobileMenuButton && mainNavigation) {
  mobileMenuButton.addEventListener(
    "click",

    () => {
      const open = mainNavigation.classList.toggle("mobile-navigation-open");

      mobileMenuButton.setAttribute(
        "aria-expanded",

        open ? "true" : "false",
      );
    },
  );
}

/* ============================================================
   MY TRIP BUTTON
============================================================ */

if (myTripButton) {
  myTripButton.addEventListener(
    "click",

    () => {
      window.location.href = "trip-planner.html";
    },
  );
}

/* ============================================================
   INITIALIZE
============================================================ */

document.addEventListener(
  "DOMContentLoaded",

  async () => {
    await updateAttractionsTripCounter();

    filterProvinces();

    console.log("LankaQuest Attractions Firebase Loaded");
  },
);
