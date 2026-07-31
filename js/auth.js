
/* ============================================================
   AUTHENTICATION CORE
   LankaQuest

   FIREBASE FIRST ARCHITECTURE

   FLOW:

   Firebase Authentication
            |
            ↓
        Firebase UID
            |
            ↓
       Firestore Profile
            |
            ↓
       Session Cache
            |
            ↓
          Dashboard


   ACCOUNT TYPES:

   ADMIN
      ↓
   admin-guides.html

   TOURIST
      ↓
   tourist-dashboard.html

   APPROVED GUIDE
      ↓
   guide-dashboard.html

   PENDING / REJECTED / INACTIVE GUIDE
      ↓
   guide-verification.html

   IMPORTANT:

   localStorage/sessionStorage are ONLY session cache.
   They are NOT the database.

============================================================ */


/* ============================================================
   FIREBASE IMPORTS
============================================================ */

import {
    auth,
    db
} from "./firebase-config.js";


import {
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* ============================================================
   ADMIN CONFIGURATION
============================================================ */

const ADMIN_EMAIL =
    "kalawanesangamaji@gmail.com";


/* ============================================================
   SESSION KEY

   This is ONLY a login-session cache.
============================================================ */

const AUTH_USER_KEY =
    "exploreSriLankaCurrentUser";


/* ============================================================
   GOOGLE PROVIDER
============================================================ */

const googleProvider =
    new GoogleAuthProvider();


/* ============================================================
   GET CURRENT USER

   Reads application session cache.
============================================================ */

function getCurrentUser() {

    let savedUser =
        localStorage.getItem(
            AUTH_USER_KEY
        );


    if (!savedUser) {

        savedUser =
            sessionStorage.getItem(
                AUTH_USER_KEY
            );

    }


    if (!savedUser) {

        return null;

    }


    try {

        return JSON.parse(
            savedUser
        );

    } catch (error) {

        console.error(
            "User session error:",
            error
        );


        clearUserSession();


        return null;

    }

}


/* ============================================================
   SAVE CURRENT USER

   Session cache only.
============================================================ */

function saveCurrentUser(
    user,
    remember = true
) {

    clearUserSession();


    const storage =
        remember
            ? localStorage
            : sessionStorage;


    storage.setItem(
        AUTH_USER_KEY,
        JSON.stringify(user)
    );

}


/* ============================================================
   CLEAR USER SESSION
============================================================ */

function clearUserSession() {

    localStorage.removeItem(
        AUTH_USER_KEY
    );


    sessionStorage.removeItem(
        AUTH_USER_KEY
    );

}


/* ============================================================
   CHECK ADMIN FIREBASE USER

   IMPORTANT:

   Firebase Authentication is the source of identity.

   Admin email:
   kalawanesangamaji@gmail.com

   Email must also be verified.
============================================================ */

function isAdminFirebaseUser(
    firebaseUser
) {

    if (!firebaseUser) {

        return false;

    }


    const email =
        String(
            firebaseUser.email || ""
        )
        .trim()
        .toLowerCase();


    return (
        email ===
        ADMIN_EMAIL.toLowerCase()
        &&
        firebaseUser.emailVerified === true
    );

}


/* ============================================================
   CREATE ADMIN SESSION

   Admin does NOT need a Firestore profile document.

   Admin identity comes from Firebase Authentication.
============================================================ */

function createAdminSession(
    firebaseUser
) {

    return {

        uid:
            firebaseUser.uid,

        id:
            firebaseUser.uid,

        email:
            firebaseUser.email || ADMIN_EMAIL,

        fullName:
            firebaseUser.displayName ||
            "LankaQuest Administrator",

        accountType:
            "admin",

        role:
            "admin",

        emailVerified:
            firebaseUser.emailVerified === true

    };

}


/* ============================================================
   CREATE GUIDE SESSION OBJECT

   Firestore:
   lankaQuestGuides/{UID}
============================================================ */

function createGuideSession(
    guide,
    uid
) {

    return {

        uid:
            uid,

        id:
            uid,

        guideId:
            uid,

        accountType:
            "guide",

        fullName:
            guide.fullName || "",

        email:
            guide.email || "",

        phone:
            guide.phone || "",

        province:
            guide.province || "",

        district:
            guide.district || "",

        languages:
            Array.isArray(
                guide.languages
            )
                ? guide.languages
                : [],

        specializations:
            Array.isArray(
                guide.specializations
            )
                ? guide.specializations
                : [],

        experience:
            guide.experience || "",

        areasCovered:
            guide.areasCovered || "",

        profileImage:
            guide.profileImage || "",

        verificationStatus:
            guide.verificationStatus ||
            "pending",

        status:
            guide.status ||
            "pending",

        profileStatus:
            guide.profileStatus ||
            "inactive",

        isActive:
            guide.isActive === true,

        rating:
            guide.rating || 0,

        reviewCount:
            guide.reviewCount || 0

    };

}


/* ============================================================
   CREATE TOURIST SESSION OBJECT

   Firestore:
   lankaQuestTourists/{UID}
============================================================ */

function createTouristSession(
    tourist,
    uid
) {

    return {

        uid:
            uid,

        id:
            uid,

        accountType:
            "tourist",

        fullName:
            tourist.fullName || "",

        email:
            tourist.email || "",

        phone:
            tourist.phone || "",

        country:
            tourist.country || ""

    };

}


/* ============================================================
   GOOGLE LOGIN

   IMPORTANT FIX:

   Admin Google account is handled BEFORE checking
   lankaQuestGuides or lankaQuestTourists.

   Therefore the Admin does NOT need a Firestore profile.
============================================================ */

async function googleLogin() {

    try {

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );


        const firebaseUser =
            result.user;


        console.log(
            "Google UID:",
            firebaseUser.uid
        );


        console.log(
            "Google Email:",
            firebaseUser.email
        );


        /* ====================================================
           ADMIN CHECK
        ==================================================== */

        if (
            isAdminFirebaseUser(
                firebaseUser
            )
        ) {

            const adminUser =
                createAdminSession(
                    firebaseUser
                );


            saveCurrentUser(
                adminUser,
                true
            );


            console.log(
                "Admin Google login successful."
            );


            return {

                success:
                    true,

                user:
                    adminUser

            };

        }


        /* ====================================================
           GUIDE PROFILE CHECK
        ==================================================== */

        const guideRef =
            doc(
                db,
                "lankaQuestGuides",
                firebaseUser.uid
            );


        const guideSnap =
            await getDoc(
                guideRef
            );


        if (
            guideSnap.exists()
        ) {

            const guideData =
                guideSnap.data();


            const guideUser =
                createGuideSession(
                    guideData,
                    firebaseUser.uid
                );


            saveCurrentUser(
                guideUser,
                true
            );


            return {

                success:
                    true,

                user:
                    guideUser

            };

        }


        /* ====================================================
           TOURIST PROFILE CHECK
        ==================================================== */

        const touristRef =
            doc(
                db,
                "lankaQuestTourists",
                firebaseUser.uid
            );


        const touristSnap =
            await getDoc(
                touristRef
            );


        if (
            touristSnap.exists()
        ) {

            const touristData =
                touristSnap.data();


            const touristUser =
                createTouristSession(
                    touristData,
                    firebaseUser.uid
                );


            saveCurrentUser(
                touristUser,
                true
            );


            return {

                success:
                    true,

                user:
                    touristUser

            };

        }


        /* ====================================================
           PROFILE NOT FOUND
        ==================================================== */

        await signOut(
            auth
        );


        clearUserSession();


        return {

            success:
                false,

            message:
                "Google account is authenticated, but no LankaQuest profile was found. Please complete registration."

        };


    } catch (error) {

        console.error(
            "Google Login Error:",
            error
        );


        /*
           User closed the Google popup.
        */

        if (
            error.code ===
            "auth/popup-closed-by-user"
        ) {

            return {

                success:
                    false,

                message:
                    "Google sign-in was cancelled."

            };

        }


        /*
           Popup blocked.
        */

        if (
            error.code ===
            "auth/popup-blocked"
        ) {

            return {

                success:
                    false,

                message:
                    "Google sign-in popup was blocked by the browser."

            };

        }


        /*
           Unauthorized domain.
        */

        if (
            error.code ===
            "auth/unauthorized-domain"
        ) {

            return {

                success:
                    false,

                message:
                    "This website domain is not authorized for Google sign-in in Firebase Authentication."

            };

        }


        return {

            success:
                false,

            message:
                error.message ||
                "Google login failed."

        };

    }

}


