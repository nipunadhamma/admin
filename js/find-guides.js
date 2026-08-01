
/* ============================================================
   LANKAQUEST
   FIND GUIDES PAGE

   FIRESTORE-ONLY GUIDE SELECTION

   FLOW:

   Tourist
      ↓
   quotation-request.html
      ↓
   Firestore Request
      ↓
   find-guides.html
      ↓
   Load Approved Guides
      ↓
   Select Guide
      ↓
   Update Firestore Request
      ↓
   guideId
   guideName
   guideEmail
   selectedGuide
   status = "guide_selected"
      ↓
   Guide Dashboard
============================================================ */


/* ============================================================
   1. FIREBASE IMPORTS
============================================================ */

import {
    db,
    auth
} from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* ============================================================
   2. DOM ELEMENTS

   These IDs MUST match find-guides.html
============================================================ */

const guidesList =
    document.getElementById("guidesList");

const guidesLoading =
    document.getElementById("guidesLoading");

const guidesEmptyState =
    document.getElementById("guidesEmptyState");

const guideSearch =
    document.getElementById("guideSearch");

const guideDistrict =
    document.getElementById("guideDistrict");

const guideLanguage =
    document.getElementById("guideLanguage");

const guideSort =
    document.getElementById("guideSort");

const guideResultCount =
    document.getElementById("guideResultCount");

const clearGuideFilters =
    document.getElementById("clearGuideFilters");

const emptyClearFilters =
    document.getElementById("emptyClearFilters");


/* ============================================================
   3. STATE
============================================================ */

let guides = [];

let filteredGuides = [];

let currentRequest = null;

let currentRequestId = null;

let currentUser = null;


/* ============================================================
   4. GET REQUEST ID
============================================================ */

function getRequestIdFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("requestId");
}


/* ============================================================
   5. GET CURRENT FIREBASE USER
============================================================ */

function getAuthenticatedUser() {

    return auth.currentUser || null;

}


/* ============================================================
   6. WAIT FOR FIREBASE AUTH
============================================================ */

function waitForAuthenticatedUser() {

    return new Promise(
        (resolve) => {

            const existingUser =
                getAuthenticatedUser();

            if (existingUser) {

                resolve(existingUser);

                return;
            }


            const unsubscribe =
                onAuthStateChanged(
                    auth,
                    (user) => {

                        unsubscribe();

                        resolve(user);

                    }
                );

        }
    );

}


/* ============================================================
   7. ESCAPE HTML
============================================================ */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value == null
            ? ""
            : String(value);

    return div.innerHTML;

}


/* ============================================================
   8. SHOW LOADING
============================================================ */

function showLoading() {

    if (guidesLoading) {

        guidesLoading.style.display =
            "block";

        guidesLoading.textContent =
            "Loading registered guides...";

    }

}


/* ============================================================
   9. HIDE LOADING
============================================================ */

function hideLoading() {

    if (guidesLoading) {

        guidesLoading.style.display =
            "none";

    }

}


/* ============================================================
   10. SHOW EMPTY STATE
============================================================ */

function showEmptyState() {

    if (guidesEmptyState) {

        guidesEmptyState.style.display =
            "block";

    }

}


/* ============================================================
   11. HIDE EMPTY STATE
============================================================ */

function hideEmptyState() {

    if (guidesEmptyState) {

        guidesEmptyState.style.display =
            "none";

    }

}


/* ============================================================
   12. GET CURRENT REQUEST
============================================================ */

async function loadCurrentRequest() {

    currentRequestId =
        getRequestIdFromURL();


    if (!currentRequestId) {

        console.error(
            "No requestId found in URL."
        );

        showPageMessage(
            "No quotation request was found."
        );

        return null;

    }


    try {

        const requestRef =
            doc(
                db,
                "lankaQuestQuotationRequests",
                currentRequestId
            );


        const requestSnapshot =
            await getDoc(requestRef);


        if (!requestSnapshot.exists()) {

            console.error(
                "Quotation request not found:",
                currentRequestId
            );

            showPageMessage(
                "The quotation request could not be found."
            );

            return null;

        }


        currentRequest = {

            id:
                requestSnapshot.id,

            ...requestSnapshot.data()

        };


        console.log(
            "Quotation request loaded:",
            currentRequest
        );


        return currentRequest;

    } catch (error) {

        console.error(
            "Load quotation request error:",
            error
        );


        showPageMessage(
            "Unable to load your quotation request."
        );


        return null;

    }

}


