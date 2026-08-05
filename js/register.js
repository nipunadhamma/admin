/* ============================================================
   LankaWayfarer
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
   Guide Photo → Cloudinary
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
   Tourist / Guide selection
        ↓
   Guide Photo → Cloudinary
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

import { auth, db } from "./firebase-config.js";

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
   CLOUDINARY CONFIGURATION
   LankaWayfarer — Guide Profile Photos
============================================================ */

const CLOUDINARY_CLOUD_NAME =
    "uok813er";

const CLOUDINARY_UPLOAD_PRESET =
    "lankawayfarer_guides";

/*
   Cloudinary upload endpoint.
*/

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/* ============================================================
   PROFILE PHOTO SETTINGS
============================================================ */

const MAX_PROFILE_PHOTO_SIZE = 2 * 1024 * 1024;

const ALLOWED_PROFILE_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/* ============================================================
   DOM ELEMENTS
============================================================ */

const registrationForm = document.getElementById("registrationForm");

const accountTypeInputs = document.querySelectorAll(
  'input[name="accountType"]',
);

const touristFields = document.getElementById("touristFields");

const guideFields = document.getElementById("guideFields");

const registrationMessage = document.getElementById("registrationMessage");

const fullNameInput = document.getElementById("fullName");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const confirmPasswordInput = document.getElementById("confirmPassword");

const profilePhotoInput = document.getElementById("profilePhoto");

/* ============================================================
   GOOGLE REGISTRATION MODE
============================================================ */

const urlParams = new URLSearchParams(window.location.search);

const isGoogleRegistration = urlParams.get("google") === "1";

/*
   Authenticated Firebase user.
*/

let authenticatedUser = null;

/*
   Temporary photo URL.

   This is kept in memory during registration.
*/

let pendingProfilePhotoURL = "";

/* ============================================================
   MESSAGE SYSTEM
============================================================ */

function showRegistrationMessage(message, type = "success") {
  if (!registrationMessage) {
    return;
  }

  registrationMessage.textContent = message;

  registrationMessage.style.display = "block";

  if (type === "error") {
    registrationMessage.style.background = "#fff0f0";

    registrationMessage.style.color = "#b42318";
  } else {
    registrationMessage.style.background = "#edf8f1";

    registrationMessage.style.color = "#176044";
  }
}

/* ============================================================
   ACCOUNT TYPE
============================================================ */

function getSelectedAccountType() {
  const selected = document.querySelector('input[name="accountType"]:checked');

  return selected ? selected.value : "tourist";
}

/* ============================================================
   SWITCH ACCOUNT FIELDS
============================================================ */

function updateAccountTypeFields() {
  const accountType = getSelectedAccountType();

  if (accountType === "tourist") {
    if (touristFields) {
      touristFields.classList.remove("hidden");
    }

    if (guideFields) {
      guideFields.classList.add("hidden");
    }
  } else {
    if (touristFields) {
      touristFields.classList.add("hidden");
    }

    if (guideFields) {
      guideFields.classList.remove("hidden");
    }
  }
}

/* ============================================================
   ACCOUNT TYPE LISTENERS
============================================================ */

accountTypeInputs.forEach((input) => {
  input.addEventListener("change", updateAccountTypeFields);
});

/* ============================================================
   GOOGLE REGISTRATION UI
============================================================ */

function setupGoogleRegistrationUI() {
  if (!isGoogleRegistration) {
    return;
  }

  /* --------------------------------------------------------
       Password is not required for Google registration.
    -------------------------------------------------------- */

  if (passwordInput) {
    passwordInput.required = false;

    passwordInput.disabled = true;

    passwordInput.value = "";
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.required = false;

    confirmPasswordInput.disabled = true;

    confirmPasswordInput.value = "";
  }

  /* --------------------------------------------------------
       Google email
    -------------------------------------------------------- */

  if (emailInput && authenticatedUser) {
    emailInput.value = authenticatedUser.email || "";

    emailInput.readOnly = true;
  }

  /* --------------------------------------------------------
       Google display name
    -------------------------------------------------------- */

  if (fullNameInput && authenticatedUser && authenticatedUser.displayName) {
    if (!fullNameInput.value.trim()) {
      fullNameInput.value = authenticatedUser.displayName;
    }
  }

  console.log("Google registration mode enabled.");
}