/* ============================================================
   FIREBASE EMAIL + PASSWORD LOGIN

   IMPORTANT FIX:

   Admin account is checked immediately after Firebase Auth.

   Admin does NOT need a Firestore profile.
============================================================ */

async function firebaseLogin(
    email,
    password,
    remember = true
) {

    try {

        const normalizedEmail =
            String(
                email || ""
            )
            .trim()
            .toLowerCase();


        /* ====================================================
           FIREBASE AUTHENTICATION
        ==================================================== */

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                normalizedEmail,
                password
            );


        const firebaseUser =
            userCredential.user;


        const uid =
            firebaseUser.uid;


        console.log(
            "Firebase UID:",
            uid
        );


        console.log(
            "Firebase Email:",
            firebaseUser.email
        );


        /* ====================================================
           ADMIN CHECK
        ==================================================== */

        if (
            isAdminFirebaseUser(
                firebaseUser
            )
        ) {

            const adminUser =
                createAdminSession(
                    firebaseUser
                );


            saveCurrentUser(
                adminUser,
                remember
            );


            console.log(
                "Admin email/password login successful."
            );


            return {

                success:
                    true,

                user:
                    adminUser

            };

        }


        /*
           If the email belongs to the Admin address but
           Firebase says the email is not verified, do not
           create an Admin session.

           This matches the Firestore Rules requirement.
        */

        if (
            normalizedEmail ===
            ADMIN_EMAIL.toLowerCase()
            &&
            firebaseUser.emailVerified !== true
        ) {

            await signOut(
                auth
            );


            clearUserSession();


            return {

                success:
                    false,

                message:
                    "Admin email must be verified before administrator access is allowed."

            };

        }


        /* ====================================================
           GUIDE PROFILE CHECK
        ==================================================== */

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


        if (
            guideSnap.exists()
        ) {

            const guideData =
                guideSnap.data();


            const guideUser =
                createGuideSession(
                    guideData,
                    uid
                );


            saveCurrentUser(
                guideUser,
                remember
            );


            return {

                success:
                    true,

                user:
                    guideUser

            };

        }


        /* ====================================================
           TOURIST PROFILE CHECK
        ==================================================== */

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


        if (
            touristSnap.exists()
        ) {

            const touristData =
                touristSnap.data();


            const touristUser =
                createTouristSession(
                    touristData,
                    uid
                );


            saveCurrentUser(
                touristUser,
                remember
            );


            return {

                success:
                    true,

                user:
                    touristUser

            };

        }


        /* ====================================================
           FIREBASE ACCOUNT EXISTS BUT PROFILE DOES NOT
        ==================================================== */

        await signOut(
            auth
        );


        clearUserSession();


        return {

            success:
                false,

            message:
                "Account profile not found. Please contact support."

        };


    } catch (error) {

        console.error(
            "Firebase Login Error:",
            error
        );


        let message =
            "Login failed. Please try again.";


        if (
            error.code ===
            "auth/user-not-found"
        ) {

            message =
                "No account found with this email.";

        }


        else if (
            error.code ===
            "auth/wrong-password"
        ) {

            message =
                "Incorrect password.";

        }


        else if (
            error.code ===
            "auth/invalid-credential"
        ) {

            message =
                "Invalid email or password.";

        }


        else if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "Invalid email address.";

        }


        else if (
            error.code ===
            "auth/user-disabled"
        ) {

            message =
                "This account has been disabled.";

        }


        else if (
            error.code ===
            "auth/too-many-requests"
        ) {

            message =
                "Too many login attempts. Please try again later.";

        }


        else if (
            error.code ===
            "auth/network-request-failed"
        ) {

            message =
                "Network error. Please check your internet connection.";

        }


        return {

            success:
                false,

            message:
                message

        };

    }

}