/* ============================================================
   13. VERIFY TOURIST OWNERSHIP
============================================================ */

async function verifyTouristOwnership() {

    if (!currentRequest) {

        return false;

    }


    const firebaseUser =
        getAuthenticatedUser();


    if (!firebaseUser) {

        showPageMessage(
            "Please login as a Tourist before selecting a guide."
        );

        return false;

    }


    currentUser =
        firebaseUser;


    /*
       Request must belong to
       authenticated Firebase user.
    */

    if (
        currentRequest.touristId &&
        currentRequest.touristId !==
            firebaseUser.uid
    ) {

        console.error(
            "Tourist ownership mismatch."
        );


        showPageMessage(
            "You are not authorized to modify this quotation request."
        );


        return false;

    }


    return true;

}


/* ============================================================
   14. LOAD APPROVED GUIDES
============================================================ */

async function loadGuides() {

    if (!guidesList) {

        console.error(
            "guidesList element not found."
        );

        return;

    }


    showLoading();

    hideEmptyState();


    try {

        /*
           ONLY APPROVED GUIDES

           No status fallback.
           No accountStatus fallback.
        */

        const guidesQuery =
            query(
                collection(
                    db,
                    "lankaQuestGuides"
                ),
                where(
                    "verificationStatus",
                    "==",
                    "approved"
                )
            );


        const guidesSnapshot =
            await getDocs(
                guidesQuery
            );


        console.log(
            "Approved guide documents found:",
            guidesSnapshot.size
        );


        guides = [];


        guidesSnapshot.forEach(
            (guideSnapshot) => {

                const data =
                    guideSnapshot.data();


                console.log(
                    "Approved guide:",
                    guideSnapshot.id,
                    data
                );


                /*
                   Only actual guide accounts.
                */

                if (
                    data.accountType !==
                    "guide"
                ) {

                    return;

                }


                guides.push({

                    id:
                        guideSnapshot.id,

                    uid:
                        data.uid ||
                        guideSnapshot.id,

                    ...data

                });

            }
        );


        filteredGuides =
            [...guides];


        populateDistrictFilter();

        populateLanguageFilter();

        applySort();

        renderGuides();


        console.log(
            "Approved guides loaded:",
            guides.length
        );


    } catch (error) {

        console.error(
            "Load guides error:",
            error
        );


        guidesList.innerHTML = "";

        showEmptyState();


        if (guidesEmptyState) {

            guidesEmptyState.querySelector("h3")?.replaceChildren(
                document.createTextNode(
                    "Unable to Load Guides"
                )
            );

        }


    } finally {

        hideLoading();

    }

}


/* ============================================================
   15. POPULATE DISTRICT FILTER
============================================================ */

