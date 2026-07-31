/* ============================================================
   FIREBASE CONFIGURATION
   LankaQuest

   Firebase Project:
   lankaquest-13df9

============================================================ */


/* ============================================================
   FIREBASE SDK IMPORTS
============================================================ */

import {
    initializeApp
}
from
"https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";


import {
    getAuth
}
from
"https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


import {
    getFirestore
}
from
"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";



/* ============================================================
   FIREBASE CONFIG
============================================================ */

const firebaseConfig = {

    apiKey:
        "AIzaSyD7PUFJqTaw1W_WN0v4ZtCzZNjXLWBKpq0",

    authDomain:
        "lankaquest-13df9.firebaseapp.com",

    projectId:
        "lankaquest-13df9",

    storageBucket:
        "lankaquest-13df9.firebasestorage.app",

    messagingSenderId:
        "979670170585",

    appId:
        "1:979670170585:web:96a55b9c799f4e6302f7c8"

};



/* ============================================================
   INITIALIZE FIREBASE
============================================================ */

const app =
    initializeApp(firebaseConfig);



/* ============================================================
   SERVICES
============================================================ */

const auth =
    getAuth(app);


const db =
    getFirestore(app);



/* ============================================================
   EXPORT
============================================================ */

export {

    app,

    auth,

    db

};