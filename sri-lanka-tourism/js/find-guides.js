/* ============================================================
   FIND REGISTERED GUIDES
   Explore Sri Lanka

   Features:

   🧑‍💼 Registered Guides
   ✅ Approved Guides Only
   🟢 Active Guides Only
   🏆 Ranking
   ⭐ Rating
   🔎 Search
   📍 District Filter
   🗣 Language Filter
   📊 Sorting
   👤 Select Guide

   Frontend Demo Architecture

   Later:

   localStorage
        ↓
   Backend API
        ↓
   Database
============================================================ */

/* ============================================================
   1. STORAGE KEYS
============================================================ */

const REGISTERED_GUIDES_KEY = "exploreSriLankaRegisteredGuides";

const SELECTED_GUIDE_KEY = "exploreSriLankaSelectedGuide";

/* ============================================================
   2. DEMO GUIDES
============================================================ */

/*
   දැනට Backend එකක් නැති නිසා
   Demo Guides කිහිපයක් භාවිතා කරමු.

   Production version එකේදී
   මේ data Backend Database එකෙන්
   ලබාගත හැක.
*/

const demoGuides = [
  {
    id: "guide-demo-001",

    accountType: "guide",

    fullName: "Demo Sri Lanka Guide",

    email: "guide@example.com",

    phone: "+94 77 123 4567",

    district: "Kandy",

    province: "Central Province",

    languages: "English, Sinhala",

    experience: "5-10",

    experienceYears: 7,

    rating: 4.9,

    reviewCount: 125,

    completedTrips: 87,

    verificationStatus: "approved",

    status: "active",

    profileImage: "",

    specializations: ["Cultural Tours", "Kandy Tours", "Heritage"],
  },

  {
    id: "guide-demo-002",

    accountType: "guide",

    fullName: "Kasun Perera",

    email: "kasun@example.com",

    phone: "+94 71 234 5678",

    district: "Galle",

    province: "Southern Province",

    languages: "English, Sinhala, Tamil",

    experience: "8-10",

    experienceYears: 9,

    rating: 4.8,

    reviewCount: 180,

    completedTrips: 132,

    verificationStatus: "approved",

    status: "active",

    profileImage: "",

    specializations: ["Galle Fort", "Southern Coast", "Beach Tours"],
  },

  {
    id: "guide-demo-003",

    accountType: "guide",

    fullName: "Nimal Silva",

    email: "nimal@example.com",

    phone: "+94 76 345 6789",

    district: "Matale",

    province: "Central Province",

    languages: "English, Sinhala",

    experience: "3-5",

    experienceYears: 5,

    rating: 4.7,

    reviewCount: 76,

    completedTrips: 54,

    verificationStatus: "approved",

    status: "active",

    profileImage: "",

    specializations: ["Sigiriya", "Dambulla", "Cultural Tours"],
  },
];

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
   4. GET REGISTERED GUIDES
============================================================ */

function getRegisteredGuides() {
  /*
       Demo Guides
    */

  let guides = [...demoGuides];

  /*
       LocalStorage Registered Guides
    */

  const savedGuides = localStorage.getItem(REGISTERED_GUIDES_KEY);

  /*
       No Registered Guides
    */

  if (!savedGuides) {
    return guides;
  }

  /*
       Parse Saved Guides
    */

  try {
    const registeredGuides = JSON.parse(savedGuides);

    if (Array.isArray(registeredGuides)) {
      guides = [...guides, ...registeredGuides];
    }
  } catch (error) {
    console.error(
      "Registered guides data error:",

      error,
    );
  }

  /*
       Remove Duplicate Guide IDs
    */

  const uniqueGuides = guides.filter(
    (guide, index, self) =>
      index === self.findIndex((item) => item.id === guide.id),
  );

  /*
       Only Approved + Active Guides
    */

  return uniqueGuides.filter(
    (guide) =>
      guide.accountType === "guide" &&
      guide.verificationStatus === "approved" &&
      guide.status === "active",
  );
}

/* ============================================================
   5. CALCULATE GUIDE RANK
============================================================ */

