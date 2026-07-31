/* ============================================================
GUIDE DASHBOARD LOGIC
LankaQuest

FIREBASE FIRST ARCHITECTURE


auth.js
   ↓
exploreSriLankaCurrentUser
   ↓
Firebase UID
   ↓
Firestore

lankaQuestGuides
   ↓
Current Guide Document

lankaQuestQuotationRequests
   ↓
Tourist Requests

lankaQuestQuotations
   ↓
Guide Quotations

Guide Dashboard


IMPORTANT RULE:

localStorage is ONLY used for login session.

Business data MUST come from Firestore.

============================================================ */

/* ============================================================
FIREBASE IMPORTS
============================================================ */

import { db } from "./firebase-config.js";

import { getCurrentUser, logoutUser, redirectAfterLogin } from "./auth.js";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ============================================================
1. SESSION KEY ONLY
============================================================ */

const GUIDE_CURRENT_USER_KEY = "exploreSriLankaCurrentUser";

/* ============================================================
2. DOM ELEMENTS
============================================================ */

const guideHeaderName = document.getElementById("guideHeaderName");

const guideWelcomeName = document.getElementById("guideWelcomeName");

const guideStatus = document.getElementById("guideStatus");

const totalRequestCount = document.getElementById("totalRequestCount");

const pendingRequestCount = document.getElementById("pendingRequestCount");

const quotationCount = document.getElementById("quotationCount");

const incomingRequestsContainer = document.getElementById(
  "incomingRequestsContainer",
);

const noRequestsState = document.getElementById("noRequestsState");

const refreshRequestsButton = document.getElementById("refreshRequestsButton");

const logoutButton = document.getElementById("logoutButton");

/* ============================================================
3. GET CURRENT LOGIN USER

ONLY AUTH SESSION

NOT BUSINESS DATA

============================================================ */

function getDashboardCurrentUser() {
  return getCurrentUser();
}

/* ============================================================
4. GET CURRENT GUIDE UID

============================================================ */

function getCurrentGuideId(user) {
  if (!user) {
    return "";
  }

  return user.uid || user.guideId || user.id || "";
}

/* ============================================================
5. LOAD GUIDE FROM FIRESTORE


Collection:

lankaQuestGuides

Document:

UID


============================================================ */

async function findCurrentGuide(currentUser) {
  const guideId = getCurrentGuideId(currentUser);

  if (!guideId) {
    console.error("Guide UID missing");

    return null;
  }

  try {
    const guideRef = doc(
      db,

      "lankaQuestGuides",

      guideId,
    );

    const guideSnap = await getDoc(guideRef);

    if (!guideSnap.exists()) {
      console.error("Guide document not found");

      return null;
    }

    return {
      id: guideId,

      uid: guideId,

      ...guideSnap.data(),
    };
  } catch (error) {
    console.error(
      "Guide loading error:",

      error,
    );

    return null;
  }
}

/* ============================================================
6. UPDATE GUIDE NAME

============================================================ */

function updateGuideName(guide) {
  if (!guide) {
    return;
  }

  const name = guide.fullName || guide.email || "Guide";

  if (guideHeaderName) {
    guideHeaderName.textContent = name;
  }

  if (guideWelcomeName) {
    guideWelcomeName.textContent = name;
  }
}
/* ============================================================
7. GET GUIDE ACCOUNT STATUS

Firestore fields:

status
isActive
profileStatus
packageStatus

============================================================ */


function getGuideAccountStatus(guide){


    if(!guide){


        return {

            text:"Unknown",

            className:"status-unknown"

        };


    }



    /*
       Rejected
    */


    if(

        guide.status === "rejected"

        ||

        guide.packageStatus === "rejected"

    ){


        return {


            text:"Rejected",


            className:"status-rejected"


        };


    }




    /*
       Active Approved Guide
    */


    if(


        guide.status === "approved"

        &&

        guide.isActive === true

        &&

        guide.profileStatus === "active"


    ){


        return {


            text:"Active",


            className:"status-active"


        };


    }




    /*
       Pending Approval
    */


    if(


        guide.status === "pending"

        ||

        guide.packageStatus === "pending"


    ){


        return {


            text:"Pending Review",


            className:"status-pending"


        };


    }




    /*
       Disabled
    */


    if(


        guide.isActive === false

        ||

        guide.profileStatus === "inactive"


    ){


        return {


            text:"Inactive",


            className:"status-inactive"


        };


    }




    return {


        text:
        guide.status || "Unknown",


        className:"status-unknown"


    };


}







/* ============================================================
8. UPDATE GUIDE STATUS UI

============================================================ */


function updateGuideStatus(guide){



    if(!guideStatus){

        return;

    }



    const statusInfo =

    getGuideAccountStatus(
        guide
    );




    guideStatus.textContent =

    statusInfo.text;





    guideStatus.classList.remove(

        "status-active",

        "status-pending",

        "status-rejected",

        "status-inactive",

        "status-unknown"

    );




    guideStatus.classList.add(

        statusInfo.className

    );



}







