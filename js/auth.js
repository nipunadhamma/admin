
/* ============================================================
   AUTHENTICATION CORE
   Explore Sri Lanka

   RESPONSIBILITIES:

   🔐 Login State
   👤 Current User
   🧳 Tourist Account
   🧑‍💼 Guide Account
   🛡️ Guide Verification
   🚪 Logout
   🔄 Normal Login Redirect

   ARCHITECTURE:

   Tourist Account
       ↓
   Tourist Dashboard
       ↓
   Trip Planner
       ↓
   Quotation
       ↓
   Find Guide

   Guide Account
       ↓
   Guide Dashboard
       ↓
   Incoming Requests
       ↓
   Guide Requests
       ↓
   Send Quotation

   FRONTEND DEMO AUTHENTICATION

   Future:
   Backend API
   Database
   Secure Authentication
   JWT / Session
============================================================ */


/* ============================================================
   1. STORAGE KEYS
============================================================ */

const AUTH_USER_KEY =
    "exploreSriLankaCurrentUser";


const DEMO_ACCOUNTS_KEY =
    "exploreSriLankaDemoAccounts";


/* ============================================================
   2. DEMO ACCOUNTS
============================================================ */

const demoAccounts = [

    /* ========================================================
       DEMO TOURIST
    ======================================================== */

    {

        id:
            "tourist-demo-001",

        accountType:
            "tourist",

        fullName:
            "Demo Tourist",

        email:
            "tourist@example.com",

        password:
            "tourist123",

        country:
            "United Kingdom"

    },


    /* ========================================================
       DEMO GUIDE
    ======================================================== */

    {

        id:
            "guide-demo-001",

        accountType:
            "guide",

        fullName:
            "Demo Sri Lanka Guide",

        email:
            "guide@example.com",

        password:
            "guide123",

        phone:
            "+94 77 123 4567",

        district:
            "Kandy",

        languages:
            "English, Sinhala",

        experience:
            "5-10",

        verificationStatus:
            "approved",

        status:
            "active"

    }

];


/* ============================================================
   3. GET CURRENT USER
============================================================ */

function getCurrentUser() {

    /*
       First check localStorage.

       Remember Me = checked
    */

    let savedUser =
        localStorage.getItem(
            AUTH_USER_KEY
        );


    /*
       If not found,
       check sessionStorage.

       Remember Me = unchecked
    */

    if (!savedUser) {

        savedUser =
            sessionStorage.getItem(
                AUTH_USER_KEY
            );

    }


    /*
       No logged-in user
    */

    if (!savedUser) {

        return null;

    }


    /*
       Convert JSON
    */

    try {

        return JSON.parse(
            savedUser
        );

    }

    catch (error) {

        console.error(

            "Authentication data error:",

            error

        );


        /*
           Clear corrupted data
        */

        localStorage.removeItem(
            AUTH_USER_KEY
        );


        sessionStorage.removeItem(
            AUTH_USER_KEY
        );


        return null;

    }

}


/* ============================================================
   4. SAVE CURRENT USER
============================================================ */

function saveCurrentUser(

    user,

    remember = true

) {

    /*
       Remove old sessions
    */

    localStorage.removeItem(
        AUTH_USER_KEY
    );


    sessionStorage.removeItem(
        AUTH_USER_KEY
    );


    /*
       Remember Me
    */

    if (remember) {

        localStorage.setItem(

            AUTH_USER_KEY,

            JSON.stringify(
                user
            )

        );

    }

    else {

        /*
           Temporary Session
        */

        sessionStorage.setItem(

            AUTH_USER_KEY,

            JSON.stringify(
                user
            )

        );

    }

}


/* ============================================================
   5. LOGIN USER
============================================================ */

