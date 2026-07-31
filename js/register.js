
/* ============================================================
   LANKAQUEST
   REGISTRATION SYSTEM

   Firebase First Architecture

   ACCOUNT TYPES:

   🧳 Tourist
   🧑‍💼 Guide


   NORMAL REGISTRATION:

   Register Form
        |
        ↓
   Firebase Authentication
        |
        ↓
   Firebase UID
        |
        ↓
   Firestore Profile


   GOOGLE REGISTRATION:

   Google Authentication
        |
        ↓
   Existing Firebase UID
        |
        ↓
   Registration Form
        |
        ↓
   Firestore Profile


   FIRESTORE:

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
  db
} from "./firebase-config.js";


import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


import {
  doc,
  setDoc,
  serverTimestamp
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


/* ============================================================
   GOOGLE REGISTRATION MODE

   Normal:

   register.html

   Google:

   register.html?google=1
============================================================ */

const urlParams =
  new URLSearchParams(
    window.location.search
  );


const isGoogleRegistration =
  urlParams.get("google") === "1";


/* ============================================================
   GET SELECTED ACCOUNT TYPE
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

  const type =
    getSelectedAccountType();


  if (
    type === "tourist"
  ) {

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

  }

  else {

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
   MESSAGE SYSTEM
============================================================ */

function showRegistrationMessage(
  message,
  type = "success"
) {

  if (
    !registrationMessage
  ) {

    return;

  }


  registrationMessage.textContent =
    message;


  registrationMessage.style.display =
    "block";


  if (
    type === "error"
  ) {

    registrationMessage.style.background =
      "#fff0f0";


    registrationMessage.style.color =
      "#b42318";

  }

  else {

    registrationMessage.style.background =
      "#edf8f1";


    registrationMessage.style.color =
      "#176044";

  }

}


/* ============================================================
   GET INPUT VALUE SAFELY
============================================================ */

function getInputValue(
  id
) {

  const element =
    document.getElementById(
      id
    );


  if (!element) {

    return "";

  }


  return element.value.trim();

}


/* ============================================================
   SET INPUT VALUE SAFELY
============================================================ */

function setInputValue(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (!element) {

    return;

  }


  element.value =
    value || "";

}


/* ============================================================
   PREPARE GOOGLE REGISTRATION FORM
============================================================ */

function prepareGoogleRegistration() {

  if (
    !isGoogleRegistration
  ) {

    return;

  }


  /*
    Google registration requires
    an already authenticated Firebase user.
  */

  const firebaseUser =
    auth.currentUser;


  if (!firebaseUser) {

    showRegistrationMessage(
      "Your Google session could not be found. Please sign in with Google again.",
      "error"
    );


    return;

  }


  /* ==========================================================
     PRE-FILL GOOGLE DATA
  ========================================================== */

  const googleName =
    firebaseUser.displayName ||
    "";


  const googleEmail =
    firebaseUser.email ||
    "";


  setInputValue(
    "fullName",
    googleName
  );


  setInputValue(
    "email",
    googleEmail
  );


  /*
    Google already authenticated the user.

    Therefore password fields are not required
    for Google registration.
  */

  const password =
    document.getElementById(
      "password"
    );


  const confirmPassword =
    document.getElementById(
      "confirmPassword"
    );


  if (password) {

    password.required =
      false;

    password.disabled =
      true;

  }


  if (confirmPassword) {

    confirmPassword.required =
      false;

    confirmPassword.disabled =
      true;

  }


  /*
    Google email is controlled by Firebase Auth.

    User should not change it.
  */

  const emailInput =
    document.getElementById(
      "email"
    );


  if (emailInput) {

    emailInput.readOnly =
      true;

  }


  showRegistrationMessage(
    "Google account connected. Complete your profile information below.",
    "success"
  );

}


/* ============================================================
   VALIDATE GOOGLE SESSION
============================================================ */

