
/* ============================================================
   LankaWayfarer
   FIND GUIDES

   FIREBASE / FIRESTORE FIRST ARCHITECTURE

   FLOW:

   Tourist
      ↓
   quotation-request.html
      ↓
   Firestore Quotation Request
      ↓
   find-guides.html?requestId=...
      ↓
   Verify Firebase Tourist
      ↓
   Verify Request Ownership
      ↓
   Load Approved Guides
      ↓
   Search / Filter / Sort
      ↓
   Select Guide
      ↓
   Update Firestore Request
      ↓
   status = "guide_selected"
      ↓
   quotation-request.html?requestId=...&guideId=...
============================================================ */


/* ============================================================
   1. FIREBASE IMPORTS
============================================================ */

import {
    auth,
    db
} from "./firebase-config.js";

import {
    onAuthStateChanged
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
   2. FIRESTORE COLLECTIONS
============================================================ */

const GUIDE_COLLECTION =
    "lankaQuestGuides";

const QUOTATION_COLLECTION =
    "lankaQuestQuotationRequests";


/* ============================================================
   3. DOM ELEMENTS
============================================================ */

const guidesList =
    document.getElementById(
        "guidesList"
    );

const guidesLoading =
    document.getElementById(
        "guidesLoading"
    );

const guidesEmptyState =
    document.getElementById(
        "guidesEmptyState"
    );

const guideSearch =
    document.getElementById(
        "guideSearch"
    );

const guideDistrict =
    document.getElementById(
        "guideDistrict"
    );

const guideLanguage =
    document.getElementById(
        "guideLanguage"
    );

const guideSort =
    document.getElementById(
        "guideSort"
    );

const guideResultCount =
    document.getElementById(
        "guideResultCount"
    );

const clearGuideFilters =
    document.getElementById(
        "clearGuideFilters"
    );

const emptyClearFilters =
    document.getElementById(
        "emptyClearFilters"
    );


/* ============================================================
   4. STATE
============================================================ */

let guides = [];

let filteredGuides = [];

let currentRequest = null;

let currentRequestId = null;

let currentUser = null;


/* ============================================================
   5. GET REQUEST ID
============================================================ */

function getRequestId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get(
        "requestId"
    );

}


/* ============================================================
   6. GET AUTHENTICATED USER
============================================================ */

function getAuthenticatedUser() {

    return auth.currentUser || null;

}


/* ============================================================
   7. WAIT FOR FIREBASE AUTH
============================================================ */

function waitForAuthenticatedUser() {

    return new Promise(
        (resolve) => {

            const existingUser =
                getAuthenticatedUser();


            if (existingUser) {

                resolve(
                    existingUser
                );

                return;

            }


            const unsubscribe =
                onAuthStateChanged(
                    auth,
                    (user) => {

                        unsubscribe();

                        resolve(
                            user || null
                        );

                    }
                );

        }
    );

}


/* ============================================================
   8. HTML ESCAPE
============================================================ */

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value == null
            ? ""
            : String(value);

    return div.innerHTML;

}


/* ============================================================
   9. NORMALIZE VALUE
============================================================ */

function normalizeText(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();

}


/* ============================================================
   10. ARRAY / TEXT HELPER
============================================================ */

function toArray(
    value
) {

    if (
        Array.isArray(
            value
        )
    ) {

        return value
            .map(
                item =>
                    String(
                        item ?? ""
                    ).trim()
            )
            .filter(Boolean);

    }


    if (
        value == null ||
        value === ""
    ) {

        return [];

    }


    return String(
        value
    )
        .split(",")
        .map(
            item =>
                item.trim()
        )
        .filter(Boolean);

}


/* ============================================================
   11. DISPLAY HELPERS
============================================================ */

function showLoading(
    message =
        "Loading registered guides..."
) {

    if (!guidesLoading) {

        return;

    }

    guidesLoading.style.display =
        "block";

    guidesLoading.textContent =
        message;

}


function hideLoading() {

    if (!guidesLoading) {

        return;

    }

    guidesLoading.style.display =
        "none";

}


function showEmptyState() {

    if (!guidesEmptyState) {

        return;

    }

    guidesEmptyState.style.display =
        "block";

}


function hideEmptyState() {

    if (!guidesEmptyState) {

        return;

    }

    guidesEmptyState.style.display =
        "none";

}


/* ============================================================
   12. PAGE ERROR
============================================================ */

