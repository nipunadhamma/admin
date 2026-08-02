
/* ============================================================
   LANKAQUEST
   REGISTRATION SYSTEM

   FIREBASE FIRST ARCHITECTURE

   ACCOUNT TYPES:

   🧳 Tourist
   🧑‍💼 Guide


   NORMAL REGISTRATION:

   Register Form
        ↓
   Firebase Authentication
        ↓
   Verification Email
        ↓
   User Verifies Email
        ↓
   Reload Firebase User
        ↓
   emailVerified === true
        ↓
   Check Existing Profile
        ↓
   Create Firestore Profile
        ↓
   Dashboard


   GOOGLE REGISTRATION:

   Google Login
        ↓
   Firebase Authentication
        ↓
   register.html?google=1
        ↓
   Existing Firebase User
        ↓
   Tourist / Guide selection
        ↓
   Firestore Profile
        ↓
   Registration Complete


   COLLECTIONS:

   Tourist:
   lankaQuestTourists/{UID}

   Guide:
   lankaQuestGuides/{UID}

============================================================ */


/* ============================================================
   FIREBASE IMPORTS
============================================================ */

import {
  auth,
  db,
} from "./firebase-config.js";


import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  reload,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* ============================================================
   DOM ELEMENTS
============================================================ */

const registrationForm =
  document.getElementById(
    "registrationForm"
  );


const accountTypeInputs =
  document.querySelectorAll(
    'input[name="accountType"]'
  );


const touristFields =
  document.getElementById(
    "touristFields"
  );


const guideFields =
  document.getElementById(
    "guideFields"
  );


const registrationMessage =
  document.getElementById(
    "registrationMessage"
  );


const fullNameInput =
  document.getElementById(
    "fullName"
  );


const emailInput =
  document.getElementById(
    "email"
  );


const passwordInput =
  document.getElementById(
    "password"
  );


const confirmPasswordInput =
  document.getElementById(
    "confirmPassword"
  );


/* ============================================================
   GOOGLE REGISTRATION MODE
============================================================ */

const urlParams =
  new URLSearchParams(
    window.location.search
  );


const isGoogleRegistration =
  urlParams.get("google") === "1";


/*
   Authenticated Firebase user.

   Normal registration:
   Created after email/password registration.

   Google registration:
   Already authenticated before reaching this page.
*/

let authenticatedUser = null;



/* ============================================================
   MESSAGE SYSTEM
============================================================ */

function showRegistrationMessage(
  message,
  type = "success"
) {

  if (!registrationMessage) {
    return;
  }


  registrationMessage.textContent =
    message;


  registrationMessage.style.display =
    "block";


  if (type === "error") {

    registrationMessage.style.background =
      "#fff0f0";

    registrationMessage.style.color =
      "#b42318";

  } else {

    registrationMessage.style.background =
      "#edf8f1";

    registrationMessage.style.color =
      "#176044";

  }

}


/* ============================================================
   ACCOUNT TYPE
============================================================ */

function getSelectedAccountType() {

  const selected =
    document.querySelector(
      'input[name="accountType"]:checked'
    );


  return selected
    ? selected.value
    : "tourist";

}


/* ============================================================
   SWITCH ACCOUNT FIELDS
============================================================ */

function updateAccountTypeFields() {

  const accountType =
    getSelectedAccountType();


  if (accountType === "tourist") {

    if (touristFields) {

      touristFields.classList.remove(
        "hidden"
      );

    }


    if (guideFields) {

      guideFields.classList.add(
        "hidden"
      );

    }

  } else {

    if (touristFields) {

      touristFields.classList.add(
        "hidden"
      );

    }


    if (guideFields) {

      guideFields.classList.remove(
        "hidden"
      );

    }

  }

}


/* ============================================================
   ACCOUNT TYPE LISTENERS
============================================================ */

accountTypeInputs.forEach(
  (input) => {

    input.addEventListener(
      "change",
      updateAccountTypeFields
    );

  }
);


/* ============================================================
   GOOGLE REGISTRATION UI
============================================================ */

