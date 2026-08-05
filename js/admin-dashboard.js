/* ============================================================
   LANKAWAYFARER
   ADMIN DASHBOARD

   FIREBASE FIRST ARCHITECTURE

   SECURITY:

   Firebase Authentication
          ↓
   admin: true custom claim
          ↓
   Email verified
          ↓
   Admin Dashboard
          ↓
   Firestore

   COLLECTION:

   lankaQuestGuides

============================================================ */

/* ============================================================
   FIREBASE
============================================================ */

import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ============================================================
   DOM ELEMENTS
============================================================ */

const dashboardLoading = document.getElementById("dashboardLoading");

const dashboardError = document.getElementById("dashboardError");

const dashboardErrorMessage = document.getElementById("dashboardErrorMessage");

const dashboardContent = document.getElementById("dashboardContent");

const retryDashboardButton = document.getElementById("retryDashboardButton");

const adminAccountEmail = document.getElementById("adminAccountEmail");

const adminSecurityStatus = document.getElementById("adminSecurityStatus");

const totalGuidesCount = document.getElementById("totalGuidesCount");

const pendingGuidesCount = document.getElementById("pendingGuidesCount");

const approvedGuidesCount = document.getElementById("approvedGuidesCount");

const activeGuidesCount = document.getElementById("activeGuidesCount");

const recentGuidesTableBody = document.getElementById("recentGuidesTableBody");

const recentGuidesEmpty = document.getElementById("recentGuidesEmpty");

const headerLogoutButton = document.getElementById("headerLogoutButton");

const sidebarLogoutButton = document.getElementById("sidebarLogoutButton");

/* ============================================================
   STATE
============================================================ */

let authenticatedAdmin = null;

let allGuides = [];

/*
   Prevent multiple dashboard
   initialization operations.
*/

let dashboardInitialized = false;

/* ============================================================
   SHOW LOADING
============================================================ */

function showDashboardLoading() {
  if (dashboardLoading) {
    dashboardLoading.hidden = false;
  }

  if (dashboardError) {
    dashboardError.hidden = true;
  }

  if (dashboardContent) {
    dashboardContent.hidden = true;
  }
}

/* ============================================================
   SHOW DASHBOARD
============================================================ */

function showDashboardContent() {
  if (dashboardLoading) {
    dashboardLoading.hidden = true;
  }

  if (dashboardError) {
    dashboardError.hidden = true;
  }

  if (dashboardContent) {
    dashboardContent.hidden = false;
  }
}

/* ============================================================
   SHOW ERROR
============================================================ */

function showDashboardError(message) {
  if (dashboardLoading) {
    dashboardLoading.hidden = true;
  }

  if (dashboardContent) {
    dashboardContent.hidden = true;
  }

  if (dashboardErrorMessage) {
    dashboardErrorMessage.textContent = message;
  }

  if (dashboardError) {
    dashboardError.hidden = false;
  }
}

/* ============================================================
   ADMIN AUTHORIZATION
============================================================ */

async function verifyAdminAccess(user) {
  /*
       No Firebase user.
    */

  if (!user) {
    window.location.href = "admin-login.html";

    return false;
  }

  try {
    /*
           Force ID token refresh.

           Important when the admin custom claim
           was recently added.
        */

    const idTokenResult = await user.getIdTokenResult(true);

    /*
           Custom claim.
        */

    const isAdmin = idTokenResult.claims.admin === true;

    /*
           Email verification.
        */

    const isEmailVerified = user.emailVerified === true;

    console.log("========================================");

    console.log("ADMIN AUTHORIZATION");

    console.log("UID:", user.uid);

    console.log("Email:", user.email);

    console.log("Admin claim:", isAdmin);

    console.log("Email verified:", isEmailVerified);

    console.log("Claims:", idTokenResult.claims);

    console.log("========================================");

    /*
           Not admin.
        */

    if (!isAdmin) {
      console.error("Admin access denied.");

      await signOut(auth);

      window.location.href = "admin-login.html";

      return false;
    }

    /*
           Admin email not verified.
        */

    if (!isEmailVerified) {
      console.error("Admin email is not verified.");

      await signOut(auth);

      window.location.href = "admin-login.html";

      return false;
    }

    /*
           Authorized.
        */

    authenticatedAdmin = user;

    if (adminAccountEmail) {
      adminAccountEmail.textContent = user.email || "Administrator";
    }

    if (adminSecurityStatus) {
      adminSecurityStatus.textContent = "Admin access verified";
    }

    return true;
  } catch (error) {
    console.error("Admin authorization error:", error);

    try {
      await signOut(auth);
    } catch (signOutError) {
      console.error("Admin sign out error:", signOutError);
    }

    window.location.href = "admin-login.html";

    return false;
  }
}