function populateDistrictFilter() {

    if (!guideDistrict) {

        return;

    }


    const districts = [

        ...new Set(

            guides
                .map(
                    (guide) =>
                        guide.district
                )
                .filter(Boolean)

        )

    ].sort();


    guideDistrict.innerHTML = `

        <option value="">
            All Districts
        </option>

    `;


    districts.forEach(
        (district) => {

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

}


/* ============================================================
   16. POPULATE LANGUAGE FILTER
============================================================ */

function populateLanguageFilter() {

    if (!guideLanguage) {

        return;

    }


    const languages = [];


    guides.forEach(
        (guide) => {

            const guideLanguages =
                guide.languages ||
                guide.language ||
                [];


            if (
                Array.isArray(
                    guideLanguages
                )
            ) {

                guideLanguages.forEach(
                    (language) => {

                        if (language) {

                            languages.push(
                                String(
                                    language
                                ).trim()
                            );

                        }

                    }
                );

            } else {

                String(
                    guideLanguages
                )
                    .split(",")
                    .forEach(
                        (language) => {

                            if (
                                language.trim()
                            ) {

                                languages.push(
                                    language.trim()
                                );

                            }

                        }
                    );

            }

        }
    );


    const uniqueLanguages =
        [
            ...new Set(
                languages
            )
        ].sort();


    guideLanguage.innerHTML = `

        <option value="">
            All Languages
        </option>

    `;


    uniqueLanguages.forEach(
        (language) => {

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
   17. APPLY FILTERS
============================================================ */

function applyFilters() {

    const search =
        guideSearch
            ? guideSearch.value
                .trim()
                .toLowerCase()
            : "";


    const district =
        guideDistrict
            ? guideDistrict.value
            : "";


    const language =
        guideLanguage
            ? guideLanguage.value
            : "";


    filteredGuides =
        guides.filter(
            (guide) => {

                /*
                   SEARCH
                */

                if (search) {

                    const searchableText = [

                        guide.fullName,

                        guide.name,

                        guide.district,

                        guide.province,

                        guide.email,

                        guide.specializations,

                        guide.specialization,

                        guide.areas,

                        guide.coverageAreas,

                        guide.languages,

                        guide.language

                    ]
                        .flat()
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    if (
                        !searchableText.includes(
                            search
                        )
                    ) {

                        return false;

                    }

                }


                /*
                   DISTRICT
                */

                if (
                    district &&
                    guide.district !==
                        district
                ) {

                    return false;

                }


                /*
                   LANGUAGE
                */

                if (language) {

                    const guideLanguages =
                        guide.languages ||
                        guide.language ||
                        [];


                    const languageMatch =
                        Array.isArray(
                            guideLanguages
                        )
                            ? guideLanguages.some(
                                (item) =>
                                    String(item)
                                        .toLowerCase()
                                        .trim() ===
                                    language
                                        .toLowerCase()
                                        .trim()
                              )
                            : String(
                                guideLanguages
                              )
                                .toLowerCase()
                                .split(",")
                                .map(
                                    (item) =>
                                        item.trim()
                                )
                                .includes(
                                    language
                                        .toLowerCase()
                                        .trim()
                                );


                    if (!languageMatch) {

                        return false;

                    }

                }


                return true;

            }
        );


    applySort();

    renderGuides();

}


/* ============================================================
   18. APPLY SORT
============================================================ */

function applySort() {

    const sort =
        guideSort
            ? guideSort.value
            : "rank";


    if (
        sort === "rating" ||
        sort === "rank"
    ) {

        filteredGuides.sort(
            (a, b) => {

                const ratingA =
                    Number(
                        a.rating ||
                        a.averageRating ||
                        0
                    );


                const ratingB =
                    Number(
                        b.rating ||
                        b.averageRating ||
                        0
                    );


                return ratingB -
                    ratingA;

            }
        );


        return;

    }


    if (
        sort === "experience"
    ) {

        filteredGuides.sort(
            (a, b) => {

                const experienceA =
                    Number(
                        a.experienceYears ||
                        0
                    );


                const experienceB =
                    Number(
                        b.experienceYears ||
                        0
                    );


                return experienceB -
                    experienceA;

            }
        );


        return;

    }


    if (
        sort === "reviews"
    ) {

        filteredGuides.sort(
            (a, b) => {

                const reviewsA =
                    Number(
                        a.reviewCount ||
                        a.reviewsCount ||
                        0
                    );


                const reviewsB =
                    Number(
                        b.reviewCount ||
                        b.reviewsCount ||
                        0
                    );


                return reviewsB -
                    reviewsA;

            }
        );


        return;

    }


    if (
        sort === "completed"
    ) {

        filteredGuides.sort(
            (a, b) => {

                const completedA =
                    Number(
                        a.completedTrips ||
                        a.completedTourCount ||
                        0
                    );


                const completedB =
                    Number(
                        b.completedTrips ||
                        b.completedTourCount ||
                        0
                    );


                return completedB -
                    completedA;

            }
        );


        return;

    }

}


/* ============================================================
   19. RENDER GUIDES
============================================================ */

function renderGuides() {

    if (!guidesList) {

        return;

    }


    guidesList.innerHTML = "";


    if (guideResultCount) {

        guideResultCount.textContent =
            `${filteredGuides.length} Guide${
                filteredGuides.length === 1
                    ? ""
                    : "s"
            }`;

    }


    if (
        filteredGuides.length === 0
    ) {

        showEmptyState();

        return;

    }


    hideEmptyState();


    filteredGuides.forEach(
        (guide, index) => {

            const card =
                createGuideCard(
                    guide,
                    index
                );


            guidesList.appendChild(
                card
            );

        }
    );

}


/* ============================================================
   20. CREATE GUIDE CARD
============================================================ */

function createGuideCard(
    guide,
    index
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "guide-card";


    const name =
        guide.fullName ||
        guide.name ||
        "Registered Guide";


    const district =
        guide.district ||
        "Sri Lanka";


    const rating =
        guide.rating ||
        guide.averageRating ||
        "New";


    const experience =
        guide.experienceYears ||
        guide.experience ||
        "Not specified";


    const languages =
        guide.languages ||
        guide.language ||
        [];


    let languageText =
        "N/A";


    if (
        Array.isArray(
            languages
        )
    ) {

        languageText =
            languages.length
                ? languages.join(", ")
                : "N/A";

    } else if (
        languages
    ) {

        languageText =
            String(
                languages
            );

    }


    const specializations =
        guide.specializations ||
        guide.specialization ||
        "General Tourism";


    const areas =
        guide.areas ||
        guide.coverageAreas ||
        "N/A";


    const avatar =
        guide.photoURL ||
        guide.profileImage ||
        guide.photo ||
        "";


    const avatarHTML =
        avatar
            ? `

                <img
                    src="${escapeHTML(avatar)}"
                    alt="${escapeHTML(name)}"
                    class="guide-avatar-image"
                >

            `
            : `

                <div class="guide-avatar-placeholder">
                    👤
                </div>

            `;


    card.innerHTML = `

        <div class="guide-rank">

            🏆 Rank #${index + 1}

        </div>


        <div class="guide-card-header">

            ${avatarHTML}

            <div>

                <h3>
                    ${escapeHTML(name)}
                </h3>

                <p>
                    📍
                    ${escapeHTML(district)}
                </p>

            </div>

        </div>


        <div class="guide-verified">

            ✓ Verified Guide

        </div>


        <div class="guide-details">

            <p>

                🧑‍💼

                <strong>
                    Experience:
                </strong>

                ${escapeHTML(
                    experience
                )}

            </p>


            <p>

                🗣

                <strong>
                    Languages:
                </strong>

                ${escapeHTML(
                    languageText
                )}

            </p>


            <p>

                🌿

                <strong>
                    Specializations:
                </strong>

                ${escapeHTML(
                    Array.isArray(
                        specializations
                    )
                        ? specializations.join(
                            ", "
                          )
                        : specializations
                )}

            </p>


            <p>

                🗺

                <strong>
                    Areas:
                </strong>

                ${escapeHTML(
                    Array.isArray(
                        areas
                    )
                        ? areas.join(
                            ", "
                          )
                        : areas
                )}

            </p>


            <p>

                ⭐

                <strong>
                    Rating:
                </strong>

                ${escapeHTML(
                    rating
                )}

            </p>

        </div>


        <div class="guide-card-actions">

            <button
                type="button"
                class="view-guide-button"
            >
                View Profile
            </button>


            <button
                type="button"
                class="select-guide-button"
            >
                Select Guide →
            </button>

        </div>

    `;


    const viewButton =
        card.querySelector(
            ".view-guide-button"
        );


    if (viewButton) {

        viewButton.addEventListener(
            "click",
            () => {

                viewGuideProfile(
                    guide
                );

            }
        );

    }


    const selectButton =
        card.querySelector(
            ".select-guide-button"
        );


    if (selectButton) {

        selectButton.addEventListener(
            "click",
            async () => {

                await selectGuide(
                    guide,
                    selectButton
                );

            }
        );

    }


    return card;

}


/* ============================================================
   21. VIEW GUIDE PROFILE
============================================================ */

function viewGuideProfile(
    guide
) {

    const name =
        guide.fullName ||
        guide.name ||
        "Guide";


    const email =
        guide.email ||
        "Not available";


    const phone =
        guide.phone ||
        guide.phoneNumber ||
        "Not available";


    const district =
        guide.district ||
        "Not specified";


    const languages =
        guide.languages ||
        guide.language ||
        "N/A";


    const specializations =
        guide.specializations ||
        guide.specialization ||
        "General Tourism";


    alert(

        `${name}\n\n` +

        `📍 ${district}\n` +

        `📧 ${email}\n` +

        `📞 ${phone}\n\n` +

        `🗣 Languages: ${
            Array.isArray(
                languages
            )
                ? languages.join(
                    ", "
                  )
                : languages
        }\n\n` +

        `🌿 Specializations: ${
            Array.isArray(
                specializations
            )
                ? specializations.join(
                    ", "
                  )
                : specializations
        }`

    );

}


/* ============================================================
   22. SELECT GUIDE
============================================================ */

async function selectGuide(
    guide,
    button
) {

    if (
        button &&
        button.disabled
    ) {

        return;

    }


    const firebaseUser =
        getAuthenticatedUser();


    if (!firebaseUser) {

        alert(
            "Please login as a Tourist before selecting a guide."
        );

        return;

    }


    currentUser =
        firebaseUser;


    if (
        !currentRequest ||
        !currentRequest.id
    ) {

        alert(
            "Quotation request was not found."
        );

        return;

    }


    /*
       Verify request ownership
    */

    if (
        currentRequest.touristId &&
        currentRequest.touristId !==
            firebaseUser.uid
    ) {

        alert(
            "You are not authorized to modify this request."
        );

        return;

    }


    /*
       Guide UID
    */

    const guideId =
        guide.uid ||
        guide.id;


    if (!guideId) {

        console.error(
            "Guide UID is missing:",
            guide
        );


        alert(
            "This guide could not be selected because the guide ID is missing."
        );


        return;

    }


    const guideName =
        guide.fullName ||
        guide.name ||
        "";


    const guideEmail =
        guide.email ||
        "";


    const confirmed =
        window.confirm(
            `Select ${guideName || "this guide"} as your tour guide?`
        );


    if (!confirmed) {

        return;

    }


    if (button) {

        button.disabled =
            true;

        button.dataset.originalText =
            button.textContent;

        button.textContent =
            "Selecting...";

    }


    try {

        /*
           Selected guide snapshot
        */

        const selectedGuide = {

            uid:
                guideId,

            id:
                guideId,

            fullName:
                guideName,

            email:
                guideEmail,

            phone:
                guide.phone ||
                guide.phoneNumber ||
                "",

            district:
                guide.district ||
                "",

            province:
                guide.province ||
                "",

            languages:
                guide.languages ||
                guide.language ||
                [],

            specializations:
                guide.specializations ||
                guide.specialization ||
                "",

            areas:
                guide.areas ||
                guide.coverageAreas ||
                "",

            verificationStatus:
                guide.verificationStatus

        };


        /*
           Update Firestore request
        */

        const requestRef =
            doc(
                db,
                "lankaQuestQuotationRequests",
                currentRequest.id
            );


        await updateDoc(
            requestRef,
            {

                guideId:
                    guideId,

                guideName:
                    guideName,

                guideEmail:
                    guideEmail,

                selectedGuide:
                    selectedGuide,

                status:
                    "guide_selected",

                quotationRequested:
                    true,

                guideSelectedAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }
        );


        /*
           Update local state
        */

        currentRequest.guideId =
            guideId;

        currentRequest.guideName =
            guideName;

        currentRequest.guideEmail =
            guideEmail;

        currentRequest.selectedGuide =
            selectedGuide;

        currentRequest.status =
            "guide_selected";

        currentRequest.quotationRequested =
            true;


        console.log(
            "Guide selected successfully.",
            {

                requestId:
                    currentRequest.id,

                guideId:
                    guideId,

                guideName:
                    guideName,

                guideEmail:
                    guideEmail

            }
        );


        alert(
            `${guideName || "Guide"} has been selected successfully.`
        );


        /*
           Continue to quotation request page
        */

        window.location.href =
            `quotation-request.html?requestId=${
                encodeURIComponent(
                    currentRequest.id
                )
            }&guideId=${
                encodeURIComponent(
                    guideId
                )
            }`;


    } catch (error) {

        console.error(
            "Select guide Firestore error:",
            error
        );


        alert(
            error.message ||
            "Unable to select this guide. Please try again."
        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                button.dataset.originalText ||
                "Select Guide →";

        }

    }

}


/* ============================================================
   23. SHOW PAGE MESSAGE
============================================================ */

function showPageMessage(
    message
) {

    if (guidesList) {

        guidesList.innerHTML = `

            <div class="guide-error">

                <div>
                    ⚠️
                </div>

                <h3>
                    ${escapeHTML(message)}
                </h3>

            </div>

        `;

    } else {

        alert(message);

    }

}


/* ============================================================
   24. CLEAR FILTERS
============================================================ */

function clearFilters() {

    if (guideSearch) {

        guideSearch.value =
            "";

    }


    if (guideDistrict) {

        guideDistrict.value =
            "";

    }


    if (guideLanguage) {

        guideLanguage.value =
            "";

    }


    if (guideSort) {

        guideSort.value =
            "rank";

    }


    filteredGuides =
        [...guides];


    applySort();

    renderGuides();

}


/* ============================================================
   25. EVENT LISTENERS
============================================================ */

if (guideSearch) {

    guideSearch.addEventListener(
        "input",
        () => {

            applyFilters();

        }
    );

}


if (guideDistrict) {

    guideDistrict.addEventListener(
        "change",
        () => {

            applyFilters();

        }
    );

}


if (guideLanguage) {

    guideLanguage.addEventListener(
        "change",
        () => {

            applyFilters();

        }
    );

}


if (guideSort) {

    guideSort.addEventListener(
        "change",
        () => {

            applyFilters();

        }
    );

}


if (clearGuideFilters) {

    clearGuideFilters.addEventListener(
        "click",
        () => {

            clearFilters();

        }
    );

}


if (emptyClearFilters) {

    emptyClearFilters.addEventListener(
        "click",
        () => {

            clearFilters();

        }
    );

}


/* ============================================================
   26. INITIALIZE
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "LankaQuest Find Guides loading..."
        );


        /*
           Wait for Firebase Auth
        */

        const firebaseUser =
            await waitForAuthenticatedUser();


        if (!firebaseUser) {

            showPageMessage(
                "Please login as a Tourist before finding guides."
            );

            return;

        }


        currentUser =
            firebaseUser;


        /*
           Load quotation request
        */

        const request =
            await loadCurrentRequest();


        if (!request) {

            return;

        }


        /*
           Verify ownership
        */

        const authorized =
            await verifyTouristOwnership();


        if (!authorized) {

            return;

        }


        /*
           Load approved guides
        */

        await loadGuides();


        console.log(
            "Find Guides page initialized.",
            {

                requestId:
                    currentRequestId,

                touristId:
                    currentUser?.uid,

                guides:
                    guides.length

            }
        );

    }
);


/* ============================================================
   END FIND-GUIDES.JS
============================================================ */

