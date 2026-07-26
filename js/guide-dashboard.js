/* ============================================================
   GUIDE DASHBOARD LOGIC
   Explore Sri Lanka

   FLOW:

   Tourist
      ↓
   Trip Planner
      ↓
   Quotation Request
      ↓
   Find Registered Guides
      ↓
   Tourist Selects Guide
      ↓
   Request.selectedGuide
      ↓
   localStorage
      ↓
   Guide Login
      ↓
   Guide Dashboard
      ↓
   Current Guide's Requests Only
      ↓
   Guide Requests Page
      ↓
   Send Quotation

   Frontend Demo Architecture
============================================================ */

/* ============================================================
   1. STORAGE KEYS
============================================================ */

const GUIDE_QUOTATION_REQUESTS_KEY = "exploreSriLankaQuotationRequests";

/* ============================================================
   2. DOM ELEMENTS
============================================================ */

const incomingRequestsContainer = document.getElementById(
  "incomingRequestsContainer",
);

const noRequestsState = document.getElementById("noRequestsState");

const totalRequestCount = document.getElementById("totalRequestCount");

const pendingRequestCount = document.getElementById("pendingRequestCount");

const quotationCount = document.getElementById("quotationCount");

const guideStatus = document.getElementById("guideStatus");

const guideHeaderName = document.getElementById("guideHeaderName");

const guideWelcomeName = document.getElementById("guideWelcomeName");

const logoutButton = document.getElementById("logoutButton");

const refreshRequestsButton = document.getElementById("refreshRequestsButton");

/* ============================================================
   3. GET QUOTATION REQUESTS
============================================================ */

function getGuideQuotationRequests() {
  const savedRequests = localStorage.getItem(GUIDE_QUOTATION_REQUESTS_KEY);

  /*
       No Saved Requests
    */

  if (!savedRequests) {
    return [];
  }

  /*
       Parse Requests
    */

  try {
    const requests = JSON.parse(savedRequests);

    /*
           Make Sure Array
        */

    if (!Array.isArray(requests)) {
      return [];
    }

    return requests;
  } catch (error) {
    console.error(
      "Guide quotation request data error:",

      error,
    );

    return [];
  }
}

/* ============================================================
   4. GET CURRENT GUIDE REQUESTS
============================================================ */

/*
   IMPORTANT:

   සියලුම quotation requests
   Guide Dashboard එකේ පෙන්වන්නේ නැත.

   Current logged-in Guide
   select කර ඇති requests
   පමණක් පෙන්වයි.

   Matching:

   request.selectedGuide.id
          ===
   currentGuide.id
============================================================ */

function getCurrentGuideRequests(currentGuide) {
  /*
       No Guide
    */

  if (!currentGuide) {
    return [];
  }

  /*
       Get All Requests
    */

  const allRequests = getGuideQuotationRequests();

  /*
       Current Guide ID
    */

  const currentGuideId = currentGuide.id;

  /*
       Filter Requests
    */

  const guideRequests = allRequests.filter((request) => {
    /*
                   Selected Guide
                   Does Not Exist
                */

    if (!request.selectedGuide) {
      return false;
    }

    /*
                   Get Selected Guide ID
                */

    const selectedGuideId = request.selectedGuide.id;

    /*
                   Match Guide
                */

    return selectedGuideId === currentGuideId;
  });

  return guideRequests;
}

/* ============================================================
   5. FORMAT DATE
============================================================ */

function formatRequestDate(dateString) {
  /*
       No Date
    */

  if (!dateString) {
    return "Date not available";
  }

  /*
       Format Date
    */

  try {
    return new Date(dateString).toLocaleString();
  } catch (error) {
    return dateString;
  }
}

/* ============================================================
   6. GET REQUEST STATUS LABEL
============================================================ */

function getRequestStatusLabel(status) {
  /*
       Default
    */

  if (!status) {
    return "Pending";
  }

  /*
       Status Labels
    */

  const statusLabels = {
    pending: "Pending",

    guide_selected: "Guide Selected",

    quotation_sent: "Quotation Sent",

    accepted: "Accepted",

    rejected: "Rejected",

    completed: "Completed",
  };

  return statusLabels[status] || status;
}

/* ============================================================
   7. UPDATE DASHBOARD STATS
============================================================ */

