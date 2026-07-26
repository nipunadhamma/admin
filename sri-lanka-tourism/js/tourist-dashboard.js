/* ============================================================
   TOURIST DASHBOARD LOGIC
   Explore Sri Lanka

   FLOW:

   Tourist
      ↓
   Trip Planner
      ↓
   Quotation Request
      ↓
   Guide Sends Quotation
      ↓
   Tourist Dashboard
      ↓
   View Quotation
      ↓
   Tourist Disclaimer
      ↓
   Accept / Reject
      ↓
   Accepted
      ↓
   Chat Can Be Enabled Later

   FRONTEND DEMO ARCHITECTURE
============================================================ */

/* ============================================================
   1. STORAGE KEYS
============================================================ */

const DASHBOARD_TRIP_KEY = "sriLankaMyTrip";

const DASHBOARD_REQUESTS_KEY = "exploreSriLankaQuotationRequests";

const DASHBOARD_SELECTED_GUIDE_KEY = "exploreSriLankaSelectedGuide";

/* ============================================================
   2. DOM ELEMENTS
============================================================ */

const headerUserName = document.getElementById("headerUserName");

const welcomeUserName = document.getElementById("welcomeUserName");

const logoutButton = document.getElementById("logoutButton");

const dashboardTripCount = document.getElementById("dashboardTripCount");

const dashboardRequestCount = document.getElementById("dashboardRequestCount");

const dashboardGuideCount = document.getElementById("dashboardGuideCount");

const selectedGuideContainer = document.getElementById(
  "selectedGuideContainer",
);

const quotationRequestsContainer = document.getElementById(
  "quotationRequestsContainer",
);

const dashboardTripContainer = document.getElementById(
  "dashboardTripContainer",
);

/* ============================================================
   3. GET MY TRIP
============================================================ */

function getDashboardTrip() {
  const savedTrip = localStorage.getItem(DASHBOARD_TRIP_KEY);

  if (!savedTrip) {
    return [];
  }

  try {
    const trip = JSON.parse(savedTrip);

    return Array.isArray(trip) ? trip : [];
  } catch (error) {
    console.error("Dashboard trip error:", error);

    return [];
  }
}

/* ============================================================
   4. GET ALL QUOTATION REQUESTS
============================================================ */

function getDashboardQuotationRequests() {
  const savedRequests = localStorage.getItem(DASHBOARD_REQUESTS_KEY);

  if (!savedRequests) {
    return [];
  }

  try {
    const requests = JSON.parse(savedRequests);

    return Array.isArray(requests) ? requests : [];
  } catch (error) {
    console.error(
      "Dashboard quotation request error:",

      error,
    );

    return [];
  }
}

/* ============================================================
   5. SAVE ALL QUOTATION REQUESTS
============================================================ */

function saveDashboardQuotationRequests(requests) {
  localStorage.setItem(
    DASHBOARD_REQUESTS_KEY,

    JSON.stringify(requests),
  );
}

/* ============================================================
   6. GET CURRENT TOURIST REQUESTS
============================================================ */

function getMyQuotationRequests() {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;

  if (!user) {
    return [];
  }

  const requests = getDashboardQuotationRequests();

  /*
       Only current tourist requests
    */

  return requests.filter(
    (request) =>
      request.tourist &&
      (request.tourist.id === user.id || request.tourist.email === user.email),
  );
}

/* ============================================================
   7. GET SELECTED GUIDE
============================================================ */

function getDashboardSelectedGuide() {
  /*
       First check quotation requests.

       Latest selected guide
       is the most accurate data.
    */

  const requests = getMyQuotationRequests();

  const selectedRequests = requests.filter((request) => request.selectedGuide);

  if (selectedRequests.length > 0) {
    /*
           Latest selected guide
        */

    const latestRequest = selectedRequests[selectedRequests.length - 1];

    return {
      guide: latestRequest.selectedGuide,

      request: latestRequest,
    };
  }

  /*
       Fallback to
       Selected Guide Storage
    */

  const savedGuide = localStorage.getItem(DASHBOARD_SELECTED_GUIDE_KEY);

  if (!savedGuide) {
    return null;
  }

  try {
    return {
      guide: JSON.parse(savedGuide),

      request: null,
    };
  } catch (error) {
    console.error(
      "Selected guide data error:",

      error,
    );

    return null;
  }
}

