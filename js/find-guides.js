/* ============================================================
   LANKAQUEST
   FIND REGISTERED GUIDES

   FIREBASE FIRST VERSION

   Architecture:

   Firebase Authentication
            |
            ↓
   Tourist Account
            |
            ↓
   Find Guides
            |
            ↓
   Firestore
   lankaQuestGuides
            |
            ↓
   Approved Active Guides


   RULES:

   ✅ Firestore only
   ✅ No localStorage
   ✅ No JSON cache
   ✅ No fake database

============================================================ */

/* ============================================================
   1. FIREBASE IMPORT
============================================================ */

import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ============================================================
   2. FIRESTORE COLLECTIONS
============================================================ */

const GUIDES_COLLECTION = "lankaQuestGuides";

const REQUESTS_COLLECTION = "lankaQuestQuotationRequests";

/* ============================================================
   3. DOM ELEMENTS
============================================================ */

const guidesList = document.getElementById("guidesList");

const guidesLoading = document.getElementById("guidesLoading");

const guidesEmptyState = document.getElementById("guidesEmptyState");

const guideResultCount = document.getElementById("guideResultCount");

const guideSearch = document.getElementById("guideSearch");

const guideDistrict = document.getElementById("guideDistrict");

const guideLanguage = document.getElementById("guideLanguage");

const guideSort = document.getElementById("guideSort");

const clearGuideFilters = document.getElementById("clearGuideFilters");

const emptyClearFilters = document.getElementById("emptyClearFilters");

/* ============================================================
   4. GLOBAL DATA
============================================================ */

let allGuides = [];

let filteredGuides = [];

/* ============================================================
   5. GET CURRENT FIREBASE USER
============================================================ */

function getFirebaseUser() {
  if (typeof getCurrentUser === "function") {
    return getCurrentUser();
  }

  return null;
}

/* ============================================================
   6. GET APPROVED ACTIVE GUIDES
============================================================ */

async function getRegisteredGuides() {
  try {
    const guidesQuery = query(
      collection(
        db,

        GUIDES_COLLECTION,
      ),

      where(
        "accountType",

        "==",

        "guide",
      ),

      where(
        "status",

        "==",

        "approved",
      ),

      where(
        "isActive",

        "==",

        true,
      ),
    );

    const snapshot = await getDocs(guidesQuery);

    const guides = [];

    snapshot.forEach((document) => {
      const guide = {
        id: document.id,

        ...document.data(),
      };

      if (guide.profileStatus === "active") {
        guides.push(guide);
      }
    });

    console.log(
      "Firebase Approved Guides:",

      guides,
    );

    return guides;
  } catch (error) {
    console.error(
      "Guide loading error:",

      error,
    );

    return [];
  }
}

/* ============================================================
   7. NORMALIZE GUIDE DATA
============================================================ */

function normalizeGuide(guide) {
  return {
    ...guide,

    languages: Array.isArray(guide.languages) ? guide.languages : [],

    specializations: Array.isArray(guide.specializations)
      ? guide.specializations
      : [],

    areasCovered: guide.areasCovered || "",

    experience: guide.experience || "",
  };
}

/* ============================================================
   8. LOAD GUIDES
============================================================ */

async function loadGuides() {
  if (guidesLoading) {
    guidesLoading.style.display = "block";
  }

  allGuides = await getRegisteredGuides();

  allGuides = allGuides.map(normalizeGuide);

  loadFilterOptions();

  filterGuides();

  if (guidesLoading) {
    guidesLoading.style.display = "none";
  }
}
/* ============================================================
   PART 02

   FILTER SYSTEM
   SEARCH
   SORT
   RENDER GUIDES

============================================================ */


/* ============================================================
   9. LOAD FILTER OPTIONS
============================================================ */


function loadFilterOptions(){



    if(

        !guideDistrict ||

        !guideLanguage

    ){

        return;

    }




    /*
       Clear existing options
    */


    while(

        guideDistrict.options.length > 1

    ){

        guideDistrict.remove(1);

    }





    while(

        guideLanguage.options.length > 1

    ){

        guideLanguage.remove(1);

    }





    /*
       DISTRICTS
    */


    const districts = [


        ...new Set(


            allGuides

            .map(

                guide => guide.district

            )


            .filter(Boolean)


        )


    ]

    .sort();






    districts.forEach(

        district=>{


            const option =

            document.createElement(

                "option"

            );



            option.value =

                district;



            option.textContent =

                district;




            guideDistrict.appendChild(

                option

            );


        }

    );







    /*
       LANGUAGES
    */


    const languages = [


        ...new Set(


            allGuides


            .flatMap(

                guide =>

                guide.languages

            )


            .filter(Boolean)



        )



    ]

    .sort();







    languages.forEach(

        language=>{


            const option =

            document.createElement(

                "option"

            );




            option.value =

                language;




            option.textContent =

                language;





            guideLanguage.appendChild(

                option

            );



        }

    );



}





