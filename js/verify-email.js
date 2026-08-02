/* ============================================================
   LANKAQUEST
   EMAIL VERIFICATION SYSTEM

   FIREBASE FIRST ARCHITECTURE

   FLOW:

   Register
       ↓
   Firebase Authentication
       ↓
   Send Verification Email
       ↓
   Save Pending Registration Data
       ↓
   verify-email.html
       ↓
   User verifies email
       ↓
   "I Have Verified My Email"
       ↓
   Reload Firebase User
       ↓
   emailVerified === true
       ↓
   Read Pending Registration Data
       ↓
   Check Existing Firestore Profile
       ↓
   Create Firestore Profile
       ↓
   Remove Pending Registration Data
       ↓
   Dashboard


   ACCOUNT TYPES:

   🧳 Tourist
   🧑‍💼 Guide


   COLLECTIONS:

   Tourist:
   lankaQuestTourists/{UID}

   Guide:
   lankaQuestGuides/{UID}


   IMPORTANT:

   Normal email/password registration does NOT create
   a Firestore profile until the email is verified.


   Pending registration data is stored temporarily in:

   sessionStorage:
   lankaQuestPendingRegistration

============================================================ */

/* ============================================================
   FIREBASE IMPORTS
============================================================ */

import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ============================================================
   CONSTANTS
============================================================ */

const PENDING_REGISTRATION_KEY = "lankaQuestPendingRegistration";

/* ============================================================
   DOM ELEMENTS
============================================================ */

const verificationEmail = document.getElementById("verificationEmail");

const verificationMessage = document.getElementById("verificationMessage");

const checkVerificationButton = document.getElementById(
  "checkVerificationButton",
);

const resendVerificationButton = document.getElementById(
  "resendVerificationButton",
);

const backToLoginButton = document.getElementById("backToLoginButton");

/* ============================================================
   AUTHENTICATED USER
============================================================ */

let authenticatedUser = null;

/* ============================================================
   PROCESS STATE

   Prevent multiple profile-creation operations
   from running at the same time.
============================================================ */

let verificationProcessing = false;

/* ============================================================
   MESSAGE SYSTEM
============================================================ */

function showVerificationMessage(message, type = "success") {
  if (!verificationMessage) {
    return;
  }

  verificationMessage.textContent = message;

  verificationMessage.style.display = "block";

  if (type === "error") {
    verificationMessage.style.background = "#fff0f0";

    verificationMessage.style.color = "#b42318";
  } else {
    verificationMessage.style.background = "#edf8f1";

    verificationMessage.style.color = "#176044";
  }
}

/* ============================================================
   GET PENDING REGISTRATION DATA

   register.js saves temporary registration information
   before redirecting to verify-email.html.

   IMPORTANT:

   Password is NEVER stored here.
============================================================ */

function getPendingRegistrationData() {
  try {
    const savedData = sessionStorage.getItem(PENDING_REGISTRATION_KEY);

    if (!savedData) {
      return null;
    }

    const registrationData = JSON.parse(savedData);

    if (!registrationData || typeof registrationData !== "object") {
      return null;
    }

    return registrationData;
  } catch (error) {
    console.error("Unable to read pending registration data:", error);

    return null;
  }
}

/* ============================================================
   REMOVE PENDING REGISTRATION DATA
============================================================ */

function clearPendingRegistrationData() {
  sessionStorage.removeItem(PENDING_REGISTRATION_KEY);

  console.log("Pending registration data removed.");
}

/* ============================================================
   GET VALID ACCOUNT TYPE

   Account type comes from the temporary registration data,
   NOT from the URL.

   Supported:

   tourist
   guide
============================================================ */

function getValidAccountType() {
  const registrationData = getPendingRegistrationData();

  if (!registrationData) {
    return null;
  }

  if (registrationData.accountType === "tourist") {
    return "tourist";
  }

  if (registrationData.accountType === "guide") {
    return "guide";
  }

  return null;
}

/* ============================================================
   SHOW USER EMAIL
============================================================ */

function displayUserEmail(user) {
  if (!verificationEmail) {
    return;
  }

  if (user && user.email) {
    verificationEmail.textContent = user.email;

    return;
  }

  verificationEmail.textContent = "Your registered email address";
}

/* ============================================================
   CHECK EXISTING FIRESTORE PROFILE
============================================================ */

async function checkExistingProfile(uid) {
  /* ==========================================================
     CHECK TOURIST PROFILE
  ========================================================== */

  const touristRef = doc(db, "lankaQuestTourists", uid);

  const touristSnapshot = await getDoc(touristRef);

  if (touristSnapshot.exists()) {
    return {
      exists: true,

      accountType: "tourist",

      data: touristSnapshot.data(),
    };
  }

  /* ==========================================================
     CHECK GUIDE PROFILE
  ========================================================== */

  const guideRef = doc(db, "lankaQuestGuides", uid);

  const guideSnapshot = await getDoc(guideRef);

  if (guideSnapshot.exists()) {
    return {
      exists: true,

      accountType: "guide",

      data: guideSnapshot.data(),
    };
  }

  /* ==========================================================
     NO PROFILE
  ========================================================== */

  return {
    exists: false,

    accountType: null,

    data: null,
  };
}

