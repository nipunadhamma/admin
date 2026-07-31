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
      ↓
   Incoming Request
============================================================ */

/* ============================================================
   1. FIREBASE IMPORTS
============================================================ */

import { db } from "./firebase-config.js";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ============================================================
   2. DOM ELEMENTS
============================================================ */

const guidesContainer = document.getElementById("guidesContainer");

const guideSearchInput = document.getElementById("guideSearchInput");

const districtFilter = document.getElementById("districtFilter");

const languageFilter = document.getElementById("languageFilter");

const sortFilter = document.getElementById("sortFilter");

const clearFiltersButton = document.getElementById("clearFiltersButton");

const guideCount = document.getElementById("guideCount");

const logoutButton = document.getElementById("logoutButton");

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
  const params = new URLSearchParams(window.location.search);

  return params.get("requestId");
}

/* ============================================================
   5. GET CURRENT FIREBASE USER
============================================================ */

async function getCurrentFirebaseUser() {
  /*
       auth.js may expose getCurrentUser()
       through window.
    */

  if (typeof window.getCurrentUser === "function") {
    const user = window.getCurrentUser();

    if (user) {
      return user.firebaseUser || user.authUser || user;
    }
  }

  /*
       Fallback:

       Import Firebase Auth directly.

       This makes the page independent from
       localStorage/session-only authentication.
    */

  try {
    const { getAuth, onAuthStateChanged } =
      await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");

    const { auth } = await import("./firebase-config.js");

    if (auth?.currentUser) {
      return auth.currentUser;
    }

    return await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();

        resolve(user);
      });
    });
  } catch (error) {
    console.error("Unable to get Firebase user:", error);

    return null;
  }
}

/* ============================================================
   6. ESCAPE HTML
============================================================ */

function escapeHTML(value) {
  const div = document.createElement("div");

  div.textContent = value == null ? "" : String(value);

  return div.innerHTML;
}

/* ============================================================
   7. LOAD CURRENT REQUEST
============================================================ */

async function loadCurrentRequest() {
  currentRequestId = getRequestIdFromURL();

  if (!currentRequestId) {
    console.error("No requestId found in URL.");

    showPageMessage(
      "No quotation request was found. Please return to your trip.",
    );

    return null;
  }

  try {
    const requestRef = doc(db, "lankaQuestQuotationRequests", currentRequestId);

    const snapshot = await getDoc(requestRef);

    if (!snapshot.exists()) {
      console.error("Quotation request not found:", currentRequestId);

      showPageMessage("The quotation request could not be found.");

      return null;
    }

    currentRequest = {
      id: snapshot.id,

      ...snapshot.data(),
    };

    console.log("Quotation request loaded:", currentRequest);

    return currentRequest;
  } catch (error) {
    console.error("Load quotation request error:", error);

    showPageMessage("Unable to load your quotation request.");

    return null;
  }
}

/* ============================================================
   8. VERIFY TOURIST OWNERSHIP
============================================================ */

async function verifyTouristOwnership() {
  if (!currentRequest) {
    return false;
  }

  const firebaseUser = await getCurrentFirebaseUser();

  if (!firebaseUser) {
    showPageMessage("Please login as a Tourist before selecting a guide.");

    return false;
  }

  currentUser = firebaseUser;

  /*
       The request must belong to
       the authenticated tourist.
    */

  if (
    currentRequest.touristId &&
    currentRequest.touristId !== firebaseUser.uid
  ) {
    console.error("Tourist ownership mismatch.");

    showPageMessage("You are not authorized to modify this quotation request.");

    return false;
  }

  return true;
}

/* ============================================================
   9. LOAD APPROVED GUIDES
============================================================ */