function validateGoogleSession() {

  if (
    !isGoogleRegistration
  ) {

    return true;

  }


  const firebaseUser =
    auth.currentUser;


  if (!firebaseUser) {

    showRegistrationMessage(
      "Google authentication session expired. Please return to login and try again.",
      "error"
    );


    return false;

  }


  if (
    !firebaseUser.email
  ) {

    showRegistrationMessage(
      "Your Google account does not provide an email address.",
      "error"
    );


    return false;

  }


  return true;

}


/* ============================================================
   REGISTER GOOGLE USER PROFILE
============================================================ */

async function registerGoogleProfile() {

  /*
    Google user must already be authenticated.
  */

  const firebaseUser =
    auth.currentUser;


  if (!firebaseUser) {

    throw new Error(
      "Google authentication session not found."
    );

  }


  const uid =
    firebaseUser.uid;


  const accountType =
    getSelectedAccountType();


  const fullName =
    getInputValue(
      "fullName"
    );


  const email =
    firebaseUser.email ||
    "";


  if (!fullName) {

    throw new Error(
      "Please enter your full name."
    );

  }


  /* ==========================================================
     COMMON PROFILE DATA
  ========================================================== */

  const profileData = {

    uid:
      uid,

    fullName:
      fullName,

    email:
      email,

    accountType:
      accountType,

    authProvider:
      "google",

    createdAt:
      serverTimestamp()

  };


  /* ==========================================================
     TOURIST
  ========================================================== */

  if (
    accountType ===
    "tourist"
  ) {

    const country =
      getInputValue(
        "country"
      );


    if (!country) {

      throw new Error(
        "Please select your country."
      );

    }


    profileData.country =
      country;


    await setDoc(

      doc(
        db,
        "lankaQuestTourists",
        uid
      ),

      profileData

    );


    showRegistrationMessage(
      "Tourist profile created successfully.",
      "success"
    );


    setTimeout(
      () => {

        window.location.href =
          "tourist-dashboard.html";

      },
      1200
    );


    return;

  }


  /* ==========================================================
     GUIDE
  ========================================================== */

  profileData.phone =
    getInputValue(
      "phone"
    );


  profileData.district =
    getInputValue(
      "guideDistrict"
    );


  profileData.languages =
    getInputValue(
      "languages"
    );


  profileData.experience =
    getInputValue(
      "experience"
    );


  /*
    Guide verification always starts
    in pending state.
  */

  profileData.verificationStatus =
    "pending";


  profileData.status =
    "pending";


  /*
    Additional fields used by the
    guide/admin workflow.
  */

  profileData.profileStatus =
    "inactive";


  profileData.isActive =
    false;


  await setDoc(

    doc(
      db,
      "lankaQuestGuides",
      uid
    ),

    profileData

  );


  showRegistrationMessage(
    "Guide registration submitted successfully. Your profile is now pending verification.",
    "success"
  );


  setTimeout(
    () => {

      window.location.href =
        "guide-verification.html";

    },
    1500
  );

}


/* ============================================================
   REGISTER EMAIL/PASSWORD USER
============================================================ */

