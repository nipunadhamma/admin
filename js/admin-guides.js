
/* ============================================================
   LANKAWAYFARER
   ADMIN GUIDE MANAGEMENT SYSTEM

   File:
   js/admin-guides.js

   FIREBASE FIRST ARCHITECTURE

   FIRESTORE COLLECTION:
   lankaQuestGuides/{uid}

   CURRENT GUIDE PROFILE FIELDS:

   uid
   fullName
   email
   accountType
   phone
   district
   languages
   experience
   profilePhotoUrl
   verificationStatus
   status
   emailVerified
   createdAt

   ADMIN / FUTURE FIELDS:

   nic
   passport
   dateOfBirth
   address
   province
   guideLicenseNumber
   specializations
   areasCovered
   qualifications
   bio
   identityDocument
   guideLicenseDocument
   additionalDocuments
   isActive
   profileStatus
   package
   packageStatus
   reviewedAt
   reviewedBy
   approvedAt
   rejectedAt
   rejectionReason
   statusUpdatedAt
   deletedAt

   IMPORTANT:

   This file uses Firestore as the single source of truth.

   No LocalStorage guide database is used.
============================================================ */


/* ============================================================
   1. FIREBASE IMPORTS
============================================================ */

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* ============================================================
   2. DOM ELEMENTS
============================================================ */


/* ------------------------------------------------------------
   Guide Table
------------------------------------------------------------ */

const guidesTableBody =
    document.getElementById(
        "guidesTableBody"
    );


/* ------------------------------------------------------------
   Search
------------------------------------------------------------ */

const guideSearchInput =
    document.getElementById(
        "guideSearch"
    );


/* ------------------------------------------------------------
   Status Filter
------------------------------------------------------------ */

const guideStatusFilter =
    document.getElementById(
        "guideStatusFilter"
    );


/* ------------------------------------------------------------
   Language Filter
------------------------------------------------------------ */

const guideLanguageFilter =
    document.getElementById(
        "guideLanguageFilter"
    );


/* ------------------------------------------------------------
   Empty State
------------------------------------------------------------ */

const guideEmptyState =
    document.getElementById(
        "guideEmptyState"
    );


/* ------------------------------------------------------------
   Statistics
------------------------------------------------------------ */

const totalGuidesCount =
    document.getElementById(
        "totalGuidesCount"
    );


const pendingGuidesCount =
    document.getElementById(
        "pendingGuidesCount"
    );


const approvedGuidesCount =
    document.getElementById(
        "approvedGuidesCount"
    );


const activeGuidesCount =
    document.getElementById(
        "activeGuidesCount"
    );


/* ------------------------------------------------------------
   Details Modal
------------------------------------------------------------ */

const guideDetailsModal =
    document.getElementById(
        "guideDetailsModal"
    );


const closeGuideDetails =
    document.getElementById(
        "closeGuideDetails"
    );


const guideDetailsContent =
    document.getElementById(
        "guideDetailsContent"
    );


/* ============================================================
   3. GUIDE DATA
============================================================ */

let allGuides = [];


/* ============================================================
   4. GET GUIDE UNIQUE ID
============================================================ */

function getGuideUniqueId(guide) {

    if (!guide) {
        return "";
    }

    /*
       Firestore document ID is the Firebase UID.

       Current architecture:

       lankaQuestGuides/{uid}
    */

    return String(
        guide.id ||
        guide.uid ||
        guide.guideId ||
        ""
    );
}


/* ============================================================
   5. GET GUIDES FROM FIRESTORE
============================================================ */