/* ============================================================
   LOGIN USER WRAPPER

   Compatible with login.js
============================================================ */

async function loginUser(
    email,
    password,
    remember = true
) {

    return await firebaseLogin(
        email,
        password,
        remember
    );

}


/* ============================================================
   LOGOUT USER

   Firebase Auth logout
   +
   Clear application session
============================================================ */

async function logoutUser() {

    try {

        await signOut(
            auth
        );


        clearUserSession();


        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            "Logout Error:",
            error
        );

    }

}


/* ============================================================
   REQUIRE ACCOUNT TYPE

   Used by:

   tourist-dashboard.js
   guide-dashboard.js
============================================================ */

function requireAccountType(
    requiredType
) {

    const user =
        getCurrentUser();


    if (!user) {

        window.location.href =
            "login.html";


        return null;

    }


    if (
        user.accountType !==
        requiredType
    ) {

        alert(
            "Access denied."
        );


        redirectAfterLogin(
            user
        );


        return null;

    }


    return user;

}


/* ============================================================
   REQUIRE ADMIN

   Use this on future Admin pages if required.

   IMPORTANT:

   This is only a client-side navigation check.
   Firestore Security Rules remain the real protection.
============================================================ */

function requireAdmin() {

    const user =
        getCurrentUser();


    if (!user) {

        window.location.href =
            "login.html";


        return null;

    }


    if (
        user.accountType !==
        "admin"
        ||
        user.email.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
    ) {

        alert(
            "Administrator access denied."
        );


        redirectAfterLogin(
            user
        );


        return null;

    }


    return user;

}