/* ============================================================
   CREATE TOURIST PROFILE
============================================================ */

async function createTouristProfile(user, registrationData) {
  const profileRef = doc(db, "lankaQuestTourists", user.uid);

  /* ==========================================================
     PREVENT DUPLICATE PROFILE
  ========================================================== */

  const existingProfile = await getDoc(profileRef);

  if (existingProfile.exists()) {
    console.log("Tourist profile already exists:", user.uid);

    return existingProfile.data();
  }

  /* ==========================================================
     REGISTRATION DATA
  ========================================================== */

  const fullName = registrationData.fullName || user.displayName || "";

  const country = registrationData.country || "";

  const email = user.email || registrationData.email || "";

  /* ==========================================================
     VALIDATION
  ========================================================== */

  if (!fullName.trim()) {
    throw new Error(
      "Your registration information could not be found. Please return to the registration page and try again.",
    );
  }

  if (!email.trim()) {
    throw new Error(
      "Your email address could not be found. Please return to the registration page and try again.",
    );
  }

  /* ==========================================================
     TOURIST PROFILE
  ========================================================== */

  const profileData = {
    uid: user.uid,

    fullName: fullName.trim(),

    email: email.trim(),

    accountType: "tourist",

    country: country.trim(),

    emailVerified: true,

    createdAt: serverTimestamp(),
  };

  /* ==========================================================
     FIRESTORE

     lankaQuestTourists/{UID}
  ========================================================== */

  await setDoc(profileRef, profileData);

  console.log("Tourist profile created:", user.uid);

  return profileData;
}

/* ============================================================
   CREATE GUIDE PROFILE
============================================================ */

async function createGuideProfile(user, registrationData) {
  const profileRef = doc(db, "lankaQuestGuides", user.uid);

  /* ==========================================================
     PREVENT DUPLICATE PROFILE
  ========================================================== */

  const existingProfile = await getDoc(profileRef);

  if (existingProfile.exists()) {
    console.log("Guide profile already exists:", user.uid);

    return existingProfile.data();
  }

  /* ==========================================================
     REGISTRATION DATA
  ========================================================== */

  const fullName = registrationData.fullName || user.displayName || "";

  const email = user.email || registrationData.email || "";

  const phone = registrationData.phone || "";

  const district = registrationData.district || "";

  const languages = registrationData.languages || "";

  const experience = registrationData.experience || "";

  /* ==========================================================
     VALIDATION
  ========================================================== */

  if (!fullName.trim()) {
    throw new Error(
      "Your registration information could not be found. Please return to the registration page and try again.",
    );
  }

  if (!email.trim()) {
    throw new Error(
      "Your email address could not be found. Please return to the registration page and try again.",
    );
  }

  /* ==========================================================
     GUIDE PROFILE
  ========================================================== */

  const profileData = {
    uid: user.uid,

    fullName: fullName.trim(),

    email: email.trim(),

    accountType: "guide",

    phone: phone.trim(),

    district: district,

    languages: languages.trim(),

    experience: experience,

    verificationStatus: "pending",

    status: "pending",

    emailVerified: true,

    createdAt: serverTimestamp(),
  };

  /* ==========================================================
     FIRESTORE

     lankaQuestGuides/{UID}
  ========================================================== */

  await setDoc(profileRef, profileData);

  console.log("Guide profile created:", user.uid);

  return profileData;
}

/* ============================================================
   CREATE VERIFIED FIRESTORE PROFILE
============================================================ */

