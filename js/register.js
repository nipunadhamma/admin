/* ============================================================
   LANKAQUEST
   REGISTRATION SYSTEM

   Firebase First Architecture


   Account Types:

   🧳 Tourist
   🧑‍💼 Guide


   FLOW:

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

   Tourist:
   lankaQuestTourists/{UID}


   Guide:
   lankaQuestGuides/{UID}

============================================================ */

/* ============================================================
   FIREBASE IMPORTS
============================================================ */

import { auth, db } from "./firebase-config.js";

import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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
  const type = getSelectedAccountType();

  if (type === "tourist") {
    touristFields.classList.remove("hidden");

    guideFields.classList.add("hidden");
  } else {
    touristFields.classList.add("hidden");

    guideFields.classList.remove("hidden");
  }
}

accountTypeInputs.forEach((input) => {
  input.addEventListener("change", updateAccountTypeFields);
});

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
   REGISTER USER

============================================================ */

async function registerUser() {
  try {
    const accountType = getSelectedAccountType();

    const fullName = document.getElementById("fullName").value.trim();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    /*
            Firebase Authentication

            Password is stored securely
            by Firebase

        */

    const userCredential = await createUserWithEmailAndPassword(
      auth,

      email,

      password,
    );

    const firebaseUser = userCredential.user;

    const uid = firebaseUser.uid;

    /* ====================================================
           COMMON PROFILE DATA
        ==================================================== */

    const profileData = {
      uid: uid,

      fullName: fullName,

      email: email,

      accountType: accountType,

      createdAt: serverTimestamp(),
    };

    /* ====================================================
           TOURIST PROFILE

           Collection:

           lankaQuestTourists

        ==================================================== */

    if (accountType === "tourist") {
      profileData.country = document.getElementById("country").value.trim();

      await setDoc(
        doc(
          db,

          "lankaQuestTourists",

          uid,
        ),

        profileData,
      );

      showRegistrationMessage("Tourist account created successfully.");

      setTimeout(
        () => {
          window.location.href = "login.html";
        },

        1500,
      );
    } else {

    /* ====================================================
           GUIDE PROFILE

           Collection:

           lankaQuestGuides

        ==================================================== */
      profileData.phone = document.getElementById("phone").value.trim();

      profileData.district = document.getElementById("guideDistrict").value;

      profileData.languages = document.getElementById("languages").value.trim();

      profileData.experience = document.getElementById("experience").value;

      profileData.verificationStatus = "pending";

      profileData.status = "pending";

      await setDoc(
        doc(
          db,

          "lankaQuestGuides",

          uid,
        ),

        profileData,
      );

      showRegistrationMessage("Guide registration submitted successfully.");

      setTimeout(
        () => {
          window.location.href = "login.html";
        },

        1500,
      );
    }
  } catch (error) {
    console.error("Registration Error:", error);

    let message = "Registration failed.";

    switch (error.code) {
      case "auth/email-already-in-use":
        message = "Email already registered.";

        break;

      case "auth/invalid-email":
        message = "Invalid email address.";

        break;

      case "auth/weak-password":
        message = "Password is too weak.";

        break;

      default:
        message = error.message;
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

    (event) => {
      event.preventDefault();

      registerUser();
    },
  );
}

/* ============================================================
   INITIALIZE

============================================================ */

document.addEventListener(
  "DOMContentLoaded",

  () => {
    updateAccountTypeFields();
  },
);
