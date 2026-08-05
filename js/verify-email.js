/* ============================================================
    LANKAWAYFARER
    EMAIL VERIFICATION SYSTEM

    File:
    js/verify-email.js

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
    User clicks Firebase verification link
        ↓
    applyActionCode()
        ↓
    Email becomes verified
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


    FIRESTORE COLLECTIONS:

    Tourist:
    lankaQuestTourists/{UID}

    Guide:
    lankaQuestGuides/{UID}


    IMPORTANT:

    Normal email/password registration does NOT create
    a Firestore profile until email verification is complete.


    Pending registration data:

    sessionStorage:
    lankaQuestPendingRegistration


    GUIDE PHOTO:

    Cloudinary URL is preserved as:

    profilePhotoUrl

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
  applyActionCode,
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
============================================================ */

let verificationProcessing = false;

/* ============================================================
   EMAIL LINK PROCESS STATE
============================================================ */

let emailLinkProcessing = false;

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
   CLEAR PENDING REGISTRATION DATA
============================================================ */

function clearPendingRegistrationData() {
  sessionStorage.removeItem(PENDING_REGISTRATION_KEY);

  console.log("Pending registration data removed.");
}

/* ============================================================
   GET VALID ACCOUNT TYPE
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
   NORMALIZE GUIDE LANGUAGES
============================================================ */