async function loadGuides() {

    try {

        const guidesSnapshot =
            await getDocs(
                collection(
                    db,
                    "lankaQuestGuides"
                )
            );


        allGuides = [];


        guidesSnapshot.forEach(
            guideDocument => {

                const guide = {

                    id:
                        guideDocument.id,

                    ...guideDocument.data()

                };


                /*
                   Soft deleted guides are not shown.
                */

                if (
                    guide.status !==
                    "deleted"
                ) {

                    allGuides.push(
                        guide
                    );

                }

            }
        );


        console.log(
            "LankaWayfarer Firebase Guides:",
            allGuides
        );


        renderGuides();

        updateGuideStatistics();


    } catch (error) {

        console.error(
            "Loading guides failed:",
            error
        );


        if (guidesTableBody) {

            guidesTableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        Unable to load guide applications.
                    </td>
                </tr>
            `;

        }

    }

}


/* ============================================================
   6. NORMALIZE VALUE
============================================================ */

function normalizeValue(value) {

    if (
        value ===
        undefined
        ||
        value ===
        null
    ) {

        return "";

    }


    return String(
        value
    ).trim();

}


/* ============================================================
   7. GET FILE NAME / FILE VALUE
============================================================ */

function getFileName(fileData) {

    if (!fileData) {

        return "Not uploaded";

    }


    /*
       Current Cloudinary profile photo:

       profilePhotoUrl
    */

    if (
        typeof fileData ===
        "string"
    ) {

        return fileData;

    }


    /*
       Future file object support
    */

    if (
        typeof fileData ===
        "object"
        &&
        fileData.name
    ) {

        return fileData.name;

    }


    /*
       Future URL object support
    */

    if (
        typeof fileData ===
        "object"
        &&
        fileData.url
    ) {

        return fileData.url;

    }


    return "Not uploaded";

}


/* ============================================================
   8. GET ADDITIONAL DOCUMENT NAMES
============================================================ */

function getAdditionalDocumentNames(
    documents
) {

    if (
        !documents
        ||
        !Array.isArray(
            documents
        )
        ||
        documents.length === 0
    ) {

        return "No additional documents";

    }


    return documents
        .map(
            documentData => {

                return getFileName(
                    documentData
                );

            }
        )
        .join(
            ", "
        );

}


/* ============================================================
   9. GET GUIDE LANGUAGES
============================================================ */

function getGuideLanguages(
    guide
) {

    if (
        !guide
    ) {

        return [];

    }


    const languages =
        guide.languages;


    /*
       Current registration may save
       languages as a string.
    */

    if (
        typeof languages ===
        "string"
    ) {

        const value =
            languages.trim();


        if (!value) {

            return [];

        }


        /*
           Support comma-separated
           language values.
        */

        return value
            .split(",")
            .map(
                language =>
                    language.trim()
            )
            .filter(
                Boolean
            );

    }


    /*
       Future / existing array support.
    */

    if (
        Array.isArray(
            languages
        )
    ) {

        return languages
            .map(
                language =>
                    String(
                        language
                    ).trim()
            )
            .filter(
                Boolean
            );

    }


    return [];

}


/* ============================================================
   10. GET SPECIALIZATIONS
============================================================ */

function getGuideSpecializations(
    guide
) {

    if (
        !guide
    ) {

        return [];

    }


    const specializations =
        guide.specializations;


    if (
        typeof specializations ===
        "string"
    ) {

        return specializations
            .split(",")
            .map(
                value =>
                    value.trim()
            )
            .filter(
                Boolean
            );

    }


    if (
        Array.isArray(
            specializations
        )
    ) {

        return specializations
            .map(
                value =>
                    String(
                        value
                    ).trim()
            )
            .filter(
                Boolean
            );

    }


    return [];

}


/* ============================================================
   11. FORMAT STATUS
============================================================ */

function formatGuideStatus(
    status
) {

    const statusNames = {

        pending:
            "Pending Review",

        approved:
            "Approved",

        rejected:
            "Rejected",

        suspended:
            "Suspended",

        deleted:
            "Deleted"

    };


    return (

        statusNames[
            status
        ]

        ||

        status

        ||

        "Unknown"

    );

}


/* ============================================================
   12. FORMAT FIRESTORE DATE
============================================================ */

function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "N/A";

    }


    let date;


    /*
       Firestore Timestamp
    */

    if (
        typeof dateValue.toDate ===
        "function"
    ) {

        date =
            dateValue.toDate();

    }


    /*
       JavaScript Date
    */

    else if (
        dateValue instanceof Date
    ) {

        date =
            dateValue;

    }


    /*
       Firestore timestamp-like
       object / milliseconds
    */

    else if (
        typeof dateValue ===
        "object"
        &&
        typeof dateValue.seconds ===
        "number"
    ) {

        date =
            new Date(
                dateValue.seconds *
                1000
            );

    }


    else {

        date =
            new Date(
                dateValue
            );

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "N/A";

    }


    return date.toLocaleDateString(
        "en-US",
        {

            year:
                "numeric",

            month:
                "long",

            day:
                "numeric"

        }
    );

}


/* ============================================================
   13. GET FILTERED GUIDES
============================================================ */

function getFilteredGuides() {

    const searchText =

        guideSearchInput

            ?

            guideSearchInput.value
                .toLowerCase()
                .trim()

            :

            "";


    const selectedStatus =

        guideStatusFilter

            ?

            guideStatusFilter.value

            :

            "all";


    const selectedLanguage =

        guideLanguageFilter

            ?

            guideLanguageFilter.value

            :

            "all";


    return allGuides.filter(
        guide => {


            /* ------------------------------------------------
               SEARCH
            ------------------------------------------------ */

            const languagesText =

                getGuideLanguages(
                    guide
                )
                .join(
                    " "
                );


            const specializationsText =

                getGuideSpecializations(
                    guide
                )
                .join(
                    " "
                );


            const searchSource = [

                guide.uid,

                guide.id,

                guide.fullName,

                guide.email,

                guide.phone,

                guide.nic,

                guide.passport,

                guide.guideLicenseNumber,

                guide.province,

                guide.district,

                guide.address,

                guide.areasCovered,

                guide.qualifications,

                guide.bio,

                languagesText,

                specializationsText

            ]
            .filter(
                value =>
                    value !==
                    undefined
                    &&
                    value !==
                    null
            )
            .join(
                " "
            )
            .toLowerCase();


            const searchMatch =

                !searchText

                ||

                searchSource.includes(
                    searchText
                );


            /* ------------------------------------------------
               STATUS
            ------------------------------------------------ */

            const statusMatch =

                selectedStatus ===
                "all"

                ||

                guide.status ===
                selectedStatus;


            /* ------------------------------------------------
               LANGUAGE
            ------------------------------------------------ */

            const languages =

                getGuideLanguages(
                    guide
                );


            const languageMatch =

                selectedLanguage ===
                "all"

                ||

                languages.some(
                    language =>
                        language
                            .toLowerCase()
                            ===
                        selectedLanguage
                            .toLowerCase()
                );


            return (

                searchMatch

                &&

                statusMatch

                &&

                languageMatch

            );

        }
    );

}


/* ============================================================
   14. RENDER GUIDES
============================================================ */

function renderGuides() {

    if (!guidesTableBody) {

        console.warn(
            "guidesTableBody element not found."
        );

        return;

    }


    guidesTableBody.innerHTML =
        "";


    const filteredGuides =
        getFilteredGuides();


    if (
        filteredGuides.length ===
        0
    ) {

        if (guideEmptyState) {

            guideEmptyState.style.display =
                "block";

        }

        return;

    }


    if (guideEmptyState) {

        guideEmptyState.style.display =
            "none";

    }


    filteredGuides.forEach(
        guide => {

            const row =
                document.createElement(
                    "tr"
                );


            const guideUniqueId =
                getGuideUniqueId(
                    guide
                );


            const guideName =

                normalizeValue(
                    guide.fullName
                )

                ||

                "Unnamed Guide";


            const guideEmail =

                normalizeValue(
                    guide.email
                )

                ||

                "No Email";


            const guidePhone =

                normalizeValue(
                    guide.phone
                )

                ||

                "N/A";


            const guideStatus =

                normalizeValue(
                    guide.status
                )

                ||

                "pending";


            const languages =

                getGuideLanguages(
                    guide
                );


            const languagesText =

                languages.length > 0

                ?

                languages.join(
                    ", "
                )

                :

                "N/A";


            const statusClass =

                guideStatus
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        "-"
                    );


            row.innerHTML = `

                <td>

                    <div class="admin-guide-name">

                        <strong>
                            ${escapeHtml(
                                guideName
                            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                                guideUniqueId ||
                                "N/A"
                            )}
                        </span>

                    </div>

                </td>


                <td>

                    ${escapeHtml(
                        guideEmail
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        guidePhone
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        languagesText
                    )}

                </td>


                <td>

                    <span
                        class="guide-status ${escapeHtml(
                            statusClass
                        )}"
                    >

                        ${escapeHtml(
                            formatGuideStatus(
                                guideStatus
                            )
                        )}

                    </span>

                </td>


                <td>

                    <div class="guide-actions">


                        <button
                            type="button"
                            class="guide-view-btn"
                            data-guide-id="${escapeHtml(
                                guideUniqueId
                            )}"
                        >
                            View
                        </button>


                        ${
                            guideStatus ===
                            "pending"

                            ?

                            `

                            <button
                                type="button"
                                class="guide-approve-btn"
                                data-guide-id="${escapeHtml(
                                    guideUniqueId
                                )}"
                            >
                                Approve
                            </button>


                            <button
                                type="button"
                                class="guide-reject-btn"
                                data-guide-id="${escapeHtml(
                                    guideUniqueId
                                )}"
                            >
                                Reject
                            </button>

                            `

                            :

                            ""
                        }


                        ${
                            guideStatus ===
                            "approved"

                            ?

                            `

                            <button
                                type="button"
                                class="guide-status-btn"
                                data-guide-id="${escapeHtml(
                                    guideUniqueId
                                )}"
                            >

                                ${
                                    guide.isActive ===
                                    true

                                    ?

                                    "Deactivate"

                                    :

                                    "Activate"
                                }

                            </button>

                            `

                            :

                            ""
                        }


                        <button
                            type="button"
                            class="guide-delete-btn"
                            data-guide-id="${escapeHtml(
                                guideUniqueId
                            )}"
                        >
                            Delete
                        </button>


                    </div>

                </td>

            `;


            guidesTableBody.appendChild(
                row
            );

        }
    );


    attachGuideActionEvents();

}


/* ============================================================
   15. ESCAPE HTML
============================================================ */

function escapeHtml(
    value
) {

    if (
        value ===
        undefined
        ||
        value ===
        null
    ) {

        return "";

    }


    return String(
        value
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
   16. ATTACH ACTION EVENTS
============================================================ */

function attachGuideActionEvents() {


    document
        .querySelectorAll(
            ".guide-view-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openGuideDetails(
                            button.dataset.guideId
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".guide-approve-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        approveGuide(
                            button.dataset.guideId
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".guide-reject-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        rejectGuide(
                            button.dataset.guideId
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".guide-status-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        toggleGuideActiveStatus(
                            button.dataset.guideId
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".guide-delete-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteGuide(
                            button.dataset.guideId
                        );

                    }
                );

            }
        );

}


/* ============================================================
   17. FIND GUIDE
============================================================ */

function findGuide(
    guideId
) {

    return allGuides.find(
        guide => {

            return (

                String(
                    guide.id
                ) ===
                String(
                    guideId
                )

                ||

                String(
                    guide.uid
                ) ===
                String(
                    guideId
                )

                ||

                String(
                    guide.guideId
                ) ===
                String(
                    guideId
                )

            );

        }
    );

}


/* ============================================================
   18. APPROVE GUIDE
============================================================ */

async function approveGuide(
    guideId
) {

    const guide =
        findGuide(
            guideId
        );


    if (!guide) {

        alert(
            "Guide not found."
        );

        return;

    }


    const confirmed =
        confirm(
            `Approve guide "${guide.fullName || "this guide"}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        await updateDoc(

            doc(
                db,
                "lankaQuestGuides",
                guideId
            ),

            {

                status:
                    "approved",

                verificationStatus:
                    "approved",

                isActive:
                    true,

                profileStatus:
                    "active",

                packageStatus:
                    "approved",

                approvedAt:
                    serverTimestamp(),

                reviewedAt:
                    serverTimestamp(),

                statusUpdatedAt:
                    serverTimestamp()

            }

        );


        alert(
            "Guide approved successfully."
        );


        await loadGuides();


    } catch (error) {

        console.error(
            "Approve guide error:",
            error
        );


        alert(
            "Guide approval failed."
        );

    }

}


