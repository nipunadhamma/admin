/* ============================================================
   LANKAQUEST
   Trip Planner System

   PART 01
   Firebase Setup
   Authentication Validation
   Global State Management
   Destination Loading

   Architecture:
   Firebase Authentication
   Firestore: lankaQuestTouristTrips

============================================================ */

/* ============================================================
   FIREBASE IMPORTS
============================================================ */

import { auth, db } from "./firebase-config.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ============================================================
   GLOBAL VARIABLES
============================================================ */

let currentTourist = null;

/*
    Selected destinations
    Loaded from Trip Planner
*/

let selectedDestinations = [];

/*
    Trip information object

    This object will be saved
    to Firestore

*/

let tripData = {
  destinations: [],

  startDate: "",

  endDate: "",

  travelDays: 0,

  travelers: 1,

  travelStyle: "",

  transport: "",

  accommodation: "",

  specialRequests: "",
};

/* ============================================================
   DOM ELEMENTS
============================================================ */

const plannerDestinations = document.getElementById("plannerDestinations");

const plannerEmptyState = document.getElementById("plannerEmptyState");

const tripCounter = document.getElementById("tripCounter");

const startDateInput = document.getElementById("startDate");

const endDateInput = document.getElementById("endDate");

const travelerCount = document.getElementById("travelerCount");

const travelStyle = document.getElementById("travelStyle");

const transport = document.getElementById("transport");

const accommodation = document.getElementById("accommodation");

const specialRequests = document.getElementById("specialRequests");

/* ============================================================
   FIREBASE AUTHENTICATION CHECK

   Only logged-in tourists
   can use Trip Planner

============================================================ */

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentTourist = user;

    console.log("Tourist Logged In:", user.uid);

    initializeTripPlanner();
  } else {
    console.warn("No Tourist Login Found");

    showLoginRequired();
  }
});

/* ============================================================
   INITIALIZE TRIP PLANNER

============================================================ */

function initializeTripPlanner() {
  loadSelectedDestinations();

  setupTripListeners();

  updateTripSummary();
}

/* ============================================================
   LOAD SELECTED DESTINATIONS


   Destination selection comes from
   Explore Map page


============================================================ */

function loadSelectedDestinations() {
  /*
        Temporary bridge

        Existing map system sends
        destinations through window object

        Firebase migration friendly

    */

  if (window.myTripDestinations && Array.isArray(window.myTripDestinations)) {
    selectedDestinations = window.myTripDestinations;
  }

  tripData.destinations = selectedDestinations;

  renderDestinations();
}

/* ============================================================
   RENDER DESTINATIONS

============================================================ */

function renderDestinations() {
  if (!plannerDestinations) {
    return;
  }

  plannerDestinations.innerHTML = "";

  if (selectedDestinations.length === 0) {
    if (plannerEmptyState) {
      plannerEmptyState.style.display = "block";
    }

    return;
  }

  if (plannerEmptyState) {
    plannerEmptyState.style.display = "none";
  }

  selectedDestinations.forEach((place, index) => {
    const card = document.createElement("div");

    card.className = "planner-destination-card";

    card.innerHTML = `

                <div class="destination-info">

                    <h4>
                        ${place.name}
                    </h4>

                    <p>
                        ${place.district || ""}
                    </p>

                </div>


                <button 
                    class="remove-destination"
                    data-index="${index}"
                >

                    ✕ Remove

                </button>


            `;

    plannerDestinations.appendChild(card);
  });

  updateTripCounter();
}

/* ============================================================
   UPDATE TRIP COUNTER

============================================================ */

function updateTripCounter() {
  if (!tripCounter) {
    return;
  }

  tripCounter.innerText = selectedDestinations.length;
}

/* ============================================================
   REMOVE DESTINATION EVENT

============================================================ */

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove-destination")) {
    const index = event.target.dataset.index;

    selectedDestinations.splice(index, 1);

    tripData.destinations = selectedDestinations;

    renderDestinations();

    updateTripSummary();
  }
});

/* ============================================================
   LOGIN REQUIRED MESSAGE

============================================================ */

function showLoginRequired() {
  const container = document.querySelector(".planner-container");

  if (container) {
    container.innerHTML = `

            <div class="login-required">

                <h2>
                    🔐 Tourist Login Required
                </h2>


                <p>
                    Please login before creating
                    your travel plan.
                </p>


                <a href="login.html">

                    Login Now

                </a>


            </div>

        `;
  }
}