/* ============================================================
   8. UPDATE USER INFORMATION
============================================================ */

function updateDashboardUser() {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;

  if (!user) {
    return;
  }

  const displayName = user.fullName || user.email || "Tourist";

  if (headerUserName) {
    headerUserName.textContent = displayName;
  }

  if (welcomeUserName) {
    welcomeUserName.textContent = displayName;
  }
}

/* ============================================================
   9. UPDATE SUMMARY
============================================================ */

function updateDashboardSummary() {
  const trip = getDashboardTrip();

  const requests = getMyQuotationRequests();

  const selectedGuideRequests = requests.filter(
    (request) => request.selectedGuide,
  );

  if (dashboardTripCount) {
    dashboardTripCount.textContent = trip.length;
  }

  if (dashboardRequestCount) {
    dashboardRequestCount.textContent = requests.length;
  }

  if (dashboardGuideCount) {
    dashboardGuideCount.textContent = selectedGuideRequests.length;
  }
}

/* ============================================================
   10. FORMAT REQUEST STATUS
============================================================ */

function formatTouristRequestStatus(status) {
  const statusMap = {
    pending: "Pending",

    guide_selected: "Guide Selected",

    quotation_sent: "Quotation Received",

    quotation_accepted: "Quotation Accepted",

    quotation_rejected: "Quotation Rejected",
  };

  return statusMap[status] || "Pending";
}

/* ============================================================
   11. FORMAT DATE
============================================================ */

function formatDashboardDate(date) {
  if (!date) {
    return "";
  }

  try {
    return new Date(date).toLocaleDateString();
  } catch (error) {
    return date;
  }
}

/* ============================================================
   12. GET LATEST QUOTATION
============================================================ */

function getLatestQuotation(request) {
  if (!request) {
    return null;
  }

  /*
       Quotations are saved
       by guide-requests.js
       inside request.quotations
    */

  if (!Array.isArray(request.quotations) || request.quotations.length === 0) {
    return null;
  }

  /*
       Get latest quotation
    */

  return request.quotations[request.quotations.length - 1];
}

/* ============================================================
   13. RENDER QUOTATION
============================================================ */