/* ============================================================
   19. REJECT GUIDE
============================================================ */

async function rejectGuide(
    guideId
) {

    const guide =
        findGuide(
            guideId
        );


    if (!guide) {

        alert(
            "Guide not found."
        );

        return;

    }


    const confirmed =
        confirm(
            `Reject guide "${guide.fullName || "this guide"}"?`
        );


    if (!confirmed) {

        return;

    }


    const rejectionReason =
        prompt(
            "Enter rejection reason:"
        );


    if (
        rejectionReason ===
        null
    ) {

        return;

    }


    try {

        await updateDoc(

            doc(
                db,
                "lankaQuestGuides",
                guideId
            ),

            {

                status:
                    "rejected",

                verificationStatus:
                    "rejected",

                isActive:
                    false,

                profileStatus:
                    "inactive",

                packageStatus:
                    "rejected",

                rejectionReason:
                    rejectionReason.trim(),

                rejectedAt:
                    serverTimestamp(),

                reviewedAt:
                    serverTimestamp(),

                statusUpdatedAt:
                    serverTimestamp()

            }

        );


        alert(
            "Guide application rejected."
        );


        await loadGuides();


    } catch (error) {

        console.error(
            "Reject guide error:",
            error
        );


        alert(
            "Guide rejection failed."
        );

    }

}


