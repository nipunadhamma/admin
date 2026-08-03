/* ============================================================
   LOGIN PAGE LOGIC
   LankaWayfarer

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

        Firebase allows only one active popup
        authentication operation at a time.
      */

      if (googleLoginInProgress) {

        console.log(
          "Google login already in progress."
        );

        return;
      }


      googleLoginInProgress = true;


      /*
        Disable button while Google popup
        authentication is running.
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


        /* ====================================================
           FIREBASE GOOGLE LOGIN
        ==================================================== */

        const result =
          await googleLogin();


        /* ====================================================
           LOGIN FAILED
        ==================================================== */

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


        /* ====================================================
           NEW GOOGLE USER
           
           Firebase Authentication succeeded,
           but no LankaQuest profile exists.

           IMPORTANT:

           Do NOT call redirectAfterLogin().

           Go to registration page instead.

           Firebase Auth session remains active.
        ==================================================== */

        if (
          result.needsRegistration === true
        ) {

          console.log(
            "Google user has no LankaWayfarer profile."
          );


          showLoginMessage(
            "Google account verified. Opening registration...",
            "success"
          );


          /*
            Small delay so the user can see
            the success message before navigation.
          */

          setTimeout(
            () => {

              window.location.href =
                "register.html?google=1";

            },

            500
          );


          return;
        }


        /* ====================================================
           EXISTING LANKAWAYFARER USER
        ==================================================== */

        showLoginMessage(
          "Google login successful. Redirecting...",
          "success"
        );


        /*
          Existing profile found.

          redirectAfterLogin() decides:

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


        /* ====================================================
           POPUP ALREADY OPEN
        ==================================================== */

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


        /* ====================================================
           USER CLOSED POPUP
        ==================================================== */

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


        /* ====================================================
           POPUP BLOCKED
        ==================================================== */

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


        /* ====================================================
           UNAUTHORIZED DOMAIN
        ==================================================== */

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


        /* ====================================================
           GENERAL ERROR
        ==================================================== */

        showLoginMessage(
          error.message ||
          "Google login failed.",
          "error"
        );

      } finally {

        /*
          Unlock the button after the operation.

          If page navigation has already started,
          the browser will simply leave this page.
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