/* ============================================================
9. LOAD GUIDE REQUESTS FROM FIRESTORE


Collection:

lankaQuestQuotationRequests


Expected fields:

guideId
selectedGuideId
assignedGuideId
guideEmail
status


============================================================ */


async function getCurrentGuideRequests(guide){



    if(!guide){

        return [];

    }




    const guideId =

    guide.uid ||

    guide.id ||

    "";





    if(!guideId){

        return [];

    }





    try{


        const requestsRef =

        collection(

            db,

            "lankaQuestQuotationRequests"

        );





        const q =

        query(

            requestsRef,

            where(

                "guideId",

                "==",

                guideId

            )

        );





        const snapshot =

        await getDocs(q);





        const requests = [];





        snapshot.forEach(doc=>{


            requests.push({


                id:doc.id,


                ...doc.data()


            });



        });





        return requests;



    }
    catch(error){



        console.error(

            "Request loading error:",

            error

        );



        return [];



    }



}








/* ============================================================
10. LOAD GUIDE QUOTATIONS FROM FIRESTORE


Collection:

lankaQuestQuotations


============================================================ */


async function getCurrentGuideQuotations(guide){



    if(!guide){

        return [];

    }




    const guideId =

    guide.uid ||

    guide.id ||

    "";





    if(!guideId){

        return [];

    }




    try{



        const quotationsRef =

        collection(

            db,

            "lankaQuestQuotations"

        );





        const q =

        query(

            quotationsRef,

            where(

                "guideId",

                "==",

                guideId

            )

        );





        const snapshot =

        await getDocs(q);





        const quotations = [];





        snapshot.forEach(doc=>{


            quotations.push({


                id:doc.id,


                ...doc.data()


            });



        });





        return quotations;



    }
    catch(error){



        console.error(

            "Quotation loading error:",

            error

        );



        return [];



    }



}







/* ============================================================
11. GET REQUEST STATUS

============================================================ */


function getRequestStatus(request){



    return (

        request.status ||

        request.requestStatus ||

        "pending"


    ).toLowerCase();



}








/* ============================================================
12. UPDATE DASHBOARD COUNTS


NOW ASYNC BECAUSE DATA COMES FROM FIRESTORE

============================================================ */


async function updateDashboardCounts(guide){



    const requests =

    await getCurrentGuideRequests(
        guide
    );





    const quotations =

    await getCurrentGuideQuotations(
        guide
    );






    if(totalRequestCount){


        totalRequestCount.textContent =

        requests.length;


    }






    const pending =

    requests.filter(

        request =>


        getRequestStatus(request)
        ===
        "pending"


        ||

        getRequestStatus(request)
        ===
        "new"


    );







    if(pendingRequestCount){


        pendingRequestCount.textContent =

        pending.length;


    }






    if(quotationCount){


        quotationCount.textContent =

        quotations.length;


    }



}
/* ============================================================
13. ESCAPE HTML

Prevent HTML injection

============================================================ */