/* ============================================================
   20. TOGGLE ACTIVE / INACTIVE
============================================================ */

async function toggleGuideActiveStatus(
    guideId
) {

    const guide =
        findGuide(
            guideId
        );


    if (!guide) {

        alert(
            "Guide not found."
        );

        return;

    }


    if (
        guide.status !==
        "approved"
    ) {

        alert(
            "Only approved guides can be activated or deactivated."
        );

        return;

    }


    const newStatus =
        guide.isActive !== true;


    try {

        await updateDoc(

            doc(
                db,
                "lankaQuestGuides",
                guideId
            ),

            {

                isActive:
                    newStatus,

                profileStatus:
                    newStatus
                        ? "active"
                        : "inactive",

                statusUpdatedAt:
                    serverTimestamp()

            }

        );


        alert(

            newStatus

                ?

                "Guide activated."

                :

                "Guide deactivated."

        );


        await loadGuides();


    } catch (error) {

        console.error(
            "Toggle guide status error:",
            error
        );


        alert(
            "Unable to update guide status."
        );

    }

}


/* ============================================================
   21. DELETE GUIDE
============================================================ */

async function deleteGuide(
    guideId
) {

    const guide =
        findGuide(
            guideId
        );


    if (!guide) {

        alert(
            "Guide not found."
        );

        return;

    }


    const confirmed =
        confirm(
            `Delete guide "${guide.fullName || "this guide"}" permanently?`
        );


    if (!confirmed) {

        return;

    }


    try {

        /*
           Soft delete.

           The Firestore document itself is preserved.
        */

        await updateDoc(

            doc(
                db,
                "lankaQuestGuides",
                guideId
            ),

            {

                status:
                    "deleted",

                verificationStatus:
                    "deleted",

                isActive:
                    false,

                profileStatus:
                    "inactive",

                deletedAt:
                    serverTimestamp(),

                statusUpdatedAt:
                    serverTimestamp()

            }

        );


        alert(
            "Guide deleted successfully."
        );


        await loadGuides();


    } catch (error) {

        console.error(
            "Delete guide error:",
            error
        );


        alert(
            "Guide deletion failed."
        );

    }

}