/* ============================================================
   FIRESTORE TIMESTAMP TO DATE
============================================================ */

function convertFirestoreDate(value) {
  if (!value) {
    return null;
  }

  /*
       Firestore Timestamp
    */

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  /*
       JavaScript Date
    */

  if (value instanceof Date) {
    return value;
  }

  /*
       Timestamp-like object
    */

  if (typeof value === "object" && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }

  /*
       Number / string
    */

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/* ============================================================
   FORMAT DATE
============================================================ */

function formatDate(value) {
  const date = convertFirestoreDate(value);

  if (!date) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",

    month: "short",

    day: "numeric",
  });
}

/* ============================================================
   FORMAT STATUS
============================================================ */

function formatStatus(status) {
  const statusNames = {
    pending: "Pending Review",

    approved: "Approved",

    rejected: "Rejected",

    suspended: "Suspended",

    deleted: "Deleted",
  };

  return statusNames[status] || status || "Unknown";
}

/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHtml(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

/* ============================================================
   LOAD GUIDES
============================================================ */

async function loadGuides() {
  /*
       Firestore Security Rules must allow
       admin:true users to read lankaQuestGuides.
    */

  const guidesSnapshot = await getDocs(collection(db, "lankaQuestGuides"));

  allGuides = [];

  guidesSnapshot.forEach((guideDocument) => {
    const guide = {
      id: guideDocument.id,

      ...guideDocument.data(),
    };

    /*
               Deleted guides are not shown
               in dashboard statistics.
            */

    if (guide.status !== "deleted") {
      allGuides.push(guide);
    }
  });

  console.log("Admin Dashboard Guides:", allGuides);

  updateStatistics();

  renderRecentGuides();
}

/* ============================================================
   UPDATE STATISTICS
============================================================ */

function updateStatistics() {
  const total = allGuides.length;

  const pending = allGuides.filter(
    (guide) => guide.status === "pending",
  ).length;

  const approved = allGuides.filter(
    (guide) => guide.status === "approved",
  ).length;

  const active = allGuides.filter(
    (guide) => guide.status === "approved" && guide.isActive === true,
  ).length;

  if (totalGuidesCount) {
    totalGuidesCount.textContent = total;
  }

  if (pendingGuidesCount) {
    pendingGuidesCount.textContent = pending;
  }

  if (approvedGuidesCount) {
    approvedGuidesCount.textContent = approved;
  }

  if (activeGuidesCount) {
    activeGuidesCount.textContent = active;
  }
}

/* ============================================================
   SORT RECENT GUIDES
============================================================ */

function getRecentGuides() {
  return [...allGuides]

    .sort((firstGuide, secondGuide) => {
      const firstDate = convertFirestoreDate(
        firstGuide.createdAt || firstGuide.registeredAt,
      );

      const secondDate = convertFirestoreDate(
        secondGuide.createdAt || secondGuide.registeredAt,
      );

      const firstTime = firstDate ? firstDate.getTime() : 0;

      const secondTime = secondDate ? secondDate.getTime() : 0;

      return secondTime - firstTime;
    })

    .slice(0, 8);
}

/* ============================================================
   RENDER RECENT GUIDES
============================================================ */

function renderRecentGuides() {
  if (!recentGuidesTableBody) {
    return;
  }

  recentGuidesTableBody.innerHTML = "";

  const recentGuides = getRecentGuides();

  if (recentGuides.length === 0) {
    if (recentGuidesEmpty) {
      recentGuidesEmpty.hidden = false;
    }

    return;
  }

  if (recentGuidesEmpty) {
    recentGuidesEmpty.hidden = true;
  }

  recentGuides.forEach((guide) => {
    const row = document.createElement("tr");

    const guideId = guide.id || guide.uid || "";

    const guideName = guide.fullName || "Unnamed Guide";

    const guideEmail = guide.email || "No Email";

    const district = guide.district || "N/A";

    const status = guide.status || "pending";

    const statusClass = String(status).toLowerCase();

    const registrationDate = formatDate(guide.createdAt || guide.registeredAt);

    row.innerHTML = `

                <td>

                    <div class="dashboard-guide-name">

                        <strong>
                            ${escapeHtml(guideName)}
                        </strong>

                        <span>
                            ${escapeHtml(guideId)}
                        </span>

                    </div>

                </td>


                <td>

                    ${escapeHtml(guideEmail)}

                </td>


                <td>

                    ${escapeHtml(district)}

                </td>


                <td>

                    <span
                        class="dashboard-status ${escapeHtml(statusClass)}"
                    >

                        ${escapeHtml(formatStatus(status))}

                    </span>

                </td>


                <td>

                    ${escapeHtml(registrationDate)}

                </td>


                <td>

                    <a
                        href="admin-guides.html"
                        class="dashboard-view-button"
                    >
                        View
                    </a>

                </td>

            `;

    recentGuidesTableBody.appendChild(row);
  });
}

/* ============================================================
   LOGOUT
============================================================ */

async function logoutAdmin() {
  const confirmed = window.confirm("Are you sure you want to logout?");

  if (!confirmed) {
    return;
  }

  try {
    await signOut(auth);

    window.location.href = "admin-login.html";
  } catch (error) {
    console.error("Admin logout error:", error);

    alert("Unable to logout. Please try again.");
  }
}

/* ============================================================
   INITIALIZE DASHBOARD
============================================================ */

async function initializeDashboard(user) {
  /*
       Prevent duplicate initialization.
    */

  if (dashboardInitialized) {
    return;
  }

  showDashboardLoading();

  /*
       Security check first.
    */

  const authorized = await verifyAdminAccess(user);

  if (!authorized) {
    return;
  }

  try {
    /*
           Load Firebase guide data.
        */

    await loadGuides();

    /*
           Dashboard is ready.
        */

    dashboardInitialized = true;

    showDashboardContent();
  } catch (error) {
    console.error("Admin dashboard loading failed:", error);

    /*
           Firestore permission.
        */

    if (error.code === "permission-denied") {
      showDashboardError(
        "Firestore denied administrator access. Please check the Firebase Security Rules and admin custom claim.",
      );

      return;
    }

    /*
           Network.
        */

    if (error.code === "unavailable") {
      showDashboardError(
        "Firebase is temporarily unavailable. Please check your internet connection and try again.",
      );

      return;
    }

    /*
           Default.
        */

    showDashboardError(
      "We could not load the administrator dashboard data. Please try again.",
    );
  }
}

/* ============================================================
   RETRY
============================================================ */

if (retryDashboardButton) {
  retryDashboardButton.addEventListener("click", async () => {
    dashboardInitialized = false;

    const user = auth.currentUser;

    await initializeDashboard(user);
  });
}

/* ============================================================
   HEADER LOGOUT
============================================================ */

if (headerLogoutButton) {
  headerLogoutButton.addEventListener("click", logoutAdmin);
}

/* ============================================================
   SIDEBAR LOGOUT
============================================================ */

if (sidebarLogoutButton) {
  sidebarLogoutButton.addEventListener("click", logoutAdmin);
}

/* ============================================================
   AUTH STATE
============================================================ */

onAuthStateChanged(auth, async (user) => {
  console.log(
    "Admin Dashboard Auth State:",
    user ? user.uid : "No authenticated user",
  );

  /*
           If Firebase session disappears,
           return to admin login.
        */

  if (!user) {
    window.location.href = "admin-login.html";

    return;
  }

  await initializeDashboard(user);
});

/* ============================================================
   INITIAL STATE
============================================================ */

showDashboardLoading();

/* ============================================================
   END ADMIN-DASHBOARD.JS
============================================================ */