async function loadGuides() {
  if (!guidesContainer) {
    return;
  }

  try {
    guidesContainer.innerHTML = `

            <div class="guide-loading">

                <div>
                    🔄
                </div>

                <p>
                    Loading registered guides...
                </p>

            </div>

        `;

    /*
           Only approved guides should appear
           to tourists.
        */

    const guidesQuery = query(
      collection(db, "lankaQuestGuides"),
      where("verificationStatus", "==", "approved"),
    );

    const snapshot = await getDocs(guidesQuery);

    guides = [];

    snapshot.forEach((guideSnapshot) => {
      const data = guideSnapshot.data();

      guides.push({
        id: guideSnapshot.id,

        uid: guideSnapshot.id,

        ...data,
      });
    });

    /*
           Only actual guide accounts.
        */

    guides = guides.filter(
      (guide) => !guide.accountType || guide.accountType === "guide",
    );

    filteredGuides = [...guides];

    populateDistrictFilter();

    populateLanguageFilter();

    renderGuides();

    console.log("Approved guides loaded:", guides.length);
  } catch (error) {
    console.error("Load guides error:", error);

    guidesContainer.innerHTML = `

            <div class="guide-error">

                <div>
                    ⚠️
                </div>

                <h3>
                    Unable to load guides
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;
  }
}

/* ============================================================
   10. POPULATE DISTRICT FILTER
============================================================ */

function populateDistrictFilter() {
  if (!districtFilter) {
    return;
  }

  const districts = [
    ...new Set(guides.map((guide) => guide.district).filter(Boolean)),
  ].sort();

  /*
       Keep first "All Districts"
       option.
    */

  districtFilter.innerHTML = `

        <option value="">
            All Districts
        </option>

    `;

  districts.forEach((district) => {
    const option = document.createElement("option");

    option.value = district;

    option.textContent = district;

    districtFilter.appendChild(option);
  });
}

/* ============================================================
   11. POPULATE LANGUAGE FILTER
============================================================ */

function populateLanguageFilter() {
  if (!languageFilter) {
    return;
  }

  const languages = [];

  guides.forEach((guide) => {
    const guideLanguages = guide.languages || guide.language || [];

    if (Array.isArray(guideLanguages)) {
      guideLanguages.forEach((language) => {
        if (language) {
          languages.push(language);
        }
      });
    } else if (typeof guideLanguages === "string") {
      guideLanguages.split(",").forEach((language) => {
        if (language.trim()) {
          languages.push(language.trim());
        }
      });
    }
  });

  const uniqueLanguages = [...new Set(languages)].sort();

  languageFilter.innerHTML = `

        <option value="">
            All Languages
        </option>

    `;

  uniqueLanguages.forEach((language) => {
    const option = document.createElement("option");

    option.value = language;

    option.textContent = language;

    languageFilter.appendChild(option);
  });
}

/* ============================================================
   12. GUIDE SEARCH + FILTER
============================================================ */

function applyFilters() {
  const search = guideSearchInput
    ? guideSearchInput.value.trim().toLowerCase()
    : "";

  const district = districtFilter ? districtFilter.value : "";

  const language = languageFilter ? languageFilter.value : "";

  filteredGuides = guides.filter((guide) => {
    /*
                   Search
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

        guide.languages,

        guide.language,
      ]
        .flat()
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(search)) {
        return false;
      }
    }

    /*
                   District
                */

    if (district && guide.district !== district) {
      return false;
    }

    /*
                   Language
                */

    if (language) {
      const guideLanguages = guide.languages || guide.language || [];

      const languageMatch = Array.isArray(guideLanguages)
        ? guideLanguages
            .map((item) => String(item).toLowerCase())
            .includes(language.toLowerCase())
        : String(guideLanguages).toLowerCase().includes(language.toLowerCase());

      if (!languageMatch) {
        return false;
      }
    }

    return true;
  });

  applySort();

  renderGuides();
}

/* ============================================================
   13. SORT GUIDES
============================================================ */

function applySort() {
  const sort = sortFilter ? sortFilter.value : "rating";

  if (sort === "rating") {
    filteredGuides.sort(
      (a, b) =>
        Number(b.rating || b.averageRating || 0) -
        Number(a.rating || a.averageRating || 0),
    );

    return;
  }

  if (sort === "experience") {
    filteredGuides.sort(
      (a, b) => Number(b.experienceYears || 0) - Number(a.experienceYears || 0),
    );

    return;
  }

  if (sort === "name") {
    filteredGuides.sort((a, b) =>
      String(a.fullName || a.name || "").localeCompare(
        String(b.fullName || b.name || ""),
      ),
    );
  }
}

/* ============================================================
   14. RENDER GUIDES
============================================================ */

function renderGuides() {
  if (!guidesContainer) {
    return;
  }

  if (guideCount) {
    guideCount.textContent = `${filteredGuides.length} Guide${
      filteredGuides.length === 1 ? "" : "s"
    }`;
  }

  if (filteredGuides.length === 0) {
    guidesContainer.innerHTML = `

            <div class="no-guides">

                <div>
                    🔎
                </div>

                <h3>
                    No Guides Found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>

        `;

    return;
  }

  guidesContainer.innerHTML = "";

  filteredGuides.forEach((guide, index) => {
    const card = createGuideCard(guide, index);

    guidesContainer.appendChild(card);
  });
}

/* ============================================================
   15. CREATE GUIDE CARD
============================================================ */

function createGuideCard(guide, index) {
  const card = document.createElement("article");

  card.className = "guide-card";

  const name = guide.fullName || guide.name || "Registered Guide";

  const district = guide.district || "Sri Lanka";

  const rating = guide.rating || guide.averageRating || "New";

  const experience =
    guide.experienceYears || guide.experience || "Not specified";

  const languages = guide.languages || guide.language || [];

  let languageText = "N/A";

  if (Array.isArray(languages)) {
    languageText = languages.length ? languages.join(", ") : "N/A";
  } else if (languages) {
    languageText = String(languages);
  }

  const specializations =
    guide.specializations || guide.specialization || "General Tourism";

  const areas = guide.areas || guide.coverageAreas || "N/A";

  const avatar = guide.photoURL || guide.profileImage || guide.photo || "";

  const avatarHTML = avatar
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
                    📍 ${escapeHTML(district)}
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

                ${escapeHTML(experience)}
            </p>


            <p>
                🗣
                <strong>
                    Languages:
                </strong>

                ${escapeHTML(languageText)}
            </p>


            <p>
                🌿
                <strong>
                    Specializations:
                </strong>

                ${escapeHTML(
                  Array.isArray(specializations)
                    ? specializations.join(", ")
                    : specializations,
                )}
            </p>


            <p>
                🗺
                <strong>
                    Areas:
                </strong>

                ${escapeHTML(Array.isArray(areas) ? areas.join(", ") : areas)}
            </p>

        </div>


        <div class="guide-card-actions">

            <button
                type="button"
                class="view-guide-button"
                data-guide-id="${escapeHTML(guide.id)}"
            >
                View Profile
            </button>


            <button
                type="button"
                class="select-guide-button"
                data-guide-id="${escapeHTML(guide.id)}"
            >
                Select Guide →
            </button>

        </div>

    `;

  const viewButton = card.querySelector(".view-guide-button");

  if (viewButton) {
    viewButton.addEventListener("click", () => {
      viewGuideProfile(guide);
    });
  }

  const selectButton = card.querySelector(".select-guide-button");

  if (selectButton) {
    selectButton.addEventListener("click", async () => {
      await selectGuide(guide, selectButton);
    });
  }

  return card;
}

/* ============================================================
   16. VIEW GUIDE PROFILE
============================================================ */

function viewGuideProfile(guide) {
  /*
       Preserve the existing simple profile
       behaviour without creating a separate
       data source.
    */

  const name = guide.fullName || guide.name || "Guide";

  const email = guide.email || "Not available";

  const phone = guide.phone || guide.phoneNumber || "Not available";

  const district = guide.district || "Not specified";

  const languages = guide.languages || guide.language || "N/A";

  const specializations =
    guide.specializations || guide.specialization || "General Tourism";

  alert(
    `${name}\n\n` +
      `📍 ${district}\n` +
      `📧 ${email}\n` +
      `📞 ${phone}\n\n` +
      `🗣 Languages: ${
        Array.isArray(languages) ? languages.join(", ") : languages
      }\n\n` +
      `🌿 Specializations: ${
        Array.isArray(specializations)
          ? specializations.join(", ")
          : specializations
      }`,
  );
}

/* ============================================================
   17. SELECT GUIDE
============================================================ */

async function selectGuide(guide, button) {
  /*
       Prevent double clicks.
    */

  if (button?.disabled) {
    return;
  }

  /*
       Confirm tourist authentication.
    */

  const authorized = await verifyTouristOwnership();

  if (!authorized) {
    return;
  }

  if (!currentRequest || !currentRequest.id) {
    alert("Quotation request was not found.");

    return;
  }

  /*
       Validate guide UID.
    */

  const guideId = guide.uid || guide.id;

  if (!guideId) {
    console.error("Guide UID is missing:", guide);

    alert("This guide could not be selected because the guide ID is missing.");

    return;
  }

  /*
       Confirm selection.
    */

  const confirmed = window.confirm(
    `Select ${guide.fullName || guide.name || "this guide"} as your tour guide?`,
  );

  if (!confirmed) {
    return;
  }

  if (button) {
    button.disabled = true;

    button.dataset.originalText = button.textContent;

    button.textContent = "Selecting...";
  }

  try {
    /*
           =====================================================
           CREATE A CLEAN GUIDE SNAPSHOT
           =====================================================
        */

    const selectedGuide = {
      uid: guideId,

      id: guideId,

      fullName: guide.fullName || guide.name || "",

      email: guide.email || "",

      phone: guide.phone || guide.phoneNumber || "",

      district: guide.district || "",

      province: guide.province || "",

      languages: guide.languages || guide.language || [],

      specializations: guide.specializations || guide.specialization || "",

      areas: guide.areas || guide.coverageAreas || "",

      verificationStatus: guide.verificationStatus || "approved",
    };

    /*
           =====================================================
           UPDATE FIRESTORE REQUEST
           =====================================================

           THIS IS THE IMPORTANT FIX.

           guideId is now stored directly.

           Guide Dashboard can query:

           where(
               "guideId",
               "==",
               currentGuide.uid
           )
        */

    const requestRef = doc(
      db,
      "lankaQuestQuotationRequests",
      currentRequest.id,
    );

    await updateDoc(requestRef, {
      /*
                   Guide identity
                */

      guideId: guideId,

      guideName: selectedGuide.fullName,

      guideEmail: selectedGuide.email,

      /*
                   Full selected guide snapshot
                */

      selectedGuide: selectedGuide,

      /*
                   Request status
                */

      status: "guide_selected",

      quotationRequested: true,

      /*
                   Timestamp
                */

      guideSelectedAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    });

    /*
           Update in-memory request.
        */

    currentRequest.guideId = guideId;

    currentRequest.guideName = selectedGuide.fullName;

    currentRequest.guideEmail = selectedGuide.email;

    currentRequest.selectedGuide = selectedGuide;

    currentRequest.status = "guide_selected";

    currentRequest.quotationRequested = true;

    /*
           Success
        */

    console.log("Guide selected successfully.", {
      requestId: currentRequest.id,

      guideId: guideId,

      guideName: selectedGuide.fullName,

      guideEmail: selectedGuide.email,
    });

    alert(
      `${selectedGuide.fullName || "Guide"} has been selected successfully.`,
    );

    /*
           Go to request confirmation /
           next stage.

           Keep requestId in URL so the
           next page can load the same
           Firestore document.
        */

    window.location.href = `quotation-request.html?requestId=${encodeURIComponent(
      currentRequest.id,
    )}&guideId=${encodeURIComponent(guideId)}`;
  } catch (error) {
    console.error("Select guide Firestore error:", error);

    alert(error.message || "Unable to select this guide. Please try again.");

    if (button) {
      button.disabled = false;

      button.textContent = button.dataset.originalText || "Select Guide →";
    }
  }
}

/* ============================================================
   18. SHOW PAGE MESSAGE
============================================================ */

function showPageMessage(message) {
  if (!guidesContainer) {
    alert(message);

    return;
  }

  guidesContainer.innerHTML = `

        <div class="guide-error">

            <div>
                ⚠️
            </div>

            <h3>
                ${escapeHTML(message)}
            </h3>

        </div>

    `;
}

/* ============================================================
   19. CLEAR FILTERS
============================================================ */

function clearFilters() {
  if (guideSearchInput) {
    guideSearchInput.value = "";
  }

  if (districtFilter) {
    districtFilter.value = "";
  }

  if (languageFilter) {
    languageFilter.value = "";
  }

  if (sortFilter) {
    sortFilter.value = "rating";
  }

  filteredGuides = [...guides];

  applySort();

  renderGuides();
}

/* ============================================================
   20. FILTER EVENT LISTENERS
============================================================ */

if (guideSearchInput) {
  guideSearchInput.addEventListener("input", () => {
    applyFilters();
  });
}

if (districtFilter) {
  districtFilter.addEventListener("change", () => {
    applyFilters();
  });
}

if (languageFilter) {
  languageFilter.addEventListener("change", () => {
    applyFilters();
  });
}

if (sortFilter) {
  sortFilter.addEventListener("change", () => {
    applyFilters();
  });
}

if (clearFiltersButton) {
  clearFiltersButton.addEventListener("click", () => {
    clearFilters();
  });
}

/* ============================================================
   21. LOGOUT
============================================================ */

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      if (typeof window.logoutUser === "function") {
        await window.logoutUser();
      } else {
        const { getAuth, signOut } =
          await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");

        const { auth } = await import("./firebase-config.js");

        await signOut(auth);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }

    window.location.href = "index.html";
  });
}

/* ============================================================
   22. INITIALIZE
============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("LankaQuest Find Guides loading...");

  /*
           1. Load request
        */

  const request = await loadCurrentRequest();

  if (!request) {
    return;
  }

  /*
           2. Verify tourist ownership
        */

  const authorized = await verifyTouristOwnership();

  if (!authorized) {
    return;
  }

  /*
           3. Load approved guides
        */

  await loadGuides();

  console.log("Find Guides page initialized.", {
    requestId: currentRequestId,

    touristId: currentUser?.uid,

    guides: guides.length,
  });
});

/* ============================================================
   END FIND-GUIDES.JS
============================================================ */