async function registerEmailPasswordUser() {

  const accountType =
    getSelectedAccountType();


  const fullName =
    getInputValue(
      "fullName"
    );


  const email =
    getInputValue(
      "email"
    );


  const passwordElement =
    document.getElementById(
      "password"
    );


  const confirmPasswordElement =
    document.getElementById(
      "confirmPassword"
    );


  const password =
    passwordElement
      ? passwordElement.value
      : "";


  const confirmPassword =
    confirmPasswordElement
      ? confirmPasswordElement.value
      : "";


  if (!fullName) {

    throw new Error(
      "Please enter your full name."
    );

  }


  if (!email) {

    throw new Error(
      "Please enter your email address."
    );

  }


  if (!password) {

    throw new Error(
      "Please enter a password."
    );

  }


  if (
    password !==
    confirmPassword
  ) {

    throw new Error(
      "Passwords do not match."
    );

  }


  /* ==========================================================
     FIREBASE AUTHENTICATION
  ========================================================== */

  const userCredential =
    await createUserWithEmailAndPassword(

      auth,

      email,

      password

    );


  const firebaseUser =
    userCredential.user;


  const uid =
    firebaseUser.uid;


  /* ==========================================================
     COMMON PROFILE DATA
  ========================================================== */

  const profileData = {

    uid:
      uid,

    fullName:
      fullName,

    email:
      email,

    accountType:
      accountType,

    authProvider:
      "password",

    createdAt:
      serverTimestamp()

  };


  /* ==========================================================
     TOURIST PROFILE
  ========================================================== */

  if (
    accountType ===
    "tourist"
  ) {

    profileData.country =
      getInputValue(
        "country"
      );


    await setDoc(

      doc(
        db,
        "lankaQuestTourists",
        uid
      ),

      profileData

    );


    showRegistrationMessage(
      "Tourist account created successfully. Please login.",
      "success"
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
     GUIDE PROFILE
  ========================================================== */

  profileData.phone =
    getInputValue(
      "phone"
    );


  profileData.district =
    getInputValue(
      "guideDistrict"
    );


  profileData.languages =
    getInputValue(
      "languages"
    );


  profileData.experience =
    getInputValue(
      "experience"
    );


  profileData.verificationStatus =
    "pending";


  profileData.status =
    "pending";


  profileData.profileStatus =
    "inactive";


  profileData.isActive =
    false;


  await setDoc(

    doc(
      db,
      "lankaQuestGuides",
      uid
    ),

    profileData

  );


  showRegistrationMessage(
    "Guide registration submitted successfully. Please login after verification.",
    "success"
  );


  setTimeout(
    () => {

      window.location.href =
        "login.html";

    },
    1500
  );

}


/* ============================================================
   MAIN REGISTRATION FUNCTION
============================================================ */

async function registerUser() {

  try {

    /*
      Google registration
    */

    if (
      isGoogleRegistration
    ) {

      if (
        !validateGoogleSession()
      ) {

        return;

      }


      await registerGoogleProfile();


      return;

    }


    /*
      Normal email/password registration
    */

    await registerEmailPasswordUser();

  }

  catch (error) {

    console.error(
      "Registration Error:",
      error
    );


    let message =
      "Registration failed.";


    switch (
      error.code
    ) {

      case "auth/email-already-in-use":

        message =
          "Email already registered.";

        break;


      case "auth/invalid-email":

        message =
          "Invalid email address.";

        break;


      case "auth/weak-password":

        message =
          "Password is too weak.";

        break;


      case "auth/network-request-failed":

        message =
          "Network error. Please check your internet connection.";

        break;


      case "permission-denied":

        message =
          "You do not have permission to create this profile.";

        break;


      default:

        message =
          error.message ||
          "Registration failed.";

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

if (
  registrationForm
) {

  registrationForm.addEventListener(

    "submit",

    async (event) => {

      event.preventDefault();


      await registerUser();

    }

  );

}


/* ============================================================
   INITIALIZE
============================================================ */

document.addEventListener(

  "DOMContentLoaded",

  () => {

    updateAccountTypeFields();


    /*
      IMPORTANT:

      Firebase Auth currentUser may not be available
      immediately when the page loads.

      Therefore Google registration initialization
      is handled through onAuthStateChanged below.
    */

  }

);


/* ============================================================
   FIREBASE AUTH STATE

   Required for Google registration.

   When:

   register.html?google=1

   is opened, wait for Firebase to restore
   the authenticated Google user.
============================================================ */

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


if (
  isGoogleRegistration
) {

  onAuthStateChanged(

    auth,

    (firebaseUser) => {

      if (!firebaseUser) {

        showRegistrationMessage(
          "Google authentication session not found. Please return to login and sign in with Google again.",
          "error"
        );


        return;

      }


      prepareGoogleRegistration();

    }

  );

}


/* ============================================================
   EXPORT
============================================================ */

export {
  registerUser
};