function updateGuideDashboardStats(requests) {
  /*
       Safety Check
    */

  if (!Array.isArray(requests)) {
    requests = [];
  }

  /*
       Total Requests
    */

  if (totalRequestCount) {
    totalRequestCount.textContent = requests.length;
  }

  /*
       Pending Requests

       Include:

       pending
       guide_selected
    */

  const pendingRequests = requests.filter(
    (request) =>
      request.status === "pending" || request.status === "guide_selected",
  );

  if (pendingRequestCount) {
    pendingRequestCount.textContent = pendingRequests.length;
  }

  /*
       Total Guide Quotations
    */

  let totalQuotations = 0;

  requests.forEach((request) => {
    if (Array.isArray(request.quotations)) {
      /*
                   Count only quotations
                   belonging to current guide
                */

      totalQuotations += request.quotations.length;
    }
  });

  if (quotationCount) {
    quotationCount.textContent = totalQuotations;
  }
}

/* ============================================================
   8. RENDER DESTINATIONS
============================================================ */

function renderRequestDestinations(destinations) {
  /*
       Empty Destinations
    */

  if (!Array.isArray(destinations) || destinations.length === 0) {
    return `

            <div class="request-destination-item">

                <span>

                    No destinations selected

                </span>

            </div>

        `;
  }

  /*
       Destination Cards
    */

  return destinations

    .map(
      (place) => `

            <div
                class="request-destination-item"
            >

                <img
                    src="${place.image || ""}"
                    alt="${place.name || "Destination"}"
                >


                <div>

                    <strong>

                        ${place.name || "Unknown Destination"}

                    </strong>


                    <span>

                        ${place.district || ""}

                        ${place.province ? " · " + place.province : ""}

                    </span>

                </div>

            </div>

        `,
    )

    .join("");
}

/* ============================================================
   9. RENDER REQUEST CARD
============================================================ */

function renderRequestCard(request) {
  /*
       Tourist
    */

  const tourist = request.tourist || {};

  /*
       Destinations
    */

  const destinations = request.destinations || [];

  /*
       Status
    */

  const status = request.status || "pending";

  /*
       Status Label
    */

  const statusLabel = getRequestStatusLabel(status);

  /*
       Special Requests
    */

  const specialRequests =
    request.specialRequests || "No special requests provided.";

  /*
       Create Card
    */

  const card = document.createElement("article");

  card.className = "incoming-request-card";

  /*
       Request Card HTML
    */

  card.innerHTML = `

        <!-- ====================================================
             REQUEST HEADER
        ===================================================== -->

        <div class="request-card-header">


            <div class="request-tourist-info">

                <h3>

                    🧳

                    ${tourist.fullName || "Unknown Tourist"}

                </h3>


                <p>

                    📧

                    ${tourist.email || "Email not available"}

                </p>

            </div>


            <span
                class="request-status request-status-${status}"
            >

                ${statusLabel}

            </span>

        </div>



        <!-- ====================================================
             TRAVEL DETAILS
        ===================================================== -->

        <div class="request-details-grid">


            <div class="request-detail-item">

                <span>

                    📅 Start Date

                </span>


                <strong>

                    ${request.startDate || "Not selected"}

                </strong>

            </div>



            <div class="request-detail-item">

                <span>

                    📅 End Date

                </span>


                <strong>

                    ${request.endDate || "Not selected"}

                </strong>

            </div>



            <div class="request-detail-item">

                <span>

                    👥 Travelers

                </span>


                <strong>

                    ${request.travelers || "Not selected"}

                </strong>

            </div>



            <div class="request-detail-item">

                <span>

                    🌿 Travel Style

                </span>


                <strong>

                    ${request.travelStyle || "Not selected"}

                </strong>

            </div>



            <div class="request-detail-item">

                <span>

                    🚗 Transport

                </span>


                <strong>

                    ${request.transport || "Not selected"}

                </strong>

            </div>



            <div class="request-detail-item">

                <span>

                    🏨 Accommodation

                </span>


                <strong>

                    ${request.accommodation || "Not selected"}

                </strong>

            </div>

        </div>



        <!-- ====================================================
             DESTINATIONS
        ===================================================== -->

        <div class="request-destinations">

            <h4>

                📍 Requested Destinations

            </h4>


            <div class="request-destination-list">

                ${renderRequestDestinations(destinations)}

            </div>

        </div>



        <!-- ====================================================
             SPECIAL REQUESTS
        ===================================================== -->

        <div class="request-special-requests">

            <strong>

                💬 Special Requests

            </strong>


            <p>

                ${specialRequests}

            </p>

        </div>



        <!-- ====================================================
             FOOTER
        ===================================================== -->

        <div class="request-card-footer">


            <span class="request-date">

                Request ID:

                ${request.requestId || "N/A"}

                ·

                ${formatRequestDate(request.createdAt)}

            </span>


            <button
                type="button"
                class="send-quotation-button"
                data-request-id="${request.requestId || ""}"
            >

                💰

                Send Quotation

                →

            </button>

        </div>

    `;

  return card;
}