/* ============================================================
   CHECK EXISTING PROFILE
============================================================ */

async function checkExistingProfile(uid) {
  /* --------------------------------------------------------
       TOURIST
    -------------------------------------------------------- */

  const touristRef = doc(db, "lankaQuestTourists", uid);

  const touristSnap = await getDoc(touristRef);

  if (touristSnap.exists()) {
    return {
      exists: true,

      accountType: "tourist",

      data: touristSnap.data(),
    };
  }

  /* --------------------------------------------------------
       GUIDE
    -------------------------------------------------------- */

  const guideRef = doc(db, "lankaQuestGuides", uid);

  const guideSnap = await getDoc(guideRef);

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
   VALIDATE PROFILE PHOTO
============================================================ */

function validateProfilePhoto(file) {
  if (!file) {
    return null;
  }

  /* --------------------------------------------------------
       FILE TYPE
    -------------------------------------------------------- */

  if (!ALLOWED_PROFILE_PHOTO_TYPES.includes(file.type)) {
    throw new Error("Profile photo must be JPG, PNG or WEBP.");
  }

  /* --------------------------------------------------------
       FILE SIZE
    -------------------------------------------------------- */

  if (file.size > MAX_PROFILE_PHOTO_SIZE) {
    throw new Error("Profile photo must be 2 MB or smaller.");
  }

  return file;
}

/* ============================================================
   UPLOAD GUIDE PROFILE PHOTO
   CLOUDINARY DIRECT BROWSER UPLOAD
============================================================ */

async function uploadGuideProfilePhoto() {

    /* --------------------------------------------------------
       CHECK INPUT
    -------------------------------------------------------- */

    if (!profilePhotoInput) {

        console.warn(
            "Profile photo input element was not found."
        );

        return "";

    }


    /* --------------------------------------------------------
       GET SELECTED FILE
    -------------------------------------------------------- */

    const file =
        profilePhotoInput.files?.[0];


    /* --------------------------------------------------------
       PHOTO IS OPTIONAL
    -------------------------------------------------------- */

    if (!file) {

        console.log(
            "No guide profile photo selected."
        );

        return "";

    }


    /* --------------------------------------------------------
       VALIDATE PHOTO
    -------------------------------------------------------- */

    validateProfilePhoto(file);


    /* --------------------------------------------------------
       CLOUDINARY CONFIGURATION
    -------------------------------------------------------- */

    if (
        !CLOUDINARY_CLOUD_NAME ||
        CLOUDINARY_CLOUD_NAME ===
            "YOUR_CLOUD_NAME"
    ) {

        throw new Error(
            "Cloudinary Cloud Name has not been configured."
        );

    }


    if (
        !CLOUDINARY_UPLOAD_PRESET ||
        CLOUDINARY_UPLOAD_PRESET ===
            "YOUR_UNSIGNED_UPLOAD_PRESET"
    ) {

        throw new Error(
            "Cloudinary Upload Preset has not been configured."
        );

    }


    /* --------------------------------------------------------
       CREATE FORM DATA
    -------------------------------------------------------- */

    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    /*
       Cloudinary folder
    */

    formData.append(
        "folder",
        "lankawayfarer/guide-profiles"
    );


    /* --------------------------------------------------------
       DEBUG INFORMATION
    -------------------------------------------------------- */

    console.log(
        "----------------------------------------"
    );

    console.log(
        "Cloudinary Upload Started"
    );

    console.log(
        "File Name:",
        file.name
    );

    console.log(
        "File Type:",
        file.type
    );

    console.log(
        "File Size:",
        file.size
    );

    console.log(
        "Cloud Name:",
        CLOUDINARY_CLOUD_NAME
    );

    console.log(
        "Upload Preset:",
        CLOUDINARY_UPLOAD_PRESET
    );

    console.log(
        "----------------------------------------"
    );


    /* --------------------------------------------------------
       UPLOAD
    -------------------------------------------------------- */

    let response;

    try {

        response =
            await fetch(
                CLOUDINARY_UPLOAD_URL,
                {
                    method: "POST",
                    body: formData
                }
            );

    } catch (networkError) {

        console.error(
            "Cloudinary Network Error:",
            networkError
        );

        throw new Error(
            "Unable to connect to Cloudinary. Please check your internet connection."
        );

    }


    /* --------------------------------------------------------
       READ RESPONSE
    -------------------------------------------------------- */

    let result;

    try {

        result =
            await response.json();

    } catch (jsonError) {

        console.error(
            "Cloudinary Response Error:",
            jsonError
        );

        throw new Error(
            "Cloudinary returned an invalid response."
        );

    }


    /* --------------------------------------------------------
       CLOUDINARY ERROR
    -------------------------------------------------------- */

    if (!response.ok) {

        console.error(
            "Cloudinary Upload Failed:",
            result
        );

        throw new Error(
            result?.error?.message ||
            "Profile photo upload failed."
        );

    }


    /* --------------------------------------------------------
       CHECK SECURE URL
    -------------------------------------------------------- */

    if (
        !result ||
        !result.secure_url
    ) {

        console.error(
            "Cloudinary response did not contain secure_url:",
            result
        );

        throw new Error(
            "Cloudinary did not return a profile photo URL."
        );

    }


    /* --------------------------------------------------------
       PHOTO URL
    -------------------------------------------------------- */

    const photoURL =
        result.secure_url;


    /* --------------------------------------------------------
       SUCCESS
    -------------------------------------------------------- */

    console.log(
        "========================================"
    );

    console.log(
        "Guide Profile Photo Uploaded Successfully"
    );

    console.log(
        "Cloudinary URL:",
        photoURL
    );

    console.log(
        "Public ID:",
        result.public_id || ""
    );

    console.log(
        "========================================"
    );


    /* --------------------------------------------------------
       RETURN URL
    -------------------------------------------------------- */

    return photoURL;

}

/* ============================================================
   CREATE TOURIST PROFILE
============================================================ */

async function createTouristProfile(firebaseUser) {
  const uid = firebaseUser.uid;

  const fullName = fullNameInput ? fullNameInput.value.trim() : "";

  const email =
    firebaseUser.email || (emailInput ? emailInput.value.trim() : "");

  const countryElement = document.getElementById("country");

  const country = countryElement ? countryElement.value.trim() : "";

  /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */

  if (!fullName) {
    throw new Error("Please enter your full name.");
  }

  if (!email) {
    throw new Error("A valid email address is required.");
  }

  /* --------------------------------------------------------
       EMAIL VERIFICATION
    -------------------------------------------------------- */

  if (!isGoogleRegistration && !firebaseUser.emailVerified) {
    throw new Error(
      "Please verify your email address before creating your LankaWayfarer profile.",
    );
  }

  /* --------------------------------------------------------
       TOURIST PROFILE
    -------------------------------------------------------- */

  const profileData = {
    uid: uid,

    fullName: fullName,

    email: email,

    accountType: "tourist",

    country: country,

    createdAt: serverTimestamp(),
  };

  /* --------------------------------------------------------
       FIRESTORE
    -------------------------------------------------------- */

  await setDoc(
    doc(db, "lankaQuestTourists", uid),

    profileData,
  );

  console.log("Tourist profile created:", uid);

  return profileData;
}


/* ============================================================
   CREATE GUIDE PROFILE
   FIREBASE FIRESTORE
============================================================ */

async function createGuideProfile(
    firebaseUser,
    profilePhotoURL = ""
) {

    /* --------------------------------------------------------
       USER ID
    -------------------------------------------------------- */

    const uid =
        firebaseUser.uid;


    /* --------------------------------------------------------
       BASIC INFORMATION
    -------------------------------------------------------- */

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


    /* --------------------------------------------------------
       GUIDE FORM ELEMENTS
    -------------------------------------------------------- */

    const phoneElement =
        document.getElementById("phone");


    const districtElement =
        document.getElementById("guideDistrict");


    const languagesElement =
        document.getElementById("languages");


    const experienceElement =
        document.getElementById("experience");


    /* --------------------------------------------------------
       GUIDE VALUES
    -------------------------------------------------------- */

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


    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */

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


    /* --------------------------------------------------------
       EMAIL VERIFICATION
    -------------------------------------------------------- */

    if (
        !isGoogleRegistration &&
        !firebaseUser.emailVerified
    ) {

        throw new Error(
            "Please verify your email address before creating your LankaWayfarer guide profile."
        );

    }


    /* --------------------------------------------------------
       PHOTO URL DEBUG
    -------------------------------------------------------- */

    console.log(
        "========================================"
    );

    console.log(
        "GUIDE PROFILE PHOTO URL"
    );

    console.log(
        "profilePhotoURL:",
        profilePhotoURL
    );

    console.log(
        "Photo available:",
        Boolean(profilePhotoURL)
    );

    console.log(
        "========================================"
    );


    /* --------------------------------------------------------
       GUIDE PROFILE DATA
    -------------------------------------------------------- */

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


        /*
           IMPORTANT

           Cloudinary secure URL.

           Example:

           https://res.cloudinary.com/uok813er/...

        */

        profilePhotoUrl:
            profilePhotoURL || "",


        /*
           Guide verification
        */

        verificationStatus:
            "pending",


        status:
            "pending",


        /*
           Firestore timestamp
        */

        createdAt:
            serverTimestamp()

    };


    /* --------------------------------------------------------
       FIRESTORE DEBUG
    -------------------------------------------------------- */

    console.log(
        "Guide profile data before Firestore:",
        profileData
    );


    console.log(
        "Firestore collection:",
        "lankaQuestGuides"
    );


    console.log(
        "Firestore document ID:",
        uid
    );


    /* --------------------------------------------------------
       SAVE GUIDE PROFILE
    -------------------------------------------------------- */

    await setDoc(

        doc(
            db,
            "lankaQuestGuides",
            uid
        ),

        profileData

    );


    /* --------------------------------------------------------
       SUCCESS
    -------------------------------------------------------- */

    console.log(
        "========================================"
    );

    console.log(
        "Guide profile created successfully."
    );

    console.log(
        "Guide UID:",
        uid
    );

    console.log(
        "Saved profilePhotoUrl:",
        profileData.profilePhotoUrl
    );

    console.log(
        "========================================"
    );


    /* --------------------------------------------------------
       RETURN
    -------------------------------------------------------- */

    return profileData;

}



