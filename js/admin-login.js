
/* ============================================================
   LANKAWAYFARER
   ADMIN LOGIN

   FIREBASE AUTHENTICATION
   CUSTOM CLAIM AUTHORIZATION

   LOGIN METHODS

   1. Email / Password
   2. Google

   REQUIRED CUSTOM CLAIM

   admin: true

============================================================ */


/* ============================================================
   FIREBASE
============================================================ */

import { auth } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


/* ============================================================
   DOM ELEMENTS
============================================================ */

const adminLoginForm =
    document.getElementById("adminLoginForm");

const adminEmail =
    document.getElementById("adminEmail");

const adminPassword =
    document.getElementById("adminPassword");

const adminLoginButton =
    document.getElementById("adminLoginButton");

const googleAdminLoginButton =
    document.getElementById("googleAdminLoginButton");

const adminLoginMessage =
    document.getElementById("adminLoginMessage");


/* ============================================================
   GOOGLE PROVIDER
============================================================ */

const googleProvider =
    new GoogleAuthProvider();

googleProvider.addScope("profile");
googleProvider.addScope("email");


/* ============================================================
   SHOW MESSAGE
============================================================ */

function showAdminLoginMessage(
    message,
    type = "error"
) {

    if (!adminLoginMessage) {
        return;
    }

    adminLoginMessage.textContent =
        message;

    adminLoginMessage.style.display =
        "block";

    adminLoginMessage.className =
        `admin-login-message ${type}`;
}


/* ============================================================
   AUTH ERROR MESSAGE
============================================================ */

function getAuthErrorMessage(error) {

    switch (error.code) {

        case "auth/invalid-credential":
            return "Invalid email address or password.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/user-disabled":
            return "This administrator account has been disabled.";

        case "auth/too-many-requests":
            return "Too many login attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        case "auth/popup-closed-by-user":
            return "Google sign-in was cancelled.";

        case "auth/popup-blocked":
            return "Google login popup was blocked. Please allow popups and try again.";

        case "auth/cancelled-popup-request":
            return "Google sign-in was cancelled.";

        case "auth/account-exists-with-different-credential":
            return "An account already exists with the same email using another sign-in method.";

        default:

            console.error(
                "Firebase Authentication Error:",
                error
            );

            return "Unable to sign in. Please try again.";
    }
}


/* ============================================================
   CHECK ADMIN CUSTOM CLAIM
============================================================ */

async function checkAdminAuthorization(user) {

    if (!user) {
        return false;
    }

    /*
       Force refresh ID token.

       This is important after creating/changing
       the Firebase Admin custom claim.
    */

    const idTokenResult =
        await user.getIdTokenResult(true);

    const isAdmin =
        idTokenResult.claims.admin === true;

    console.log(
        "Admin authorization:",
        isAdmin
    );

    console.log(
        "Admin claims:",
        idTokenResult.claims
    );

    return isAdmin;
}


/* ============================================================
   VERIFY ADMIN USER
============================================================ */

async function verifyAdminUser(user) {

    if (!user) {

        throw new Error(
            "Authentication failed."
        );
    }


    /* --------------------------------------------------------
       EMAIL VERIFICATION
    -------------------------------------------------------- */

    if (!user.emailVerified) {

        await signOut(auth);

        throw new Error(
            "Please verify your administrator email address before signing in."
        );
    }


    /* --------------------------------------------------------
       ADMIN CUSTOM CLAIM
    -------------------------------------------------------- */

    const isAdmin =
        await checkAdminAuthorization(user);


    if (!isAdmin) {

        await signOut(auth);

        throw new Error(
            "You are not authorized to access the administrator portal."
        );
    }


    return true;
}


/* ============================================================
   EMAIL / PASSWORD LOGIN
============================================================ */

