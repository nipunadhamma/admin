/* ============================================================
   TOURIST DASHBOARD LOGIC
   LankaQuest

   FIREBASE FIRST VERSION

   Architecture:

   Firebase Authentication
          ↓
   Firebase UID
          ↓
   Firestore

   Collections:

   lankaQuestTourists
   lankaQuestTouristTrips
   lankaQuestQuotationRequests
   lankaQuestQuotations


   NO localStorage
   NO sessionStorage
   NO JSON DATABASE

============================================================ */

/* ============================================================
   1. FIREBASE IMPORTS
============================================================ */

import { auth, db } from "./firebase-config.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ============================================================
   2. FIRESTORE COLLECTIONS
============================================================ */

const TOURIST_COLLECTION = "lankaQuestTourists";

const TRIP_COLLECTION = "lankaQuestTouristTrips";

const REQUEST_COLLECTION = "lankaQuestQuotationRequests";

/* ============================================================
   3. CURRENT USER
============================================================ */

let currentFirebaseUser = null;

let currentTouristProfile = null;

/* ============================================================
   4. DOM ELEMENTS
============================================================ */

const headerUserName = document.getElementById("headerUserName");

const welcomeUserName = document.getElementById("welcomeUserName");

const logoutButton = document.getElementById("logoutButton");

const dashboardTripCount = document.getElementById("dashboardTripCount");

const dashboardRequestCount = document.getElementById("dashboardRequestCount");

const dashboardGuideCount = document.getElementById("dashboardGuideCount");

const dashboardTripContainer = document.getElementById(
  "dashboardTripContainer",
);

const quotationRequestsContainer = document.getElementById(
  "quotationRequestsContainer",
);

const selectedGuideContainer = document.getElementById(
  "selectedGuideContainer",
);

/* ============================================================
   5. GET FIREBASE TOURIST PROFILE
============================================================ */

async function getTouristProfile(uid) {
  try {
    const touristRef = doc(db, TOURIST_COLLECTION, uid);

    const touristSnap = await getDoc(touristRef);

    if (touristSnap.exists()) {
      return {
        id: uid,

        ...touristSnap.data(),
      };
    }

    console.warn("Tourist profile not found");

    return null;
  } catch (error) {
    console.error("Tourist profile loading error:", error);

    return null;
  }
}

/* ============================================================
   6. GET TOURIST TRIP FROM FIRESTORE
============================================================ */

async function getTouristTrip(uid) {
  try {
    const tripRef = doc(db, TRIP_COLLECTION, uid);

    const tripSnap = await getDoc(tripRef);

    if (tripSnap.exists()) {
      const data = tripSnap.data();

      return {
        destinations: Array.isArray(data.destinations) ? data.destinations : [],

        startDate: data.startDate || "",

        endDate: data.endDate || "",

        travelers: data.travelers || "",

        travelStyle: data.travelStyle || "",

        transport: data.transport || "",

        accommodation: data.accommodation || "",

        specialRequests: data.specialRequests || "",
      };
    }

    return {
      destinations: [],

      startDate: "",

      endDate: "",

      travelers: "",

      travelStyle: "",

      transport: "",

      accommodation: "",

      specialRequests: "",
    };
  } catch (error) {
    console.error("Firestore trip loading error:", error);

    return {
      destinations: [],
    };
  }
}

/* ============================================================
   7. UPDATE DASHBOARD USER DISPLAY
============================================================ */

function updateDashboardUser() {
  if (!currentTouristProfile) {
    return;
  }

  const name =
    currentTouristProfile.fullName || currentTouristProfile.email || "Tourist";

  if (headerUserName) {
    headerUserName.textContent = name;
  }

  if (welcomeUserName) {
    welcomeUserName.textContent = name;
  }
}

/* ============================================================
   8. RENDER MY TRIP
============================================================ */

