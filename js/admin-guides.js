

/* ============================================================
LANKAWAYFARER
ADMIN GUIDE MANAGEMENT SYSTEM

File:
js/admin-guides.js

## COMMON GUIDE DATA FIELD NAMES

fullName
email
phone
nic
passport
dateOfBirth
address
province
district
languages
guideLicenseNumber
experience
specializations
areasCovered
qualifications
bio
profileImage
identityDocument
guideLicenseDocument
additionalDocuments
accountType
status
isActive
profileStatus
package
packageStatus
registeredAt
createdAt
reviewedAt
reviewedBy
approvedAt
rejectedAt
rejectionReason
statusUpdatedAt

## STORAGE KEY

guide-register.js
↓
localStorage
↓
"lankaWayfarerGuides"
↓
admin-guides.js
↓
Admin Guide Management

CURRENT VERSION:
LocalStorage Prototype

FUTURE:
Firebase / Supabase / Backend API
============================================================ */

/* ============================================================

1. STORAGE KEY
   ============================================================ */

import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ============================================================
2. DOM ELEMENTS
============================================================ */

/* Guide Table */

const guidesTableBody =
document.getElementById(
"guidesTableBody"
);

/* Search */

const guideSearchInput =
document.getElementById(
"guideSearch"
);

/* Status Filter */

const guideStatusFilter =
document.getElementById(
"guideStatusFilter"
);

/* Language Filter */

const guideLanguageFilter =
document.getElementById(
"guideLanguageFilter"
);

/* Empty State */

const guideEmptyState =
document.getElementById(
"guideEmptyState"
);

/* Statistics */

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

/* Details Modal */

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

  return String(
    guide.id ||
    guide.guideId ||
    ""
  );


}

/* ============================================================
5. GET GUIDES FROM FIRESTORE
============================================================ */

async function loadGuides() {
  try {
    const guidesSnapshot = await getDocs(collection(db, "lankaQuestGuides"));

    allGuides = [];

    guidesSnapshot.forEach((doc) => {
      const guide = {
        id: doc.id,

        ...doc.data(),
      };

      if (guide.status !== "deleted") {
        allGuides.push(guide);
      }
    });

    console.log("Firebase Guides:", allGuides);

    renderGuides();

    updateGuideStatistics();
  } catch (error) {
    console.error("Loading guides failed:", error);
  }
}

/* ============================================================
7. GET FILE NAME
============================================================ */

function getFileName(fileData) {


if (!fileData) {

    return "Not uploaded";

}


/*
   File object data saved by guide-register.js
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
   If string
*/

if (
    typeof fileData ===
    "string"
) {

    return fileData;

}


return "Not uploaded";


}

/* ============================================================
8. GET MULTIPLE FILE NAMES
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
        document => {

            return getFileName(
                document
            );

        }
    )
    .join(
        ", "
    );


}

/* ============================================================
9. GET LANGUAGES
============================================================ */

function getGuideLanguages(
guide
) {


if (
    !guide
    ||
    !Array.isArray(
        guide.languages
    )
) {

    return [];

}


return guide.languages;


}

/* ============================================================
10. GET SPECIALIZATIONS
============================================================ */

