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

if (googleLoginButton) {
  googleLoginButton.addEventListener(
    "click",

    async () => {
      try {
        showLoginMessage(
          "Connecting Google account...",

          "success",
        );

        const result = await googleLogin();

        if (!result || !result.success) {
          showLoginMessage(
            result.message || "Google login failed.",

            "error",
          );

          return;
        }

        showLoginMessage(
          "Google login successful. Redirecting...",

          "success",
        );

        redirectAfterLogin(result.user);
      } catch (error) {
        console.error(
          "Google Login Error:",

          error,
        );

        showLoginMessage(
          "Google login failed.",

          "error",
        );
      }
    },
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