/* ============================================================
   TRIP INPUT LISTENERS

   Continued in PART 02

============================================================ */

function setupTripListeners() {
  console.log("Trip Planner listeners ready");
}

/* ============================================================
   SUMMARY PLACEHOLDER

   Completed in PART 03

============================================================ */

function updateTripSummary() {
  console.log("Trip Summary Updated", tripData);
}
/* ============================================================
   PART 02

   Trip Details Management

   Features:
   - Date Handling
   - Travel Days Calculation
   - Travelers
   - Travel Style
   - Transport
   - Accommodation
   - Special Requests

============================================================ */






/* ============================================================
   COMPLETE TRIP LISTENERS

============================================================ */


function setupTripListeners(){



    /*
        Start Date Change
    */


    if(startDateInput){


        startDateInput.addEventListener(
            "change",
            ()=>{


                tripData.startDate =
                    startDateInput.value;



                calculateTravelDays();


                updateTripSummary();


            }
        );


    }






    /*
        End Date Change
    */


    if(endDateInput){


        endDateInput.addEventListener(
            "change",
            ()=>{


                tripData.endDate =
                    endDateInput.value;



                calculateTravelDays();


                updateTripSummary();



            }
        );


    }








    /*
        Traveler Count

    */


    if(travelerCount){


        travelerCount.addEventListener(
            "change",
            ()=>{


                tripData.travelers =
                    Number(
                        travelerCount.value
                    );



                updateTripSummary();


            }
        );


    }








    /*
        Travel Style

    */


    if(travelStyle){


        travelStyle.addEventListener(
            "change",
            ()=>{


                tripData.travelStyle =
                    travelStyle.value;



                updateTripSummary();


            }
        );


    }








    /*
        Transport

    */


    if(transport){


        transport.addEventListener(
            "change",
            ()=>{


                tripData.transport =
                    transport.value;



                updateTripSummary();


            }
        );


    }








    /*
        Accommodation

    */


    if(accommodation){


        accommodation.addEventListener(
            "change",
            ()=>{


                tripData.accommodation =
                    accommodation.value;



                updateTripSummary();


            }
        );


    }








    /*
        Special Requests

    */


    if(specialRequests){


        specialRequests.addEventListener(
            "input",
            ()=>{


                tripData.specialRequests =
                    specialRequests.value;



                updateTripSummary();


            }
        );


    }



}








/* ============================================================
   CALCULATE TRAVEL DAYS

============================================================ */


function calculateTravelDays(){



    if(
        !tripData.startDate ||
        !tripData.endDate
    ){

        tripData.travelDays = 0;

        return;

    }





    const start =
        new Date(
            tripData.startDate
        );



    const end =
        new Date(
            tripData.endDate
        );





    const difference =
        end.getTime()
        -
        start.getTime();





    const days =
        Math.ceil(
            difference /
            (
                1000 *
                60 *
                60 *
                24
            )
        );





    if(days < 0){


        alert(
            "End date cannot be before start date"
        );


        tripData.travelDays = 0;


        return;


    }





    /*
        Include starting day

    */


    tripData.travelDays =
        days + 1;




}









/* ============================================================
   DATE VALIDATION

============================================================ */


function validateDates(){



    if(
        !tripData.startDate ||
        !tripData.endDate
    ){


        return false;


    }





    const start =
        new Date(
            tripData.startDate
        );


    const end =
        new Date(
            tripData.endDate
        );




    return end >= start;



}









/* ============================================================
   GET CURRENT TRIP DATA

   Used before Firestore save

============================================================ */


function getTripData(){



    return {


        touristId:
            currentTourist
            ?
            currentTourist.uid
            :
            null,



        touristEmail:
            currentTourist
            ?
            currentTourist.email
            :
            null,



        ...tripData


    };



}








/* ============================================================
   FORMAT DESTINATION DATA

   Clean Firestore structure

============================================================ */


function prepareDestinations(){



    return selectedDestinations.map(
        (place)=>{


            return {


                id:
                    place.id || "",


                name:
                    place.name || "",


                district:
                    place.district || "",


                province:
                    place.province || "",


                category:
                    place.category || "",


                image:
                    place.image || ""



            };


        }
    );


}








/* ============================================================
   UPDATE SUMMARY DATA

   PART 03 will connect UI

============================================================ */


