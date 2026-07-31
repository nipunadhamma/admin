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

        lankaQuestGuides
        lankaQuestTourists

            |
            ↓

        Session Cache Only

        exploreSriLankaCurrentUser

            |
            ↓

        Dashboard


   IMPORTANT:

   localStorage is NOT database.

   It is only temporary login session storage.

============================================================ */

/* ============================================================
   FIREBASE IMPORTS
============================================================ */

import { auth, db } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ============================================================
   SESSION KEY ONLY

   NOT DATABASE

============================================================ */

const AUTH_USER_KEY = "exploreSriLankaCurrentUser";

const googleProvider = new GoogleAuthProvider();

/* ============================================================
   GET CURRENT USER

   Reads current login session

============================================================ */

function getCurrentUser() {
  let savedUser = localStorage.getItem(AUTH_USER_KEY);

  if (!savedUser) {
    savedUser = sessionStorage.getItem(AUTH_USER_KEY);
  }

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch (error) {
    console.error(
      "User session error:",

      error,
    );

    clearUserSession();

    return null;
  }
}

/* ============================================================
   SAVE CURRENT USER

   Session cache only

============================================================ */

function saveCurrentUser(
  user,

  remember = true,
) {
  clearUserSession();

  const storage = remember ? localStorage : sessionStorage;

  storage.setItem(
    AUTH_USER_KEY,

    JSON.stringify(user),
  );
}

/* ============================================================
   CLEAR USER SESSION

============================================================ */

function clearUserSession() {
  localStorage.removeItem(AUTH_USER_KEY);

  sessionStorage.removeItem(AUTH_USER_KEY);
}

/* ============================================================
   CREATE GUIDE SESSION OBJECT


   Firestore:

   lankaQuestGuides/{UID}

============================================================ */

function createGuideSession(
  guide,

  uid,
) {
  return {
    uid: uid,

    id: uid,

    guideId: uid,

    accountType: "guide",

    fullName: guide.fullName || "",

    email: guide.email || "",

    phone: guide.phone || "",

    province: guide.province || "",

    district: guide.district || "",

    languages: Array.isArray(guide.languages) ? guide.languages : [],

    specializations: Array.isArray(guide.specializations)
      ? guide.specializations
      : [],

    experience: guide.experience || "",

    areasCovered: guide.areasCovered || "",

    profileImage: guide.profileImage || "",

    verificationStatus: guide.verificationStatus || "pending",

    status: guide.status || "pending",

    profileStatus: guide.profileStatus || "inactive",

    isActive: guide.isActive === true,

    rating: guide.rating || 0,

    reviewCount: guide.reviewCount || 0,
  };
}

/* ============================================================
   CREATE TOURIST SESSION OBJECT


   Firestore:

   lankaQuestTourists/{UID}

============================================================ */

function createTouristSession(
  tourist,

  uid,
) {
  return {
    uid: uid,

    id: uid,

    accountType: "tourist",

    fullName: tourist.fullName || "",

    email: tourist.email || "",

    phone: tourist.phone || "",

    country: tourist.country || "",
  };
}

/* ============================================================
   GOOGLE LOGIN

   Firebase Authentication
          |
          ↓
   Google Account
          |
          ↓
   Firebase UID
          |
          ↓
   Firestore Profile

   lankaQuestTourists
   lankaQuestGuides

============================================================ */


async function googleLogin(){


    try{


        const provider =
            new GoogleAuthProvider();



        const result =
            await signInWithPopup(

                auth,

                provider

            );



        const firebaseUser =
            result.user;



        const uid =
            firebaseUser.uid;



        console.log(
            "Google UID:",
            uid
        );



        /*
            CHECK GUIDE PROFILE

            lankaQuestGuides/{UID}

        */


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



        if(
            guideSnap.exists()
        ){


            const guideData =
                guideSnap.data();



            const guideUser =
                createGuideSession(

                    guideData,

                    uid

                );



            saveCurrentUser(

                guideUser,

                true

            );



            return {

                success:true,

                user:guideUser

            };


        }





        /*
            CHECK TOURIST PROFILE

            lankaQuestTourists/{UID}

        */


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



        if(
            touristSnap.exists()
        ){


            const touristData =
                touristSnap.data();



            const touristUser =
                createTouristSession(

                    touristData,

                    uid

                );



            saveCurrentUser(

                touristUser,

                true

            );



            return {


                success:true,


                user:touristUser


            };


        }





        /*
            Firebase account exists

            But Firestore profile missing

        */


        await signOut(auth);



        return {


            success:false,


            message:

            "Google account registered but profile not found. Please complete registration."


        };



    }



    catch(error){


        console.error(

            "Google Login Error:",

            error

        );



        return {


            success:false,


            message:

            error.message || 
            "Google login failed."


        };


    }


}
/* ============================================================
   FIREBASE LOGIN

   FLOW:

   Email + Password

        ↓

   Firebase Authentication

        ↓

   Firebase UID

        ↓

   Firestore Profile

        ↓

   Create Session

============================================================ */