function calculateGuideRank(guide) {
  /*
       Rating Score
       Maximum 50
    */

  const ratingScore = (Number(guide.rating) || 0) * 10;

  /*
       Review Score
       Maximum 15
    */

  const reviewScore = Math.min(
    (Number(guide.reviewCount) || 0) / 10,

    15,
  );

  /*
       Experience Score
       Maximum 15
    */

  const experienceScore = Math.min(
    (Number(guide.experienceYears) || 0) * 1.5,

    15,
  );

  /*
       Completed Trips
       Maximum 20
    */

  const completedScore = Math.min(
    (Number(guide.completedTrips) || 0) / 10,

    20,
  );

  /*
       Total Rank Score
    */

  return ratingScore + reviewScore + experienceScore + completedScore;
}

/* ============================================================
   6. PREPARE GUIDE DATA
============================================================ */

function prepareGuide(guide) {
  return {
    ...guide,

    rankScore: calculateGuideRank(guide),
  };
}

/* ============================================================
   7. LOAD FILTER OPTIONS
============================================================ */

function loadFilterOptions() {
  const guides = getRegisteredGuides();

  /*
       Districts
    */

  const districts = [
    ...new Set(
      guides

        .map((guide) => guide.district)

        .filter(Boolean),
    ),
  ].sort();

  /*
       Languages
    */

  const languages = [
    ...new Set(
      guides

        .flatMap((guide) => String(guide.languages || "").split(","))

        .map((language) => language.trim())

        .filter(Boolean),
    ),
  ].sort();

  /*
       Add District Options
    */

  districts.forEach((district) => {
    const option = document.createElement("option");

    option.value = district;

    option.textContent = district;

    guideDistrict.appendChild(option);
  });

  /*
       Add Language Options
    */

  languages.forEach((language) => {
    const option = document.createElement("option");

    option.value = language;

    option.textContent = language;

    guideLanguage.appendChild(option);
  });
}

/* ============================================================
   8. FILTER GUIDES
============================================================ */

function filterGuides() {
  let guides = getRegisteredGuides().map(prepareGuide);

  /*
       Search
    */

  const searchValue = guideSearch.value

    .trim()

    .toLowerCase();

  if (searchValue) {
    guides = guides.filter(
      (guide) =>
        String(guide.fullName || "")
          .toLowerCase()

          .includes(searchValue) ||
        String(guide.district || "")
          .toLowerCase()

          .includes(searchValue),
    );
  }

  /*
       District Filter
    */

  const selectedDistrict = guideDistrict.value;

  if (selectedDistrict) {
    guides = guides.filter((guide) => guide.district === selectedDistrict);
  }

  /*
       Language Filter
    */

  const selectedLanguage = guideLanguage.value;

  if (selectedLanguage) {
    guides = guides.filter((guide) =>
      String(guide.languages || "")
        .toLowerCase()

        .includes(selectedLanguage.toLowerCase()),
    );
  }

  /*
       Sort
    */

  const sortValue = guideSort.value;

  if (sortValue === "rank") {
    guides.sort((a, b) => b.rankScore - a.rankScore);
  } else if (sortValue === "rating") {
    guides.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
  } else if (sortValue === "experience") {
    guides.sort(
      (a, b) =>
        (Number(b.experienceYears) || 0) - (Number(a.experienceYears) || 0),
    );
  } else if (sortValue === "reviews") {
    guides.sort(
      (a, b) => (Number(b.reviewCount) || 0) - (Number(a.reviewCount) || 0),
    );
  } else if (sortValue === "completed") {
    guides.sort(
      (a, b) =>
        (Number(b.completedTrips) || 0) - (Number(a.completedTrips) || 0),
    );
  }

  /*
       Render
    */

  renderGuides(guides);
}

/* ============================================================
   9. RENDER GUIDES
============================================================ */

