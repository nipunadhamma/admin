
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

   Firebase Authentication is the ONLY
   authentication/session source.

   localStorage/sessionStorage are NOT used
   for authentication state.
============================================================ */


/* ============================================================
   1. FIREBASE IMPORTS
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
   2. ADMIN CONFIGURATION
============================================================ */

const ADMIN_EMAIL =
    "kalawanesangamaji@gmail.com";


/* ============================================================
   3. GOOGLE PROVIDER
============================================================ */

const googleProvider =
    new GoogleAuthProvider();


/* ============================================================
   4. GET CURRENT FIREBASE USER

   FIREBASE AUTHENTICATION IS THE ONLY
   AUTHORITATIVE IDENTITY SOURCE.
============================================================ */

function getCurrentUser() {

    return auth.currentUser || null;

}


/* ============================================================
   5. CHECK ADMIN FIREBASE USER
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
   6. CREATE ADMIN SESSION OBJECT

   Admin does NOT need a Firestore profile.
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
   7. CREATE GUIDE SESSION OBJECT

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
            guide.phone || guide.phoneNumber || "",

        province:
            guide.province || "",

        district:
            guide.district || "",

        languages:
            Array.isArray(
                guide.languages
            )
                ? guide.languages
                : guide.languages
                    ? [guide.languages]
                    : guide.language
                        ? [guide.language]
                        : [],

        specializations:
            Array.isArray(
                guide.specializations
            )
                ? guide.specializations
                : guide.specializations
                    ? [guide.specializations]
                    : guide.specialization
                        ? [guide.specialization]
                        : [],

        experience:
            guide.experience ||
            guide.experienceYears ||
            "",

        areasCovered:
            guide.areasCovered ||
            guide.areas ||
            guide.coverageAreas ||
            "",

        profileImage:
            guide.profileImage ||
            guide.photoURL ||
            guide.photo ||
            "",

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
            Number(
                guide.rating ||
                guide.averageRating ||
                0
            ),

        reviewCount:
            Number(
                guide.reviewCount ||
                guide.reviewsCount ||
                0
            )

    };

}


/* ============================================================
   8. CREATE TOURIST SESSION OBJECT

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
   9. GOOGLE LOGIN

   Google
      ↓
   Firebase Authentication
      ↓
   Firebase UID
      ↓
   Admin?
      ↓
   Guide?
      ↓
   Tourist?
      ↓
   Registration
============================================================ */