function normalizeLanguages(languages) {
  if (Array.isArray(languages)) {
    return languages.map((language) => String(language).trim()).filter(Boolean);
  }

  if (typeof languages !== "string") {
    return [];
  }

  return languages
    .split(",")
    .map((language) => language.trim())
    .filter(Boolean);
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
   HANDLE FIREBASE EMAIL ACTION LINK
============================================================ */

async function handleEmailVerificationLink() {
  /*
       Read Firebase action parameters
       from the current URL.
    */

  const url = new URL(window.location.href);

  const mode = url.searchParams.get("mode");

  const oobCode = url.searchParams.get("oobCode");

  /*
       Only process Firebase verification links.
    */

  if (mode !== "verifyEmail" || !oobCode) {
    return false;
  }

  /*
       Prevent duplicate processing.
    */

  if (emailLinkProcessing) {
    return true;
  }

  emailLinkProcessing = true;

  console.log("Firebase email verification link detected.");

  try {
    /*
           Apply Firebase verification code.
        */

    await applyActionCode(auth, oobCode);

    console.log("Firebase email verification completed successfully.");

    showVerificationMessage(
      'Your email has been verified successfully. Please click "I Have Verified My Email" to continue.',
      "success",
    );

    /*
           Remove verification parameters
           from browser address bar.

           This keeps the page clean and prevents
           accidentally reusing the same action code.
        */

    window.history.replaceState({}, document.title, window.location.pathname);

    /*
           Refresh authenticated Firebase user
           so emailVerified becomes true.
        */

    if (auth.currentUser) {
      await reload(auth.currentUser);

      authenticatedUser = auth.currentUser;

      displayUserEmail(authenticatedUser);
    }

    /*
           The actual Firestore profile creation
           remains controlled by the existing
           "I Have Verified My Email" button.
        */

    return true;
  } catch (error) {
    console.error("Firebase email verification link error:", error);

    /*
           The code may already have been used.
        */

    if (error.code === "auth/invalid-action-code") {
      showVerificationMessage(
        "This verification link is invalid, expired, or has already been used. Please request a new verification email.",
        "error",
      );

      return true;
    }

    /*
           Expired action code.
        */

    if (error.code === "auth/expired-action-code") {
      showVerificationMessage(
        "This verification link has expired. Please request a new verification email.",
        "error",
      );

      return true;
    }

    /*
           Default action-link error.
        */

    showVerificationMessage(
      error.message ||
        "We could not verify your email using this link. Please request a new verification email.",
      "error",
    );

    return true;
  }
}

/* ============================================================
   CHECK EXISTING FIRESTORE PROFILE
============================================================ */

async function checkExistingProfile(uid) {
  const touristRef = doc(db, "lankaQuestTourists", uid);

  const touristSnapshot = await getDoc(touristRef);

  if (touristSnapshot.exists()) {
    return {
      exists: true,

      accountType: "tourist",

      data: touristSnapshot.data(),
    };
  }

  const guideRef = doc(db, "lankaQuestGuides", uid);

  const guideSnapshot = await getDoc(guideRef);

  if (guideSnapshot.exists()) {
    return {
      exists: true,

      accountType: "guide",

      data: guideSnapshot.data(),
    };
  }

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

  const existingProfile = await getDoc(profileRef);

  if (existingProfile.exists()) {
    console.log("Tourist profile already exists:", user.uid);

    return existingProfile.data();
  }

  const fullName = registrationData.fullName || user.displayName || "";

  const country = registrationData.country || "";

  const email = user.email || registrationData.email || "";

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

  const profileData = {
    uid: user.uid,

    fullName: fullName.trim(),

    email: email.trim(),

    accountType: "tourist",

    country: country.trim(),

    emailVerified: true,

    createdAt: serverTimestamp(),
  };

  await setDoc(profileRef, profileData);

  console.log("Tourist profile created:", user.uid);

  return profileData;
}

/* ============================================================
   CREATE GUIDE PROFILE
============================================================ */

async function createGuideProfile(user, registrationData) {
  const profileRef = doc(db, "lankaQuestGuides", user.uid);

  const existingProfile = await getDoc(profileRef);

  if (existingProfile.exists()) {
    console.log("Guide profile already exists:", user.uid);

    return existingProfile.data();
  }

  const fullName = registrationData.fullName || user.displayName || "";

  const email = user.email || registrationData.email || "";

  const phone = registrationData.phone || "";

  const district = registrationData.district || "";

  const experience = registrationData.experience || "";

  const languages = normalizeLanguages(registrationData.languages);

  const profilePhotoUrl = registrationData.profilePhotoUrl || "";

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

  const profileData = {
    uid: user.uid,

    fullName: fullName.trim(),

    email: email.trim(),

    accountType: "guide",

    phone: phone.trim(),

    district: district.trim(),

    languages: languages,

    experience: experience.trim(),

    profilePhotoUrl: profilePhotoUrl.trim(),

    verificationStatus: "pending",

    status: "pending",

    emailVerified: true,

    createdAt: serverTimestamp(),
  };

  console.log("Guide profile data before Firestore:", profileData);

  console.log("Firestore collection:", "lankaQuestGuides");

  console.log("Firestore document ID:", user.uid);

  console.log("Guide profile photo URL:", profileData.profilePhotoUrl);

  await setDoc(profileRef, profileData);

  console.log("Guide profile created:", user.uid);

  return profileData;
}

/* ============================================================
   CREATE VERIFIED FIRESTORE PROFILE
============================================================ */

async function createVerifiedProfile(user) {
  const registrationData = getPendingRegistrationData();

  if (!registrationData) {
    throw new Error(
      "Your pending registration information could not be found. Please return to the registration page and try again.",
    );
  }

  const accountType = getValidAccountType();

  if (!accountType) {
    throw new Error(
      "Your account type could not be determined. Please return to the registration page and try again.",
    );
  }

  if (!user.uid) {
    throw new Error("Your Firebase authentication session is invalid.");
  }

  const existingProfile = await checkExistingProfile(user.uid);

  if (existingProfile.exists) {
    console.log(
      "Existing LankaWayfarer profile found:",
      existingProfile.accountType,
    );

    clearPendingRegistrationData();

    if (existingProfile.accountType === "tourist") {
      window.location.href = "tourist-dashboard.html";

      return;
    }

    if (existingProfile.accountType === "guide") {
      window.location.href = "guide-verification.html";

      return;
    }
  }

  if (!user.emailVerified) {
    throw new Error(
      "Email verification is required before creating your LankaWayfarer profile.",
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

  throw new Error("Invalid account type.");
}

/* ============================================================
   CHECK EMAIL VERIFICATION
============================================================ */

async function checkEmailVerification() {
  if (verificationProcessing) {
    return;
  }

  if (!authenticatedUser) {
    showVerificationMessage(
      "Your Firebase session could not be found. Please return to the login page.",
      "error",
    );

    return;
  }

  verificationProcessing = true;

  try {
    await reload(authenticatedUser);

    authenticatedUser = auth.currentUser;

    if (!authenticatedUser) {
      throw new Error(
        "Your authentication session has expired. Please return to the login page.",
      );
    }

    displayUserEmail(authenticatedUser);

    if (!authenticatedUser.emailVerified) {
      showVerificationMessage(
        "Your email has not been verified yet. Please click the verification link in your email first.",
        "error",
      );

      return;
    }

    console.log("Email verification confirmed.");

    await createVerifiedProfile(authenticatedUser);
  } catch (error) {
    console.error("Email verification error:", error);

    if (error.code === "permission-denied") {
      showVerificationMessage(
        "Your email was verified, but we could not create your LankaWayfarer profile because Firestore permissions denied the request.",
        "error",
      );

      return;
    }

    if (error.code === "already-exists") {
      showVerificationMessage(
        "Your LankaWayfarer profile already exists.",
        "error",
      );

      return;
    }

    if (error.code === "unavailable") {
      showVerificationMessage(
        "The service is temporarily unavailable. Please check your internet connection and try again.",
        "error",
      );

      return;
    }

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
    await reload(authenticatedUser);

    authenticatedUser = auth.currentUser;

    if (!authenticatedUser) {
      throw new Error("Your authentication session has expired.");
    }

    if (authenticatedUser.emailVerified) {
      showVerificationMessage("Your email is already verified.", "success");

      return;
    }

    await sendEmailVerification(authenticatedUser);

    showVerificationMessage(
      "A new verification email has been sent. Please check your inbox and spam folder.",
      "success",
    );
  } catch (error) {
    console.error("Resend verification error:", error);

    if (error.code === "auth/too-many-requests") {
      showVerificationMessage(
        "Too many verification emails were requested. Please wait a little while before trying again.",
        "error",
      );

      return;
    }

    if (error.code === "auth/network-request-failed") {
      showVerificationMessage(
        "Network error. Please check your internet connection and try again.",
        "error",
      );

      return;
    }

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
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
  }

  clearPendingRegistrationData();

  window.location.href = "login.html";
}

/* ============================================================
   BUTTON EVENTS
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
      checkVerificationButton.disabled = false;
    }
  });
}

if (resendVerificationButton) {
  resendVerificationButton.addEventListener("click", async () => {
    resendVerificationButton.disabled = true;

    try {
      await resendVerificationEmail();
    } finally {
      setTimeout(() => {
        if (resendVerificationButton) {
          resendVerificationButton.disabled = false;
        }
      }, 3000);
    }
  });
}

if (backToLoginButton) {
  backToLoginButton.addEventListener("click", returnToLogin);
}

/* ============================================================
   AUTH STATE
============================================================ */

onAuthStateChanged(auth, async (user) => {
  authenticatedUser = user;

  console.log(
    "Verification Auth State:",
    user ? user.uid : "No authenticated user",
  );

  if (!user) {
    /*
               IMPORTANT:

               A Firebase email action link can open
               the page before an authenticated session
               is restored.

               Therefore do not immediately redirect
               before the Firebase action-link handler
               gets a chance to process the URL.
            */

    const url = new URL(window.location.href);

    const mode = url.searchParams.get("mode");

    const oobCode = url.searchParams.get("oobCode");

    if (mode === "verifyEmail" && oobCode) {
      console.log(
        "Verification link opened without an active Firebase session.",
      );

      showVerificationMessage(
        "Your email verification link has been received. Please return to the registration page and continue the verification process.",
        "success",
      );

      return;
    }

    showVerificationMessage(
      "Your authentication session could not be found. Returning to login...",
      "error",
    );

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);

    return;
  }

  displayUserEmail(user);

  /*
           Process Firebase email action link
           if one exists.
        */

  const handledEmailLink = await handleEmailVerificationLink();

  /*
           If the current page was opened through
           a verification link, stop here.

           The user can now click:
           "I Have Verified My Email"
        */

  if (handledEmailLink) {
    return;
  }

  const pendingData = getPendingRegistrationData();

  if (!pendingData) {
    if (user.emailVerified) {
      try {
        const profile = await checkExistingProfile(user.uid);

        if (profile.exists) {
          if (profile.accountType === "tourist") {
            window.location.href = "tourist-dashboard.html";

            return;
          }

          if (profile.accountType === "guide") {
            window.location.href = "guide-verification.html";

            return;
          }
        }

        showVerificationMessage(
          "Your registration information could not be found. Please return to the registration page.",
          "error",
        );
      } catch (error) {
        console.error("Existing profile check error:", error);

        if (error.code === "permission-denied") {
          showVerificationMessage(
            "We could not check your LankaWayfarer profile because Firestore permissions denied the request.",
            "error",
          );
        } else {
          showVerificationMessage(
            "We could not check your LankaWayfarer profile. Please try again.",
            "error",
          );
        }
      }
    } else {
      showVerificationMessage(
        "Your pending registration information could not be found. Please return to the registration page.",
        "error",
      );
    }

    return;
  }

  const pendingAccountType = getValidAccountType();

  if (!pendingAccountType) {
    showVerificationMessage(
      "Your account type could not be determined. Please return to the registration page.",
      "error",
    );

    return;
  }

  if (user.emailVerified) {
    await checkEmailVerification();
  }
});

/* ============================================================
   INITIALIZE
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
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