async function loginAdmin(event) {

    event.preventDefault();


    const email =
        adminEmail
            ? adminEmail.value.trim()
            : "";


    const password =
        adminPassword
            ? adminPassword.value
            : "";


    /* --------------------------------------------------------
       VALIDATE EMAIL
    -------------------------------------------------------- */

    if (!email) {

        showAdminLoginMessage(
            "Please enter your email address."
        );

        return;
    }


    /* --------------------------------------------------------
       VALIDATE PASSWORD
    -------------------------------------------------------- */

    if (!password) {

        showAdminLoginMessage(
            "Please enter your password."
        );

        return;
    }


    /* --------------------------------------------------------
       DISABLE LOGIN BUTTON
    -------------------------------------------------------- */

    if (adminLoginButton) {

        adminLoginButton.disabled =
            true;

        adminLoginButton.textContent =
            "Signing in...";
    }


    try {

        /* ----------------------------------------------------
           FIREBASE EMAIL LOGIN
        ---------------------------------------------------- */

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        /* ----------------------------------------------------
           VERIFY ADMIN
        ---------------------------------------------------- */

        await verifyAdminUser(user);


        /* ----------------------------------------------------
           SUCCESS
        ---------------------------------------------------- */

        showAdminLoginMessage(
            "Administrator authentication successful.",
            "success"
        );


        window.location.href =
            "admin-dashboard.html";

    }

    catch (error) {

        console.error(
            "Admin email login error:",
            error
        );


        /*
           Custom authorization errors already have
           useful messages.
        */

        showAdminLoginMessage(
            error.message &&
            (
                error.message.includes(
                    "administrator"
                )
                ||
                error.message.includes(
                    "verify"
                )
            )
                ? error.message
                : getAuthErrorMessage(error)
        );
    }

    finally {

        if (adminLoginButton) {

            adminLoginButton.disabled =
                false;

            adminLoginButton.textContent =
                "Login";
        }
    }
}


/* ============================================================
   GOOGLE ADMIN LOGIN
============================================================ */

async function loginAdminWithGoogle() {

    if (googleAdminLoginButton) {

        googleAdminLoginButton.disabled =
            true;

        googleAdminLoginButton.classList.add(
            "loading"
        );

        googleAdminLoginButton.innerHTML =
            `
                <span class="google-login-icon">
                    G
                </span>

                <span>
                    Signing in...
                </span>
            `;
    }


    try {

        /* ----------------------------------------------------
           GOOGLE POPUP LOGIN
        ---------------------------------------------------- */

        const userCredential =
            await signInWithPopup(
                auth,
                googleProvider
            );


        const user =
            userCredential.user;


        if (!user) {

            throw new Error(
                "Google authentication failed."
            );
        }


        console.log(
            "Google authenticated user:",
            user.email
        );


        /* ----------------------------------------------------
           VERIFY ADMIN
        ---------------------------------------------------- */

        await verifyAdminUser(user);


        /* ----------------------------------------------------
           SUCCESS
        ---------------------------------------------------- */

        showAdminLoginMessage(
            "Administrator authentication successful.",
            "success"
        );


        window.location.href =
            "admin-dashboard.html";
    }

    catch (error) {

        console.error(
            "Google admin login error:",
            error
        );


        showAdminLoginMessage(
            error.message &&
            (
                error.message.includes(
                    "administrator"
                )
                ||
                error.message.includes(
                    "verify"
                )
            )
                ? error.message
                : getAuthErrorMessage(error)
        );
    }

    finally {

        if (googleAdminLoginButton) {

            googleAdminLoginButton.disabled =
                false;

            googleAdminLoginButton.classList.remove(
                "loading"
            );

            googleAdminLoginButton.innerHTML =
                `
                    <span class="google-login-icon">
                        G
                    </span>

                    <span>
                        Continue with Google
                    </span>
                `;
        }
    }
}


/* ============================================================
   EMAIL LOGIN EVENT
============================================================ */

if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        loginAdmin
    );
}


/* ============================================================
   GOOGLE LOGIN EVENT
============================================================ */

if (googleAdminLoginButton) {

    googleAdminLoginButton.addEventListener(
        "click",
        loginAdminWithGoogle
    );
}


/* ============================================================
   EXISTING ADMIN SESSION
============================================================ */

onAuthStateChanged(
    auth,

    async (user) => {

        if (!user) {
            return;
        }


        try {

            /*
               Check whether the currently authenticated
               Firebase user is actually an administrator.
            */

            const isAdmin =
                await checkAdminAuthorization(user);


            /*
               Redirect ONLY when:

               1. Admin custom claim exists
               2. Email is verified
            */

            if (
                isAdmin &&
                user.emailVerified
            ) {

                console.log(
                    "Existing admin session detected."
                );


                window.location.href =
                    "admin-dashboard.html";
            }

        }

        catch (error) {

            console.error(
                "Existing admin session check failed:",
                error
            );
        }
    }
);


/* ============================================================
   END ADMIN LOGIN
============================================================ */