async function googleLogin() {

    try {

        /* ====================================================
           GOOGLE AUTHENTICATION
        ==================================================== */

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );


        const firebaseUser =
            result.user;


        if (!firebaseUser) {

            return {

                success:
                    false,

                message:
                    "Google authentication failed."

            };

        }


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


            console.log(
                "Admin Google login successful.",
                adminUser
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


            console.log(
                "LankaQuest guide profile found.",
                guideData
            );


            const guideUser =
                createGuideSession(
                    guideData,
                    firebaseUser.uid
                );


            console.log(
                "Guide Google login successful.",
                guideUser
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


            console.log(
                "LankaQuest tourist profile found.",
                touristData
            );


            const touristUser =
                createTouristSession(
                    touristData,
                    firebaseUser.uid
                );


            console.log(
                "Tourist Google login successful.",
                touristUser
            );


            return {

                success:
                    true,

                user:
                    touristUser

            };

        }


        /* ====================================================
           NO LANKAQUEST PROFILE

           IMPORTANT:

           DO NOT signOut(auth).

           Firebase Google authentication must remain
           active so registration can continue.
        ==================================================== */

        console.log(
            "Google authentication successful."
        );


        console.log(
            "No LankaQuest profile found."
        );


        return {

            success:
                true,

            user:
                firebaseUser,

            profile:
                null,

            accountType:
                null,

            needsRegistration:
                true

        };


    } catch (error) {

        console.error(
            "Google Login Error:",
            error
        );


        /* ====================================================
           USER CLOSED POPUP
        ==================================================== */

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


        /* ====================================================
           POPUP ALREADY OPEN
        ==================================================== */

        if (
            error.code ===
            "auth/cancelled-popup-request"
        ) {

            return {

                success:
                    false,

                message:
                    "A Google sign-in window is already open."

            };

        }


        /* ====================================================
           POPUP BLOCKED
        ==================================================== */

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


        /* ====================================================
           UNAUTHORIZED DOMAIN
        ==================================================== */

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


        /* ====================================================
           DEFAULT ERROR
        ==================================================== */

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
   10. FIREBASE EMAIL + PASSWORD LOGIN

   Email + Password remains enabled.

   No localStorage/sessionStorage is used.
============================================================ */

async function firebaseLogin(
    email,
    password
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


        /* ====================================================
           ADMIN EMAIL VERIFICATION
        ==================================================== */

        if (
            normalizedEmail ===
            ADMIN_EMAIL.toLowerCase()

            &&

            firebaseUser.emailVerified !== true
        ) {

            await signOut(
                auth
            );


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


            console.log(
                "Guide email/password login successful.",
                guideUser
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


            console.log(
                "Tourist email/password login successful.",
                touristUser
            );


            return {

                success:
                    true,

                user:
                    touristUser

            };

        }


        /* ====================================================
           FIREBASE ACCOUNT WITHOUT PROFILE
        ==================================================== */

        await signOut(
            auth
        );


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
   11. LOGIN USER WRAPPER

   Compatible with login.js
============================================================ */

async function loginUser(
    email,
    password
) {

    return await firebaseLogin(
        email,
        password
    );

}


/* ============================================================
   12. LOGOUT USER

   Firebase Auth is the only session authority.
============================================================ */

async function logoutUser() {

    try {

        await signOut(
            auth
        );


        console.log(
            "Firebase logout successful."
        );


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
   13. REQUIRE ACCOUNT TYPE

   Used by:

   tourist-dashboard.js
   guide-dashboard.js
============================================================ */

function requireAccountType(
    requiredType
) {

    const firebaseUser =
        getCurrentUser();


    if (!firebaseUser) {

        window.location.href =
            "login.html";


        return null;

    }


    /*
       This function only has the Firebase user
       at this point.

       Pages that need the Firestore profile should
       load it using firebaseUser.uid.
    */

    return firebaseUser;

}


/* ============================================================
   14. REQUIRE ADMIN

   Firebase Authentication is the identity source.

   Firestore Rules remain the real protection.
============================================================ */

function requireAdmin() {

    const firebaseUser =
        getCurrentUser();


    if (!firebaseUser) {

        window.location.href =
            "login.html";


        return null;

    }


    if (
        !isAdminFirebaseUser(
            firebaseUser
        )
    ) {

        alert(
            "Administrator access denied."
        );


        window.location.href =
            "index.html";


        return null;

    }


    return firebaseUser;

}


/* ============================================================
   15. GUIDE DASHBOARD ACCESS CHECK

   NOTE:

   This function receives the Firestore guide
   profile/session object.

   The exact Firestore status structure will be
   verified separately.
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
   16. REDIRECT AFTER LOGIN

   NOTE:

   login.js should call this only after it has
   received the appropriate user/profile object.
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
   17. CHECK LOGIN STATUS

   Firebase Authentication only.
============================================================ */

function isLoggedIn() {

    return (
        getCurrentUser() !==
        null
    );

}


/* ============================================================
   18. RESTORE USER SESSION

   Firebase automatically restores the authenticated
   session. No localStorage/sessionStorage cache is needed.
============================================================ */

function restoreUserSession() {

    const user =
        getCurrentUser();


    if (user) {

        console.log(
            "Firebase authenticated user:",
            user.uid,
            user.email
        );

    }

}


/* ============================================================
   19. INITIALIZE AUTH
============================================================ */

restoreUserSession();


/* ============================================================
   20. EXPORTS
============================================================ */

export {

    getCurrentUser,

    loginUser,

    logoutUser,

    requireAccountType,

    requireAdmin,

    redirectAfterLogin,

    isLoggedIn,

    googleLogin,

    canAccessGuideDashboard

};