function createSummaryObject(){



    return {


        destinations:
            prepareDestinations(),


        travelDays:
            tripData.travelDays,


        travelers:
            tripData.travelers,


        style:
            tripData.travelStyle,


        transport:
            tripData.transport,


        accommodation:
            tripData.accommodation



    };



}
/* ============================================================
   PART 03

   Live Summary
   Firestore Save System

   Collection:
   lankaQuestTouristTrips

============================================================ */






/* ============================================================
   UPDATE LIVE TRIP SUMMARY

============================================================ */


function updateTripSummary(){



    const summary =
        document.getElementById(
            "tripSummary"
        );



    if(!summary){

        console.log(
            "Summary element not found"
        );


        return;

    }





    const data =
        createSummaryObject();





    summary.innerHTML = `


        <div class="summary-item">

            <h4>
                📍 Destinations
            </h4>

            <p>
                ${
                    data.destinations.length
                    ||
                    0
                }
                Places Selected
            </p>

        </div>




        <div class="summary-item">

            <h4>
                📅 Duration
            </h4>

            <p>

                ${
                    data.travelDays
                    ||
                    0
                }
                Days

            </p>

        </div>




        <div class="summary-item">

            <h4>
                👥 Travelers
            </h4>

            <p>

                ${
                    data.travelers
                    ||
                    1
                }

                Person(s)

            </p>

        </div>




        <div class="summary-item">

            <h4>
                🚗 Transport
            </h4>

            <p>

                ${
                    data.transport
                    ||
                    "Not Selected"
                }

            </p>

        </div>




        <div class="summary-item">

            <h4>
                🏨 Accommodation
            </h4>

            <p>

                ${
                    data.accommodation
                    ||
                    "Not Selected"
                }

            </p>

        </div>



    `;



}








/* ============================================================
   SAVE TRIP TO FIRESTORE

   Collection:
   lankaQuestTouristTrips

============================================================ */


async function saveTripToFirestore(){



    try{



        /*
            Authentication Check

        */


        if(!currentTourist){



            throw new Error(
                "Please login before saving trip"
            );


        }







        /*
            Date Validation

        */


        if(
            !validateDates()
        ){



            throw new Error(
                "Please select valid travel dates"
            );


        }








        /*
            Destination Validation

        */


        if(
            selectedDestinations.length === 0
        ){



            throw new Error(
                "Please add destinations first"
            );


        }








        /*
            Prepare Firestore Data

        */


        const finalTrip = {



            touristId:
                currentTourist.uid,



            touristEmail:
                currentTourist.email,



            destinations:
                prepareDestinations(),



            startDate:
                tripData.startDate,



            endDate:
                tripData.endDate,



            travelDays:
                tripData.travelDays,



            travelers:
                tripData.travelers,



            travelStyle:
                tripData.travelStyle,



            transport:
                tripData.transport,



            accommodation:
                tripData.accommodation,



            specialRequests:
                tripData.specialRequests,



            status:
                "draft",



            createdAt:
                serverTimestamp()



        };








        /*
            Firestore Save

        */


        const docRef =
            await addDoc(
                collection(
                    db,
                    "lankaQuestTouristTrips"
                ),
                finalTrip
            );







        console.log(
            "Trip Saved:",
            docRef.id
        );






        showMessage(
            "✅ Trip saved successfully"
        );





        return docRef.id;




    }

    catch(error){



        console.error(
            "Trip Save Error:",
            error
        );



        showMessage(
            error.message,
            true
        );



        return null;



    }



}








/* ============================================================
   SAVE BUTTON CONNECT

============================================================ */


const saveTripButton =
    document.getElementById(
        "saveTripBtn"
    );




if(saveTripButton){



    saveTripButton.addEventListener(
        "click",
        ()=>{


            saveTripToFirestore();


        }
    );



}








/* ============================================================
   USER MESSAGE SYSTEM

============================================================ */


function showMessage(
    message,
    error=false
){



    const box =
        document.getElementById(
            "tripMessage"
        );



    if(box){



        box.innerText =
            message;



        box.className =
            error
            ?
            "trip-message error"
            :
            "trip-message success";



        box.style.display =
            "block";



        setTimeout(
            ()=>{


                box.style.display =
                    "none";


            },
            4000
        );



    }
    else{


        alert(
            message
        );


    }



}








/* ============================================================
   EXPORT FUNCTIONS

   Available for other modules

============================================================ */


window.LankaQuestTrip = {



    getTripData,

    saveTripToFirestore,

    updateTripSummary


};