async function createVerifiedProfile(user) {
  /* ==========================================================
     GET PENDING REGISTRATION DATA
  ========================================================== */

  const registrationData = getPendingRegistrationData();

  if (!registrationData) {
    throw new Error(
      "Your pending registration information could not be found. Please return to the registration page and try again.",
    );
  }

  /* ==========================================================
     ACCOUNT TYPE
  ========================================================== */

  const accountType = getValidAccountType();

  if (!accountType) {
    throw new Error(
      "Your account type could not be determined. Please return to the registration page and try again.",
    );
  }

  /* ==========================================================
     CHECK EXISTING PROFILE

     This prevents duplicate profiles.
  ========================================================== */

  const existingProfile = await checkExistingProfile(user.uid);

  if (existingProfile.exists) {
    console.log(
      "Existing LankaQuest profile found:",
      existingProfile.accountType,
    );

    clearPendingRegistrationData();

    /* ========================================================
       EXISTING TOURIST
    ======================================================== */

    if (existingProfile.accountType === "tourist") {
      window.location.href = "tourist-dashboard.html";

      return;
    }

    /* ========================================================
       EXISTING GUIDE
    ======================================================== */

    window.location.href = "guide-verification.html";

    return;
  }

  /* ==========================================================
     FINAL EMAIL VERIFICATION CHECK
  ========================================================== */

  if (!user.emailVerified) {
    throw new Error(
      "Email verification is required before creating your LankaQuest profile.",
    );
  }

  /* ==========================================================
     TOURIST
  ========================================================== */

  if (accountType === "tourist") {
    await createTouristProfile(user, registrationData);

    clearPendingRegistrationData();

    showVerificationMessage(
      "Email verified successfully. Your tourist account is ready!",
      "success",
    );

    setTimeout(() => {
      window.location.href = "tourist-dashboard.html";
    }, 1200);

    return;
  }

  /* ==========================================================
     GUIDE
  ========================================================== */

  if (accountType === "guide") {
    await createGuideProfile(user, registrationData);

    clearPendingRegistrationData();

    showVerificationMessage(
      "Email verified successfully. Your guide registration has been submitted for verification.",
      "success",
    );

    setTimeout(() => {
      window.location.href = "guide-verification.html";
    }, 1200);

    return;
  }

  /* ==========================================================
     INVALID ACCOUNT TYPE
  ========================================================== */

  throw new Error("Invalid account type.");
}

/* ============================================================
   CHECK EMAIL VERIFICATION
============================================================ */

async function checkEmailVerification() {
  /* ==========================================================
     PREVENT DUPLICATE PROCESSING
  ========================================================== */

  if (verificationProcessing) {
    return;
  }

  /* ==========================================================
     AUTH USER CHECK
  ========================================================== */

  if (!authenticatedUser) {
    showVerificationMessage(
      "Your Firebase session could not be found. Please return to the login page.",
      "error",
    );

    return;
  }

  verificationProcessing = true;

  try {
    /* ========================================================
       RELOAD FIREBASE USER

       Firebase may still contain the old
       emailVerified value until reload().
    ======================================================== */

    await reload(authenticatedUser);

    authenticatedUser = auth.currentUser;

    if (!authenticatedUser) {
      throw new Error(
        "Your authentication session has expired. Please return to the login page.",
      );
    }

    /* ========================================================
       DISPLAY CURRENT EMAIL
    ======================================================== */

    displayUserEmail(authenticatedUser);

    /* ========================================================
       CHECK EMAIL VERIFICATION
    ======================================================== */

    if (!authenticatedUser.emailVerified) {
      showVerificationMessage(
        "Your email has not been verified yet. Please click the verification link in your email first.",
        "error",
      );

      return;
    }

    /* ========================================================
       EMAIL VERIFIED

       ONLY NOW create the Firestore profile.
    ======================================================== */

    await createVerifiedProfile(authenticatedUser);
  } catch (error) {
    console.error("Email verification error:", error);

    /* ========================================================
       FIRESTORE PERMISSION ERROR
    ======================================================== */

    if (error.code === "permission-denied") {
      showVerificationMessage(
        "Your email was verified, but we could not create your LankaQuest profile because Firestore permissions denied the request.",
        "error",
      );

      return;
    }

    /* ========================================================
       NETWORK ERROR
    ======================================================== */

    if (error.code === "unavailable") {
      showVerificationMessage(
        "The service is temporarily unavailable. Please check your internet connection and try again.",
        "error",
      );

      return;
    }

    /* ========================================================
       DEFAULT ERROR
    ======================================================== */

    showVerificationMessage(
      error.message ||
        "We could not complete email verification. Please try again.",
      "error",
    );
  } finally {
    verificationProcessing = false;
  }
}

/* ============================================================
   RESEND VERIFICATION EMAIL
============================================================ */

async function resendVerificationEmail() {
  if (!authenticatedUser) {
    showVerificationMessage(
      "Your authentication session could not be found. Please return to the registration page.",
      "error",
    );

    return;
  }

  try {
    /* ========================================================
       REFRESH USER
    ======================================================== */

    await reload(authenticatedUser);

    authenticatedUser = auth.currentUser;

    if (!authenticatedUser) {
      throw new Error("Your authentication session has expired.");
    }

    /* ========================================================
       ALREADY VERIFIED
    ======================================================== */

    if (authenticatedUser.emailVerified) {
      showVerificationMessage("Your email is already verified.", "success");

      return;
    }

    /* ========================================================
       SEND VERIFICATION EMAIL
    ======================================================== */

    await sendEmailVerification(authenticatedUser);

    showVerificationMessage(
      "A new verification email has been sent. Please check your inbox and spam folder.",
      "success",
    );
  } catch (error) {
    console.error("Resend verification error:", error);

    /* ========================================================
       TOO MANY REQUESTS
    ======================================================== */

    if (error.code === "auth/too-many-requests") {
      showVerificationMessage(
        "Too many verification emails were requested. Please wait a little while before trying again.",
        "error",
      );

      return;
    }

    /* ========================================================
       NETWORK ERROR
    ======================================================== */

    if (error.code === "auth/network-request-failed") {
      showVerificationMessage(
        "Network error. Please check your internet connection and try again.",
        "error",
      );

      return;
    }

    /* ========================================================
       DEFAULT ERROR
    ======================================================== */

    showVerificationMessage(
      error.message || "Unable to resend the verification email.",
      "error",
    );
  }
}