/* ============================================================
   CREATE FIRESTORE PROFILE
============================================================ */

async function createFirestoreProfile(
  firebaseUser,
  accountType,
  profilePhotoURL = "",
) {
  if (accountType === "tourist") {
    return await createTouristProfile(firebaseUser);
  }

  if (accountType === "guide") {
    return await createGuideProfile(firebaseUser, profilePhotoURL);
  }

  throw new Error("Invalid account type.");
}

/* ============================================================
   NORMAL EMAIL/PASSWORD REGISTRATION
============================================================ */

async function registerWithEmailPassword() {
  const email = emailInput ? emailInput.value.trim() : "";

  const password = passwordInput ? passwordInput.value : "";

  const confirmPassword = confirmPasswordInput
    ? confirmPasswordInput.value
    : "";

  /* --------------------------------------------------------
       EMAIL
    -------------------------------------------------------- */

  if (!email) {
    throw new Error("Please enter your email address.");
  }

  /* --------------------------------------------------------
       PASSWORD
    -------------------------------------------------------- */

  if (!password) {
    throw new Error("Please enter a password.");
  }

  /* --------------------------------------------------------
       CONFIRM PASSWORD
    -------------------------------------------------------- */

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  /* --------------------------------------------------------
       CREATE AUTH ACCOUNT
    -------------------------------------------------------- */

  const userCredential = await createUserWithEmailAndPassword(
    auth,

    email,

    password,
  );

  const firebaseUser = userCredential.user;

  if (!firebaseUser) {
    throw new Error("Firebase authentication failed.");
  }

  /* --------------------------------------------------------
       GUIDE PHOTO
    -------------------------------------------------------- */

  let profilePhotoURL = "";

  if (getSelectedAccountType() === "guide") {
    profilePhotoURL = await uploadGuideProfilePhoto();
  }

  /*
       Keep the URL in memory.

       This same URL is passed into
       savePendingRegistrationData().
    */

  pendingProfilePhotoURL = profilePhotoURL;

  /* --------------------------------------------------------
       SEND VERIFICATION EMAIL
    -------------------------------------------------------- */

  await sendEmailVerification(firebaseUser);

  console.log("Verification email sent:", firebaseUser.email);

  /* --------------------------------------------------------
       SAVE PENDING DATA
    -------------------------------------------------------- */

  savePendingRegistrationData(profilePhotoURL);

  authenticatedUser = firebaseUser;

  /* --------------------------------------------------------
       REDIRECT
    -------------------------------------------------------- */

  window.location.href = "verify-email.html";

  return firebaseUser;
}

