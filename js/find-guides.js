
/* ============================================================
   LankaWayfarer
   FIND GUIDES
   FIREBASE / FIRESTORE FIRST ARCHITECTURE

   This version keeps the existing:
   - Firebase Authentication
   - Quotation Request ownership check
   - Approved Guide loading
   - Search / filter / sort
   - Guide selection
   - Firestore request update
   - quotation-request.html redirect

   Updated:
   - Professional Guide Profile cards
   - Profile photo support
   - Verification badge
   - Professional stats
   - Better profile information
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

            <div class="guide-error-icon">
                ⚠️
            </div>

            <h3>
                ${escapeHTML(message)}
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

                if (
                    district &&
                    guide.district !==
                        district
                ) {

                    return false;

                }

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
   23. PROFESSIONAL GUIDE CARD
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


    const province =
        guide.province ||
        "";


    const rating =
        guide.rating ||
        guide.averageRating ||
        "";


    const reviewCount =
        guide.reviewCount ||
        guide.reviewsCount ||
        0;


    const experience =
        guide.experienceYears ||
        guide.experience ||
        "";


    const completedTrips =
        guide.completedTrips ||
        guide.completedTourCount ||
        0;


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


    const areas =
        toArray(
            guide.areas ||
            guide.coverageAreas
        );


  const avatar =
    guide.profilePhotoUrl ||
    guide.profilePhotoURL ||
    guide.photoURL ||
    guide.profileImage ||
    guide.photo ||
    "";

    const locationText =
        province
            ? `${district}, ${province}`
            : district;


    const ratingText =
        rating
            ? Number(rating).toFixed(1)
            : "New";


    const experienceText =
        experience
            ? `${experience} ${
                String(experience)
                    .toLowerCase()
                    .includes("year")
                    ? ""
                    : "years"
            }`
            : "Not specified";


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
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <div
                    class="guide-avatar-placeholder"
                    style="display:none;"
                    aria-hidden="true"
                >
                    👤
                </div>

            `
            : `

                <div
                    class="guide-avatar-placeholder"
                    aria-hidden="true"
                >
                    👤
                </div>

            `;


    const languageHTML =
        languages.length
            ? languages
                .slice(0, 4)
                .map(
                    language => `
                        <span class="guide-tag">
                            ${escapeHTML(language)}
                        </span>
                    `
                )
                .join("")
            : `
                <span class="guide-muted">
                    Not specified
                </span>
            `;


    const specializationHTML =
        specializations.length
            ? specializations
                .slice(0, 3)
                .map(
                    item => `
                        <span class="guide-tag guide-tag-soft">
                            ${escapeHTML(item)}
                        </span>
                    `
                )
                .join("")
            : `
                <span class="guide-muted">
                    General Tourism
                </span>
            `;


    const areasText =
        areas.length
            ? areas
                .slice(0, 3)
                .join(", ")
            : "Sri Lanka";


    card.innerHTML = `

        <div class="guide-card-cover">

            <div class="guide-rank-badge">
                <span>🏆</span>
                Rank #${index + 1}
            </div>

            <div class="guide-verified-badge">
                <span>✓</span>
                Verified Guide
            </div>

        </div>


        <div class="guide-card-top">

            <div class="guide-avatar">

                ${avatarHTML}

            </div>


            <div class="guide-main-info">

                <div class="guide-name-row">

                    <h3 class="guide-name">
                        ${escapeHTML(name)}
                    </h3>

                </div>


                <p class="guide-location">
                    📍
                    ${escapeHTML(locationText)}
                </p>


                <div class="guide-profile-label">
                    Registered LankaWayfarer Guide
                </div>

            </div>

        </div>


        <div class="guide-stats">

            <div class="guide-stat">

                <strong>
                    ${escapeHTML(ratingText)}
                </strong>

                <span>
                    ⭐ Rating
                    ${
                        reviewCount
                            ? ` · ${escapeHTML(reviewCount)} reviews`
                            : ""
                    }
                </span>

            </div>


            <div class="guide-stat">

                <strong>
                    ${escapeHTML(
                        experienceText
                    )}
                </strong>

                <span>
                    Experience
                </span>

            </div>


            <div class="guide-stat">

                <strong>
                    ${escapeHTML(
                        completedTrips || "—"
                    )}
                </strong>

                <span>
                    Completed Trips
                </span>

            </div>

        </div>


        <div class="guide-details">


            <div class="guide-detail-block">

                <div class="guide-detail-title">
                    🗣 Languages
                </div>

                <div class="guide-tags">
                    ${languageHTML}
                </div>

            </div>


            <div class="guide-detail-block">

                <div class="guide-detail-title">
                    🌿 Specializations
                </div>

                <div class="guide-tags">
                    ${specializationHTML}
                </div>

            </div>


            <div class="guide-detail-row">

                <span class="guide-detail-icon">
                    🗺
                </span>

                <span>
                    <strong>
                        Areas Covered
                    </strong>

                    <br>

                    ${escapeHTML(areasText)}

                </span>

            </div>


        </div>


        <div class="guide-card-actions">

            <button
                type="button"
                class="view-guide-button"
            >
                <span>👤</span>
                View Profile
            </button>


            <button
                type="button"
                class="select-guide-button"
            >
                Select Guide
                <span>→</span>
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
   PROFESSIONAL MODAL
============================================================ */