function getGuideSpecializations(
guide
) {


if (
    !guide
    ||
    !Array.isArray(
        guide.specializations
    )
) {

    return [];

}


return guide.specializations;


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
        "Suspended"

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
12. FORMAT DATE
============================================================ */

function formatDate(
dateValue
) {


if (!dateValue) {

    return "N/A";

}


const date =
    new Date(
        dateValue
    );


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


        /* =================================================
           SEARCH
        ================================================= */

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

            guide.fullName,

            guide.email,

            guide.phone,

            guide.nic,

            guide.passport,

            guide.guideLicenseNumber,

            guide.province,

            guide.district,

            guide.areasCovered,

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


        /* =================================================
           STATUS
        ================================================= */

        const statusMatch =

            selectedStatus ===
            "all"

            ||

            guide.status ===
            selectedStatus;


        /* =================================================
           LANGUAGE
        ================================================= */

        const languages =

            getGuideLanguages(
                guide
            );


        const languageMatch =

            selectedLanguage ===
            "all"

            ||

            languages.includes(
                selectedLanguage
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

            guide.fullName

            ||

            "Unnamed Guide";


        const guideEmail =

            guide.email

            ||

            "No Email";


        const guidePhone =

            guide.phone

            ||

            "N/A";


        const guideStatus =

            guide.status

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

            String(
                guideStatus
            )
            .toLowerCase();


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
                            guide.guideId ||
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
                    class="guide-status ${statusClass}"
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
                                guide.isActive
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

async function approveGuide(guideId) {
  const guide = findGuide(guideId);

  if (!guide) {
    alert("Guide not found.");

    return;
  }

  const confirmed = confirm(
    `Approve guide "${guide.fullName || "this guide"}"?`,
  );

  if (!confirmed) {
    return;
  }

  try {
    await updateDoc(
      doc(
        db,

        "lankaQuestGuides",

        guideId,
      ),

      {
        status: "approved",

        verificationStatus: "approved",

        isActive: true,

        profileStatus: "active",

        packageStatus: "approved",

        approvedAt: serverTimestamp(),

        reviewedAt: serverTimestamp(),

        statusUpdatedAt: serverTimestamp(),
      },
    );

    alert("Guide approved successfully.");

    await loadGuides();
  } catch (error) {
    console.error(
      "Approve guide error:",

      error,
    );

    alert("Guide approval failed.");
  }
}

/* ============================================================
19. REJECT GUIDE
============================================================ */

async function rejectGuide(guideId) {


    const guide = findGuide(guideId);


    if (!guide) {

        alert("Guide not found.");

        return;

    }



    const confirmed = confirm(
        `Reject guide "${guide.fullName || "this guide"}"?`
    );


    if (!confirmed) {

        return;

    }



    const rejectionReason = prompt(
        "Enter rejection reason:"
    );


    if (rejectionReason === null) {

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


                isActive:
                    false,


                profileStatus:
                    "inactive",


                packageStatus:
                    "rejected",


                rejectionReason:
                    rejectionReason.trim(),


                rejectedAt:
                    new Date(),


                reviewedAt:
                    new Date(),


                statusUpdatedAt:
                    new Date()


            }


        );



        alert(
            "Guide application rejected."
        );



        await loadGuides();



    }

    catch(error){


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


async function toggleGuideActiveStatus(guideId){


    const guide = findGuide(guideId);



    if(!guide){


        alert(
            "Guide not found."
        );


        return;


    }





    if(

        guide.status !== "approved"

    ){


        alert(

            "Only approved guides can be activated or deactivated."

        );


        return;


    }





    const newStatus =

        !guide.isActive;




    try{


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

                    ?

                    "active"

                    :

                    "inactive",



                statusUpdatedAt:

                    new Date()


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



    }

    catch(error){


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


async function deleteGuide(guideId){


    const guide = findGuide(guideId);



    if(!guide){


        alert(
            "Guide not found."
        );


        return;


    }




    const confirmed = confirm(

        `Delete guide "${guide.fullName || "this guide"}" permanently?`

    );



    if(!confirmed){

        return;

    }





    try{


        await updateDoc(


            doc(

                db,

                "lankaQuestGuides",

                guideId

            ),


            {


                status:

                    "deleted",


                isActive:

                    false,


                profileStatus:

                    "inactive",


                deletedAt:

                    new Date()


            }


        );




        alert(

            "Guide deleted successfully."

        );



        await loadGuides();



    }


    catch(error){


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


const profileImageName =

    getFileName(
        guide.profileImage
    );


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

        guide.registeredAt

        ||

        guide.createdAt

    );


const status =

    guide.status

    ||

    "pending";


guideDetailsContent.innerHTML = `

    <div class="guide-detail-profile">


        <div class="guide-detail-profile-image">

            ${
                guide.profileImage

                ?

                `<div class="guide-file-preview">
                    ${escapeHtml(
                        profileImageName
                    )}
                </div>`

                :

                `<div class="guide-default-avatar">
                    👤
                </div>`
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
                        guide.guideId ||
                        guide.id ||
                        "N/A"
                    )}
                </strong>

            </p>


            <span class="guide-status ${escapeHtml(
                status
            )}">

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
                    ${escapeHtml(
                        profileImageName
                    )}
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
                        guide.isActive

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
        "LankaQuest Admin Guide Management initialized."
    );


    loadGuides();

}


);
