/* ============================================================
LANKAQUEST
TRIP PLANNER

FIREBASE FIRST ARCHITECTURE

FLOW:

Tourist
↓
Trip Planner
↓
Select Destinations
↓
Add Travel Details
↓
Firebase Authentication
↓
Tourist Profile Check
↓
Firestore
lankaQuestTouristTrips/{tripId}
↓
quotation-request.html?trip={tripId}
============================================================ */

/* ============================================================
FIREBASE IMPORTS
============================================================ */

import {
auth,
db,
} from "./firebase-config.js";

import {
onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
collection,
addDoc,
getDoc,
doc,
serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ============================================================

1. STORAGE KEY

IMPORTANT:

This is intentionally preserved.

The map / My Trip system currently uses this key
to maintain selected destinations.

============================================================ */

const MY_TRIP_KEY =
"sriLankaMyTrip";

/* ============================================================
2. TRIP PLANNER DATA KEY

Existing UI state is preserved.

Final submitted trip is saved to Firestore.

============================================================ */

const TRIP_PLANNER_DATA_KEY =
"sriLankaTripPlannerData";

/* ============================================================
3. FIRESTORE COLLECTION
============================================================ */

const TRIP_COLLECTION =
"lankaQuestTouristTrips";

/* ============================================================
4. GET MY TRIP

IMPORTANT:

This is the original destination logic.

Do NOT change this to window.sriLankaMyTrip.

The actual destination array is stored as JSON
inside localStorage.

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


const trip =
  JSON.parse(
    savedTrip
  );


if (
  !Array.isArray(trip)
) {

  return [];

}


return trip;


} catch (error) {


console.error(
  "Trip data error:",
  error
);


return [];


}

}

/* ============================================================
5. SAVE MY TRIP

Existing destination system preserved.

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
6. DOM ELEMENTS
============================================================ */

const plannerDestinations =
document.getElementById(
"plannerDestinations"
);

const plannerEmptyState =
document.getElementById(
"plannerEmptyState"
);

const plannerPlaceCount =
document.getElementById(
"plannerPlaceCount"
);

const summaryPlaceCount =
document.getElementById(
"summaryPlaceCount"
);

/* ============================================================
7. RENDER DESTINATIONS

Original destination rendering preserved.

============================================================ */

function renderPlannerDestinations() {

const trip =
getMyTrip();

/*
Clear old cards
*/

if (
plannerDestinations
) {


plannerDestinations.innerHTML =
  "";


}

/*
Update counters
*/

if (
plannerPlaceCount
) {


plannerPlaceCount.textContent =
  trip.length +
  (
    trip.length === 1
      ? " Place"
      : " Places"
  );


}

if (
summaryPlaceCount
) {


summaryPlaceCount.textContent =
  trip.length;


}

/*
Empty State
*/

if (
trip.length === 0
) {


if (
  plannerEmptyState
) {

  plannerEmptyState.style.display =
    "block";

}


return;


}

/*
Hide Empty State
*/

if (
plannerEmptyState
) {


plannerEmptyState.style.display =
  "none";


}

/*
Create Destination Cards
*/

trip.forEach(
(
place,
index
) => {


  const card =
    document.createElement(
      "div"
    );


  card.className =
    "planner-destination";


  card.innerHTML = `

    <img
      src="${escapeHtml(
        place.image || ""
      )}"
      alt="${escapeHtml(
        place.name ||
        "Destination"
      )}"
    >

    <div
      class="planner-destination-info"
    >

      <h4>

        ${index + 1}.

        ${escapeHtml(
          place.name ||
          "Unknown Destination"
        )}

      </h4>


      <p>

        📍

        ${escapeHtml(
          place.district ||
          ""
        )}

        ${
          place.province
            ? " · " +
              escapeHtml(
                place.province
              )
            : ""
        }

      </p>


      <p>

        ⭐

        ${escapeHtml(
          String(
            place.rating ||
            "N/A"
          )
        )}

      </p>

    </div>


    <button
      type="button"
      class="remove-planner-place"
      data-place-id="${escapeHtml(
        String(
          place.id ||
          ""
        )
      )}"
      title="Remove destination"
    >

      ×

    </button>

  `;


  /*
     Remove Button
  */

  const removeButton =
    card.querySelector(
      ".remove-planner-place"
    );


  if (
    removeButton
  ) {

    removeButton.addEventListener(
      "click",
      () => {

        removePlannerDestination(
          place.id
        );

      }
    );

  }


  /*
     Add Card
  */

  if (
    plannerDestinations
  ) {

    plannerDestinations.appendChild(
      card
    );

  }

}


);

}

/* ============================================================
8. REMOVE DESTINATION

Original logic preserved.

============================================================ */

function removePlannerDestination(
placeId
) {

let trip =
getMyTrip();

/*
Remove selected place
*/

trip =
trip.filter(
(place) =>
place.id !== placeId
);

/*
Save updated trip
*/

saveMyTrip(
trip
);

/*
Re-render
*/

renderPlannerDestinations();

}

/* ============================================================
9. TRAVEL DATES
============================================================ */

const startDate =
document.getElementById(
"startDate"
);

const endDate =
document.getElementById(
"endDate"
);

const summaryDates =
document.getElementById(
"summaryDates"
);

function updateTravelDates() {

if (
!startDate ||
!endDate ||
!summaryDates
) {


return;


}

if (
!startDate.value ||
!endDate.value
) {


summaryDates.textContent =
  "Not selected";


return;


}

summaryDates.textContent =
startDate.value +
" → " +
endDate.value;

}

if (
startDate
) {

startDate.addEventListener(
"change",
updateTravelDates
);

}

if (
endDate
) {

endDate.addEventListener(
"change",
updateTravelDates
);

}

/* ============================================================
10. TRAVELERS
============================================================ */

const travelerCount =
document.getElementById(
"travelerCount"
);

const summaryTravelers =
document.getElementById(
"summaryTravelers"
);

if (
travelerCount
) {

travelerCount.addEventListener(
"change",
() => {


  if (
    summaryTravelers
  ) {

    summaryTravelers.textContent =
      travelerCount.value
        ? travelerCount.value
        : "Not selected";

  }

}


);

}

/* ============================================================
11. TRAVEL STYLE
============================================================ */

const travelStyle =
document.getElementById(
"travelStyle"
);

/* ============================================================
12. TRANSPORT
============================================================ */

const transportOptions =
document.querySelectorAll(
'input[name="transport"]'
);

const summaryTransport =
document.getElementById(
"summaryTransport"
);

transportOptions.forEach(
(option) => {


option.addEventListener(
  "change",
  () => {

    if (
      summaryTransport
    ) {

      summaryTransport.textContent =
        option.value;

    }

  }
);


}
);

/* ============================================================
13. ACCOMMODATION
============================================================ */

const accommodationOptions =
document.querySelectorAll(
'input[name="accommodation"]'
);

const summaryAccommodation =
document.getElementById(
"summaryAccommodation"
);

accommodationOptions.forEach(
(option) => {


option.addEventListener(
  "change",
  () => {

    if (
      summaryAccommodation
    ) {

      summaryAccommodation.textContent =
        option.value;

    }

  }
);


}
);

/* ============================================================
14. SPECIAL REQUESTS
============================================================ */

const specialRequests =
document.getElementById(
"specialRequests"
);

/* ============================================================
15. SAVE PLANNER DATA

Existing localStorage save is preserved for the current
planner UI.

IMPORTANT:

This is NOT the final trip database.

The final submitted trip is saved to Firestore below.

============================================================ */

function saveTripPlannerData() {

const tripPlannerData = {


startDate:
  startDate
    ? startDate.value
    : "",


endDate:
  endDate
    ? endDate.value
    : "",


travelers:
  travelerCount
    ? travelerCount.value
    : "",


travelStyle:
  travelStyle
    ? travelStyle.value
    : "",


transport:
  document.querySelector(
    'input[name="transport"]:checked'
  )?.value ||
  "",


accommodation:
  document.querySelector(
    'input[name="accommodation"]:checked'
  )?.value ||
  "",


specialRequests:
  specialRequests
    ? specialRequests.value
    : "",


updatedAt:
  new Date().toISOString(),


};

localStorage.setItem(


TRIP_PLANNER_DATA_KEY,

JSON.stringify(
  tripPlannerData
)


);

console.log(
"Trip Planner Data Saved:",
tripPlannerData
);

return tripPlannerData;

}

/* ============================================================
16. LOAD SAVED PLANNER DATA
============================================================ */

function loadSavedPlannerData() {

const savedPlannerData =
localStorage.getItem(
TRIP_PLANNER_DATA_KEY
);

if (
!savedPlannerData
) {


return;


}

try {


const data =
  JSON.parse(
    savedPlannerData
  );


/*
   Start Date
*/

if (
  startDate &&
  data.startDate
) {

  startDate.value =
    data.startDate;

}


/*
   End Date
*/

if (
  endDate &&
  data.endDate
) {

  endDate.value =
    data.endDate;

}


/*
   Travelers
*/

if (
  travelerCount &&
  data.travelers
) {

  travelerCount.value =
    data.travelers;

}


/*
   Travel Style
*/

if (
  travelStyle &&
  data.travelStyle
) {

  travelStyle.value =
    data.travelStyle;

}


/*
   Transport
*/

if (
  data.transport
) {

  const transport =
    document.querySelector(
      `input[name="transport"][value="${CSS.escape(
        data.transport
      )}"]`
    );


  if (
    transport
  ) {

    transport.checked =
      true;

  }

}


/*
   Accommodation
*/

if (
  data.accommodation
) {

  const accommodation =
    document.querySelector(
      `input[name="accommodation"][value="${CSS.escape(
        data.accommodation
      )}"]`
    );


  if (
    accommodation
  ) {

    accommodation.checked =
      true;

  }

}


/*
   Special Requests
*/

if (
  specialRequests &&
  data.specialRequests
) {

  specialRequests.value =
    data.specialRequests;

}


/*
   Update summaries
*/

updateTravelDates();


if (
  travelerCount &&
  summaryTravelers
) {

  summaryTravelers.textContent =
    travelerCount.value
      ? travelerCount.value
      : "Not selected";

}


if (
  summaryTransport
) {

  summaryTransport.textContent =
    data.transport ||
    "Not selected";

}


if (
  summaryAccommodation
) {

  summaryAccommodation.textContent =
    data.accommodation ||
    "Not selected";

}


} catch (
error
) {


console.error(
  "Unable to load saved Trip Planner data:",
  error
);


}

}

/* ============================================================
17. CURRENT FIREBASE USER
============================================================ */

let currentFirebaseUser =
null;

/* ============================================================
18. FIREBASE AUTH STATE

Keep the current Firebase user available.

============================================================ */

onAuthStateChanged(
auth,
(user) => {


currentFirebaseUser =
  user || null;


if (
  user
) {

  console.log(
    "Trip Planner Firebase user:",
    user.uid
  );


  console.log(
    "Trip Planner Firebase email:",
    user.email
  );

} else {

  console.log(
    "Trip Planner: no Firebase user."
  );

}


}
);

/* ============================================================
19. BUILD FIRESTORE TRIP DATA
============================================================ */

function buildFirestoreTripData(
trip,
plannerData,
firebaseUser
) {

/*
Convert destinations into a clean Firestore-safe
structure.


 Preserve the existing destination information.


*/

const destinations =
trip.map(
(place) => ({


    id:
      place.id ||
      "",


    name:
      place.name ||
      "",


    image:
      place.image ||
      "",


    district:
      place.district ||
      "",


    province:
      place.province ||
      "",


    category:
      place.category ||
      "",


    rating:
      place.rating ||
      "",


    bestTime:
      place.bestTime ||
      "",


    latitude:
      place.latitude ??
      place.lat ??
      null,


    longitude:
      place.longitude ??
      place.lng ??
      null,

  })
);


return {


/*
   OWNER
*/

touristId:
  firebaseUser.uid,


touristEmail:
  firebaseUser.email ||
  "",


touristName:
  firebaseUser.displayName ||
  "",


/*
   DESTINATIONS
*/

destinations:
  destinations,


/*
   TRAVEL DETAILS
*/

startDate:
  plannerData.startDate ||
  "",


endDate:
  plannerData.endDate ||
  "",


travelers:
  plannerData.travelers ||
  "",


travelStyle:
  plannerData.travelStyle ||
  "",


transport:
  plannerData.transport ||
  "",


accommodation:
  plannerData.accommodation ||
  "",


specialRequests:
  plannerData.specialRequests ||
  "",


/*
   WORKFLOW
*/

status:
  "draft",


quotationRequested:
  false,


/*
   TIMESTAMPS
*/

createdAt:
  serverTimestamp(),


updatedAt:
  serverTimestamp(),


};

}

/* ============================================================
20. CHECK TOURIST PROFILE
============================================================ */

async function verifyTouristProfile(
firebaseUser
) {

const touristRef =
doc(
db,


  "lankaQuestTourists",

  firebaseUser.uid
);


const touristSnapshot =
await getDoc(
touristRef
);

if (
!touristSnapshot.exists()
) {


return {

  exists:
    false,

  profile:
    null,

};


}

const profile =
touristSnapshot.data();

if (
profile.accountType !==
"tourist"
) {


return {

  exists:
    false,

  profile:
    profile,

};


}

return {


exists:
  true,

profile:
  profile,


};

}

/* ============================================================
21. SAVE TRIP TO FIRESTORE
============================================================ */

async function saveTripToFirestore(
trip,
plannerData,
firebaseUser
) {

const tripData =
buildFirestoreTripData(
trip,


  plannerData,

  firebaseUser
);


console.log(
"Saving LankaQuest trip to Firestore:",
tripData
);

const tripCollection =
collection(
db,


  TRIP_COLLECTION
);


const documentReference =
await addDoc(
tripCollection,


  tripData
);


console.log(
"Trip saved to Firestore.",
documentReference.id
);

return {


id:
  documentReference.id,

data:
  tripData,


};

}

/* ============================================================
22. REQUEST GUIDE QUOTATION
============================================================ */

const requestQuoteButton =
document.getElementById(
"requestQuoteButton"
);

let quotationRequestInProgress =
false;

if (
requestQuoteButton
) {

requestQuoteButton.addEventListener(
"click",


async () => {

  /*
     Prevent duplicate Firestore documents.
  */

  if (
    quotationRequestInProgress
  ) {

    return;

  }


  quotationRequestInProgress =
    true;


  const originalButtonText =
    requestQuoteButton.textContent;


  requestQuoteButton.disabled =
    true;


  requestQuoteButton.textContent =
    " Saving Trip... ";


  try {

    /* ==================================================
       STEP 1
       GET SELECTED DESTINATIONS
    ================================================== */

    const trip =
      getMyTrip();


    /*
       Destination check
    */

    if (
      trip.length === 0
    ) {

      alert(
        "Please add at least one destination before requesting a quotation."
      );


      return;

    }


    /* ==================================================
       STEP 2
       SAVE CURRENT PLANNER DATA
    ================================================== */

    const plannerData =
      saveTripPlannerData();


    /* ==================================================
       STEP 3
       FIREBASE AUTH CHECK
    ================================================== */

    const firebaseUser =
      auth.currentUser ||
      currentFirebaseUser;


    if (
      !firebaseUser
    ) {

      alert(
        "Please login as a Tourist before requesting a guide quotation."
      );


      window.location.href =
        "login.html?redirect=trip-planner.html";


      return;

    }


    currentFirebaseUser =
      firebaseUser;


    /* ==================================================
       STEP 4
       TOURIST PROFILE CHECK
    ================================================== */

    const touristCheck =
      await verifyTouristProfile(
        firebaseUser
      );


    if (
      !touristCheck.exists
    ) {

      alert(
        "A LankaQuest Tourist profile was not found for this account. Please complete Tourist registration first."
      );


      return;

    }


    /* ==================================================
       STEP 5
       SAVE TRIP TO FIRESTORE
    ================================================== */

    requestQuoteButton.textContent =
      " Saving to Firebase... ";


    const savedTrip =
      await saveTripToFirestore(

        trip,

        plannerData,

        firebaseUser

      );


    /* ==================================================
       STEP 6
       SUCCESS
    ================================================== */

    console.log(
      "LankaQuest Trip ID:",
      savedTrip.id
    );


    /*
       Open quotation page with Firestore document ID.

       quotation-request.js already reads:

       ?trip=DOCUMENT_ID
    */

    window.location.href =
      "quotation-request.html?trip=" +
      encodeURIComponent(
        savedTrip.id
      );

  } catch (
    error
  ) {

    console.error(
      "Trip Planner / Firestore Error:",
      error
    );


    /* ==================================================
       FIRESTORE PERMISSION ERROR
    ================================================== */

    if (
      error.code ===
      "permission-denied"
    ) {

      alert(
        "Firestore denied access to save this trip. Please make sure you are logged in with your Tourist account."
      );


      return;

    }


    /* ==================================================
       AUTH ERROR
    ================================================== */

    if (
      error.code &&
      error.code.startsWith(
        "auth/"
      )
    ) {

      alert(
        "Your Firebase login session is not available. Please login again."
      );


      window.location.href =
        "login.html?redirect=trip-planner.html";


      return;

    }


    /* ==================================================
       GENERAL ERROR
    ================================================== */

    alert(
      error.message ||
      "Unable to save your trip. Please try again."
    );

  } finally {

    quotationRequestInProgress =
      false;


    requestQuoteButton.disabled =
      false;


    requestQuoteButton.textContent =
      originalButtonText;

  }

}


);

}

/* ============================================================
23. HTML ESCAPE
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
24. INITIALIZE
============================================================ */

document.addEventListener(
"DOMContentLoaded",

() => {


/*
   Render selected destinations.

   This preserves the existing My Trip system.
*/

renderPlannerDestinations();


/*
   Load previously entered planner data.
*/

loadSavedPlannerData();


/*
   Update summaries.
*/

updateTravelDates();


console.log(
  "LankaQuest Trip Planner Loaded."
);


}
);

/* ============================================================
25. OPTIONAL GLOBAL REFRESH

Useful if another page/component changes
sriLankaMyTrip and returns to this planner.

============================================================ */

window.refreshTripPlanner =
function () {


renderPlannerDestinations();

updateTravelDates();


};

/* ============================================================
END TRIP PLANNER
============================================================ */