/* ============================================================
   22. OPEN GUIDE DETAILS
============================================================ */

function openGuideDetails(
    guideId
) {

    const guide =
        findGuide(
            guideId
        );


    if (!guide) {

        alert(
            "Guide not found."
        );

        return;

    }


    if (!guideDetailsContent) {

        return;

    }


    const languages =
        getGuideLanguages(
            guide
        );


    const specializations =
        getGuideSpecializations(
            guide
        );


    /*
       CURRENT FIELD:

       profilePhotoUrl

       Legacy fallback:
       profileImage
    */

    const profilePhotoUrl =
        guide.profilePhotoUrl ||
        guide.profileImage ||
        "";


    const identityDocumentName =
        getFileName(
            guide.identityDocument
        );


    const guideLicenseDocumentName =
        getFileName(
            guide.guideLicenseDocument
        );


    const additionalDocumentsNames =
        getAdditionalDocumentNames(
            guide.additionalDocuments
        );


    const registrationDate =
        formatDate(
            guide.createdAt ||
            guide.registeredAt
        );


    const status =
        guide.status ||
        "pending";


    const profilePhotoAvailable =
        Boolean(
            profilePhotoUrl
        );


    guideDetailsContent.innerHTML = `

        <div class="guide-detail-profile">


            <div class="guide-detail-profile-image">

                ${
                    profilePhotoAvailable

                    ?

                    `
                    <img
                        src="${escapeHtml(
                            profilePhotoUrl
                        )}"
                        alt="${escapeHtml(
                            guide.fullName ||
                            "Guide profile photo"
                        )}"
                        class="guide-profile-photo"
                        loading="lazy"
                    >
                    `

                    :

                    `
                    <div class="guide-default-avatar">
                        👤
                    </div>
                    `
                }

            </div>


            <div>

                <h2>
                    ${escapeHtml(
                        guide.fullName ||
                        "Unnamed Guide"
                    )}
                </h2>


                <p>

                    Guide ID:

                    <strong>
                        ${escapeHtml(
                            guide.uid ||
                            guide.id ||
                            "N/A"
                        )}
                    </strong>

                </p>


                <span
                    class="guide-status ${escapeHtml(
                        status
                    )}"
                >

                    ${escapeHtml(
                        formatGuideStatus(
                            status
                        )
                    )}

                </span>

            </div>


        </div>



        <div class="guide-detail-section">

            <h3>
                Personal Information
            </h3>


            <div class="guide-detail-grid">


                <div>

                    <strong>
                        Full Name
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.fullName ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        Email
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.email ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        Phone
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.phone ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        NIC
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.nic ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        Passport
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.passport ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        Date of Birth
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.dateOfBirth ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        Province
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.province ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        District
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.district ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div class="full-width">

                    <strong>
                        Address
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.address ||
                            "N/A"
                        )}
                    </span>

                </div>


            </div>

        </div>



        <div class="guide-detail-section">

            <h3>
                Professional Information
            </h3>


            <div class="guide-detail-grid">


                <div>

                    <strong>
                        Guide License Number
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.guideLicenseNumber ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        Experience
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.experience ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        Languages
                    </strong>

                    <span>
                        ${
                            languages.length

                            ?

                            escapeHtml(
                                languages.join(
                                    ", "
                                )
                            )

                            :

                            "N/A"
                        }
                    </span>

                </div>


                <div>

                    <strong>
                        Specializations
                    </strong>

                    <span>
                        ${
                            specializations.length

                            ?

                            escapeHtml(
                                specializations.join(
                                    ", "
                                )
                            )

                            :

                            "N/A"
                        }
                    </span>

                </div>


                <div class="full-width">

                    <strong>
                        Areas Covered
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.areasCovered ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div class="full-width">

                    <strong>
                        Qualifications
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.qualifications ||
                            "N/A"
                        )}
                    </span>

                </div>


            </div>

        </div>



        <div class="guide-detail-section">

            <h3>
                About Guide
            </h3>


            <p class="guide-detail-description">

                ${escapeHtml(
                    guide.bio ||
                    "No biography available."
                )}

            </p>

        </div>



        <div class="guide-detail-section">

            <h3>
                Submitted Documents
            </h3>


            <div class="guide-document-list">


                <div>

                    <strong>
                        Profile Photo
                    </strong>

                    <span>

                        ${
                            profilePhotoAvailable

                            ?

                            "Uploaded"

                            :

                            "Not uploaded"
                        }

                    </span>

                </div>


                <div>

                    <strong>
                        NIC / Passport Copy
                    </strong>

                    <span>
                        ${escapeHtml(
                            identityDocumentName
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        Guide License / Certificate
                    </strong>

                    <span>
                        ${escapeHtml(
                            guideLicenseDocumentName
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        Additional Documents
                    </strong>

                    <span>
                        ${escapeHtml(
                            additionalDocumentsNames
                        )}
                    </span>

                </div>


            </div>

        </div>



        <div class="guide-detail-section">

            <h3>
                Account & Membership
            </h3>


            <div class="guide-detail-grid">


                <div>

                    <strong>
                        Account Type
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.accountType ||
                            "guide"
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        Profile Status
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.profileStatus ||
                            "inactive"
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        Account Status
                    </strong>

                    <span>

                        ${
                            guide.isActive ===
                            true

                            ?

                            "Active"

                            :

                            "Inactive"
                        }

                    </span>

                </div>


                <div>

                    <strong>
                        Membership Package
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.package ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        Package Status
                    </strong>

                    <span>
                        ${escapeHtml(
                            guide.packageStatus ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        Email Verified
                    </strong>

                    <span>

                        ${
                            guide.emailVerified ===
                            true

                            ?

                            "Verified"

                            :

                            "Not Verified"
                        }

                    </span>

                </div>


                <div>

                    <strong>
                        Registration Date
                    </strong>

                    <span>
                        ${escapeHtml(
                            registrationDate
                        )}
                    </span>

                </div>


            </div>

        </div>



        ${
            guide.rejectionReason

            ?

            `

            <div class="guide-rejection-notice">

                <h3>
                    Rejection Reason
                </h3>

                <p>
                    ${escapeHtml(
                        guide.rejectionReason
                    )}
                </p>

            </div>

            `

            :

            ""

        }

    `;


    if (guideDetailsModal) {

        guideDetailsModal.classList.add(
            "active"
        );


        guideDetailsModal.setAttribute(
            "aria-hidden",
            "false"
        );

    }

}