function renderGuides(guides) {
  /*
       Clear
    */

  guidesList.innerHTML = "";

  /*
       Count
    */

  guideResultCount.textContent =
    guides.length + (guides.length === 1 ? " Guide" : " Guides");

  /*
       Hide Loading
    */

  guidesLoading.style.display = "none";

  /*
       Empty
    */

  if (guides.length === 0) {
    guidesEmptyState.style.display = "block";

    return;
  }

  /*
       Hide Empty
    */

  guidesEmptyState.style.display = "none";

  /*
       Create Cards
    */

  guides.forEach((guide, index) => {
    const card = document.createElement("article");

    card.className = "guide-card";

    const languages = guide.languages || "Not specified";

    const specializations = Array.isArray(guide.specializations)
      ? guide.specializations.join(", ")
      : "General Tourism";

    card.innerHTML = `

                <div class="guide-rank-badge">

                    🏆 Rank #${index + 1}

                </div>


                <div class="guide-card-top">


                    <div class="guide-avatar">

                        ${
                          guide.profileImage
                            ? `<img
                                src="${guide.profileImage}"
                                alt="${guide.fullName}"
                            >`
                            : "🧑‍💼"
                        }

                    </div>


                    <div class="guide-main-info">


                        <div class="guide-name-row">


                            <h3 class="guide-name">

                                ${guide.fullName}

                            </h3>


                            <span class="verified-badge">

                                ✓ Verified

                            </span>


                        </div>


                        <p class="guide-location">

                            📍

                            ${guide.district || "Sri Lanka"}

                            ${guide.province ? " · " + guide.province : ""}

                        </p>

                    </div>

                </div>



                <div class="guide-stats">


                    <div class="guide-stat">

                        <strong>

                            ⭐ ${guide.rating || "N/A"}

                        </strong>

                        <span>
                            Rating
                        </span>

                    </div>


                    <div class="guide-stat">

                        <strong>

                            📝 ${guide.reviewCount || 0}

                        </strong>

                        <span>
                            Reviews
                        </span>

                    </div>


                    <div class="guide-stat">

                        <strong>

                            ✈️ ${guide.completedTrips || 0}

                        </strong>

                        <span>
                            Trips
                        </span>

                    </div>

                </div>



                <div class="guide-details">


                    <div class="guide-detail-row">

                        <span>
                            🧑‍💼
                        </span>

                        <strong>
                            Experience:
                        </strong>

                        <span>
                            ${guide.experience || "Not specified"}
                        </span>

                    </div>


                    <div class="guide-detail-row">

                        <span>
                            🗣️
                        </span>

                        <strong>
                            Languages:
                        </strong>

                        <span>
                            ${languages}
                        </span>

                    </div>


                    <div class="guide-detail-row">

                        <span>
                            🌿
                        </span>

                        <strong>
                            Specialties:
                        </strong>

                        <span>
                            ${specializations}
                        </span>

                    </div>

                </div>



                <div class="guide-card-actions">


                    <button
                        type="button"
                        class="view-guide-button"
                        data-guide-id="${guide.id}"
                    >

                        View Profile

                    </button>


                    <button
                        type="button"
                        class="select-guide-button"
                        data-guide-id="${guide.id}"
                    >

                        Select Guide →

                    </button>

                </div>

            `;

    /*
               View Profile
            */

    const viewButton = card.querySelector(".view-guide-button");

    viewButton.addEventListener("click", () => {
      viewGuideProfile(guide);
    });

    /*
               Select Guide
            */

    const selectButton = card.querySelector(".select-guide-button");

    selectButton.addEventListener("click", () => {
      selectGuide(guide);
    });

    /*
               Add Card
            */

    guidesList.appendChild(card);
  });
}

/* ============================================================
   10. VIEW GUIDE PROFILE
============================================================ */

function viewGuideProfile(guide) {
  /*
       දැනට Full Profile Page එකක්
       තවම හදලා නැති නිසා
       Demo Profile Information එකක් පෙන්වමු.
    */

  alert(
    "Guide Profile\n\n" +
      "Name: " +
      guide.fullName +
      "\n\nDistrict: " +
      (guide.district || "Not specified") +
      "\n\nLanguages: " +
      (guide.languages || "Not specified") +
      "\n\nExperience: " +
      (guide.experience || "Not specified") +
      "\n\nRating: ⭐ " +
      (guide.rating || "N/A") +
      "\n\nReviews: " +
      (guide.reviewCount || 0) +
      "\n\nCompleted Trips: " +
      (guide.completedTrips || 0),
  );
}

/* ============================================================
   11. SELECT GUIDE
============================================================ */