function setupGoogleRegistrationUI() {

  if (!isGoogleRegistration) {
    return;
  }


  /*
     Password is not required for Google
     registration.
  */

  if (passwordInput) {

    passwordInput.required =
      false;

    passwordInput.disabled =
      true;

    passwordInput.value =
      "";

  }


  if (confirmPasswordInput) {

    confirmPasswordInput.required =
      false;

    confirmPasswordInput.disabled =
      true;

    confirmPasswordInput.value =
      "";

  }


  /*
     Google email is controlled by Firebase.
  */

  if (
    emailInput &&
    authenticatedUser
  ) {

    emailInput.value =
      authenticatedUser.email || "";

    emailInput.readOnly =
      true;

  }


  /*
     Use Google display name
     as initial full name.
  */

  if (
    fullNameInput &&
    authenticatedUser &&
    authenticatedUser.displayName
  ) {

    if (!fullNameInput.value.trim()) {

      fullNameInput.value =
        authenticatedUser.displayName;

    }

  }


  console.log(
    "Google registration mode enabled."
  );

}


/* ============================================================
   CHECK EXISTING PROFILE
============================================================ */

async function checkExistingProfile(
  uid
) {

  /* ==========================================================
     CHECK TOURIST
  ========================================================== */

  const touristRef =
    doc(
      db,
      "lankaQuestTourists",
      uid
    );


  const touristSnap =
    await getDoc(
      touristRef
    );


  if (touristSnap.exists()) {

    return {

      exists: true,

      accountType:
        "tourist",

      data:
        touristSnap.data(),

    };

  }


  /* ==========================================================
     CHECK GUIDE
  ========================================================== */

  const guideRef =
    doc(
      db,
      "lankaQuestGuides",
      uid
    );


  const guideSnap =
    await getDoc(
      guideRef
    );


  if (guideSnap.exists()) {

    return {

      exists: true,

      accountType:
        "guide",

      data:
        guideSnap.data(),

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

async function createTouristProfile(
  firebaseUser
) {

  const uid =
    firebaseUser.uid;


  const fullName =
    fullNameInput
      ? fullNameInput.value.trim()
      : "";


  const email =
    firebaseUser.email ||
    (
      emailInput
        ? emailInput.value.trim()
        : ""
    );


  const countryElement =
    document.getElementById(
      "country"
    );


  const country =
    countryElement
      ? countryElement.value.trim()
      : "";


  /* ==========================================================
     VALIDATION
  ========================================================== */

  if (!fullName) {

    throw new Error(
      "Please enter your full name."
    );

  }


  if (!email) {

    throw new Error(
      "A valid email address is required."
    );

  }


  /* ==========================================================
     SECURITY CHECK

     Normal email accounts must have
     verified email before profile creation.

     Google accounts are already trusted
     through Google Authentication.
  ========================================================== */

  if (
    !isGoogleRegistration &&
    !firebaseUser.emailVerified
  ) {

    throw new Error(
      "Please verify your email address before creating your LankaQuest profile."
    );

  }


  /* ==========================================================
     TOURIST PROFILE
  ========================================================== */

  const profileData = {

    uid:
      uid,

    fullName:
      fullName,

    email:
      email,

    accountType:
      "tourist",

    country:
      country,

    createdAt:
      serverTimestamp(),

  };


  /* ==========================================================
     FIRESTORE

     lankaQuestTourists/{UID}
  ========================================================== */

  await setDoc(

    doc(
      db,
      "lankaQuestTourists",
      uid
    ),

    profileData

  );


  console.log(
    "Tourist profile created:",
    uid
  );


  return profileData;

}


/* ============================================================
   CREATE GUIDE PROFILE
============================================================ */

async function createGuideProfile(
  firebaseUser
) {

  const uid =
    firebaseUser.uid;


  const fullName =
    fullNameInput
      ? fullNameInput.value.trim()
      : "";


  const email =
    firebaseUser.email ||
    (
      emailInput
        ? emailInput.value.trim()
        : ""
    );


  const phoneElement =
    document.getElementById(
      "phone"
    );


  const districtElement =
    document.getElementById(
      "guideDistrict"
    );


  const languagesElement =
    document.getElementById(
      "languages"
    );


  const experienceElement =
    document.getElementById(
      "experience"
    );


  const phone =
    phoneElement
      ? phoneElement.value.trim()
      : "";


  const district =
    districtElement
      ? districtElement.value
      : "";


  const languages =
    languagesElement
      ? languagesElement.value.trim()
      : "";


  const experience =
    experienceElement
      ? experienceElement.value
      : "";


  /* ==========================================================
     VALIDATION
  ========================================================== */

  if (!fullName) {

    throw new Error(
      "Please enter your full name."
    );

  }


  if (!email) {

    throw new Error(
      "A valid email address is required."
    );

  }


  /* ==========================================================
     EMAIL VERIFICATION CHECK
  ========================================================== */

  if (
    !isGoogleRegistration &&
    !firebaseUser.emailVerified
  ) {

    throw new Error(
      "Please verify your email address before creating your LankaQuest guide profile."
    );

  }


  /* ==========================================================
     GUIDE PROFILE
  ========================================================== */

  const profileData = {

    uid:
      uid,

    fullName:
      fullName,

    email:
      email,

    accountType:
      "guide",

    phone:
      phone,

    district:
      district,

    languages:
      languages,

    experience:
      experience,

    verificationStatus:
      "pending",

    status:
      "pending",

    createdAt:
      serverTimestamp(),

  };


  /* ==========================================================
     FIRESTORE

     lankaQuestGuides/{UID}
  ========================================================== */

  await setDoc(

    doc(
      db,
      "lankaQuestGuides",
      uid
    ),

    profileData

  );


  console.log(
    "Guide profile created:",
    uid
  );


  return profileData;

}


/* ============================================================
   CREATE FIRESTORE PROFILE
============================================================ */

async function createFirestoreProfile(
  firebaseUser,
  accountType
) {

  if (
    accountType ===
    "tourist"
  ) {

    return await createTouristProfile(
      firebaseUser
    );

  }


  if (
    accountType ===
    "guide"
  ) {

    return await createGuideProfile(
      firebaseUser
    );

  }


  throw new Error(
    "Invalid account type."
  );

}


/* ============================================================
   NORMAL EMAIL/PASSWORD REGISTRATION

   STEP 1:

   Email + Password
        ↓
   Firebase Authentication
        ↓
   Send Verification Email

   IMPORTANT:

   Firestore profile is NOT created here.
============================================================ */

async function registerWithEmailPassword() {
  const email = emailInput ? emailInput.value.trim() : "";

  const password = passwordInput ? passwordInput.value : "";

  const confirmPassword = confirmPasswordInput
    ? confirmPasswordInput.value
    : "";

  /* ==========================================================
     VALIDATE EMAIL
  ========================================================== */

  if (!email) {
    throw new Error("Please enter your email address.");
  }

  /* ==========================================================
     VALIDATE PASSWORD
  ========================================================== */

  if (!password) {
    throw new Error("Please enter a password.");
  }

  /* ==========================================================
     CONFIRM PASSWORD
  ========================================================== */

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  /* ==========================================================
     CREATE FIREBASE AUTH ACCOUNT
  ========================================================== */

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  const firebaseUser = userCredential.user;

  if (!firebaseUser) {
    throw new Error("Firebase authentication failed.");
  }

  /* ============================================================
   SEND EMAIL VERIFICATION 
   ============================================================ */ 
  await sendEmailVerification(
    firebaseUser,
  );
  console.log(
    "Verification email sent:", 
    firebaseUser.email
  );

  /* ==========================================================
     SAVE PENDING PROFILE DATA
  ========================================================== */

  savePendingRegistrationData();

  /* ==========================================================
     KEEP FIREBASE AUTH SESSION ACTIVE
  ========================================================== */

  authenticatedUser = firebaseUser;

  console.log("Verification email sent:", firebaseUser.email);

  /* ==========================================================
     REDIRECT TO VERIFICATION PAGE
  ========================================================== */

  window.location.href = "verify-email.html";

  return firebaseUser;
}


/* ============================================================
   SAVE PENDING REGISTRATION DATA
============================================================ */

function savePendingRegistrationData() {

  const accountType =
    getSelectedAccountType();


  const fullName =
    fullNameInput
      ? fullNameInput.value.trim()
      : "";


  const email =
    emailInput
      ? emailInput.value.trim()
      : "";


  /*
     IMPORTANT:

     DO NOT store password or confirmPassword
     in sessionStorage.
  */


  const pendingData = {

    accountType:
      accountType,

    fullName:
      fullName,

    email:
      email,

    country:
      document.getElementById("country")
        ? document.getElementById("country").value.trim()
        : "",

    phone:
      document.getElementById("phone")
        ? document.getElementById("phone").value.trim()
        : "",

    district:
      document.getElementById("guideDistrict")
        ? document.getElementById("guideDistrict").value
        : "",

    languages:
      document.getElementById("languages")
        ? document.getElementById("languages").value.trim()
        : "",

    experience:
      document.getElementById("experience")
        ? document.getElementById("experience").value
        : "",

    createdAt:
      Date.now(),

  };


  sessionStorage.setItem(
    "lankaQuestPendingRegistration",
    JSON.stringify(pendingData)
  );


  console.log(
    "Pending registration data saved to sessionStorage."
  );


  return pendingData;

}








/* ============================================================
   GOOGLE REGISTRATION
============================================================ */

async function registerWithGoogle() {

  /*
     Google user must already be authenticated.

     auth.js should have sent the user to:

     register.html?google=1
  */

  const currentUser =
    auth.currentUser;


  if (!currentUser) {

    throw new Error(
      "Your Google session could not be found. Please return to the login page and sign in with Google again."
    );

  }


  console.log(
    "Authenticated Google user:",
    currentUser.uid
  );


  console.log(
    "Google email:",
    currentUser.email
  );


  /*
     Google Authentication normally provides
     a verified email.

     Still check the Firebase user state.
  */

  await reload(
    currentUser
  );


  const refreshedUser =
    auth.currentUser;


  if (!refreshedUser) {

    throw new Error(
      "Unable to load your Google account."
    );

  }


  if (
    !refreshedUser.emailVerified
  ) {

    throw new Error(
      "Your Google email could not be verified by Firebase."
    );

  }


  authenticatedUser =
    refreshedUser;


  return refreshedUser;

}


/* ============================================================
   COMPLETE REGISTRATION
============================================================ */

async function completeRegistration(
  firebaseUser
) {

  /* ==========================================================
     ACCOUNT TYPE
  ========================================================== */

  const accountType =
    getSelectedAccountType();


  if (
    accountType !== "tourist" &&
    accountType !== "guide"
  ) {

    throw new Error(
      "Please select an account type."
    );

  }


  /* ==========================================================
     CHECK PROFILE
  ========================================================== */

  const existingProfile =
    await checkExistingProfile(
      firebaseUser.uid
    );


  if (existingProfile.exists) {

    console.log(
      "Existing LankaQuest profile found:",
      existingProfile.accountType
    );


    showRegistrationMessage(
      "A LankaQuest profile already exists for this account.",
      "error"
    );


    setTimeout(
      () => {

        window.location.href =
          "login.html";

      },
      1500
    );


    return;

  }


  /* ==========================================================
     GOOGLE / VERIFIED USER
  ========================================================== */

  if (
    !isGoogleRegistration &&
    !firebaseUser.emailVerified
  ) {

    throw new Error(
      "Email verification is required before creating your LankaQuest profile."
    );

  }


  /* ==========================================================
     CREATE FIRESTORE PROFILE
  ========================================================== */

  await createFirestoreProfile(
    firebaseUser,
    accountType
  );


  /* ==========================================================
     SUCCESS
  ========================================================== */

  if (
    accountType ===
    "tourist"
  ) {

    showRegistrationMessage(
      "Tourist account created successfully.",
      "success"
    );

  } else {

    showRegistrationMessage(
      "Guide registration submitted successfully. Your profile is pending verification.",
      "success"
    );

  }


  /* ==========================================================
     REDIRECT
  ========================================================== */

  setTimeout(
    () => {

      if (
        accountType ===
        "tourist"
      ) {

        window.location.href =
          "tourist-dashboard.html";

      } else {

        window.location.href =
          "guide-verification.html";

      }

    },
    1500
  );

}


/* ============================================================
   MAIN REGISTRATION
============================================================ */

async function registerUser() {

  try {

    /* ========================================================
       ACCOUNT TYPE
    ======================================================== */

    const accountType =
      getSelectedAccountType();


    if (
      accountType !== "tourist" &&
      accountType !== "guide"
    ) {

      throw new Error(
        "Please select an account type."
      );

    }


    /* ========================================================
       GOOGLE REGISTRATION
    ======================================================== */

    if (
      isGoogleRegistration
    ) {

      const firebaseUser =
        await registerWithGoogle();


      await completeRegistration(
        firebaseUser
      );


      return;

    }


    /* ========================================================
       NORMAL EMAIL REGISTRATION
    ======================================================== */

    const firebaseUser =
      await registerWithEmailPassword();


    /*
       At this point:

       Firebase Auth account exists.

       Email verification email has been sent.

       DO NOT create Firestore profile yet.
    */


    


  } catch (error) {

    console.error(
      "Registration Error:",
      error
    );


    let message =
      "Registration failed.";


    /* ========================================================
       FIREBASE AUTH ERRORS
    ======================================================== */

    switch (
      error.code
    ) {

      case "auth/email-already-in-use":

        message =
          "This email address is already registered. Please login instead.";

        break;


      case "auth/invalid-email":

        message =
          "Invalid email address.";

        break;


      case "auth/weak-password":

        message =
          "Password is too weak. Please choose a stronger password.";

        break;


      case "auth/network-request-failed":

        message =
          "Network error. Please check your internet connection.";

        break;


      case "auth/too-many-requests":

        message =
          "Too many requests. Please wait a moment and try again.";

        break;


      case "auth/operation-not-allowed":

        message =
          "Email/password registration is not enabled in Firebase Authentication.";

        break;


      case "permission-denied":

        message =
          "You do not have permission to create this profile.";

        break;


      default:

        message =
          error.message ||
          "Registration failed.";

        break;

    }


    showRegistrationMessage(
      message,
      "error"
    );

  }

}


/* ============================================================
   FORM SUBMIT
============================================================ */

if (registrationForm) {

  registrationForm.addEventListener(

    "submit",

    async (event) => {

      event.preventDefault();


      /* ======================================================
         PREVENT DUPLICATE SUBMISSIONS
      ====================================================== */

      const submitButton =
        registrationForm.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {

        submitButton.disabled =
          true;

      }


      try {

        await registerUser();

      } finally {

        /*
           If verification is pending,
           the verification button remains available.

           The main submit button can be unlocked.
        */

        if (submitButton) {

          submitButton.disabled =
            false;

        }

      }

    }

  );

}


/* ============================================================
   AUTH STATE
============================================================ */

onAuthStateChanged(
  auth,
  (user) => {

    authenticatedUser =
      user;


    console.log(
      "Registration Auth State:",
      user
        ? user.uid
        : "No authenticated user"
    );


    /* ========================================================
       GOOGLE REGISTRATION WITHOUT SESSION
    ======================================================== */

    if (
      isGoogleRegistration &&
      !user
    ) {

      showRegistrationMessage(
        "Google authentication session was not found. Returning to login...",
        "error"
      );


      setTimeout(
        () => {

          window.location.href =
            "login.html";

        },
        1500
      );


      return;

    }


    /* ========================================================
       GOOGLE REGISTRATION
    ======================================================== */

    if (
      isGoogleRegistration &&
      user
    ) {

      setupGoogleRegistrationUI();

    }

  }
);


/* ============================================================
   INITIALIZE
============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    updateAccountTypeFields();

  }
);


/* ============================================================
   END REGISTER.JS
============================================================ */