/* ============================================================
   SAVE PENDING REGISTRATION DATA
============================================================ */

function savePendingRegistrationData(profilePhotoURL = "") {
  const accountType = getSelectedAccountType();

  const fullName = fullNameInput ? fullNameInput.value.trim() : "";

  const email = emailInput ? emailInput.value.trim() : "";

  /*
       IMPORTANT:

       NEVER store password or
       confirmPassword.
    */

  const pendingData = {
    accountType: accountType,

    fullName: fullName,

    email: email,

    country: document.getElementById("country")
      ? document.getElementById("country").value.trim()
      : "",

    phone: document.getElementById("phone")
      ? document.getElementById("phone").value.trim()
      : "",

    district: document.getElementById("guideDistrict")
      ? document.getElementById("guideDistrict").value
      : "",

    languages: document.getElementById("languages")
      ? document.getElementById("languages").value.trim()
      : "",

    experience: document.getElementById("experience")
      ? document.getElementById("experience").value
      : "",

    /*
           IMPORTANT:

           This is the Cloudinary URL.
        */

    profilePhotoUrl: profilePhotoURL || "",

    createdAt: Date.now(),
  };

  sessionStorage.setItem(
    "lankaQuestPendingRegistration",

    JSON.stringify(pendingData),
  );

  console.log("Pending registration data saved.");

  return pendingData;
}