/* ============================================================
   GUIDE DASHBOARD ACCESS CHECK

   Only approved active guides.
============================================================ */

function canAccessGuideDashboard(
    user
) {

    if (!user) {

        return false;

    }


    if (
        user.accountType !==
        "guide"
    ) {

        return false;

    }


    return (

        user.verificationStatus ===
            "approved"

        &&

        user.status ===
            "approved"

        &&

        user.profileStatus ===
            "active"

        &&

        user.isActive === true

    );

}


/* ============================================================
   REDIRECT AFTER LOGIN

   Admin
       ↓
   admin-guides.html

   Tourist
       ↓
   tourist-dashboard.html

   Approved Guide
       ↓
   guide-dashboard.html

   Pending / Rejected / Inactive Guide
       ↓
   guide-verification.html
============================================================ */

function redirectAfterLogin(
    user
) {

    if (!user) {

        window.location.href =
            "login.html";


        return;

    }


    /* ========================================================
       ADMIN
    ======================================================== */

    if (
        user.accountType ===
        "admin"
        &&
        String(
            user.email || ""
        )
        .toLowerCase() ===
        ADMIN_EMAIL.toLowerCase()
    ) {

        window.location.href =
            "admin-guides.html";


        return;

    }


    /* ========================================================
       TOURIST
    ======================================================== */

    if (
        user.accountType ===
        "tourist"
    ) {

        window.location.href =
            "tourist-dashboard.html";


        return;

    }


    /* ========================================================
       GUIDE
    ======================================================== */

    if (
        user.accountType ===
        "guide"
    ) {

        if (
            canAccessGuideDashboard(
                user
            )
        ) {

            window.location.href =
                "guide-dashboard.html";


            return;

        }


        /*
           Pending
           Rejected
           Inactive
        */

        window.location.href =
            "guide-verification.html";


        return;

    }


    /* ========================================================
       UNKNOWN ACCOUNT
    ======================================================== */

    window.location.href =
        "index.html";

}


/* ============================================================
   CHECK LOGIN STATUS

   Application session cache.
============================================================ */

function isLoggedIn() {

    return (
        getCurrentUser() !==
        null
    );

}


/* ============================================================
   RESTORE USER SESSION

   This does not authenticate a user by itself.
   Firebase Authentication remains the real identity system.
============================================================ */

function restoreUserSession() {

    const user =
        getCurrentUser();


    if (user) {

        console.log(
            "Active User:",
            user
        );

    }

}


/* ============================================================
   INITIALIZE AUTH
============================================================ */

restoreUserSession();


/* ============================================================
   EXPORTS
============================================================ */

export {

    getCurrentUser,

    loginUser,

    logoutUser,

    requireAccountType,

    requireAdmin,

    redirectAfterLogin,

    isLoggedIn,

    googleLogin

};

