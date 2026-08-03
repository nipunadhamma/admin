/* ============================================================
   GUIDE REGISTRATION SYSTEM
   LankaWayfarer

   Firebase Architecture:

   Guide Register Form
          |
          ↓
   Firebase Authentication
          |
          ↓
   Firestore
          |
          ↓
   LankaWayfarerGuides

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

const guideRegistrationForm = document.getElementById("guideRegistrationForm");

const formStatusMessage = document.getElementById("formStatusMessage");

const submitButton = document.getElementById("submitGuideApplication");

/* ============================================================
   SHOW MESSAGE
============================================================ */

function showMessage(
  message,

  type = "error",
) {
  if (!formStatusMessage) {
    return;
  }

  formStatusMessage.textContent = message;

  formStatusMessage.style.display = "block";

  if (type === "success") {
    formStatusMessage.style.background = "#e8fff0";

    formStatusMessage.style.color = "#146c43";
  } else {
    formStatusMessage.style.background = "#fff0f0";

    formStatusMessage.style.color = "#b42318";
  }
}

/* ============================================================
   GET CHECKBOX VALUES
============================================================ */

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))

    .map((item) => item.value);
}

/* ============================================================
   FORM SUBMIT
============================================================ */

if (guideRegistrationForm) {
  guideRegistrationForm.addEventListener(
    "submit",

    async function (event) {
      event.preventDefault();

      /* ========================================================
   GET FORM VALUES
======================================================== */

      const fullName = document.getElementById("fullName").value.trim();

      const email = document.getElementById("email").value.trim();

      const phone = document.getElementById("phone").value.trim();

      const password = document.getElementById("password").value;

      const confirmPassword = document.getElementById("confirmPassword").value;

      const district = document.getElementById("district").value;

      const province = document.getElementById("province").value;

      const nic = document.getElementById("nic").value.trim();

      const passport = document.getElementById("passport").value.trim();

      const dateOfBirth = document.getElementById("dateOfBirth").value;

      const address = document.getElementById("address").value.trim();

      const guideLicenseNumber = document
        .getElementById("guideLicenseNumber")
        .value.trim();

      const experience = document.getElementById("experience").value;

      const areasCovered = document.getElementById("areasCovered").value.trim();

      const qualifications = document
        .getElementById("qualifications")
        .value.trim();

      const bio = document.getElementById("bio").value.trim();

      const languages = getCheckedValues("languages");

      const specializations = getCheckedValues("specializations");

      /* ========================================================
   VALIDATION
======================================================== */

      if (password !== confirmPassword) {
        showMessage("Passwords do not match.");

        return;
      }

      if (password.length < 8) {
        showMessage("Password must contain at least 8 characters.");

        return;
      }

      if (languages.length === 0) {
        showMessage("Please select at least one language.");

        return;
      }

      if (specializations.length === 0) {
        showMessage("Please select at least one specialization.");

        return;
      }

      try {
        /* ========================================================
   BUTTON STATE
======================================================== */

        submitButton.disabled = true;

        submitButton.innerHTML = "Creating Account...";

        /* ========================================================
   CREATE FIREBASE AUTH USER
======================================================== */

        const userCredential = await createUserWithEmailAndPassword(
          auth,

          email,

          password,
        );

        const user = userCredential.user;

        const uid = user.uid;

        /* ========================================================
   SAVE GUIDE PROFILE
======================================================== */

        await setDoc(
          doc(
            db,

            "lankaQuestGuides",

            uid,
          ),

          {
            uid: uid,

            accountType: "guide",

            fullName: fullName,

            email: email,

            phone: phone,

            nic: nic,

            passport: passport,

            dateOfBirth: dateOfBirth,

            address: address,

            district: district,

            province: province,

            guideLicenseNumber: guideLicenseNumber,

            experience: experience,

            languages: languages,

            specializations: specializations,

            areasCovered: areasCovered,

            qualifications: qualifications,

            bio: bio,

            /* =========================
           ACCOUNT STATUS
        ========================= */

            verificationStatus: "pending",

            status: "pending",

            profileStatus: "inactive",

            isActive: false,

            rating: 0,

            reviewCount: 0,

            completedTrips: 0,

            createdAt: serverTimestamp(),
          },
        );

        /* ========================================================
   SUCCESS
======================================================== */

        showMessage(
          "Guide application submitted successfully. Your account is waiting for verification.",

          "success",
        );

        setTimeout(
          () => {
            window.location.href = "login.html";
          },

          2500,
        );
      } catch (error) {
        console.error(
          "Guide Registration Error:",

          error,
        );

        let message = "Registration failed. Please try again.";

        if (error.code === "auth/email-already-in-use") {
          message = "This email address is already registered.";
        }

        showMessage(message);

        submitButton.disabled = false;

        submitButton.innerHTML = "Submit Guide Application →";
      }
    },
  );
}