async function renderDashboardTrip() {
  if (!dashboardTripContainer || !currentFirebaseUser) {
    return;
  }

  const trip = await getTouristTrip(currentFirebaseUser.uid);

  const destinations = trip.destinations || [];

  if (dashboardTripCount) {
    dashboardTripCount.textContent = destinations.length;
  }

  if (destinations.length === 0) {
    dashboardTripContainer.innerHTML = `


        <div class="dashboard-empty-state">


            🗺️


            <h4>

                No Destinations Yet

            </h4>



            <p>

                Start planning your Sri Lanka journey.

            </p>



            <a

            href="trip-planner.html"

            class="dashboard-action-button"

            >

                Explore Destinations

            </a>


        </div>


        `;

    return;
  }

  dashboardTripContainer.innerHTML = "";

  destinations.forEach((place) => {
    const card = document.createElement("article");

    card.className = "dashboard-destination-card";

    card.innerHTML = `


            <img

            src="${place.image || ""}"

            alt="${place.name || "Destination"}"

            loading="lazy"

            >



            <h4>

            ${place.name || "Destination"}

            </h4>



            <p>

            📍

            ${place.district || ""}

            ${place.province ? " · " + place.province : ""}


            </p>


            `;

    dashboardTripContainer.appendChild(card);
  });
}

/* ============================================================
   PART 01 END
============================================================ */
/* ============================================================
   TOURIST DASHBOARD LOGIC
   PART 02

   FIRESTORE QUOTATION SYSTEM

   FLOW:

   Guide
      ↓
   Send Quotation
      ↓
   lankaQuestQuotationRequests
      ↓
   Tourist Dashboard
      ↓
   Accept / Reject
      ↓
   Firestore Update

============================================================ */


/* ============================================================
   9. GET TOURIST QUOTATION REQUESTS
============================================================ */


async function getMyQuotationRequests(){


    if(
        !currentFirebaseUser
    ){

        return [];

    }




    try{


        const requestsQuery =

        query(

            collection(

                db,

                REQUEST_COLLECTION

            ),


            where(

                "touristId",

                "==",

                currentFirebaseUser.uid

            ),


            orderBy(

                "createdAt",

                "desc"

            )

        );




        const snapshot =

        await getDocs(
            requestsQuery
        );




        const requests = [];




        snapshot.forEach(

            document => {


                requests.push({


                    firebaseId:

                        document.id,


                    ...document.data()


                });


            }

        );




        return requests;



    }


    catch(error){


        console.error(

            "Quotation request loading error:",

            error

        );



        return [];


    }



}





/* ============================================================
   10. GET LATEST QUOTATION
============================================================ */


function getLatestQuotation(
    request
){


    if(

        !request ||

        !Array.isArray(

            request.quotations

        )

    ){

        return null;

    }



    if(

        request.quotations.length === 0

    ){

        return null;

    }



    return (

        request.quotations[

            request.quotations.length - 1

        ]

    );


}





/* ============================================================
   11. FORMAT DATE
============================================================ */


function formatDashboardDate(
    value
){


    if(
        !value
    ){

        return "Not specified";

    }



    try{


        if(
            value.toDate
        ){

            return value

            .toDate()

            .toLocaleDateString();


        }



        return new Date(value)

        .toLocaleDateString();



    }


    catch(error){


        return "Not specified";


    }



}





/* ============================================================
   12. STATUS TEXT
============================================================ */


function formatRequestStatus(
    status
){


    const statusMap = {


        pending:

            "Pending",



        quotation_sent:

            "Quotation Received",



        quotation_accepted:

            "Quotation Accepted",



        quotation_rejected:

            "Quotation Rejected",



        guide_selected:

            "Guide Selected"


    };



    return (

        statusMap[status]

        ||

        "Pending"

    );



}





/* ============================================================
   13. RENDER QUOTATION CARD
============================================================ */


function renderQuotation(
    request
){



    const quotation =

        getLatestQuotation(
            request
        );





    if(
        !quotation
    ){


        return `


        <div class="quotation-not-received">


            <h4>

            ⏳ Waiting for Guide Quotation

            </h4>



            <p>

            A registered guide has not sent
            a quotation yet.

            </p>


        </div>


        `;


    }





    const guide =

        quotation.guide || {};





    return `


    <div class="tourist-quotation-card">


        <div class="quotation-card-header">


            <h4>

            🧑‍💼

            ${

                guide.fullName ||

                "Registered Guide"

            }


            </h4>



            <span class="request-status">


            ${

                formatRequestStatus(

                    request.status

                )

            }


            </span>


        </div>




        <div class="quotation-price">


            ${

                quotation.amount ||

                "0"

            }


            ${

                quotation.currency ||

                ""

            }


        </div>




        <div class="quotation-details">


            <p>

            📍

            ${

                guide.district ||

                "Sri Lanka"

            }


            </p>



            <p>

            🗣️

            ${

                Array.isArray(

                    guide.languages

                )

                ?

                guide.languages.join(", ")

                :

                "Not specified"

            }


            </p>



            <p>

            📅 Valid Until:

            ${

                formatDashboardDate(

                    quotation.validUntil

                )

            }


            </p>


        </div>





        <div class="quotation-actions">


            <button

            class="accept-quotation-button"

            data-request-id="${request.requestId}"

            >

            ✓ Accept

            </button>





            <button

            class="reject-quotation-button"

            data-request-id="${request.requestId}"

            >

            ✕ Reject

            </button>



        </div>



    </div>


    `;


}