function loginUser(

    email,

    password,

    remember = true

) {

    /*
       Search Demo Account
    */

    const user =

        demoAccounts.find(

            account =>

                account.email
                    .toLowerCase() ===
                email
                    .trim()
                    .toLowerCase()

                &&

                account.password ===
                password

        );


    /*
       Invalid Login
    */

    if (!user) {

        return {

            success:
                false,

            message:
                "Invalid email or password."

        };

    }


    /*
       Safe User Object

       Password save නොකරයි.
    */

    const safeUser = {

        id:
            user.id,

        accountType:
            user.accountType,

        fullName:
            user.fullName,

        email:
            user.email,

        country:
            user.country || "",

        phone:
            user.phone || "",

        district:
            user.district || "",

        languages:
            user.languages || "",

        experience:
            user.experience || "",

        verificationStatus:
            user.verificationStatus || "",

        status:
            user.status || ""

    };


    /*
       Save Session
    */

    saveCurrentUser(

        safeUser,

        remember

    );


    /*
       Return Login Success
    */

    return {

        success:
            true,

        user:
            safeUser

    };

}


/* ============================================================
   6. LOGOUT
============================================================ */

function logoutUser() {

    /*
       Clear Login Session
    */

    localStorage.removeItem(
        AUTH_USER_KEY
    );


    sessionStorage.removeItem(
        AUTH_USER_KEY
    );


    /*
       Return Home
    */

    window.location.href =
        "index.html";

}


/* ============================================================
   7. CHECK LOGIN
============================================================ */

function isLoggedIn() {

    return (
        getCurrentUser() !== null
    );

}


/* ============================================================
   8. GET ACCOUNT TYPE
============================================================ */

function getAccountType() {

    const user =
        getCurrentUser();


    if (!user) {

        return null;

    }


    return user.accountType;

}


/* ============================================================
   9. GET USER DISPLAY NAME
============================================================ */

function getUserDisplayName() {

    const user =
        getCurrentUser();


    if (!user) {

        return "";

    }


    return (

        user.fullName ||

        user.email ||

        ""

    );

}


/* ============================================================
   10. NORMAL LOGIN REDIRECT
============================================================ */

/*
   මෙම function එක භාවිතා කරන්නේ
   Normal Login එකෙන් පසුව පමණි.

   Tourist
       ↓
   Tourist Dashboard

   Approved Guide
       ↓
   Guide Dashboard

   Unapproved Guide
       ↓
   Guide Verification
*/

function redirectAfterLogin(

    user

) {

    /*
       No User
    */

    if (!user) {

        window.location.href =
            "login.html";

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

        /*
           Approved Guide
        */

        if (
            user.verificationStatus ===
            "approved"
        ) {

            window.location.href =
                "guide-dashboard.html";

            return;

        }


        /*
           Pending / Rejected
        */

        window.location.href =
            "guide-verification.html";

        return;

    }


    /*
       Unknown Account
    */

    window.location.href =
        "index.html";

}


/* ============================================================
   11. REQUIRE LOGIN
============================================================ */

function requireLogin(

    redirectPage =
        "login.html"

) {

    const user =
        getCurrentUser();


    if (!user) {

        window.location.href =
            redirectPage;

        return null;

    }


    return user;

}


/* ============================================================
   12. REQUIRE ACCOUNT TYPE
============================================================ */

function requireAccountType(

    accountType

) {

    const user =
        requireLogin();


    if (!user) {

        return null;

    }


    if (
        user.accountType !==
        accountType
    ) {

        redirectAfterLogin(
            user
        );

        return null;

    }


    return user;

}


/* ============================================================
   13. REQUIRE VERIFIED GUIDE
============================================================ */

function requireVerifiedGuide() {

    const user =
        requireLogin();


    if (!user) {

        return null;

    }


    /*
       Must Be Guide
    */

    if (
        user.accountType !==
        "guide"
    ) {

        redirectAfterLogin(
            user
        );

        return null;

    }


    /*
       Must Be Approved
    */

    if (
        user.verificationStatus !==
        "approved"
    ) {

        window.location.href =
            "guide-verification.html";

        return null;

    }


    return user;

}


/* ============================================================
   14. AUTH DEBUG
============================================================ */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        const user =
            getCurrentUser();


        if (user) {

            console.log(

                "Current User:",

                user

            );

        }

    }

);

