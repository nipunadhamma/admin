/* ============================================================
   LOGIN PAGE LOGIC
   LankaQuest

   FIREBASE AUTH VERSION


   LOGIN METHODS:

   1. Email + Password

   2. Google Login


   FLOW:

   Firebase Authentication
          |
          ↓
   Firebase UID
          |
          ↓
   Firestore Profile

      lankaQuestTourists
      lankaQuestGuides

          |
          ↓
   Create Session

          |
          ↓
   Redirect Dashboard


============================================================ */

import { loginUser, googleLogin, redirectAfterLogin } from "./auth.js";

/* ============================================================
   1. DOM ELEMENTS
============================================================ */

const loginForm = document.getElementById("loginForm");

const loginEmail = document.getElementById("loginEmail");

const loginPassword = document.getElementById("loginPassword");

const rememberMe = document.getElementById("rememberMe");

const loginMessage = document.getElementById("loginMessage");

const togglePassword = document.getElementById("togglePassword");

const googleLoginButton = document.getElementById("googleLoginButton");

/* ============================================================
   2. SHOW MESSAGE
============================================================ */

function showLoginMessage(
  message,

  type = "error",
) {
  if (!loginMessage) {
    return;
  }

  loginMessage.textContent = message;

  loginMessage.style.display = "block";

  if (type === "success") {
    loginMessage.style.background = "#edf8f1";

    loginMessage.style.color = "#176044";
  } else {
    loginMessage.style.background = "#fff0f0";

    loginMessage.style.color = "#b42318";
  }
}

/* ============================================================
   3. PASSWORD SHOW / HIDE
============================================================ */

if (togglePassword && loginPassword) {
  togglePassword.addEventListener(
    "click",

    () => {
      if (loginPassword.type === "password") {
        loginPassword.type = "text";

        togglePassword.textContent = "🙈";
      } else {
        loginPassword.type = "password";

        togglePassword.textContent = "👁️";
      }
    },
  );
}

/* ============================================================
   4. EMAIL PASSWORD LOGIN
============================================================ */

if (loginForm) {
  loginForm.addEventListener(
    "submit",

    async (event) => {
      event.preventDefault();

      const email = loginEmail.value.trim();

      const password = loginPassword.value;

      const remember = rememberMe.checked;

      showLoginMessage(
        "Logging in...",

        "success",
      );

      const result = await loginUser(
        email,

        password,

        remember,
      );

      if (!result || !result.success) {
        showLoginMessage(
          result?.message || "Login failed.",

          "error",
        );

        return;
      }

      showLoginMessage(
        "Login successful. Redirecting...",

        "success",
      );

      redirectAfterLogin(result.user);
    },
  );
}


/* ============================================================
   5. GOOGLE LOGIN
============================================================ */

let googleLoginInProgress = false;


if (googleLoginButton) {

  googleLoginButton.addEventListener(
    "click",

    async () => {

      /*
        Prevent multiple Google popup requests.

        This is important because Firebase
        signInWithPopup() allows only one active
        popup operation at a time.
      */

      if (googleLoginInProgress) {

        console.log(
          "Google login already in progress."
        );

        return;
      }


      googleLoginInProgress = true;


      /*
        Prevent repeated clicks while popup is open.
      */

      googleLoginButton.disabled = true;


      const originalButtonText =
        googleLoginButton.textContent;


      googleLoginButton.textContent =
        "Connecting to Google...";


      try {

        showLoginMessage(
          "Connecting Google account...",
          "success"
        );


        /*
          Start Firebase Google authentication.
        */

        const result =
          await googleLogin();


        /*
          Authentication failed.
        */

        if (
          !result ||
          !result.success
        ) {

          showLoginMessage(
            result?.message ||
            "Google login failed.",
            "error"
          );


          return;
        }


        /*
          Authentication successful.
        */

        showLoginMessage(
          "Google login successful. Redirecting...",
          "success"
        );


        /*
          Redirect based on account type.

          Admin
              ↓
          admin-guides.html

          Tourist
              ↓
          tourist-dashboard.html

          Guide
              ↓
          guide-dashboard.html
          or guide-verification.html
        */

        redirectAfterLogin(
          result.user
        );


      } catch (error) {

        console.error(
          "Google Login Error:",
          error
        );


        /*
          Firebase may return this if another
          popup request was started.

          Do not show a confusing error to the user.
        */

        if (
          error.code ===
          "auth/cancelled-popup-request"
        ) {

          showLoginMessage(
            "Google sign-in is already in progress. Please wait.",
            "error"
          );


          return;
        }


        /*
          User manually closed the popup.
        */

        if (
          error.code ===
          "auth/popup-closed-by-user"
        ) {

          showLoginMessage(
            "Google sign-in was cancelled.",
            "error"
          );


          return;
        }


        /*
          Browser blocked the popup.
        */

        if (
          error.code ===
          "auth/popup-blocked"
        ) {

          showLoginMessage(
            "Google sign-in popup was blocked by the browser. Please allow popups for this site.",
            "error"
          );


          return;
        }


        /*
          Firebase domain configuration error.
        */

        if (
          error.code ===
          "auth/unauthorized-domain"
        ) {

          showLoginMessage(
            "This website domain is not authorized for Google sign-in in Firebase.",
            "error"
          );


          return;
        }


        /*
          General error.
        */

        showLoginMessage(
          error.message ||
          "Google login failed.",
          "error"
        );

      } finally {

        /*
          Always unlock the button after
          the Google operation finishes.

          If redirect happens, this code may run
          immediately before navigation, which is fine.
        */

        googleLoginInProgress = false;


        googleLoginButton.disabled =
          false;


        googleLoginButton.textContent =
          originalButtonText;

      }

    }
  );

}


/* ============================================================
   6. FORGOT PASSWORD
============================================================ */

const forgotPassword = document.getElementById("forgotPassword");

if (forgotPassword) {
  forgotPassword.addEventListener(
    "click",

    (event) => {
      event.preventDefault();

      alert("Password reset will be connected with Firebase Auth.");
    },
  );
}

/* ============================================================
   END LOGIN.JS
============================================================ */