/* ============================================================
   10. FILTER GUIDES
============================================================ */


function filterGuides(){



    let guides =

        [

            ...allGuides

        ];






    /*
       SEARCH
    */


    const searchValue =


        guideSearch

        ?

        guideSearch.value

        .trim()

        .toLowerCase()


        :

        "";







    if(searchValue){



        guides = guides.filter(

            guide=>{


                const searchText =


                [

                    guide.fullName,


                    guide.email,


                    guide.phone,


                    guide.district,


                    guide.province,


                    guide.areasCovered,


                    ...(guide.languages || []),


                    ...(guide.specializations || [])


                ]

                .join(" ")

                .toLowerCase();





                return searchText.includes(

                    searchValue

                );



            }

        );



    }







    /*
       DISTRICT FILTER
    */


    const selectedDistrict =


        guideDistrict

        ?

        guideDistrict.value

        :

        "";






    if(selectedDistrict){


        guides = guides.filter(

            guide =>


            guide.district ===

            selectedDistrict


        );


    }







    /*
       LANGUAGE FILTER
    */


    const selectedLanguage =


        guideLanguage

        ?

        guideLanguage.value

        :

        "";







    if(selectedLanguage){



        guides = guides.filter(


            guide =>


            guide.languages.includes(

                selectedLanguage

            )


        );



    }







    /*
       SORT
    */


    const sortValue =


        guideSort

        ?

        guideSort.value


        :

        "name";







    if(

        sortValue === "name"

    ){



        guides.sort(

            (a,b)=>


            (a.fullName || "")

            .localeCompare(

                b.fullName || ""

            )


        );



    }







    else if(

        sortValue === "experience"

    ){



        guides.sort(

            (a,b)=>


            getExperienceScore(

                b.experience

            )

            -

            getExperienceScore(

                a.experience

            )


        );



    }







    filteredGuides =

        guides;






    renderGuides(

        filteredGuides

    );



}







/* ============================================================
   11. EXPERIENCE SCORE
============================================================ */


function getExperienceScore(

experience

){



    const value =


        String(

            experience || ""

        )

        .toLowerCase();






    const number =

        value.match(

            /\d+/

        );





    return number

        ?

        Number(

            number[0]

        )

        :

        0;



}







/* ============================================================
   12. RENDER GUIDES
============================================================ */


function renderGuides(

guides

){



    if(!guidesList){

        return;

    }






    guidesList.innerHTML = "";







    if(guideResultCount){



        guideResultCount.textContent =


        guides.length +

        (

            guides.length === 1

            ?

            " Guide"

            :

            " Guides"

        );



    }







    if(

        guides.length === 0

    ){



        if(guidesEmptyState){


            guidesEmptyState.style.display =

            "block";


        }



        return;



    }







    if(guidesEmptyState){


        guidesEmptyState.style.display =

        "none";


    }







    guides.forEach(

        (guide,index)=>{



            const card =

            document.createElement(

                "article"

            );




            card.className =

            "guide-card";







            card.innerHTML = `



<div class="guide-rank-badge">

🏆 Rank #${index + 1}

</div>




<div class="guide-card-top">


<div class="guide-avatar">

👤

</div>



<div class="guide-main-info">


<h3 class="guide-name">

${escapeHTML(

guide.fullName ||

"Registered Guide"

)}

</h3>



<p class="guide-location">

📍

${escapeHTML(

guide.district ||

"Sri Lanka"

)}

</p>



<span class="verified-badge">

✓ Verified Guide

</span>


</div>


</div>





<div class="guide-details">


<p>

🧑‍💼 Experience:

${escapeHTML(

guide.experience ||

"N/A"

)}

</p>



<p>

🗣 Languages:

${escapeHTML(

guide.languages.join(", ")

||

"N/A"

)}

</p>



<p>

🌿 Specializations:

${escapeHTML(

guide.specializations.join(", ")

||

"General Tourism"

)}

</p>



<p>

🗺 Areas:

${escapeHTML(

guide.areasCovered ||

"N/A"

)}

</p>



</div>





<div class="guide-card-actions">


<button

class="view-guide-button"

>

View Profile

</button>




<button

class="select-guide-button"

>

Select Guide →

</button>



</div>



`;






            guidesList.appendChild(

                card

            );







            card

            .querySelector(

                ".view-guide-button"

            )

            .addEventListener(

                "click",

                ()=>{


                    viewGuideProfile(

                        guide

                    );


                }

            );







            card

            .querySelector(

                ".select-guide-button"

            )

            .addEventListener(

                "click",

                ()=>{


                    selectGuide(

                        guide

                    );


                }

            );





        }

    );



}







/* ============================================================
   13. ESCAPE HTML
============================================================ */