function showPageMessage(
    message
) {

    console.error(
        message
    );


    if (!guidesList) {

        alert(
            message
        );

        return;

    }


    guidesList.innerHTML = `

        <div class="guide-error">

            <div>
                ⚠️
            </div>

            <h3>
                ${escapeHTML(
                    message
                )}
            </h3>

        </div>

    `;


    if (guideResultCount) {

        guideResultCount.textContent =
            "";

    }

}


/* ============================================================
   13. LOAD CURRENT QUOTATION REQUEST
============================================================ */

async function loadCurrentRequest() {

    currentRequestId =
        getRequestId();


    if (!currentRequestId) {

        showPageMessage(
            "No quotation request was found."
        );

        return null;

    }


    try {

        const requestRef =
            doc(
                db,
                QUOTATION_COLLECTION,
                currentRequestId
            );


        const snapshot =
            await getDoc(
                requestRef
            );


        if (!snapshot.exists()) {

            showPageMessage(
                "The quotation request could not be found."
            );

            return null;

        }


        currentRequest = {

            id:
                snapshot.id,

            ...snapshot.data()

        };


        console.log(
            "Quotation request loaded:",
            currentRequest
        );


        return currentRequest;

    } catch (error) {

        console.error(
            "Quotation request loading error:",
            error
        );


        showPageMessage(
            "Unable to load your quotation request."
        );


        return null;

    }

}


/* ============================================================
   14. VERIFY TOURIST OWNERSHIP
============================================================ */

function verifyTouristOwnership() {

    if (!currentRequest) {

        return false;

    }


    if (!currentUser) {

        showPageMessage(
            "Please login as a Tourist before selecting a guide."
        );

        return false;

    }


    if (
        currentRequest.touristId &&
        currentRequest.touristId !==
            currentUser.uid
    ) {

        console.error(
            "Quotation request ownership mismatch.",
            {
                requestTourist:
                    currentRequest.touristId,

                currentUser:
                    currentUser.uid
            }
        );


        showPageMessage(
            "You are not authorized to modify this quotation request."
        );

        return false;

    }


    return true;

}


/* ============================================================
   15. LOAD APPROVED GUIDES
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

        const guidesQuery =
            query(
                collection(
                    db,
                    GUIDE_COLLECTION
                ),

                where(
                    "verificationStatus",
                    "==",
                    "approved"
                )
            );


        const snapshot =
            await getDocs(
                guidesQuery
            );


        guides = [];


        snapshot.forEach(
            (guideSnapshot) => {

                const data =
                    guideSnapshot.data();


                /*
                   Only actual Guide accounts.
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
            "Load approved guides error:",
            error
        );


        guides = [];

        filteredGuides = [];


        guidesList.innerHTML =
            "";


        showEmptyState();


        const heading =
            guidesEmptyState?.querySelector(
                "h3"
            );


        if (heading) {

            heading.textContent =
                "Unable to Load Guides";

        }

    } finally {

        hideLoading();

    }

}


/* ============================================================
   16. DISTRICT FILTER
============================================================ */

