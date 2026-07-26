/* ============================================================
REGISTRATION SYSTEM
Explore Sri Lanka

Account Types:

🧳 Tourist
🧑‍💼 Guide

Future Architecture:

Registration
↓
Authentication Backend
↓
Account Type
↓
Tourist Dashboard / Guide Dashboard
============================================================ */

/* ============================================================

1. DOM ELEMENTS
   ============================================================ */

const registrationForm =
document.getElementById(
"registrationForm"
);

const accountTypeInputs =
document.querySelectorAll(
'input[name="accountType"]'
);

const touristFields =
document.getElementById(
"touristFields"
);

const guideFields =
document.getElementById(
"guideFields"
);

const registrationMessage =
document.getElementById(
"registrationMessage"
);

/* ============================================================
2. GET SELECTED ACCOUNT TYPE
============================================================ */

function getSelectedAccountType() {


const selected =
    document.querySelector(
        'input[name="accountType"]:checked'
    );


return selected
    ? selected.value
    : "tourist";


}

/* ============================================================
3. SWITCH ACCOUNT TYPE
============================================================ */

function updateAccountTypeFields() {


const accountType =
    getSelectedAccountType();


/*
   Tourist Account
*/

if (
    accountType === "tourist"
) {

    touristFields.classList.remove(
        "hidden"
    );


    guideFields.classList.add(
        "hidden"
    );


    /*
       Guide fields required නොවෙන්න
    */

    document
        .getElementById("phone")
        .required = false;


    document
        .getElementById("guideDistrict")
        .required = false;


    document
        .getElementById("languages")
        .required = false;


    document
        .getElementById("experience")
        .required = false;

}


/*
   Guide Account
*/

else {

    touristFields.classList.add(
        "hidden"
    );


    guideFields.classList.remove(
        "hidden"
    );


    /*
       Guide fields required කරන්න
    */

    document
        .getElementById("phone")
        .required = true;


    document
        .getElementById("guideDistrict")
        .required = true;


    document
        .getElementById("languages")
        .required = true;


    document
        .getElementById("experience")
        .required = true;

}


}

/* ============================================================
4. ACCOUNT TYPE EVENTS
============================================================ */

accountTypeInputs.forEach(
input => {


    input.addEventListener(
        "change",
        updateAccountTypeFields
    );

}


);

/* ============================================================
5. SHOW MESSAGE
============================================================ */

function showRegistrationMessage(
message,
type = "success"
) {


registrationMessage.textContent =
    message;


registrationMessage.style.display =
    "block";


if (
    type === "error"
) {

    registrationMessage.style.background =
        "#fff0f0";

    registrationMessage.style.color =
        "#b42318";

}

else {

    registrationMessage.style.background =
        "#edf8f1";

    registrationMessage.style.color =
        "#176044";

}


}

/* ============================================================
6. FORM SUBMIT
============================================================ */

registrationForm.addEventListener(
"submit",
event => {


    /*
       Default form submit stop කරන්න
    */

    event.preventDefault();


    /*
       Account Type
    */

    const accountType =
        getSelectedAccountType();


    /*
       Common Data
    */

    const fullName =
        document
            .getElementById("fullName")
            .value
            .trim();


    const email =
        document
            .getElementById("email")
            .value
            .trim();


    const password =
        document
            .getElementById("password")
            .value;


    const confirmPassword =
        document
            .getElementById("confirmPassword")
            .value;


    /*
       Password Check
    */

    if (
        password !==
        confirmPassword
    ) {

        showRegistrationMessage(
            "Passwords do not match.",
            "error"
        );

        return;

    }


    /*
       Basic Account Object
    */

    const account = {

        accountType:
            accountType,

        fullName:
            fullName,

        email:
            email,

        /*
           IMPORTANT:
           Real application එකේ password
           මෙහෙම store කරන්න එපා.

           Backend authentication system
           එකකට connect කළ යුතුයි.
        */

        createdAt:
            new Date().toISOString()

    };


    /*
       Tourist Data
    */

    if (
        accountType === "tourist"
    ) {

        account.country =
            document
                .getElementById("country")
                .value
                .trim();

    }


    /*
       Guide Data
    */

    if (
        accountType === "guide"
    ) {

        account.phone =
            document
                .getElementById("phone")
                .value
                .trim();


        account.district =
            document
                .getElementById(
                    "guideDistrict"
                )
                .value;


        account.languages =
            document
                .getElementById("languages")
                .value
                .trim();


        account.experience =
            document
                .getElementById("experience")
                .value;


        /*
           New Guide Account
           Default Verification Status
        */

        account.verificationStatus =
            "pending";


        /*
           Guide Account
           Default Active Status
        */

        account.status =
            "pending";

    }


    /*
       Future Backend API
       මෙතැනින් backend එකට
       registration request යවන්න පුළුවන්.
    */

    console.log(
        "Registration Data:",
        account
    );


    /*
       Temporary Success Message
    */

    if (
        accountType === "guide"
    ) {

        showRegistrationMessage(
            "Guide registration submitted successfully. Your account will be reviewed for verification."
        );

    }

    else {

        showRegistrationMessage(
            "Tourist account registration prepared successfully."
        );

    }


    /*
       Future:

       API call

       registerUser(account)

       Then redirect:

       Tourist
       → tourist-dashboard.html

       Guide
       → guide-dashboard.html

    */

}


);

/* ============================================================
7. INITIALIZE
============================================================ */

document.addEventListener(
"DOMContentLoaded",
() => {


    updateAccountTypeFields();

}


);