function escapeHTML(value){



    if(

        value === null ||

        value === undefined

    ){

        return "";

    }





    return String(value)

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
14. FORMAT REQUEST DATE

============================================================ */


function formatRequestDate(dateValue){



    if(!dateValue){


        return "Date not available";


    }





    let date;



    /*
       Firestore Timestamp
    */


    if(

        dateValue.seconds

    ){


        date =

        new Date(

            dateValue.seconds * 1000

        );


    }

    else{


        date =

        new Date(

            dateValue

        );


    }





    if(

        Number.isNaN(

            date.getTime()

        )

    ){


        return "Invalid Date";


    }





    return date.toLocaleDateString(

        "en-US",

        {


            year:"numeric",


            month:"short",


            day:"numeric"


        }

    );



}









/* ============================================================
15. CREATE REQUEST CARD


Firestore Document:

lankaQuestQuotationRequests


============================================================ */


function createRequestCard(request){



    const touristName =


        request.touristName ||


        request.fullName ||


        request.customerName ||


        "Tourist";





    const destination =


        request.destination ||


        request.destinations ||


        request.location ||


        "Sri Lanka";





    const status =


        getRequestStatus(

            request

        );





    const requestDate =


        request.createdAt ||


        request.requestedAt ||


        "";





    const requestId =


        request.id ||


        "N/A";






    const card =


    document.createElement(

        "article"

    );






    card.className =


    "incoming-request-card";







    card.innerHTML = `


        <div class="request-card-header">


            <div>


                <span class="request-card-label">

                    TRIP REQUEST

                </span>



                <h3>

                    ${escapeHTML(

                        touristName

                    )}

                </h3>


            </div>




            <span class="request-status ${escapeHTML(status)}">


                ${escapeHTML(status)}


            </span>



        </div>





        <div class="request-card-body">


            <p>


                <strong>

                    Destination:

                </strong>



                ${escapeHTML(

                    Array.isArray(destination)

                    ?

                    destination.join(", ")

                    :

                    destination

                )}



            </p>







            <p>


                <strong>

                    Request ID:

                </strong>



                ${escapeHTML(requestId)}



            </p>







            <p>


                <strong>

                    Received:

                </strong>



                ${formatRequestDate(

                    requestDate

                )}



            </p>



        </div>








        <div class="request-card-actions">



            <a

                href="guide-requests.html"

                class="view-request-button"


            >


                View Request →


            </a>



        </div>




    `;






    return card;



}









/* ============================================================
16. RENDER INCOMING REQUESTS


Firestore Data → Dashboard Cards


============================================================ */


async function renderIncomingRequests(guide){



    if(

        !incomingRequestsContainer

    ){

        return;

    }






    const requests =


    await getCurrentGuideRequests(

        guide

    );







    /*
       Clear old cards

    */


    incomingRequestsContainer.innerHTML = "";








    /*
       No Requests

    */


    if(

        requests.length === 0

    ){



        incomingRequestsContainer.style.display =

        "none";





        if(noRequestsState){



            noRequestsState.style.display =

            "block";



        }



        return;



    }







    /*
       Show container

    */


    incomingRequestsContainer.style.display =

    "grid";






    if(noRequestsState){


        noRequestsState.style.display =

        "none";


    }







    /*
       Latest first

    */


    const sortedRequests =


    [...requests].sort(

        (a,b)=>{



            const dateA =

            new Date(

                a.createdAt?.seconds

                ?

                a.createdAt.seconds * 1000

                :

                a.createdAt || 0

            ).getTime();






            const dateB =

            new Date(

                b.createdAt?.seconds

                ?

                b.createdAt.seconds * 1000

                :

                b.createdAt || 0

            ).getTime();






            return dateB - dateA;



        }

    );









    /*
       Dashboard show latest 5 only

    */


    const latestRequests =


    sortedRequests.slice(

        0,

        5

    );







    latestRequests.forEach(

        request=>{


            const card =

            createRequestCard(

                request

            );





            incomingRequestsContainer.appendChild(

                card

            );



        }

    );



}
 /* ============================================================
17. LOAD GUIDE DASHBOARD


FLOW:

auth.js

↓

exploreSriLankaCurrentUser

↓

Firebase UID

↓

lankaQuestGuides

↓

Dashboard


============================================================ */


async function loadGuideDashboard(){



    /*
       Get logged user
    */


    const currentUser =

    getDashboardCurrentUser();






    if(!currentUser){



        window.location.href =

        "login.html";



        return;


    }







    /*
       Only Guide Account

    */


    if(

        currentUser.accountType !== "guide"

    ){



        if(

            typeof redirectAfterLogin === "function"

        )
        {


            redirectAfterLogin(

                currentUser

            );


        }

        else{


            window.location.href =

            "index.html";


        }



        return;


    }







    /*
       Load Guide From Firestore

    */


    const guide =


    await findCurrentGuide(

        currentUser

    );








    console.log(

        "FOUND GUIDE DATA:",

        guide

    );







    if(!guide){



        console.error(

            "Guide profile not found"

        );





        if(guideHeaderName){


            guideHeaderName.textContent =

            currentUser.fullName || "Guide";


        }






        if(guideWelcomeName){


            guideWelcomeName.textContent =

            currentUser.fullName || "Guide";


        }






        if(guideStatus){


            guideStatus.textContent =

            "Profile Not Found";


        }





        return;


    }









    /*
       Update UI

    */


    updateGuideName(

        guide

    );





    updateGuideStatus(

        guide

    );





    await updateDashboardCounts(

        guide

    );





    await renderIncomingRequests(

        guide

    );








    console.log(

        "Current Guide:",

        guide

    );






    console.log(

        "Guide UID:",

        guide.uid

    );



}









/* ============================================================
18. REFRESH REQUESTS BUTTON


============================================================ */


if(refreshRequestsButton){



    refreshRequestsButton.addEventListener(


        "click",


        ()=>{


            loadGuideDashboard();


        }


    );


}









/* ============================================================
19. LOGOUT


============================================================ */


if(logoutButton){



    logoutButton.addEventListener(


        "click",


        ()=>{



            /*
               Use auth.js logout

            */


            if(

                typeof logoutUser === "function"

            ){



                logoutUser();



                return;


            }







            /*
               Firebase auth fallback

            */


            localStorage.removeItem(

                GUIDE_CURRENT_USER_KEY

            );



            sessionStorage.removeItem(

                GUIDE_CURRENT_USER_KEY

            );







            window.location.href =

            "index.html";



        }


    );


}









/* ============================================================
20. INITIALIZE DASHBOARD  
 getStorageArray() නැහැ
 localStorage වල guide/request/quotation data නැහැ
 GUIDE_RECORDS_KEY නැහැ
 QUOTATION_REQUESTS_KEY නැහැ
 QUOTATIONS_KEY නැහැ


============================================================ */


document.addEventListener(


    "DOMContentLoaded",


    ()=>{


        loadGuideDashboard();


    }


);