/* ============================================================
   14. ACCEPT QUOTATION
============================================================ */


async function acceptQuotation(
    requestId
){


    try{


        const requests =

            await getMyQuotationRequests();




        const request =

        requests.find(

            item =>

            item.requestId === requestId

        );




        if(
            !request
        ){

            alert(
                "Request not found."
            );

            return;

        }





        await updateDoc(

            doc(

                db,

                REQUEST_COLLECTION,

                request.firebaseId

            ),


            {


                status:

                    "quotation_accepted",



                updatedAt:

                    new Date()



            }


        );





        alert(

            "Quotation accepted successfully."

        );





        await renderQuotationRequests();



    }


    catch(error){


        console.error(

            "Accept quotation error:",

            error

        );



        alert(

            "Unable to accept quotation."

        );


    }


}






/* ============================================================
   15. REJECT QUOTATION
============================================================ */


async function rejectQuotation(
    requestId
){


    try{


        const requests =

            await getMyQuotationRequests();




        const request =

        requests.find(

            item =>

            item.requestId === requestId

        );




        if(
            !request
        ){

            alert(
                "Request not found."
            );

            return;

        }





        await updateDoc(

            doc(

                db,

                REQUEST_COLLECTION,

                request.firebaseId

            ),


            {


                status:

                    "quotation_rejected",



                updatedAt:

                    new Date()



            }


        );





        alert(

            "Quotation rejected."

        );





        await renderQuotationRequests();



    }


    catch(error){


        console.error(

            "Reject quotation error:",

            error

        );



        alert(

            "Unable to reject quotation."

        );


    }


}






/* ============================================================
   16. RENDER QUOTATION REQUESTS

   (continued in PART 03)

============================================================ */
/* ============================================================
   TOURIST DASHBOARD LOGIC
   PART 03

   FIRESTORE DASHBOARD RENDER

============================================================ */


/* ============================================================
   16. RENDER QUOTATION REQUESTS
============================================================ */


async function renderQuotationRequests(){


    if(
        !quotationRequestsContainer
    ){

        return;

    }




    const requests =

        await getMyQuotationRequests();





    if(
        dashboardRequestCount
    ){

        dashboardRequestCount.textContent =

            requests.length;

    }






    if(
        requests.length === 0
    ){


        quotationRequestsContainer.innerHTML = `


        <div class="dashboard-empty-state">


            <div>

                📋

            </div>



            <h4>

                No Quotation Requests Yet

            </h4>



            <p>

                Start planning your Sri Lanka journey.

            </p>



            <a

            href="trip-planner.html"

            class="dashboard-action-button"

            >

                Plan My Journey

            </a>


        </div>


        `;


        return;


    }





    quotationRequestsContainer.innerHTML = "";






    requests.forEach(

        request => {



            const card =

            document.createElement(
                "article"
            );



            card.className =

            "quotation-request-card";





            const destinations =

                Array.isArray(

                    request.destinations

                )

                ?

                request.destinations

                :

                [];






            const destinationNames =

                destinations.map(

                    place =>

                    place.name ||

                    "Destination"

                )

                .join(", ");






            card.innerHTML = `



            <div class="request-card-header">


                <h4>

                    🧾

                    ${

                    request.requestId ||

                    "Request"

                    }

                </h4>




                <span class="request-status">


                    ${

                    formatRequestStatus(

                        request.status

                    )

                    }


                </span>


            </div>







            <div class="request-details-grid">



                <div>


                    <span>

                    Destinations

                    </span>



                    <strong>

                    ${

                    destinationNames ||

                    "None"

                    }


                    </strong>


                </div>






                <div>


                    <span>

                    Travel Dates

                    </span>



                    <strong>


                    ${

                    request.startDate &&

                    request.endDate


                    ?


                    request.startDate +

                    " → " +

                    request.endDate


                    :


                    "Not selected"


                    }


                    </strong>


                </div>






                <div>


                    <span>

                    Travelers

                    </span>



                    <strong>


                    ${

                    request.travelers ||

                    "Not selected"


                    }


                    </strong>


                </div>



            </div>







            <div class="request-quotation-area">


                ${

                renderQuotation(

                    request

                )


                }


            </div>



            `;





            quotationRequestsContainer.appendChild(

                card

            );



        }


    );





    attachQuotationButtons();



}






