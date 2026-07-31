/* ============================================================
   TRIP PLANNER LOGIC
   LankaQuest

   FIREBASE-FIRST ARCHITECTURE


   FLOW:

   Firebase Authentication
          |
          ↓
   Current User UID
          |
          ↓
   lankaQuestTourists
          |
          ↓
   Trip Planner
          |
          ↓
   lankaQuestQuotationRequests
          |
          ↓
   Guide Dashboard


   IMPORTANT:

   ❌ localStorage database
   ❌ JSON trip arrays

   ✅ Firebase Auth
   ✅ Firestore

============================================================ */

/* ============================================================
   FIREBASE IMPORTS
============================================================ */

import { db } from "./firebase-config.js";

import { getCurrentUser, redirectAfterLogin } from "./auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ============================================================
   1. CURRENT TRIP STATE

   Temporary UI state only.

   Database:
   Firestore

============================================================ */

let currentTrip = [];

/* ============================================================
   2. CURRENT TOURIST
============================================================ */

function getCurrentTourist() {
  const user = getCurrentUser();

  if (!user) {
    return null;
  }

  if (user.accountType !== "tourist") {
    return null;
  }

  return user;
}

/* ============================================================
   3. DOM ELEMENTS
============================================================ */

const plannerDestinations = document.getElementById("plannerDestinations");

const plannerEmptyState = document.getElementById("plannerEmptyState");

const plannerPlaceCount = document.getElementById("plannerPlaceCount");

const summaryPlaceCount = document.getElementById("summaryPlaceCount");

/* ============================================================
   4. LOAD TOURIST TRIP DATA

   Firestore:

   lankaQuestTourists
        |
        UID
        |
        trips


============================================================ */

async function loadTouristTrip() {
  const tourist = getCurrentTourist();

  if (!tourist) {
    console.warn("Tourist login required.");

    currentTrip = [];

    return;
  }

  try {
    const tripRef = collection(
      db,

      "lankaQuestTouristTrips",
    );

    const tripQuery = query(
      tripRef,

      where(
        "touristId",

        "==",

        tourist.uid,
      ),
    );

    const snapshot = await getDocs(tripQuery);

    currentTrip = [];

    snapshot.forEach((doc) => {
      currentTrip.push({
        id: doc.id,

        ...doc.data(),
      });
    });

    console.log(
      "Firebase Trip Data:",

      currentTrip,
    );
  } catch (error) {
    console.error(
      "Trip loading error:",

      error,
    );

    currentTrip = [];
  }
}

/* ============================================================
   5. GET CURRENT TRIP
   Firebase State Only
============================================================ */

function getMyTrip(){

    return currentTrip;

}

/* ============================================================
   6. RENDER DESTINATIONS
============================================================ */

function renderPlannerDestinations() {

    console.log("Planner Trip:", getMyTrip());

  const trip = getMyTrip();

  if (plannerDestinations) {
    plannerDestinations.innerHTML = "";
  }

  if (plannerPlaceCount) {
    plannerPlaceCount.textContent =
      trip.length + (trip.length === 1 ? " Place" : " Places");
  }

  if (summaryPlaceCount) {
    summaryPlaceCount.textContent = trip.length;
  }

  if (trip.length === 0) {
    if (plannerEmptyState) {
      plannerEmptyState.style.display = "block";
    }

    return;
  }

  if (plannerEmptyState) {
    plannerEmptyState.style.display = "none";
  }

  trip.forEach(
    (
      place,

      index,
    ) => {
      const card = document.createElement("div");

      card.className = "planner-destination";

      card.innerHTML = `


            <img

                src="${place.image || ""}"

                alt="${place.name || "Destination"}"

            >



            <div class="planner-destination-info">



                <h4>

                ${index + 1}.

                ${place.name || "Unknown"}

                </h4>




                <p>

                📍

                ${place.district || ""}

                ${place.province ? " · " + place.province : ""}

                </p>




                <p>

                ⭐

                ${place.rating || "N/A"}

                </p>



            </div>



            `;

      if (plannerDestinations) {
        plannerDestinations.appendChild(card);
      }
    },
  );
}
/* ============================================================
   7. REMOVE DESTINATION

   Firestore-first

   Current UI state update

============================================================ */


async function removePlannerDestination(placeId){


    currentTrip =

        currentTrip.filter(

            place =>

                place.id !== placeId

        );



    renderPlannerDestinations();



}






/* ============================================================
   8. TRAVEL DATES
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






function updateTravelDates(){



    if(

        !startDate ||

        !endDate ||

        !summaryDates

    ){

        return;

    }





    if(

        !startDate.value ||

        !endDate.value

    ){


        summaryDates.textContent =

        "Not selected";


        return;


    }




    summaryDates.textContent =


        startDate.value +

        " → " +

        endDate.value;



}






if(startDate){


    startDate.addEventListener(

        "change",

        updateTravelDates

    );


}





if(endDate){


    endDate.addEventListener(

        "change",

        updateTravelDates

    );


}







/* ============================================================
   9. TRAVELERS
============================================================ */


const travelerCount =

document.getElementById(
    "travelerCount"
);




const summaryTravelers =

document.getElementById(
    "summaryTravelers"
);






if(travelerCount){


    travelerCount.addEventListener(

        "change",

        ()=>{


            if(summaryTravelers){


                summaryTravelers.textContent =


                travelerCount.value ||


                "Not selected";


            }


        }

    );


}







