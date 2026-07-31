/* ============================================================
   LANKAQUEST
   PROVINCE GUIDE

   FIREBASE VERSION

   FLOW:

   Tourist Login
        ↓
   Add Attraction
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

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ============================================================
   FIRESTORE COLLECTION
============================================================ */

const TRIP_COLLECTION = "lankaQuestTouristTrips";

/* ============================================================
   GET CURRENT USER
============================================================ */

function getFirebaseUser() {
  return auth.currentUser || null;
}

/* ============================================================
   GET TOURIST TRIP
============================================================ */

async function getProvinceGuideTrip() {
  const user = getFirebaseUser();

  if (!user) {
    console.warn("Tourist not logged in.");

    return [];
  }

  try {
    const tripRef = doc(db, TRIP_COLLECTION, user.uid);

    const tripSnap = await getDoc(tripRef);

    if (!tripSnap.exists()) {
      return [];
    }

    const data = tripSnap.data();

    return Array.isArray(data.destinations) ? data.destinations : [];
  } catch (error) {
    console.error("Get trip error:", error);

    return [];
  }
}

/* ============================================================
   ADD ATTRACTION TO MY TRIP
============================================================ */

async function addAttractionToMyTrip(attraction) {
  const user = getFirebaseUser();

  if (!user) {
    alert("Please login before adding destinations.");

    window.location.href = "login.html";

    return false;
  }

  try {
    const tripRef = doc(
      db,

      TRIP_COLLECTION,

      user.uid,
    );

    const currentTrip = await getProvinceGuideTrip();

    const alreadyAdded = currentTrip.some(
      (place) => String(place.id) === String(attraction.id),
    );

    if (alreadyAdded) {
      showProvinceGuideMessage(
        "This attraction is already in your trip.",

        "info",
      );

      return false;
    }

    await setDoc(
      tripRef,

      {
        touristId: user.uid,

        destinations: arrayUnion(attraction),

        updatedAt: serverTimestamp(),
      },

      {
        merge: true,
      },
    );

    updateProvinceTripCounter();

    showProvinceGuideMessage(
      "✓ Attraction added to My Trip.",

      "success",
    );

    return true;
  } catch (error) {
    console.error(
      "Add attraction error:",

      error,
    );

    showProvinceGuideMessage(
      "Unable to add destination.",

      "error",
    );

    return false;
  }
}

/* ============================================================
   UPDATE TRIP COUNTER
============================================================ */

async function updateProvinceTripCounter() {
  const counter = document.getElementById("provinceTripCounter");

  if (!counter) {
    return;
  }

  const trip = await getProvinceGuideTrip();

  counter.textContent = trip.length;
}

/* ============================================================
   MESSAGE BOX
============================================================ */

function showProvinceGuideMessage(
  message,

  type = "info",
) {
  let box = document.getElementById("provinceGuideMessage");

  if (!box) {
    box = document.createElement("div");

    box.id = "provinceGuideMessage";

    box.className = "province-guide-message";

    document.body.appendChild(box);
  }

  box.className = "province-guide-message " + type;

  box.textContent = message;

  box.classList.add("show");

  setTimeout(
    () => {
      box.classList.remove("show");
    },

    2500,
  );
}

/* ============================================================
   MY TRIP BUTTON
============================================================ */

function initProvinceTripButton() {
  const button = document.getElementById("provinceMyTripButton");

  if (!button) {
    return;
  }

  button.addEventListener(
    "click",

    () => {
      window.location.href = "../trip-planner.html";
    },
  );
}

/* ============================================================
   ADD BUTTONS
============================================================ */

/* ============================================================
   LANKAQUEST
   ATTRACTION TRIP BUTTON SYSTEM

   Firebase First Architecture

   Responsibility:

   ✅ Button Click Detection
   ✅ Prepare Destination Data
   ✅ Send To Trip State Manager

   ❌ No localStorage
   ❌ No database handling here

============================================================ */


/* ============================================================
   INITIALIZE ATTRACTION BUTTONS
============================================================ */

function initAttractionTripButtons(){


    const buttons =

        document.querySelectorAll(
            ".attraction-trip-button"
        );



    if(buttons.length === 0){

        console.log(
            "No attraction trip buttons found"
        );

        return;

    }




    buttons.forEach(button=>{


        button.addEventListener(

            "click",

            async()=>{



                const attraction = {


                    id:

                    button.dataset.id || "",



                    name:

                    button.dataset.name || "Attraction",



                    district:

                    button.dataset.district || "",



                    province:

                    button.dataset.province || "",



                    category:

                    button.dataset.category || "Attraction",



                    image:

                    button.dataset.image || "",



                    rating:

                    button.dataset.rating || "N/A"



                };





                console.log(

                    "Selected Attraction:",

                    attraction

                );





                /*
                    Send to Trip Manager

                    trip-state.js

                */


                if(
                    typeof addToTrip === "function"
                ){


                    await addToTrip(
                        attraction
                    );


                }

                else{


                    console.error(

                        "Trip manager not loaded"

                    );


                }



            }

        );


    });



}




/* ============================================================
   INITIALIZE AFTER PAGE LOAD
============================================================ */


document.addEventListener(

"DOMContentLoaded",

()=>{


    initAttractionTripButtons();


}

);

/* ============================================================
   INITIALIZE
============================================================ */

document.addEventListener(
  "DOMContentLoaded",

  async () => {
    await updateProvinceTripCounter();

    initProvinceTripButton();

    initAttractionTripButtons();

    console.log("LankaQuest Province Guide Firebase Loaded");
  },
);