function escapeHTML(value){



    const div =

    document.createElement(

        "div"

    );



    div.textContent =

    String(

        value || ""

    );



    return div.innerHTML;



}
/* ============================================================
   PART 03

   GUIDE PROFILE
   SELECT GUIDE
   FIRESTORE UPDATE
   EVENTS
   INITIALIZE

============================================================ */



/* ============================================================
   14. VIEW GUIDE PROFILE
============================================================ */


function viewGuideProfile(guide){



    const languages =


        guide.languages.length

        ?

        guide.languages.join(", ")

        :

        "Not specified";





    const specializations =


        guide.specializations.length

        ?

        guide.specializations.join(", ")

        :

        "Not specified";






    alert(


        "Guide Profile\n\n" +


        "Name: " +

        (guide.fullName || "N/A") +


        "\n\n" +


        "Province: " +

        (guide.province || "N/A") +



        "\n\n" +


        "District: " +

        (guide.district || "N/A") +




        "\n\n" +


        "Languages: " +

        languages +



        "\n\n" +


        "Experience: " +

        (guide.experience || "N/A") +




        "\n\n" +


        "Specializations: " +

        specializations +



        "\n\n" +


        "Areas Covered: " +

        (guide.areasCovered || "N/A")



    );



}






/* ============================================================
   15. SELECT GUIDE
   FIRESTORE ONLY

============================================================ */


async function selectGuide(guide){



    const confirmSelect =


        confirm(


            `Select ${guide.fullName} as your tour guide?`

        );





    if(!confirmSelect){

        return;

    }







    const user =


        getFirebaseUser();







    if(!user){



        alert(

            "Please login as Tourist."

        );



        window.location.href =

        "login.html?redirect=find-guides.html";



        return;



    }








    if(

        user.accountType !== "tourist"

    ){



        alert(

            "Only Tourist accounts can select guides."

        );



        return;


    }








    try{



        /*
           Find tourist quotation request
        */



        const requestQuery =

        query(


            collection(

                db,

                REQUESTS_COLLECTION

            ),



            where(

                "touristId",

                "==",

                user.id

            ),



            orderBy(

                "createdAt",

                "desc"

            )


        );







        const snapshot =


            await getDocs(

                requestQuery

            );







        if(snapshot.empty){



            alert(

                "Please create quotation request first."

            );



            window.location.href =

            "quotation-request.html";



            return;


        }







        const latestRequest =


            snapshot.docs[0];







        const selectedGuide = {



            id:

            guide.id,




            fullName:

            guide.fullName || "",




            email:

            guide.email || "",




            phone:

            guide.phone || "",




            district:

            guide.district || "",




            province:

            guide.province || "",




            languages:

            guide.languages || [],




            specializations:

            guide.specializations || [],




            areasCovered:

            guide.areasCovered || "",




            profileImage:

            guide.profileImage || ""



        };








        /*
           UPDATE FIRESTORE ONLY
        */



        await updateDoc(



            doc(

                db,

                REQUESTS_COLLECTION,

                latestRequest.id

            ),



            {



                selectedGuide:

                selectedGuide,




                status:

                "guide_selected",




                updatedAt:

                new Date()



            }



        );









        alert(

            "Guide selected successfully."

        );








        window.location.href =

        "tourist-dashboard.html";





    }



    catch(error){



        console.error(

            "Select guide error:",

            error

        );



        alert(

            "Unable to select guide."

        );



    }



}







/* ============================================================
   16. CLEAR FILTERS
============================================================ */


function clearFilters(){



    if(guideSearch){

        guideSearch.value = "";

    }




    if(guideDistrict){

        guideDistrict.value = "";

    }




    if(guideLanguage){

        guideLanguage.value = "";

    }




    if(guideSort){

        guideSort.value = "name";

    }




    filterGuides();



}







/* ============================================================
   17. EVENT LISTENERS
============================================================ */


if(guideSearch){



    guideSearch.addEventListener(

        "input",

        filterGuides

    );



}





if(guideDistrict){



    guideDistrict.addEventListener(

        "change",

        filterGuides

    );



}





if(guideLanguage){



    guideLanguage.addEventListener(

        "change",

        filterGuides

    );



}





if(guideSort){



    guideSort.addEventListener(

        "change",

        filterGuides

    );



}






if(clearGuideFilters){



    clearGuideFilters.addEventListener(

        "click",

        clearFilters

    );



}






if(emptyClearFilters){



    emptyClearFilters.addEventListener(

        "click",

        clearFilters

    );



}







/* ============================================================
   18. INITIALIZE
============================================================ */


document.addEventListener(

"DOMContentLoaded",

async()=>{



    console.log(

        "LankaQuest Find Guides Firebase Loaded"

    );






    const user =

        getFirebaseUser();






    if(user){

        console.log(

            "Current User:",

            user

        );

    }






    await loadGuides();






    console.log(

        "Available Guides:",

        allGuides

    );



}

);