/* ============================================================
   10. TRANSPORT
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

option=>{


    option.addEventListener(

        "change",

        ()=>{


            if(summaryTransport){


                summaryTransport.textContent =

                option.value;


            }


        }


    );


}

);








/* ============================================================
   11. ACCOMMODATION
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

option=>{


    option.addEventListener(

        "change",

        ()=>{


            if(summaryAccommodation){


                summaryAccommodation.textContent =

                option.value;


            }


        }


    );


}

);









/* ============================================================
   12. SAVE TRIP TO FIRESTORE


   Collection:

   lankaQuestTouristTrips


   Document:

       touristId
       destinations
       startDate
       endDate
       travelers
       transport
       accommodation
       specialRequests
       createdAt


============================================================ */



async function saveTripPlannerData(){



    const tourist =

        getCurrentTourist();




    if(!tourist){


        alert(

        "Please login as tourist first."

        );


        return false;


    }






    const tripData = {



        touristId:

            tourist.uid,



        destinations:

            currentTrip,



        startDate:

            startDate

            ?

            startDate.value

            :

            "",



        endDate:

            endDate

            ?

            endDate.value

            :

            "",




        travelers:

            travelerCount

            ?

            travelerCount.value

            :

            "",




        travelStyle:


            document.getElementById(

                "travelStyle"

            )?.value || "",






        transport:


            document.querySelector(

            'input[name="transport"]:checked'

            )?.value || "",






        accommodation:


            document.querySelector(

            'input[name="accommodation"]:checked'

            )?.value || "",





        specialRequests:


            document.getElementById(

            "specialRequests"

            )?.value || "",





        updatedAt:

            serverTimestamp()




    };






    try{



        await addDoc(


            collection(

                db,

                "lankaQuestTouristTrips"

            ),


            tripData


        );





        console.log(

            "Trip saved Firebase:",

            tripData

        );





        return true;



    }

    catch(error){



        console.error(

            "Trip save error:",

            error

        );




        alert(

        "Unable to save trip details."

        );



        return false;



    }




}
/* ============================================================
   13. REQUEST GUIDE QUOTATION


   FLOW:

   Tourist
      |
      ↓
   Trip Planner
      |
      ↓
   Login Check
      |
      ↓
   lankaQuestQuotationRequests
      |
      ↓
   Guide Dashboard


============================================================ */



const requestQuoteButton =

document.getElementById(

    "requestQuoteButton"

);







if(requestQuoteButton){



requestQuoteButton.addEventListener(


"click",


async ()=>{





/* =====================================================
   STEP 1

   CHECK DESTINATIONS

===================================================== */



if(

    currentTrip.length === 0

){


    alert(

    "Please add destinations before requesting a quotation."

    );


    return;


}








/* =====================================================
   STEP 2

   CHECK AUTH

===================================================== */


if(

typeof getCurrentUser !== "function"

){


    console.error(

    "auth.js is not loaded."

    );


    alert(

    "Authentication system unavailable."

    );


    return;


}







const currentUser =

getCurrentUser();







if(!currentUser){



    window.location.href =


    "login.html?redirect=quotation-request.html";



    return;


}









/* =====================================================
   STEP 3

   TOURIST ONLY

===================================================== */


if(

currentUser.accountType !== "tourist"

){



    alert(

    "Only tourists can request guide quotations."

    );



    return;


}










/* =====================================================
   STEP 4

   CREATE FIRESTORE REQUEST


   Collection:

   lankaQuestQuotationRequests


===================================================== */






const quotationRequest = {



    touristId:


        currentUser.uid,



    touristName:


        currentUser.fullName || "",




    touristEmail:


        currentUser.email || "",





    destinations:


        currentTrip,





    startDate:


        startDate

        ?

        startDate.value

        :

        "",





    endDate:


        endDate

        ?

        endDate.value

        :

        "",





    travelers:


        travelerCount

        ?

        travelerCount.value

        :

        "",





    travelStyle:


        document.getElementById(

            "travelStyle"

        )?.value || "",





    transport:


        document.querySelector(

        'input[name="transport"]:checked'

        )?.value || "",





    accommodation:


        document.querySelector(

        'input[name="accommodation"]:checked'

        )?.value || "",





    specialRequests:


        document.getElementById(

            "specialRequests"

        )?.value || "",





    status:


        "pending",





    createdAt:


        serverTimestamp(),





    updatedAt:


        serverTimestamp()



};









try{





    const requestRef =



    await addDoc(



        collection(


            db,


            "lankaQuestQuotationRequests"


        ),



        quotationRequest



    );







    console.log(


    "Quotation Request Created:",


    requestRef.id



    );








    alert(

    "Your quotation request has been sent successfully."

    );









    window.location.href =


    "quotation-request.html";







}

catch(error){





    console.error(


    "Quotation Request Error:",


    error



    );






    alert(

    "Unable to send quotation request."

    );



}







}

);



}









/* ============================================================
   14. INITIALIZE TRIP PLANNER


============================================================ */



document.addEventListener(



"DOMContentLoaded",



()=>{







    renderPlannerDestinations();







    updateTravelDates();






    console.log(

    "LankaQuest Trip Planner Loaded"

    );






}

);








/* ============================================================
   15. FIRESTORE ERROR HANDLING NOTE


   REQUIRED FIRESTORE RULES:


   lankaQuestQuotationRequests


   Tourist:

   create allowed


   Guide:

   read assigned requests only



============================================================ */

/* ============================================================
   EXPORT FUNCTIONS
============================================================ */

window.getMyTrip =
    getMyTrip;


window.saveTripPlannerData =
    saveTripPlannerData;


window.renderPlannerDestinations =
    renderPlannerDestinations;