function selectGuide(guide) {

    /*
       Tourist Login Check
    */

    const user =
        typeof getCurrentUser === "function"
            ? getCurrentUser()
            : null;


    /*
       Not Logged In
    */

    if (!user) {

        /*
           Selected Guide එක
           Login එකට කලින් save කරමු.
        */

        localStorage.setItem(

            SELECTED_GUIDE_KEY,

            JSON.stringify(
                guide
            )

        );


        /*
           Login Page
        */

        window.location.href =
            "login.html?redirect=find-guides.html";


        return;

    }


    /*
       Tourist Only
    */

    if (
        user.accountType !==
        "tourist"
    ) {

        alert(
            "Only Tourist accounts can select a guide."
        );


        if (
            typeof redirectAfterLogin ===
            "function"
        ) {

            redirectAfterLogin(
                user
            );

        }


        return;

    }


    /*
       Save Selected Guide
    */

    localStorage.setItem(

        SELECTED_GUIDE_KEY,

        JSON.stringify(
            guide
        )

    );


    /*
       Get Existing Quotation Requests
    */

    const savedRequests =

        localStorage.getItem(

            "exploreSriLankaQuotationRequests"

        );


    /*
       No Requests Found
    */

    if (!savedRequests) {

        alert(

            "No quotation request was found. Please submit a quotation request first."

        );


        window.location.href =
            "quotation-request.html";


        return;

    }


    let requests = [];


    /*
       Parse Requests
    */

    try {

        requests =
            JSON.parse(
                savedRequests
            );


    }

    catch (error) {

        console.error(

            "Quotation requests data error:",

            error

        );


        alert(

            "Unable to load your quotation request."

        );


        return;

    }


    /*
       Find Latest Request
       Belonging to Current Tourist
    */

    const touristRequests =

        requests.filter(

            request =>

                request.tourist &&

                (

                    request.tourist.id ===
                    user.id

                    ||

                    request.tourist.email ===
                    user.email

                )

        );


    /*
       No Tourist Request
    */

    if (
        touristRequests.length ===
        0
    ) {

        alert(

            "Please submit a quotation request before selecting a guide."

        );


        window.location.href =
            "quotation-request.html";


        return;

    }


    /*
       Get Latest Request
    */

    const latestRequest =

        touristRequests[
            touristRequests.length - 1
        ];


    /*
       Attach Selected Guide
       To Latest Request
    */

    latestRequest.selectedGuide = {

        id:
            guide.id,

        fullName:
            guide.fullName,

        email:
            guide.email || "",

        phone:
            guide.phone || "",

        district:
            guide.district || "",

        province:
            guide.province || "",

        languages:
            guide.languages || "",

        rating:
            guide.rating || 0,

        reviewCount:
            guide.reviewCount || 0,

        completedTrips:
            guide.completedTrips || 0

    };


    /*
       Update Request Status
    */

    latestRequest.status =
        "guide_selected";


    /*
       Save Updated Requests
    */

    localStorage.setItem(

        "exploreSriLankaQuotationRequests",

        JSON.stringify(
            requests
        )

    );


    /*
       Save Selected Guide
       Separately Also
    */

    localStorage.setItem(

        SELECTED_GUIDE_KEY,

        JSON.stringify(
            guide
        )

    );


    /*
       Success Message
    */

    alert(

        "Guide selected successfully. Your trip request has been updated."

    );


    /*
       Go To Tourist Dashboard
    */

    window.location.href =
        "tourist-dashboard.html";

}

/* ============================================================
   12. CLEAR FILTERS
============================================================ */

function clearFilters() {
  guideSearch.value = "";

  guideDistrict.value = "";

  guideLanguage.value = "";

  guideSort.value = "rank";

  filterGuides();
}

/* ============================================================
   13. EVENTS
============================================================ */

guideSearch.addEventListener(
  "input",

  filterGuides,
);

guideDistrict.addEventListener(
  "change",

  filterGuides,
);

guideLanguage.addEventListener(
  "change",

  filterGuides,
);

guideSort.addEventListener(
  "change",

  filterGuides,
);

clearGuideFilters.addEventListener(
  "click",

  clearFilters,
);

emptyClearFilters.addEventListener(
  "click",

  clearFilters,
);

/* ============================================================
   14. INITIALIZE
============================================================ */

document.addEventListener(
  "DOMContentLoaded",

  () => {
    /*
           Load Filter Options
        */

    loadFilterOptions();

    /*
           Load Guides
        */

    filterGuides();

    console.log("Find Registered Guides Loaded");
  },
);
