
/* ============================================================
   LANKAQUEST
   REGISTRATION SYSTEM

   Firebase First Architecture

   ACCOUNT TYPES:

   🧳 Tourist
   🧑‍💼 Guide


   NORMAL REGISTRATION:

   Register Form
        ↓
   Firebase Authentication
        ↓
   Firebase UID
        ↓
   Firestore Profile


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
   This variable stores the authenticated
   Firebase user.

   For normal registration this will normally
   be null before account creation.

   For Google registration this must already
   contain the authenticated Google user.
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
     Password is NOT required for Google
     registration.

     Firebase Authentication already has
     the authenticated Google account.
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
     Make the email field read-only because
     the email comes from Google Authentication.
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
     Google display name can be used as the
     initial full name.
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
      accountType: "tourist",
      data: touristSnap.data(),
    };

  }


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
      accountType: "guide",
      data: guideSnap.data(),
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
     TOURIST PROFILE DATA
  ========================================================== */

  const profileData = {

    uid: uid,

    fullName: fullName,

    email: email,

    accountType: "tourist",

    country: country,

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
     GUIDE PROFILE DATA

     These fields are important because the
     Firestore rules require them during create.
  ========================================================== */

  const profileData = {

    uid: uid,

    fullName: fullName,

    email: email,

    accountType: "guide",

    phone: phone,

    district: district,

    languages: languages,

    experience: experience,

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
   NORMAL EMAIL/PASSWORD REGISTRATION
============================================================ */

async function registerWithEmailPassword() {

  const email =
    emailInput
      ? emailInput.value.trim()
      : "";


  const password =
    passwordInput
      ? passwordInput.value
      : "";


  const confirmPassword =
    confirmPasswordInput
      ? confirmPasswordInput.value
      : "";


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


  return userCredential.user;

}


/* ============================================================
   GOOGLE REGISTRATION
============================================================ */

async function registerWithGoogle() {

  /*
     Google user MUST already be authenticated.

     This happens because auth.js sends the user
     here after successful Google authentication.
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


  return currentUser;

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
       GET FIREBASE USER
    ======================================================== */

    let firebaseUser;


    if (isGoogleRegistration) {

      /*
         Google account already authenticated.
      */

      firebaseUser =
        await registerWithGoogle();

    } else {

      /*
         Normal email/password registration.
      */

      firebaseUser =
        await registerWithEmailPassword();

    }


    if (!firebaseUser) {

      throw new Error(
        "Firebase authentication failed."
      );

    }


    /* ========================================================
       CHECK WHETHER PROFILE ALREADY EXISTS
    ======================================================== */

    const existingProfile =
      await checkExistingProfile(
        firebaseUser.uid
      );


    if (existingProfile.exists) {

      /*
         Do not create duplicate profiles.
      */

      console.log(
        "Existing LankaQuest profile found:",
        existingProfile.accountType
      );


      showRegistrationMessage(
        "A LankaQuest profile already exists for this Google account.",
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
       CREATE FIRESTORE PROFILE
    ======================================================== */

    if (
      accountType ===
      "tourist"
    ) {

      await createTouristProfile(
        firebaseUser
      );


      showRegistrationMessage(
        "Tourist account created successfully.",
        "success"
      );

    } else {

      await createGuideProfile(
        firebaseUser
      );


      showRegistrationMessage(
        "Guide registration submitted successfully. Your profile is pending verification.",
        "success"
      );

    }


    /* ========================================================
       REGISTRATION COMPLETE
    ======================================================== */

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


  } catch (error) {

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


      /*
         Prevent duplicate submissions.
      */

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
           If registration succeeds,
           navigation will happen shortly.

           If it fails, unlock the button.
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


    /*
       Google registration requires an
       authenticated Firebase user.

       If register.html?google=1 is opened
       directly without a Google session,
       send the user back to login.
    */

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


    /*
       Once Firebase confirms the user,
       populate Google registration fields.
    */

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