/* ============================================================
   17. ATTACH QUOTATION BUTTON EVENTS
============================================================ */


function attachQuotationButtons(){



    document

    .querySelectorAll(

        ".accept-quotation-button"

    )

    .forEach(

        button => {


            button.addEventListener(

                "click",

                ()=>{


                    acceptQuotation(

                        button.dataset.requestId

                    );


                }

            );


        }


    );







    document

    .querySelectorAll(

        ".reject-quotation-button"

    )

    .forEach(

        button => {


            button.addEventListener(

                "click",

                ()=>{


                    rejectQuotation(

                        button.dataset.requestId

                    );


                }

            );


        }


    );



}






/* ============================================================
   18. RENDER SELECTED GUIDE
============================================================ */


async function renderSelectedGuide(){



    if(
        !selectedGuideContainer
    ){

        return;

    }





    const requests =

        await getMyQuotationRequests();





    const selectedRequest =

        requests.find(

            request =>

            request.selectedGuide

        );






    if(
        !selectedRequest
    ){



        selectedGuideContainer.innerHTML = `


        <div class="no-selected-guide">


            <div>

            🧑‍💼

            </div>



            <h4>

            No Guide Selected Yet

            </h4>



            <p>

            Select a registered guide
            for your journey.

            </p>



            <a

            href="find-guides.html"

            class="dashboard-action-button"

            >

            Find Guides

            </a>



        </div>


        `;


        if(
            dashboardGuideCount
        ){

            dashboardGuideCount.textContent = 0;

        }


        return;


    }






    const guide =

        selectedRequest.selectedGuide;







    selectedGuideContainer.innerHTML = `



    <div class="selected-guide-card">



        <h4>

        🧑‍💼

        ${

        guide.fullName ||

        "Guide"

        }


        </h4>



        <p>


        📍

        ${

        guide.district ||

        "Sri Lanka"

        }


        </p>



        <p>


        🗣️

        ${

        Array.isArray(

            guide.languages

        )


        ?


        guide.languages.join(", ")


        :


        "Not specified"


        }


        </p>



        <span>


        ✓ Guide Selected


        </span>



    </div>



    `;




    if(
        dashboardGuideCount
    ){

        dashboardGuideCount.textContent = 1;

    }



}






/* ============================================================
   19. UPDATE DASHBOARD SUMMARY
============================================================ */


async function updateDashboardSummary(){



    if(
        !currentFirebaseUser
    ){

        return;

    }





    const trip =

        await getTouristTrip(

            currentFirebaseUser.uid

        );





    const requests =

        await getMyQuotationRequests();







    if(
        dashboardTripCount
    ){

        dashboardTripCount.textContent =

        (

            trip.destinations ||

            []

        )

        .length;


    }






    if(
        dashboardRequestCount
    ){

        dashboardRequestCount.textContent =

            requests.length;

    }



}






/* ============================================================
   20. FIREBASE LOGOUT
============================================================ */


async function handleLogout(){



    try{


        const {

            signOut

        } = await import(

        "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"

        );





        await signOut(

            auth

        );





        window.location.href =

            "index.html";



    }


    catch(error){


        console.error(

            "Logout error:",

            error

        );


    }



}






/* ============================================================
   21. PAGE INITIALIZATION
============================================================ */


onAuthStateChanged(

    auth,


    async(user)=>{



        if(
            !user
        ){


            window.location.href =

                "login.html";


            return;


        }





        currentFirebaseUser = user;





        currentTouristProfile =

            await getTouristProfile(

                user.uid

            );






        if(
            !currentTouristProfile
        ){


            console.error(

                "Tourist profile missing"

            );


            return;


        }







        updateDashboardUser();




        await updateDashboardSummary();




        await renderDashboardTrip();




        await renderSelectedGuide();




        await renderQuotationRequests();







        console.log(

            "LankaQuest Tourist Dashboard Loaded",

            user.uid

        );



    }


);






/* ============================================================
   22. LOGOUT BUTTON
============================================================ */


if(
    logoutButton
){


    logoutButton.addEventListener(

        "click",

        handleLogout

    );


}


/* ============================================================
   END
============================================================ */