/* ============================================================
   BACK TO LOGIN
============================================================ */

async function returnToLogin() {
  try {
    /*
       User is intentionally leaving the
       verification process.

       Sign out the Firebase session.
    */

    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
  }

  /* ==========================================================
     REMOVE TEMPORARY REGISTRATION DATA
  ========================================================== */

  clearPendingRegistrationData();

  /* ==========================================================
     RETURN TO LOGIN
  ========================================================== */

  window.location.href = "login.html";
}

/* ============================================================
   BUTTON EVENTS
============================================================ */

/* ============================================================
   CHECK VERIFICATION BUTTON
============================================================ */

if (checkVerificationButton) {
  checkVerificationButton.addEventListener("click", async () => {
    if (verificationProcessing) {
      return;
    }

    checkVerificationButton.disabled = true;

    try {
      await checkEmailVerification();
    } finally {
      /*
           If navigation occurs this does not matter.

           If verification is still pending,
           allow the user to try again.
        */

      checkVerificationButton.disabled = false;
    }
  });
}

/* ============================================================
   RESEND VERIFICATION BUTTON
============================================================ */

if (resendVerificationButton) {
  resendVerificationButton.addEventListener("click", async () => {
    resendVerificationButton.disabled = true;

    try {
      await resendVerificationEmail();
    } finally {
      /*
           Prevent rapid repeated requests.
        */

      setTimeout(() => {
        if (resendVerificationButton) {
          resendVerificationButton.disabled = false;
        }
      }, 3000);
    }
  });
}

/* ============================================================
   BACK TO LOGIN BUTTON
============================================================ */

if (backToLoginButton) {
  backToLoginButton.addEventListener("click", returnToLogin);
}

/* ============================================================
   AUTH STATE
============================================================ */

onAuthStateChanged(auth, (user) => {
  authenticatedUser = user;

  console.log(
    "Verification Auth State:",
    user ? user.uid : "No authenticated user",
  );

  /* ========================================================
       NO AUTHENTICATED USER
    ======================================================== */

  if (!user) {
    showVerificationMessage(
      "Your authentication session could not be found. Returning to login...",
      "error",
    );

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);

    return;
  }

  /* ========================================================
       DISPLAY EMAIL
    ======================================================== */

  displayUserEmail(user);

  /* ========================================================
       CHECK PENDING REGISTRATION DATA
    ======================================================== */

  const pendingData = getPendingRegistrationData();

  if (!pendingData) {
    /*
         If the user is already verified and has no
         pending registration data, they may already
         have completed registration.

         Do not create a new profile blindly.
      */

    if (user.emailVerified) {
      checkExistingProfile(user.uid)
        .then((profile) => {
          if (profile.exists) {
            if (profile.accountType === "tourist") {
              window.location.href = "tourist-dashboard.html";
            } else {
              window.location.href = "guide-verification.html";
            }

            return;
          }

          showVerificationMessage(
            "Your registration information could not be found. Please return to the registration page.",
            "error",
          );
        })
        .catch((error) => {
          console.error("Existing profile check error:", error);

          showVerificationMessage(
            "We could not check your LankaQuest profile. Please try again.",
            "error",
          );
        });
    } else {
      showVerificationMessage(
        "Your pending registration information could not be found. Please return to the registration page.",
        "error",
      );
    }

    return;
  }

  /* ========================================================
       VERIFY ACCOUNT TYPE DATA
    ======================================================== */

  const pendingAccountType = getValidAccountType();

  if (!pendingAccountType) {
    showVerificationMessage(
      "Your account type could not be determined. Please return to the registration page.",
      "error",
    );

    return;
  }

  /* ========================================================
       ALREADY VERIFIED

       Automatically continue.
    ======================================================== */

  if (user.emailVerified) {
    checkEmailVerification();
  }
});

/* ============================================================
   INITIALIZE
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /*
       Button state is controlled by
       authentication and verification logic.
    */

  if (checkVerificationButton) {
    checkVerificationButton.disabled = false;
  }

  if (resendVerificationButton) {
    resendVerificationButton.disabled = false;
  }
});

/* ============================================================
   END VERIFY-EMAIL.JS
============================================================ */