function viewGuideProfile(
    guide
) {

    /*
       Close any existing modal first
    */

    const existingModal =
        document.querySelector(
            ".guide-profile-modal"
        );

    if (existingModal) {

        existingModal.remove();

    }


    /* ========================================================
       GUIDE DATA
    ======================================================== */

    const name =
        guide.fullName ||
        guide.name ||
        "Registered Guide";


    const email =
        guide.email ||
        "Not available";


    const phone =
        guide.phone ||
        guide.phoneNumber ||
        "Not available";


    const district =
        guide.district ||
        "Sri Lanka";


    const province =
        guide.province ||
        "";


    const rating =
        guide.rating ||
        guide.averageRating ||
        "";


    const reviewCount =
        guide.reviewCount ||
        guide.reviewsCount ||
        0;


    const experience =
        guide.experienceYears ||
        guide.experience ||
        "";


    const completedTrips =
        guide.completedTrips ||
        guide.completedTourCount ||
        0;


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


    const areas =
        toArray(
            guide.areas ||
            guide.coverageAreas
        );


    const avatar =
      guide.profilePhotoUrl ||
      guide.profilePhotoURL ||
      guide.photoURL ||
      guide.profileImage ||
      guide.photo ||
      "";

    const locationText =
        province
            ? `${district}, ${province}`
            : district;


    const ratingText =
        rating
            ? Number(rating).toFixed(1)
            : "New";


    const experienceText =
        experience
            ? `${experience} ${
                String(experience)
                    .toLowerCase()
                    .includes("year")
                    ? ""
                    : "years"
            }`
            : "Not specified";


    /* ========================================================
       PROFILE PHOTO
    ======================================================== */

    const avatarHTML =
        avatar
            ? `
                <img
                    src="${escapeHTML(avatar)}"
                    alt="${escapeHTML(name)}"
                    class="guide-profile-modal-avatar-image"
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <div
                    class="guide-profile-modal-avatar-placeholder"
                    style="display:none;"
                    aria-hidden="true"
                >
                    👤
                </div>
            `
            : `
                <div
                    class="guide-profile-modal-avatar-placeholder"
                    aria-hidden="true"
                >
                    👤
                </div>
            `;


    /* ========================================================
       TAG HELPERS
    ======================================================== */

    const languageHTML =
        languages.length
            ? languages
                .map(
                    language => `
                        <span class="guide-profile-modal-tag">
                            ${escapeHTML(language)}
                        </span>
                    `
                )
                .join("")
            : `
                <span class="guide-profile-modal-muted">
                    Not specified
                </span>
            `;


    const specializationHTML =
        specializations.length
            ? specializations
                .map(
                    specialization => `
                        <span class="guide-profile-modal-tag guide-profile-modal-tag-soft">
                            ${escapeHTML(
                                specialization
                            )}
                        </span>
                    `
                )
                .join("")
            : `
                <span class="guide-profile-modal-muted">
                    General Tourism
                </span>
            `;


    const areasText =
        areas.length
            ? areas.join(", ")
            : "Sri Lanka";


    /* ========================================================
       CREATE MODAL
    ======================================================== */

    const modal =
        document.createElement(
            "div"
        );

    modal.className =
        "guide-profile-modal";


    modal.innerHTML = `

        <div
            class="guide-profile-modal-overlay"
            data-modal-close
        ></div>


        <div
            class="guide-profile-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guideProfileModalTitle"
        >


            <!-- CLOSE -->

            <button
                type="button"
                class="guide-profile-modal-close"
                aria-label="Close guide profile"
                data-modal-close
            >
                ×
            </button>


            <!-- HEADER -->

            <div class="guide-profile-modal-header">


                <div class="guide-profile-modal-avatar">

                    ${avatarHTML}

                </div>


                <div class="guide-profile-modal-header-info">

                    <div class="guide-profile-modal-verified">

                        ✓ Verified Guide

                    </div>


                    <h2
                        id="guideProfileModalTitle"
                        class="guide-profile-modal-name"
                    >
                        ${escapeHTML(name)}
                    </h2>


                    <p class="guide-profile-modal-location">

                        📍
                        ${escapeHTML(locationText)}

                    </p>


                    <p class="guide-profile-modal-label">

                        Registered LankaWayfarer Guide

                    </p>

                </div>

            </div>


            <!-- STATS -->

            <div class="guide-profile-modal-stats">


                <div class="guide-profile-modal-stat">

                    <strong>
                        ${escapeHTML(ratingText)}
                    </strong>

                    <span>
                        ⭐ Rating
                    </span>

                </div>


                <div class="guide-profile-modal-stat">

                    <strong>
                        ${escapeHTML(
                            reviewCount || "—"
                        )}
                    </strong>

                    <span>
                        Reviews
                    </span>

                </div>


                <div class="guide-profile-modal-stat">

                    <strong>
                        ${escapeHTML(
                            experienceText
                        )}
                    </strong>

                    <span>
                        Experience
                    </span>

                </div>


                <div class="guide-profile-modal-stat">

                    <strong>
                        ${escapeHTML(
                            completedTrips || "—"
                        )}
                    </strong>

                    <span>
                        Completed Trips
                    </span>

                </div>

            </div>


            <!-- BODY -->

            <div class="guide-profile-modal-body">


                <!-- CONTACT -->

                <div class="guide-profile-modal-section">

                    <h3>
                        Contact Information
                    </h3>


                    <div class="guide-profile-modal-detail">

                        <span>📧</span>

                        <span>
                            ${escapeHTML(email)}
                        </span>

                    </div>


                    <div class="guide-profile-modal-detail">

                        <span>📞</span>

                        <span>
                            ${escapeHTML(phone)}
                        </span>

                    </div>

                </div>


                <!-- LANGUAGES -->

                <div class="guide-profile-modal-section">

                    <h3>
                        🗣 Languages
                    </h3>


                    <div class="guide-profile-modal-tags">

                        ${languageHTML}

                    </div>

                </div>


                <!-- SPECIALIZATIONS -->

                <div class="guide-profile-modal-section">

                    <h3>
                        🌿 Specializations
                    </h3>


                    <div class="guide-profile-modal-tags">

                        ${specializationHTML}

                    </div>

                </div>


                <!-- AREAS -->

                <div class="guide-profile-modal-section">

                    <h3>
                        🗺 Areas Covered
                    </h3>


                    <p class="guide-profile-modal-area-text">

                        ${escapeHTML(areasText)}

                    </p>

                </div>

            </div>


            <!-- ACTIONS -->

            <div class="guide-profile-modal-actions">


                <button
                    type="button"
                    class="guide-profile-modal-cancel"
                    data-modal-close
                >
                    Close
                </button>


                <button
                    type="button"
                    class="guide-profile-modal-select"
                >
                    Select This Guide
                    <span>→</span>
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    /* ========================================================
       CLOSE MODAL
    ======================================================== */

    const closeModal =
        () => {

            modal.remove();

            document.body.classList.remove(
                "guide-profile-modal-open"
            );

        };


    modal
        .querySelectorAll(
            "[data-modal-close]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    closeModal
                );

            }
        );


    /* ========================================================
       SELECT THIS GUIDE
       REUSE EXISTING selectGuide()
    ======================================================== */

    const selectButton =
        modal.querySelector(
            ".guide-profile-modal-select"
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


    /* ========================================================
       ESCAPE KEY
    ======================================================== */

    const handleEscape =
        (event) => {

            if (
                event.key ===
                "Escape"
            ) {

                closeModal();

                document.removeEventListener(
                    "keydown",
                    handleEscape
                );

            }

        };


    document.addEventListener(
        "keydown",
        handleEscape
    );


    /* ========================================================
       BODY SCROLL LOCK
    ======================================================== */

    document.body.classList.add(
        "guide-profile-modal-open"
    );


    /* ========================================================
       FOCUS
    ======================================================== */

    requestAnimationFrame(
        () => {

            selectButton?.focus();

        }
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


    if (
        currentRequest.status ===
            "completed" ||
        currentRequest.status ===
            "quotation_accepted"
    ) {

        alert(
            "This quotation request can no longer be changed."
        );

        return;

    }


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


        const requestRef =
            doc(
                db,
                QUOTATION_COLLECTION,
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

        console.log(
            "LankaWayfarer Find Guides loading..."
        );


        currentUser =
            await waitForAuthenticatedUser();


        if (!currentUser) {

            showPageMessage(
                "Please login as a Tourist before finding guides."
            );

            return;

        }


        const request =
            await loadCurrentRequest();


        if (!request) {
            return;
        }


        const authorized =
            verifyTouristOwnership();


        if (!authorized) {
            return;
        }


        await loadGuides();


        console.log(
            "Find Guides initialized:",
            {
                requestId:
                    currentRequestId,

                touristUID:
                    currentUser.uid,

                guideCount:
                    guides.length
            }
        );

    }
);