/* ============================================================
   GOOGLE REGISTRATION
============================================================ */

async function registerWithGoogle() {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error(
      "Your Google session could not be found. Please return to the login page and sign in with Google again.",
    );
  }

  console.log("Authenticated Google user:", currentUser.uid);

  await reload(currentUser);

  const refreshedUser = auth.currentUser;

  if (!refreshedUser) {
    throw new Error("Unable to load your Google account.");
  }

  if (!refreshedUser.emailVerified) {
    throw new Error("Your Google email could not be verified by Firebase.");
  }

  authenticatedUser = refreshedUser;

  return refreshedUser;
}

/* ============================================================
   COMPLETE REGISTRATION
============================================================ */

async function completeRegistration(firebaseUser) {
  const accountType = getSelectedAccountType();

  /* --------------------------------------------------------
       ACCOUNT TYPE
    -------------------------------------------------------- */

  if (accountType !== "tourist" && accountType !== "guide") {
    throw new Error("Please select an account type.");
  }

  /* --------------------------------------------------------
       CHECK EXISTING PROFILE
    -------------------------------------------------------- */

  const existingProfile = await checkExistingProfile(firebaseUser.uid);

  if (existingProfile.exists) {
    console.log(
      "Existing LankaWayfarer profile found:",
      existingProfile.accountType,
    );

    showRegistrationMessage(
      "A LankaQuest profile already exists for this account.",
      "error",
    );

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);

    return;
  }

  /* --------------------------------------------------------
       EMAIL VERIFICATION
    -------------------------------------------------------- */

  if (!isGoogleRegistration && !firebaseUser.emailVerified) {
    throw new Error(
      "Email verification is required before creating your LankaQuest profile.",
    );
  }

  /* --------------------------------------------------------
       GUIDE PHOTO
       
       Google registration does not go through
       registerWithEmailPassword(), so upload here.
    -------------------------------------------------------- */

  let profilePhotoURL = pendingProfilePhotoURL;

  if (accountType === "guide" && !profilePhotoURL) {
    profilePhotoURL = await uploadGuideProfilePhoto();
  }

  /* --------------------------------------------------------
       CREATE FIRESTORE PROFILE
    -------------------------------------------------------- */

  await createFirestoreProfile(
    firebaseUser,

    accountType,

    profilePhotoURL,
  );

  /* --------------------------------------------------------
       SUCCESS
    -------------------------------------------------------- */

  if (accountType === "tourist") {
    showRegistrationMessage("Tourist account created successfully.", "success");
  } else {
    showRegistrationMessage(
      "Guide registration submitted successfully. Your profile is pending verification.",
      "success",
    );
  }

  /* --------------------------------------------------------
       REDIRECT
    -------------------------------------------------------- */

  setTimeout(() => {
    if (accountType === "tourist") {
      window.location.href = "tourist-dashboard.html";
    } else {
      window.location.href = "guide-verification.html";
    }
  }, 1500);
}

