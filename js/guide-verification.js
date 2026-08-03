/* ============================================================
   GUIDE VERIFICATION PAGE LOGIC
   LankaWayfarer

   PURPOSE:

   Pending Guide
        |
        ↓
   Show Verification Status

   Approved Guide
        |
        ↓
   Guide Dashboard


============================================================ */

/* ============================================================
   IMPORT AUTH FUNCTIONS
============================================================ */

import { getCurrentUser, logoutUser } from "./auth.js";

import { auth, db } from "./firebase-config.js";

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ============================================================
   DOM ELEMENTS
============================================================ */

const guideName = document.getElementById("guideName");

const verificationStatus = document.getElementById("verificationStatus");

const profileStatus = document.getElementById("profileStatus");

const refreshStatusButton = document.getElementById("refreshStatusButton");

const logoutButton = document.getElementById("logoutButton");

/* ============================================================
   LOAD GUIDE PROFILE
============================================================ */

async function loadGuideVerification() {
  const user = getCurrentUser();

  /*
       No Login
    */

  if (!user) {
    window.location.href = "login.html";

    return;
  }

  /*
       Only Guide Account
    */

  if (user.accountType !== "guide") {
    window.location.href = "index.html";

    return;
  }

  const uid = user.uid;

  try {
    const guideRef = doc(
      db,

      "lankaQuestGuides",

      uid,
    );

    const guideSnap = await getDoc(guideRef);

    if (!guideSnap.exists()) {
      alert("Guide profile not found.");

      window.location.href = "login.html";

      return;
    }

    const guide = guideSnap.data();

    /*
           NAME
        */

    if (guideName) {
      guideName.textContent = guide.fullName || "Guide";
    }

    /*
           STATUS DISPLAY
        */

    if (verificationStatus) {
      verificationStatus.textContent = capitalize(
        guide.verificationStatus || "pending",
      );
    }

    if (profileStatus) {
      profileStatus.textContent = capitalize(guide.profileStatus || "inactive");
    }

    /*
           AUTO REDIRECT

           Approved Guide

        */

    if (
      guide.verificationStatus === "approved" &&
      guide.status === "approved" &&
      guide.profileStatus === "active" &&
      guide.isActive === true
    ) {
      setTimeout(
        () => {
          window.location.href = "guide-dashboard.html";
        },

        1500,
      );
    }
  } catch (error) {
    console.error(
      "Guide Verification Error:",

      error,
    );
  }
}

/* ============================================================
   CAPITALIZE TEXT
============================================================ */

function capitalize(text) {
  if (!text) {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* ============================================================
   REFRESH STATUS
============================================================ */

if (refreshStatusButton) {
  refreshStatusButton.addEventListener(
    "click",

    () => {
      loadGuideVerification();
    },
  );
}

/* ============================================================
   LOGOUT
============================================================ */

if (logoutButton) {
  logoutButton.addEventListener(
    "click",

    async () => {
      const confirmLogout = confirm("Are you sure you want to logout?");

      if (!confirmLogout) {
        return;
      }

      await logoutUser();
    },
  );
}

/* ============================================================
   INITIAL LOAD
============================================================ */

loadGuideVerification();