async function firebaseLogin(

    email,

    password,

    remember = true ){


    try{


        /*
            Firebase Authentication Login
        */


        const userCredential =

            await signInWithEmailAndPassword(

                auth,

                email,

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





        /* ====================================================
           CHECK GUIDE PROFILE


           Firestore:

           lankaQuestGuides

           Document:

           UID

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





        if(

            guideSnap.exists()

        ){



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


                success:true,


                user:guideUser


            };



        }





        /* ====================================================
           CHECK TOURIST PROFILE


           Firestore:

           lankaQuestTourists

           Document:

           UID

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






        if(

            touristSnap.exists()

        ){



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


                success:true,


                user:touristUser


            };



        }







        /*
            Firebase account exists

            But Firestore profile missing

        */



        await signOut(

            auth

        );





        return {


            success:false,


            message:

            "Account profile not found. Please contact support."



        };



    }



    catch(error){



        console.error(

            "Firebase Login Error:",

            error

        );




        let message =

            "Login failed. Please try again.";







        if(

            error.code ===

            "auth/user-not-found"

        ){


            message =

            "No account found with this email.";


        }





        else if(

            error.code ===

            "auth/wrong-password"

        ){


            message =

            "Incorrect password.";


        }






        else if(

            error.code ===

            "auth/invalid-credential"

        ){


            message =

            "Invalid email or password.";


        }






        else if(

            error.code ===

            "auth/invalid-email"

        ){


            message =

            "Invalid email address.";


        }






        return {


            success:false,


            message:message



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

){


    return await firebaseLogin(

        email,

        password,

        remember

    );


}








/* ============================================================
   LOGOUT USER


   Firebase Auth Logout

   + Clear Session

============================================================ */


async function logoutUser(){



    try{



        await signOut(

            auth

        );





        clearUserSession();





        window.location.href =

            "index.html";




    }


    catch(error){



        console.error(

            "Logout Error:",

            error

        );



    }


}
/* ============================================================
   REQUIRE ACCOUNT TYPE


   Used in:

   tourist-dashboard.js

   guide-dashboard.js


============================================================ */


function requireAccountType(

    requiredType

){


    const user =

        getCurrentUser();





    if(!user){


        window.location.href =

            "login.html";


        return null;


    }






    if(

        user.accountType !== requiredType

    ){



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
   GUIDE DASHBOARD ACCESS CHECK


   Only approved active guides


============================================================ */


function canAccessGuideDashboard(

    user

){


    if(!user){


        return false;


    }





    if(

        user.accountType !== "guide"

    ){


        return false;


    }





    return (


        user.verificationStatus === "approved"


        &&


        user.status === "approved"


        &&


        user.profileStatus === "active"


        &&


        user.isActive === true


    );



}









/* ============================================================
   REDIRECT AFTER LOGIN


   Tourist
        ↓
   tourist-dashboard.html


   Approved Guide
        ↓
   guide-dashboard.html


   Pending Guide
        ↓
   guide-verification.html


============================================================ */


function redirectAfterLogin(

    user

){



    if(!user){


        window.location.href =

            "login.html";


        return;


    }







    /*
        TOURIST
    */


    if(

        user.accountType === "tourist"

    ){



        window.location.href =

            "tourist-dashboard.html";


        return;


    }









    /*
        GUIDE
    */


    if(

        user.accountType === "guide"

    ){



        if(

            canAccessGuideDashboard(

                user

            )

        ){



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








    /*
        UNKNOWN ACCOUNT

    */


    window.location.href =

        "index.html";


}









/* ============================================================
   CHECK LOGIN STATUS


============================================================ */


function isLoggedIn(){


    return (

        getCurrentUser() !== null

    );


}









/* ============================================================
   RESTORE USER SESSION


============================================================ */


function restoreUserSession(){



    const user =

        getCurrentUser();






    if(user){



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
  redirectAfterLogin,
  isLoggedIn,
  googleLogin,
};