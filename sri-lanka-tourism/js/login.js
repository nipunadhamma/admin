
/* ============================================================
   LOGIN PAGE LOGIC
   Explore Sri Lanka

   NORMAL LOGIN FLOW:

   Tourist
      ↓
   Tourist Dashboard

   Guide
      ↓
   Guide Dashboard


   QUOTATION FLOW:

   Trip Planner
      ↓
   Request Quotation
      ↓
   Login Required
      ↓
   login.html?redirect=quotation-request.html
      ↓
   Successful Tourist Login
      ↓
   quotation-request.html


   FIND GUIDE FLOW:

   Find Guides
      ↓
   Select Guide
      ↓
   Login Required
      ↓
   login.html?redirect=find-guides.html
      ↓
   Successful Tourist Login
      ↓
   find-guides.html

============================================================ */


/* ============================================================
   1. DOM ELEMENTS
============================================================ */

const loginForm =
    document.getElementById(
        "loginForm"
    );


const loginEmail =
    document.getElementById(
        "loginEmail"
    );


const loginPassword =
    document.getElementById(
        "loginPassword"
    );


const rememberMe =
    document.getElementById(
        "rememberMe"
    );


const loginMessage =
    document.getElementById(
        "loginMessage"
    );


const togglePassword =
    document.getElementById(
        "togglePassword"
    );


/* ============================================================
   2. SHOW LOGIN MESSAGE
============================================================ */

function showLoginMessage(

    message,

    type = "error"

) {

    if (!loginMessage) {

        return;

    }


    loginMessage.textContent =
        message;


    loginMessage.style.display =
        "block";


    /*
       Success
    */

    if (
        type ===
        "success"
    ) {

        loginMessage.style.background =
            "#edf8f1";


        loginMessage.style.color =
            "#176044";

    }


    /*
       Error
    */

    else {

        loginMessage.style.background =
            "#fff0f0";


        loginMessage.style.color =
            "#b42318";

    }

}


/* ============================================================
   3. PASSWORD VISIBILITY
============================================================ */

if (

    togglePassword &&

    loginPassword

) {

    togglePassword.addEventListener(

        "click",

        () => {

            if (

                loginPassword.type ===
                "password"

            ) {

                loginPassword.type =
                    "text";


                togglePassword.textContent =
                    "🙈";

            }

            else {

                loginPassword.type =
                    "password";


                togglePassword.textContent =
                    "👁️";

            }

        }

    );

}


/* ============================================================
   4. LOGIN FORM
============================================================ */

if (loginForm) {

    loginForm.addEventListener(

        "submit",

        event => {

            /*
               Prevent Reload
            */

            event.preventDefault();


            /*
               Get Email
            */

            const email =

                loginEmail

                    ? loginEmail.value.trim()

                    : "";


            /*
               Get Password
            */

            const password =

                loginPassword

                    ? loginPassword.value

                    : "";


            /*
               Remember Me
            */

            const remember =

                rememberMe

                    ? rememberMe.checked

                    : true;


            /* ====================================================
               EMPTY CHECK
            ==================================================== */

            if (

                !email ||

                !password

            ) {

                showLoginMessage(

                    "Please enter your email and password.",

                    "error"

                );

                return;

            }


            /* ====================================================
               LOGIN
            ==================================================== */

            const result =

                loginUser(

                    email,

                    password,

                    remember

                );


            /* ====================================================
               LOGIN FAILED
            ==================================================== */

            if (

                !result ||

                !result.success

            ) {

                showLoginMessage(

                    result &&
                    result.message

                        ? result.message

                        : "Invalid email or password.",

                    "error"

                );

                return;

            }


            /* ====================================================
               LOGIN SUCCESS
            ==================================================== */

            showLoginMessage(

                "Login successful. Redirecting...",

                "success"

            );


            /* ====================================================
               GET REDIRECT
            ==================================================== */

            const urlParams =

                new URLSearchParams(

                    window.location.search

                );


            const redirectPage =

                urlParams.get(

                    "redirect"

                );


            /* ====================================================
               REDIRECT
            ==================================================== */

            setTimeout(

                () => {

                    /* =================================================
                       1. QUOTATION REQUEST FLOW
                    ================================================= */

                    if (

                        redirectPage ===
                        "quotation-request.html"

                    ) {

                        /*
                           Only Tourist
                        */

                        if (

                            result.user.accountType ===
                            "tourist"

                        ) {

                            window.location.href =

                                "quotation-request.html";

                            return;

                        }


                        /*
                           Guide cannot submit
                           Tourist quotation request.
                        */

                        alert(

                            "Only Tourist accounts can submit quotation requests."

                        );


                        /*
                           Keep Guide in
                           Guide Dashboard
                        */

                        if (

                            result.user.accountType ===
                            "guide"

                        ) {

                            window.location.href =

                                "guide-dashboard.html";

                            return;

                        }


                        return;

                    }


                    /* =================================================
                       2. FIND GUIDES FLOW
                    ================================================= */

                    if (

                        redirectPage ===
                        "find-guides.html"

                    ) {

                        /*
                           Only Tourist
                        */

                        if (

                            result.user.accountType ===
                            "tourist"

                        ) {

                            window.location.href =

                                "find-guides.html";

                            return;

                        }


                        /*
                           Guide cannot select
                           guide as Tourist.
                        */

                        alert(

                            "Only Tourist accounts can select a guide."

                        );


                        if (

                            result.user.accountType ===
                            "guide"

                        ) {

                            window.location.href =

                                "guide-dashboard.html";

                            return;

                        }


                        return;

                    }


                    /* =================================================
                       3. NORMAL LOGIN FLOW
                    ================================================= */

                    if (

                        typeof redirectAfterLogin ===
                        "function"

                    ) {

                        redirectAfterLogin(

                            result.user

                        );

                        return;

                    }


                    /*
                       Fallback
                    */

                    window.location.href =
                        "index.html";

                },

                700

            );

        }

    );

}


/* ============================================================
   5. FORGOT PASSWORD
============================================================ */

const forgotPassword =

    document.getElementById(

        "forgotPassword"

    );


if (forgotPassword) {

    forgotPassword.addEventListener(

        "click",

        event => {

            /*
               Prevent Default
            */

            event.preventDefault();


            /*
               Temporary Demo Message
            */

            alert(

                "Password recovery will be connected to the authentication backend in the next phase."

            );

        }

    );

}