/* ============================================================
   MAIN REGISTRATION
============================================================ */

async function registerUser() {
  try {
    const accountType = getSelectedAccountType();

    /* ----------------------------------------------------
           ACCOUNT TYPE
        ---------------------------------------------------- */

    if (accountType !== "tourist" && accountType !== "guide") {
      throw new Error("Please select an account type.");
    }

    /* ----------------------------------------------------
           GOOGLE
        ---------------------------------------------------- */

    if (isGoogleRegistration) {
      const firebaseUser = await registerWithGoogle();

      await completeRegistration(firebaseUser);

      return;
    }

    /* ----------------------------------------------------
           NORMAL EMAIL REGISTRATION
        ---------------------------------------------------- */

    await registerWithEmailPassword();
  } catch (error) {
    console.error("Registration Error:", error);

    let message = "Registration failed.";

    switch (error.code) {
      case "auth/email-already-in-use":
        message =
          "This email address is already registered. Please login instead.";

        break;

      case "auth/invalid-email":
        message = "Invalid email address.";

        break;

      case "auth/weak-password":
        message = "Password is too weak. Please choose a stronger password.";

        break;

      case "auth/network-request-failed":
        message = "Network error. Please check your internet connection.";

        break;

      case "auth/too-many-requests":
        message = "Too many requests. Please wait a moment and try again.";

        break;

      case "auth/operation-not-allowed":
        message =
          "Email/password registration is not enabled in Firebase Authentication.";

        break;

      case "permission-denied":
        message = "You do not have permission to create this profile.";

        break;

      default:
        message = error.message || "Registration failed.";

        break;
    }

    showRegistrationMessage(message, "error");
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

      const submitButton = registrationForm.querySelector(
        'button[type="submit"]',
      );

      if (submitButton) {
        submitButton.disabled = true;
      }

      try {
        await registerUser();
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    },
  );
}

/* ============================================================
   AUTH STATE
============================================================ */

onAuthStateChanged(
  auth,

  (user) => {
    authenticatedUser = user;

    console.log(
      "Registration Auth State:",
      user ? user.uid : "No authenticated user",
    );

    /* ----------------------------------------------------
           GOOGLE WITHOUT SESSION
        ---------------------------------------------------- */

    if (isGoogleRegistration && !user) {
      showRegistrationMessage(
        "Google authentication session was not found. Returning to login...",
        "error",
      );

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);

      return;
    }

    /* ----------------------------------------------------
           GOOGLE REGISTRATION
        ---------------------------------------------------- */

    if (isGoogleRegistration && user) {
      setupGoogleRegistrationUI();
    }
  },
);

/* ============================================================
   INITIALIZE
============================================================ */

document.addEventListener(
  "DOMContentLoaded",

  () => {
    updateAccountTypeFields();
  },
);

/* ============================================================
   END REGISTER.JS
============================================================ */