/* ============================================================
   10. RENDER INCOMING REQUESTS
============================================================ */

function renderIncomingRequests(currentGuide) {
  /*
       Get Only Current Guide Requests
    */

  const requests = getCurrentGuideRequests(currentGuide);

  /*
       Update Stats
    */

  updateGuideDashboardStats(requests);

  /*
       Clear Existing
    */

  if (incomingRequestsContainer) {
    incomingRequestsContainer.innerHTML = "";
  }

  /*
       Empty State
    */

  if (requests.length === 0) {
    if (noRequestsState) {
      noRequestsState.style.display = "block";
    }

    return;
  }

  /*
       Hide Empty State
    */

  if (noRequestsState) {
    noRequestsState.style.display = "none";
  }

  /*
       Render Requests
    */

  if (incomingRequestsContainer) {
    requests.forEach((request) => {
      const card = renderRequestCard(request);

      incomingRequestsContainer.appendChild(card);
    });
  }

  /*
       Attach Buttons
    */

  attachQuotationButtons();
}

/* ============================================================
   11. SEND QUOTATION BUTTONS
============================================================ */

function attachQuotationButtons() {
  const buttons = document.querySelectorAll(".send-quotation-button");

  buttons.forEach((button) => {
    button.addEventListener(
      "click",

      () => {
        /*
                       Get Request ID
                    */

        const requestId = button.dataset.requestId;

        /*
                       Validate Request ID
                    */

        if (!requestId) {
          alert("Request ID is missing.");

          return;
        }

        /*
                       Open Guide Requests Page

                       Pass Request ID
                    */

        window.location.href =
          "guide-requests.html?requestId=" + encodeURIComponent(requestId);
      },
    );
  });
}

/* ============================================================
   12. LOAD GUIDE PROFILE
============================================================ */

function loadGuideProfile() {
  /*
       Get Current User

       auth.js
       getCurrentUser()
    */

  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;

  /*
       No User
    */

  if (!user) {
    window.location.href = "login.html?redirect=guide-dashboard.html";

    return null;
  }

  /*
       Must Be Guide
    */

  if (user.accountType !== "guide") {
    alert("Only Guide accounts can access the Guide Dashboard.");

    if (typeof redirectAfterLogin === "function") {
      redirectAfterLogin(user);
    } else {
      window.location.href = "index.html";
    }

    return null;
  }

  /*
       Guide Verification
    */

  if (user.verificationStatus !== "approved") {
    window.location.href = "guide-verification.html";

    return null;
  }

  /*
       Display Name
    */

  const displayName = user.fullName || "Guide";

  if (guideHeaderName) {
    guideHeaderName.textContent = displayName;
  }

  if (guideWelcomeName) {
    guideWelcomeName.textContent = displayName;
  }

  /*
       Account Status
    */

  if (guideStatus) {
    guideStatus.textContent = user.status || "Active";
  }

  /*
       Return Current Guide
    */

  return user;
}

/* ============================================================
   13. LOGOUT
============================================================ */

if (logoutButton) {
  logoutButton.addEventListener(
    "click",

    () => {
      /*
               Confirm Logout
            */

      const confirmLogout = confirm("Are you sure you want to logout?");

      if (!confirmLogout) {
        return;
      }

      /*
               Use auth.js Logout
            */

      if (typeof logoutUser === "function") {
        logoutUser();
      } else {
        window.location.href = "index.html";
      }
    },
  );
}

/* ============================================================
   14. REFRESH REQUESTS
============================================================ */

if (refreshRequestsButton) {
  refreshRequestsButton.addEventListener(
    "click",

    () => {
      /*
               Get Current Guide Again
            */

      const currentGuide =
        typeof getCurrentUser === "function" ? getCurrentUser() : null;

      /*
               Render Again
            */

      if (currentGuide) {
        renderIncomingRequests(currentGuide);
      }
    },
  );
}

/* ============================================================
   15. INITIALIZE DASHBOARD
============================================================ */

document.addEventListener(
  "DOMContentLoaded",

  () => {
    /*
           Verify Guide
        */

    const guide = loadGuideProfile();

    /*
           Stop if Not Valid
        */

    if (!guide) {
      return;
    }

    /*
           Load Current Guide Requests
        */

    renderIncomingRequests(guide);

    /*
           Debug
        */

    console.log(
      "Guide Dashboard Loaded:",

      guide.fullName,
    );

    console.log(
      "Guide ID:",

      guide.id,
    );

    console.log(
      "Guide Requests:",

      getCurrentGuideRequests(guide),
    );
  },
);