function populateDistrictFilter() {

    if (!guideDistrict) {

        return;

    }


    const districts =
        [
            ...new Set(

                guides
                    .map(
                        guide =>
                            guide.district
                    )
                    .filter(Boolean)

            )
        ]
        .sort(
            (a, b) =>
                String(a)
                    .localeCompare(
                        String(b)
                    )
        );


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
   17. LANGUAGE FILTER
============================================================ */

function populateLanguageFilter() {

    if (!guideLanguage) {

        return;

    }


    const languages =
        new Set();


    guides.forEach(
        (guide) => {

            const guideLanguages =
                toArray(
                    guide.languages ||
                    guide.language
                );


            guideLanguages.forEach(
                (language) => {

                    languages.add(
                        language
                    );

                }
            );

        }
    );


    const sortedLanguages =
        [...languages].sort(
            (a, b) =>
                a.localeCompare(
                    b
                )
        );


    guideLanguage.innerHTML = `

        <option value="">
            All Languages
        </option>

    `;


    sortedLanguages.forEach(
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
   18. CHECK GUIDE LANGUAGE
============================================================ */

function guideMatchesLanguage(
    guide,
    selectedLanguage
) {

    if (!selectedLanguage) {

        return true;

    }


    const languages =
        toArray(
            guide.languages ||
            guide.language
        );


    const target =
        normalizeText(
            selectedLanguage
        );


    return languages.some(
        language =>
            normalizeText(
                language
            ) === target
    );

}


/* ============================================================
   19. BUILD SEARCHABLE GUIDE TEXT
============================================================ */

function getGuideSearchText(
    guide
) {

    const searchableValues = [

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

    ];


    return searchableValues
        .flat()
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

}


/* ============================================================
   20. APPLY FILTERS
============================================================ */

function applyFilters() {

    const search =
        normalizeText(
            guideSearch?.value
        );


    const district =
        guideDistrict?.value ||
        "";


    const language =
        guideLanguage?.value ||
        "";


    filteredGuides =
        guides.filter(
            (guide) => {

                /*
                   SEARCH
                */

                if (search) {

                    const searchableText =
                        getGuideSearchText(
                            guide
                        );


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

                if (
                    language &&
                    !guideMatchesLanguage(
                        guide,
                        language
                    )
                ) {

                    return false;

                }


                return true;

            }
        );


    applySort();

    renderGuides();

}


/* ============================================================
   21. APPLY SORT
============================================================ */

function applySort() {

    const sort =
        guideSort?.value ||
        "rank";


    filteredGuides.sort(
        (a, b) => {

            if (
                sort ===
                    "experience"
            ) {

                return (
                    Number(
                        b.experienceYears ||
                        b.experience ||
                        0
                    ) -

                    Number(
                        a.experienceYears ||
                        a.experience ||
                        0
                    )
                );

            }


            if (
                sort ===
                    "reviews"
            ) {

                return (
                    Number(
                        b.reviewCount ||
                        b.reviewsCount ||
                        0
                    ) -

                    Number(
                        a.reviewCount ||
                        a.reviewsCount ||
                        0
                    )
                );

            }


            if (
                sort ===
                    "completed"
            ) {

                return (
                    Number(
                        b.completedTrips ||
                        b.completedTourCount ||
                        0
                    ) -

                    Number(
                        a.completedTrips ||
                        a.completedTourCount ||
                        0
                    )
                );

            }


            /*
               Default:
               Rating / Rank
            */

            return (
                Number(
                    b.rating ||
                    b.averageRating ||
                    0
                ) -

                Number(
                    a.rating ||
                    a.averageRating ||
                    0
                )
            );

        }
    );

}


/* ============================================================
   22. RENDER GUIDES
============================================================ */

function renderGuides() {

    if (!guidesList) {

        return;

    }


    guidesList.innerHTML =
        "";


    const count =
        filteredGuides.length;


    if (guideResultCount) {

        guideResultCount.textContent =
            `${count} Guide${
                count === 1
                    ? ""
                    : "s"
            }`;

    }


    if (count === 0) {

        showEmptyState();

        return;

    }


    hideEmptyState();


    filteredGuides.forEach(
        (guide, index) => {

            guidesList.appendChild(
                createGuideCard(
                    guide,
                    index
                )
            );

        }
    );

}


/* ============================================================
   23. CREATE GUIDE CARD
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
        toArray(
            guide.languages ||
            guide.language
        );


    const languageText =
        languages.length
            ? languages.join(
                ", "
            )
            : "N/A";


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
                    src="${escapeHTML(
                        avatar
                    )}"
                    alt="${escapeHTML(
                        name
                    )}"
                    class="guide-avatar-image"
                    loading="lazy"
                >

            `
            : `

                <div
                    class="guide-avatar-placeholder"
                >
                    👤
                </div>

            `;


    const specializationText =
        Array.isArray(
            specializations
        )
            ? specializations.join(
                ", "
            )
            : String(
                specializations
            );


    const areasText =
        Array.isArray(
            areas
        )
            ? areas.join(
                ", "
            )
            : String(
                areas
            );


    card.innerHTML = `

        <div class="guide-rank">

            🏆 Rank #${index + 1}

        </div>


        <div class="guide-card-header">

            ${avatarHTML}

            <div>

                <h3>
                    ${escapeHTML(
                        name
                    )}
                </h3>

                <p>
                    📍
                    ${escapeHTML(
                        district
                    )}
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
                    specializationText
                )}

            </p>


            <p>

                🗺

                <strong>
                    Areas:
                </strong>

                ${escapeHTML(
                    areasText
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
            () => {

                selectGuide(
                    guide,
                    selectButton
                );

            }
        );

    }


    return card;

}


/* ============================================================
   24. VIEW GUIDE PROFILE
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
        toArray(
            guide.languages ||
            guide.language
        );


    const specializations =
        toArray(
            guide.specializations ||
            guide.specialization
        );


    alert(

        `${name}\n\n` +

        `📍 ${district}\n` +

        `📧 ${email}\n` +

        `📞 ${phone}\n\n` +

        `🗣 Languages: ${
            languages.length
                ? languages.join(
                    ", "
                )
                : "N/A"
        }\n\n` +

        `🌿 Specializations: ${
            specializations.length
                ? specializations.join(
                    ", "
                )
                : "General Tourism"
        }`

    );

}


/* ============================================================
   25. SELECT GUIDE
============================================================ */

async function selectGuide(
    guide,
    button
) {

    if (
        button?.disabled
    ) {

        return;

    }


    if (!currentUser) {

        alert(
            "Please login as a Tourist before selecting a guide."
        );

        return;

    }


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
       FINAL OWNERSHIP CHECK
    */

    if (
        currentRequest.touristId &&
        currentRequest.touristId !==
            currentUser.uid
    ) {

        alert(
            "You are not authorized to modify this request."
        );

        return;

    }


    const guideId =
        guide.uid ||
        guide.id;


    if (!guideId) {

        console.error(
            "Guide ID missing:",
            guide
        );


        alert(
            "This guide cannot be selected because the guide ID is missing."
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


    /*
       Prevent selecting a guide
       for an already completed request.
    */

    if (
        currentRequest.status ===
            "guide_selected"
    ) {

        alert(
            "A guide has already been selected for this quotation request."
        );

        return;

    }


    const confirmed =
        window.confirm(
            `Select ${
                guideName ||
                "this guide"
            } as your tour guide?`
        );


    if (!confirmed) {

        return;

    }


    const originalText =
        button?.textContent ||
        "Select Guide →";


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Selecting...";

    }


    try {

        /*
           Store a snapshot of the
           selected guide.

           This protects the quotation
           request from future changes
           to the guide profile.
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
                toArray(
                    guide.languages ||
                    guide.language
                ),

            specializations:
                guide.specializations ||
                guide.specialization ||
                "",

            areas:
                guide.areas ||
                guide.coverageAreas ||
                "",

            verificationStatus:
                guide.verificationStatus ||
                "approved"

        };


        /*
           Firestore request reference
        */

        const requestRef =
            doc(
                db,
                QUOTATION_COLLECTION,
                currentRequest.id
            );


        /*
           Update quotation request
        */

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

        currentRequest = {

            ...currentRequest,

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
                true

        };


        console.log(
            "Guide selected successfully:",
            {
                requestId:
                    currentRequest.id,

                guideId:
                    guideId,

                guideName:
                    guideName
            }
        );


        alert(
            `${
                guideName ||
                "Guide"
            } has been selected successfully.`
        );


        /*
           Continue to quotation request page.

           Firestore requestId is preserved.
        */

        const requestId =
            encodeURIComponent(
                currentRequest.id
            );


        const selectedGuideId =
            encodeURIComponent(
                guideId
            );


        window.location.href =
            `quotation-request.html?requestId=${requestId}&guideId=${selectedGuideId}`;


    } catch (error) {

        console.error(
            "Guide selection Firestore error:",
            error
        );


        /*
           Restore button
        */

        if (button) {

            button.disabled =
                false;

            button.textContent =
                originalText;

        }


        if (
            error.code ===
            "permission-denied"
        ) {

            alert(
                "Firestore denied this operation. Please make sure you are logged in as the Tourist who created this request."
            );

            return;

        }


        alert(
            error.message ||
            "Unable to select this guide. Please try again."
        );

    }

}


/* ============================================================
   26. CLEAR FILTERS
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
   27. EVENT LISTENERS
============================================================ */

guideSearch?.addEventListener(
    "input",
    applyFilters
);


guideDistrict?.addEventListener(
    "change",
    applyFilters
);


guideLanguage?.addEventListener(
    "change",
    applyFilters
);


guideSort?.addEventListener(
    "change",
    applyFilters
);


clearGuideFilters?.addEventListener(
    "click",
    clearFilters
);


emptyClearFilters?.addEventListener(
    "click",
    clearFilters
);


/* ============================================================
   28. INITIALIZE
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log("LankaWayfarer Find Guides loading...");


        /*
           STEP 1
           Firebase Authentication
        */

        currentUser =
            await waitForAuthenticatedUser();


        if (!currentUser) {

            showPageMessage(
                "Please login as a Tourist before finding guides."
            );

            return;

        }


        /*
           STEP 2
           Load quotation request
        */

        const request =
            await loadCurrentRequest();


        if (!request) {

            return;

        }


        /*
           STEP 3
           Verify ownership
        */

        const authorized =
            verifyTouristOwnership();


        if (!authorized) {

            return;

        }


        /*
           STEP 4
           Load approved guides
        */

        await loadGuides();


        console.log(
            "Find Guides initialized:",
            {

                requestId:
                    currentRequestId,

                touristId:
                    currentUser.uid,

                guideCount:
                    guides.length

            }
        );

    }
);


/* ============================================================
   END FIND-GUIDES.JS
============================================================ */