/* ============================================================
   23. CLOSE GUIDE DETAILS
============================================================ */

function closeGuideDetailsModal() {

    if (!guideDetailsModal) {

        return;

    }


    guideDetailsModal.classList.remove(
        "active"
    );


    guideDetailsModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


if (closeGuideDetails) {

    closeGuideDetails.addEventListener(
        "click",
        closeGuideDetailsModal
    );

}


/* ============================================================
   24. CLICK OUTSIDE MODAL
============================================================ */

if (guideDetailsModal) {

    guideDetailsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                guideDetailsModal
            ) {

                closeGuideDetailsModal();

            }

        }
    );

}


/* ============================================================
   25. UPDATE STATISTICS
============================================================ */

function updateGuideStatistics() {

    const total =
        allGuides.length;


    const pending =

        allGuides.filter(
            guide =>

                guide.status ===
                "pending"

        ).length;


    const approved =

        allGuides.filter(
            guide =>

                guide.status ===
                "approved"

        ).length;


    const active =

        allGuides.filter(
            guide =>

                guide.status ===
                "approved"

                &&

                guide.isActive ===
                true

        ).length;


    if (totalGuidesCount) {

        totalGuidesCount.textContent =
            total;

    }


    if (pendingGuidesCount) {

        pendingGuidesCount.textContent =
            pending;

    }


    if (approvedGuidesCount) {

        approvedGuidesCount.textContent =
            approved;

    }


    if (activeGuidesCount) {

        activeGuidesCount.textContent =
            active;

    }

}


/* ============================================================
   26. SEARCH EVENT
============================================================ */

if (guideSearchInput) {

    guideSearchInput.addEventListener(
        "input",
        renderGuides
    );

}


/* ============================================================
   27. STATUS FILTER
============================================================ */

if (guideStatusFilter) {

    guideStatusFilter.addEventListener(
        "change",
        renderGuides
    );

}


/* ============================================================
   28. LANGUAGE FILTER
============================================================ */

if (guideLanguageFilter) {

    guideLanguageFilter.addEventListener(
        "change",
        renderGuides
    );

}


/* ============================================================
   29. ESCAPE KEY
============================================================ */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeGuideDetailsModal();

        }

    }
);


/* ============================================================
   30. INITIALIZE
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "LankaWayfarer Admin Guide Management initialized."
        );


        loadGuides();

    }
);


/* ============================================================
   END ADMIN-GUIDES.JS
============================================================ */