function renderQuotation(request) {
  const quotation = getLatestQuotation(request);

  /*
       No quotation yet
    */

  if (!quotation) {
    return 

            <div class="quotation-not-received">

                <div class="quotation-not-received-icon">
                    ⏳
                </div>


                <div>

                    <strong>
                        Waiting for Guide Quotation
                    </strong>


                    <p>

                        Your request has been sent.
                        A registered guide has not
                        sent a quotation yet.

                    </p>

                </div>

            </div>

        ;
  }

  const guide = quotation.guide || {};

  const quotationStatus = quotation.status || "sent";

  /*
       Accepted
    */

  if (request.status === "quotation_accepted") {
    return 

            <div class="tourist-quotation-card quotation-accepted">

                <div class="quotation-card-header">

                    <div>

                        <span class="quotation-label">
                            💰 Guide Quotation
                        </span>


                        <h4>

                            ${guide.fullName || "Registered Guide"}

                        </h4>

                    </div>


                    <span class="quotation-status-badge accepted">

                        ✓ Accepted

                    </span>

                </div>


                <div class="quotation-price">

                    ${quotation.amount || "0"}

                    ${quotation.currency || ""}

                </div>


                <p class="quotation-validity">

                    Valid until:

                    <strong>
                        ${formatDashboardDate(quotation.validUntil)}
                    </strong>

                </p>


                <div class="quotation-accepted-message">

                    ✓ You have accepted this quotation.

                    <br>

                    The guide can now be contacted
                    through the chat system.

                </div>


                <!--
                    Chat button will be connected
                    in the next phase.
                -->

                <button
                    type="button"
                    class="quotation-chat-button"
                    disabled
                >

                    💬 Chat with Guide

                    <span>
                        Coming Soon
                    </span>

                </button>

            </div>

        ;
  }

  /*
       Rejected
    */

  if (request.status === "quotation_rejected") {
    return 

            <div class="tourist-quotation-card quotation-rejected">

                <div class="quotation-card-header">

                    <div>

                        <span class="quotation-label">
                            💰 Guide Quotation
                        </span>


                        <h4>

                            ${guide.fullName || "Registered Guide"}

                        </h4>

                    </div>


                    <span class="quotation-status-badge rejected">

                        ✕ Rejected

                    </span>

                </div>


                <div class="quotation-rejected-message">

                    You have rejected this quotation.

                </div>

            </div>

        ;
  }

  /*
       New Quotation
       Tourist must review
    */

  return 

        <div class="tourist-quotation-card quotation-pending">

            <div class="quotation-card-header">

                <div>

                    <span class="quotation-label">

                        💰 New Guide Quotation

                    </span>


                    <h4>

                        ${guide.fullName || "Registered Guide"}

                    </h4>


                    <p class="quotation-guide-location">

                        📍

                        ${guide.district || "Sri Lanka"}

                        ${guide.province ? " · " + guide.province : ""}

                    </p>

                </div>


                <span class="quotation-status-badge">

                    New Quotation

                </span>

            </div>


            <!-- ==================================================
                 PRICE
            ================================================== -->

            <div class="quotation-price-section">

                <span>
                    Quotation Amount
                </span>


                <strong>

                    ${quotation.amount || "0"}

                    ${quotation.currency || ""}

                </strong>

            </div>


            <!-- ==================================================
                 QUOTATION DETAILS
            ================================================== -->

            <div class="quotation-details-grid">


                <div class="quotation-detail-item">

                    <span>
                        Valid Until
                    </span>

                    <strong>

                        ${formatDashboardDate(quotation.validUntil)}

                    </strong>

                </div>


                <div class="quotation-detail-item">

                    <span>
                        Guide Languages
                    </span>

                    <strong>

                        ${guide.languages || "Not specified"}

                    </strong>

                </div>


            </div>


            <!-- ==================================================
                 INCLUDED SERVICES
            ================================================== -->

            <div class="quotation-service-section">

                <h5>
                    ✓ Included Services
                </h5>


                <p>

                    ${quotation.included ? quotation.included : "Not specified"}

                </p>

            </div>


            <!-- ==================================================
                 EXCLUDED SERVICES
            ================================================== -->

            <div class="quotation-service-section">

                <h5>
                    ✕ Excluded Services
                </h5>


                <p>

                    ${quotation.excluded ? quotation.excluded : "Not specified"}

                </p>

            </div>


            <!-- ==================================================
                 GUIDE NOTES
            ================================================== -->

            ${
              quotation.notes
                ? `

                    <div class="quotation-service-section">

                        <h5>
                            📝 Guide Notes
                        </h5>


                        <p>

                            ${quotation.notes}

                        </p>

                    </div>

                `
                : ""
            }


            <!-- ==================================================
                 TOURIST DISCLAIMER
            ================================================== -->

            <div class="tourist-quotation-disclaimer">

                <div class="disclaimer-title">

                    ⚠️ Important Notice

                </div>


                <p>

                    Explore Sri Lanka is a platform
                    that connects tourists and
                    independent registered guides.

                    <br><br>

                    The website does not provide,
                    guarantee or control the travel
                    services offered by guides and
                    does not accept responsibility
                    for any financial transaction,
                    payment, agreement, loss, damage,
                    dispute or personal matter between
                    the tourist and the guide.

                    <br><br>

                    Any quotation, payment or service
                    agreement is made directly between
                    the tourist and the guide.

                </p>


                <!-- ==================================================
                     ACCEPTANCE CHECKBOX
                ================================================== -->

                <label class="quotation-acceptance-checkbox">

                    <input
                        type="checkbox"
                        class="quotation-disclaimer-checkbox"
                        data-request-id="${request.requestId}"
                    >


                    <span>

                        I have read and understood
                        the above notice and agree
                        to proceed with this quotation
                        directly with the guide.

                    </span>

                </label>

            </div>


            <!-- ==================================================
                 ACTION BUTTONS
            ================================================== -->

            <div class="quotation-action-buttons">


                <button
                    type="button"
                    class="accept-quotation-button"
                    data-request-id="${request.requestId}"
                    disabled
                >

                    ✓ Accept Quotation

                </button>


                <button
                    type="button"
                    class="reject-quotation-button"
                    data-request-id="${request.requestId}"
                >

                    ✕ Reject Quotation

                </button>


            </div>


            <div
                class="quotation-action-message"
                id="quotationMessage-${request.requestId}"
            ></div>


        </div>

    `;
}

/* ============================================================
   14. ACCEPT QUOTATION
============================================================ */

function acceptQuotation(requestId) {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;

  if (!user) {
    return;
  }

  const requests = getDashboardQuotationRequests();

  const requestIndex = requests.findIndex(
    (request) =>
      String(request.requestId) === String(requestId) &&
      request.tourist &&
      (request.tourist.id === user.id || request.tourist.email === user.email),
  );

  if (requestIndex === -1) {
    alert("Quotation request could not be found.");

    return;
  }

  const request = requests[requestIndex];

  const quotation = getLatestQuotation(request);

  if (!quotation) {
    alert("No quotation is available for this request.");

    return;
  }

  /*
       Update Status
    */

  request.status = "quotation_accepted";

  /*
       Update Quotation Status
    */

  quotation.status = "accepted";

  /*
       Acceptance Timestamp
    */

  quotation.acceptedAt = new Date().toISOString();

  /*
       Save
    */

  requests[requestIndex] = request;

  saveDashboardQuotationRequests(requests);

  /*
       Refresh Dashboard
    */

  updateDashboardSummary();

  renderSelectedGuide();

  renderQuotationRequests();

  alert("Quotation accepted successfully. You can now proceed with the guide.");
}

/* ============================================================
   15. REJECT QUOTATION
============================================================ */

function rejectQuotation(requestId) {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;

  if (!user) {
    return;
  }

  const confirmReject = window.confirm(
    "Are you sure you want to reject this quotation?",
  );

  if (!confirmReject) {
    return;
  }

  const requests = getDashboardQuotationRequests();

  const requestIndex = requests.findIndex(
    (request) =>
      String(request.requestId) === String(requestId) &&
      request.tourist &&
      (request.tourist.id === user.id || request.tourist.email === user.email),
  );

  if (requestIndex === -1) {
    alert("Quotation request could not be found.");

    return;
  }

  const request = requests[requestIndex];

  const quotation = getLatestQuotation(request);

  /*
       Update Request Status
    */

  request.status = "quotation_rejected";

  /*
       Update Quotation Status
    */

  if (quotation) {
    quotation.status = "rejected";

    quotation.rejectedAt = new Date().toISOString();
  }

  /*
       Save
    */

  requests[requestIndex] = request;

  saveDashboardQuotationRequests(requests);

  /*
       Refresh Dashboard
    */

  updateDashboardSummary();

  renderQuotationRequests();

  alert("Quotation rejected.");
}

/* ============================================================
   16. ATTACH QUOTATION ACTION BUTTONS
============================================================ */

function attachQuotationActionButtons() {
  /*
       Acceptance Checkboxes
    */

  const checkboxes = document.querySelectorAll(
    ".quotation-disclaimer-checkbox",
  );

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener(
      "change",

      () => {
        const requestId = checkbox.dataset.requestId;

        const acceptButton = document.querySelector(
          `.accept-quotation-button[data-request-id="${requestId}"]`,
        );

        if (acceptButton) {
          acceptButton.disabled = !checkbox.checked;
        }
      },
    );
  });

  /*
       Accept Buttons
    */

  const acceptButtons = document.querySelectorAll(".accept-quotation-button");

  acceptButtons.forEach((button) => {
    button.addEventListener(
      "click",

      () => {
        const requestId = button.dataset.requestId;

        if (!requestId) {
          return;
        }

        acceptQuotation(requestId);
      },
    );
  });

  /*
       Reject Buttons
    */

  const rejectButtons = document.querySelectorAll(".reject-quotation-button");

  rejectButtons.forEach((button) => {
    button.addEventListener(
      "click",

      () => {
        const requestId = button.dataset.requestId;

        if (!requestId) {
          return;
        }

        rejectQuotation(requestId);
      },
    );
  });
}

/* ============================================================
   17. RENDER SELECTED GUIDE
============================================================ */

function renderSelectedGuide() {
  if (!selectedGuideContainer) {
    return;
  }

  const selectedData = getDashboardSelectedGuide();

  /*
       No Selected Guide
    */

  if (!selectedData || !selectedData.guide) {
    selectedGuideContainer.innerHTML = `

            <div class="no-selected-guide">

                <div class="no-selected-guide-icon">
                    🧑‍💼
                </div>


                <h4>
                    No Guide Selected Yet
                </h4>


                <p>

                    Choose a registered guide
                    for your Sri Lanka journey.

                </p>


                <a
                    href="find-guides.html"
                    class="dashboard-action-button"
                >

                    Find Registered Guides

                </a>

            </div>

        `;

    return;
  }

  const guide = selectedData.guide;

  const request = selectedData.request;

  const requestId = request ? request.requestId : "";

  selectedGuideContainer.innerHTML = `

        <div class="selected-guide-card">


            <div class="selected-guide-avatar">

                ${
                  guide.profileImage
                    ? `

                        <img
                            src="${guide.profileImage}"
                            alt="${guide.fullName || "Guide"}"
                        >

                    `
                    : "🧑‍💼"
                }

            </div>


            <div class="selected-guide-info">


                <h4>

                    ${guide.fullName || "Selected Guide"}

                </h4>


                <p>

                    📍

                    ${guide.district || "Sri Lanka"}

                    ${guide.province ? " · " + guide.province : ""}

                </p>


                <p>

                    🗣️

                    ${guide.languages || "Not specified"}

                </p>


                <p>

                    ⭐

                    ${guide.rating || "N/A"}

                    &nbsp;

                    ·

                    &nbsp;

                    📝

                    ${guide.reviewCount || 0}

                    Reviews

                </p>


                <span class="selected-guide-status">

                    ✓ Guide Selected

                </span>


                ${
                  requestId
                    ? `

                        <p>

                            Request:

                            <strong>
                                ${requestId}
                            </strong>

                        </p>

                    `
                    : ""
                }


            </div>


        </div>

    `;
}

/* ============================================================
   18. RENDER QUOTATION REQUESTS
============================================================ */

function renderQuotationRequests() {
  if (!quotationRequestsContainer) {
    return;
  }

  const requests = getMyQuotationRequests();

  /*
       No Requests
    */

  if (requests.length === 0) {
    quotationRequestsContainer.innerHTML = `

            <div class="dashboard-empty-state">

                <div class="dashboard-empty-state-icon">
                    📋
                </div>


                <h4>
                    No Quotation Requests Yet
                </h4>


                <p>

                    Start planning your Sri Lanka journey
                    and request a guide quotation.

                </p>


                <a
                    href="trip-planner.html"
                    class="dashboard-action-button"
                >

                    Plan My Journey

                </a>

            </div>

        `;

    return;
  }

  /*
       Latest First
    */

  const sortedRequests = [...requests].reverse();

  quotationRequestsContainer.innerHTML = "";

  sortedRequests.forEach((request) => {
    const card = document.createElement("article");

    card.className = "quotation-request-card";

    const destinations = Array.isArray(request.destinations)
      ? request.destinations
      : [];

    const destinationNames = destinations

      .map((destination) => destination.name || "Destination")

      .join(", ");

    const status = request.status || "pending";

    /*
               Latest quotation
            */

    const quotation = getLatestQuotation(request);

    card.innerHTML = `

                <div class="request-card-header">


                    <div>

                        <h4>

                            🧾

                            ${request.requestId || "Request"}

                        </h4>


                        <span class="request-id">

                            ${
                              request.createdAt
                                ? formatDashboardDate(request.createdAt)
                                : ""
                            }

                        </span>

                    </div>


                    <span
                        class="request-status ${status}"
                    >

                        ${formatTouristRequestStatus(status)}

                    </span>


                </div>


                <div class="request-details-grid">


                    <div class="request-detail">

                        <span>
                            Destinations
                        </span>


                        <strong>

                            ${destinationNames || "None"}

                        </strong>

                    </div>


                    <div class="request-detail">

                        <span>
                            Travel Dates
                        </span>


                        <strong>

                            ${
                              request.startDate && request.endDate
                                ? request.startDate + " → " + request.endDate
                                : "Not selected"
                            }

                        </strong>

                    </div>


                    <div class="request-detail">

                        <span>
                            Travelers
                        </span>


                        <strong>

                            ${request.travelers || "Not selected"}

                        </strong>

                    </div>


                </div>


                ${
                  request.selectedGuide
                    ? `

                        <div class="request-selected-guide">

                            🧑‍💼


                            <strong>
                                Selected Guide:
                            </strong>


                            ${request.selectedGuide.fullName || "Guide"}


                            <br>


                            📍


                            ${request.selectedGuide.district || "Sri Lanka"}


                            &nbsp;

                            ·

                            ⭐


                            ${request.selectedGuide.rating || "N/A"}

                        </div>

                    `
                    : `

                        <div class="request-selected-guide">

                            ⏳

                            No guide selected yet.


                            <br><br>


                            <a
                                href="find-guides.html"
                                class="dashboard-action-button"
                            >

                                Find a Guide

                            </a>

                        </div>

                    `
                }


                <!-- ==================================================
                     QUOTATION AREA
                ================================================== -->


                <div class="request-quotation-area">

                    ${
                      quotation
                        ? renderQuotation(request)
                        : `

                            <div class="quotation-not-received">

                                <div class="quotation-not-received-icon">
                                    ⏳
                                </div>


                                <div>

                                    <strong>
                                        Waiting for Guide Quotation
                                    </strong>


                                    <p>

                                        Your request is waiting
                                        for a registered guide
                                        to send a quotation.

                                    </p>

                                </div>

                            </div>

                        `
                    }

                </div>

            `;

    quotationRequestsContainer.appendChild(card);
  });

  /*
       Attach Accept / Reject
       and Disclaimer Events
    */

  attachQuotationActionButtons();
}

/* ============================================================
   19. RENDER MY TRIP
============================================================ */

function renderDashboardTrip() {
  if (!dashboardTripContainer) {
    return;
  }

  const trip = getDashboardTrip();

  /*
       Empty Trip
    */

  if (trip.length === 0) {
    dashboardTripContainer.innerHTML = `

            <div class="dashboard-empty-state">

                <div class="dashboard-empty-state-icon">
                    🗺️
                </div>


                <h4>
                    No Destinations Yet
                </h4>


                <p>

                    Add destinations
                    to your trip planner.

                </p>


                <a
                    href="trip-planner.html"
                    class="dashboard-action-button"
                >

                    Explore Destinations

                </a>

            </div>

        `;

    return;
  }

  dashboardTripContainer.innerHTML = "";

  trip.forEach((place) => {
    const card = document.createElement("article");

    card.className = "dashboard-destination-card";

    card.innerHTML = `

                <img
                    src="${place.image || ""}"
                    alt="${place.name || "Destination"}"
                >


                <div
                    class="dashboard-destination-info"
                >


                    <h4>

                        ${place.name || "Destination"}

                    </h4>


                    <p>

                        📍

                        ${place.district || ""}

                        ${place.province ? " · " + place.province : ""}

                    </p>


                    <p>

                        ⭐

                        ${place.rating || "N/A"}

                    </p>


                </div>

            `;

    dashboardTripContainer.appendChild(card);
  });
}

/* ============================================================
   20. LOGOUT
============================================================ */

function handleTouristLogout() {
  if (typeof logoutUser === "function") {
    logoutUser();

    return;
  }

  localStorage.removeItem("exploreSriLankaCurrentUser");

  sessionStorage.removeItem("exploreSriLankaCurrentUser");

  window.location.href = "index.html";
}

/* ============================================================
   21. PAGE INITIALIZATION
============================================================ */

document.addEventListener(
  "DOMContentLoaded",

  () => {
    /*
           Require Tourist Login
        */

    const user =
      typeof requireAccountType === "function"
        ? requireAccountType("tourist")
        : null;

    /*
           Stop if not Tourist
        */

    if (!user) {
      return;
    }

    /*
           Update User
        */

    updateDashboardUser();

    /*
           Update Summary
        */

    updateDashboardSummary();

    /*
           Render Selected Guide
        */

    renderSelectedGuide();

    /*
           Render Quotation Requests

           Includes:

           Guide Quotations
           Disclaimer
           Accept
           Reject
        */

    renderQuotationRequests();

    /*
           Render Trip
        */

    renderDashboardTrip();

    /*
           Logout
        */

    if (logoutButton) {
      logoutButton.addEventListener(
        "click",

        handleTouristLogout,
      );
    }

    /*
           Debug
        */

    console.log(
      "Tourist Dashboard Loaded:",

      user,
    );
  },
);
