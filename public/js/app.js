/**
 * E-Outpass Management System
 * Role-Based Authentication, Student Portal & Warden Review Screen Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // App State
  // ==========================================
  let currentUser = JSON.parse(sessionStorage.getItem("e_outpass_user") || localStorage.getItem("eop_user") || "null");
  if (currentUser) {
    sessionStorage.setItem("e_outpass_user", JSON.stringify(currentUser));
  }

  const state = {
    currentView: "PENDING", // For Warden: "PENDING" or "ALL"
    filterBlock: "ALL",
    filterType: "ALL",
    searchQuery: "",
    requests: [],
    studentRequests: [],
    stats: null,
    selectedRequest: null
  };

  // ==========================================
  // DOM Elements
  // ==========================================
  const el = {
    // Auth & Views
    loginSection: document.getElementById("loginSection"),
    appShell: document.getElementById("appShell"),
    wardenPortalSection: document.getElementById("wardenPortalSection"),
    studentPortalSection: document.getElementById("studentPortalSection"),
    loginForm: document.getElementById("loginForm"),
    loginIdentifier: document.getElementById("loginIdentifier"),
    loginPassword: document.getElementById("loginPassword"),
    loginSelectedRole: document.getElementById("loginSelectedRole"),
    tabLoginStudent: document.getElementById("tabLoginStudent"),
    tabLoginWarden: document.getElementById("tabLoginWarden"),
    loginErrorBanner: document.getElementById("loginErrorBanner"),
    loginErrorText: document.getElementById("loginErrorText"),
    lblIdentifier: document.getElementById("lblIdentifier"),
    btnFillStudent1: document.getElementById("btnFillStudent1"),
    btnFillStudent2: document.getElementById("btnFillStudent2"),
    btnFillStudent3: document.getElementById("btnFillStudent3"),
    btnFillStudent4: document.getElementById("btnFillStudent4"),
    btnFillWarden1: document.getElementById("btnFillWarden1"),
    btnFillWarden2: document.getElementById("btnFillWarden2"),
    btnLogout: document.getElementById("btnLogout"),

    // Nav Bar
    navUserAvatar: document.getElementById("navUserAvatar"),
    navUserName: document.getElementById("navUserName"),
    navUserRole: document.getElementById("navUserRole"),
    navSubtitle: document.getElementById("navSubtitle"),
    liveClock: document.getElementById("liveClock"),

    // Warden KPI
    kpiPending: document.getElementById("kpiPending"),
    kpiUrgentSub: document.getElementById("kpiUrgentSub"),
    kpiApproved: document.getElementById("kpiApproved"),
    kpiOutside: document.getElementById("kpiOutside"),
    kpiRejected: document.getElementById("kpiRejected"),
    tabPending: document.getElementById("tabPending"),
    tabAll: document.getElementById("tabAll"),
    tabPendingCount: document.getElementById("tabPendingCount"),
    tabAllCount: document.getElementById("tabAllCount"),

    // Warden Controls
    searchInput: document.getElementById("searchInput"),
    btnClearSearch: document.getElementById("btnClearSearch"),
    blockFilter: document.getElementById("blockFilter"),
    typeFilter: document.getElementById("typeFilter"),
    btnRefresh: document.getElementById("btnRefresh"),
    outpassTable: document.getElementById("outpassTable"),
    outpassTableBody: document.getElementById("outpassTableBody"),
    emptyState: document.getElementById("emptyState"),
    showingCountText: document.getElementById("showingCountText"),
    toastContainer: document.getElementById("toastContainer"),

    // Student Portal Elements
    studentCardAvatar: document.getElementById("studentCardAvatar"),
    studentCardName: document.getElementById("studentCardName"),
    studentCardRoll: document.getElementById("studentCardRoll"),
    studentCardDept: document.getElementById("studentCardDept"),
    studentCardRoom: document.getElementById("studentCardRoom"),
    btnStudentApplyPass: document.getElementById("btnStudentApplyPass"),
    studentTable: document.getElementById("studentTable"),
    studentTableBody: document.getElementById("studentTableBody"),
    studentEmptyState: document.getElementById("studentEmptyState"),

    // Review Modal (Warden)
    reviewModal: document.getElementById("reviewModal"),
    btnCloseReviewModal: document.getElementById("btnCloseReviewModal"),
    btnCancelModal: document.getElementById("btnCancelModal"),
    modalRequestId: document.getElementById("modalRequestId"),
    modalTypeBadge: document.getElementById("modalTypeBadge"),
    modalStatusBadge: document.getElementById("modalStatusBadge"),
    modalAvatar: document.getElementById("modalAvatar"),
    modalStudentName: document.getElementById("modalStudentName"),
    modalRollNo: document.getElementById("modalRollNo"),
    modalDept: document.getElementById("modalDept"),
    modalBlockRoom: document.getElementById("modalBlockRoom"),
    modalPhone: document.getElementById("modalPhone"),
    modalHistPasses: document.getElementById("modalHistPasses"),
    modalHistAttendance: document.getElementById("modalHistAttendance"),
    modalHistCgpa: document.getElementById("modalHistCgpa"),
    modalHistOverstays: document.getElementById("modalHistOverstays"),
    modalDestination: document.getElementById("modalDestination"),
    modalDepTime: document.getElementById("modalDepTime"),
    modalRetTime: document.getElementById("modalRetTime"),
    modalDuration: document.getElementById("modalDuration"),
    modalReason: document.getElementById("modalReason"),
    modalParentName: document.getElementById("modalParentName"),
    modalParentPhone: document.getElementById("modalParentPhone"),
    btnCallParent: document.getElementById("btnCallParent"),
    btnToggleConsent: document.getElementById("btnToggleConsent"),
    modalConsentBanner: document.getElementById("modalConsentBanner"),
    modalConsentText: document.getElementById("modalConsentText"),
    wardenRemarksInput: document.getElementById("wardenRemarksInput"),
    btnRejectOutpass: document.getElementById("btnRejectOutpass"),
    btnApproveOutpass: document.getElementById("btnApproveOutpass"),
    rejectionPresets: document.querySelectorAll(".btn-preset"),

    // Status History Modal ([SCRUM06B-F002-DB-001])
    statusHistoryModal: document.getElementById("statusHistoryModal"),
    btnCloseHistModal: document.getElementById("btnCloseHistModal"),
    btnCloseHistBtn: document.getElementById("btnCloseHistBtn"),
    historyTimelineList: document.getElementById("historyTimelineList"),

    // Digital Gate Pass Modal
    passModal: document.getElementById("passModal"),
    btnClosePassModal: document.getElementById("btnClosePassModal"),
    btnClosePassModalBtn: document.getElementById("btnClosePassModalBtn"),
    btnPrintPass: document.getElementById("btnPrintPass"),
    passTokenCode: document.getElementById("passTokenCode"),
    passStudentName: document.getElementById("passStudentName"),
    passRollNo: document.getElementById("passRollNo"),
    passHostelRoom: document.getElementById("passHostelRoom"),
    passDestination: document.getElementById("passDestination"),
    passDepWindow: document.getElementById("passDepWindow"),
    passRetWindow: document.getElementById("passRetWindow"),
    passRemarks: document.getElementById("passRemarks"),
    passWarden: document.getElementById("passWarden"),
    passTimestamp: document.getElementById("passTimestamp"),

    // Student Application Form Modal
    simulatorModal: document.getElementById("simulatorModal"),
    btnCloseSimulatorModal: document.getElementById("btnCloseSimulatorModal"),
    btnCancelSimulator: document.getElementById("btnCancelSimulator"),
    simulatorForm: document.getElementById("simulatorForm"),
    simRollNo: document.getElementById("simRollNo"),
    simStudentName: document.getElementById("simStudentName"),
    simDepartment: document.getElementById("simDepartment"),
    simHostelBlock: document.getElementById("simHostelBlock"),
    simRoomNo: document.getElementById("simRoomNo"),
    simOutpassType: document.getElementById("simOutpassType"),
    simDestination: document.getElementById("simDestination"),
    simDepTime: document.getElementById("simDepTime"),
    simRetTime: document.getElementById("simRetTime"),
    simReason: document.getElementById("simReason"),
    simParentName: document.getElementById("simParentName"),
    simParentPhone: document.getElementById("simParentPhone"),
    simAssignedWarden: document.getElementById("simAssignedWarden")
  };

  // ==========================================
  // Modern Web Guidance: Light-Dismiss Dialog Fallback
  // ==========================================
  function setupDialogLightDismiss(dialog) {
    if (!dialog) return;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        dialog.close();
      });
    }
  }

  [el.reviewModal, el.passModal, el.simulatorModal, el.statusHistoryModal].forEach(setupDialogLightDismiss);

  // ==========================================
  // Live Header Clock
  // ==========================================
  function updateLiveClock() {
    const now = new Date();
    const options = {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    };
    if (el.liveClock) {
      el.liveClock.textContent = now.toLocaleDateString("en-US", options);
    }
  }
  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  // ==========================================
  // Utilities
  // ==========================================
  function formatDateTime(isoString) {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  function calculateDuration(startIso, endIso) {
    if (!startIso || !endIso) return "-";
    const start = new Date(startIso);
    const end = new Date(endIso);
    const diffMs = end - start;
    if (diffMs <= 0) return "0 mins";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  function getInitials(name) {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function getTypeBadge(type) {
    switch (type) {
      case "DAY_PASS": return `<span class="badge-type badge-day">Day Pass</span>`;
      case "WEEKEND_PASS": return `<span class="badge-type badge-weekend">Weekend Pass</span>`;
      case "EMERGENCY_PASS": return `<span class="badge-type badge-emergency">🚨 Emergency Pass</span>`;
      case "VACATION_PASS": return `<span class="badge-type badge-vacation">Vacation Pass</span>`;
      default: return `<span class="badge-type badge-day">${type || "Pass"}</span>`;
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case "APPROVED": return `<span class="status-badge approved">✔ Approved</span>`;
      case "REJECTED": return `<span class="status-badge rejected">✖ Rejected</span>`;
      case "PENDING": return `<span class="status-badge pending">⏳ Pending</span>`;
      default: return `<span class="status-badge">${status}</span>`;
    }
  }

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === "success" ? "✔" : type === "error" ? "✖" : "ℹ"}</span>
      <span>${message}</span>
    `;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.4s";
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // ==========================================
  // Authentication & Portal View Switcher
  // ==========================================
  function checkAuthState() {
    if (!currentUser) {
      // Show Login Section
      el.loginSection.classList.remove("hidden");
      el.appShell.classList.add("hidden");
    } else {
      // Show App Shell
      el.loginSection.classList.add("hidden");
      el.appShell.classList.remove("hidden");

      // Update Nav Details
      el.navUserName.textContent = currentUser.name;
      el.navUserRole.textContent = currentUser.role === "WARDEN" ? "Hostel Warden" : `Student • ${currentUser.id}`;
      el.navUserAvatar.textContent = getInitials(currentUser.name);

      if (currentUser.role === "WARDEN") {
        el.navSubtitle.textContent = "Warden Review & Approval Portal";
        el.wardenPortalSection.classList.remove("hidden");
        el.studentPortalSection.classList.add("hidden");
        fetchStats();
        fetchWardenRequests();
      } else {
        el.navSubtitle.textContent = "Student Permission & Outpass Portal";
        el.wardenPortalSection.classList.add("hidden");
        el.studentPortalSection.classList.remove("hidden");
        setupStudentPortal();
      }
    }
  }

  // Role Tab Switching on Login Form (if present)
  if (el.tabLoginStudent && el.tabLoginWarden) {
    el.tabLoginStudent.addEventListener("click", () => {
      el.tabLoginStudent.classList.add("active");
      el.tabLoginWarden.classList.remove("active");
      if (el.loginSelectedRole) el.loginSelectedRole.value = "STUDENT";
      if (el.lblIdentifier) el.lblIdentifier.textContent = "College Roll Number / Student ID";
      if (el.loginIdentifier) el.loginIdentifier.placeholder = "e.g. 2024506057";
      if (el.loginErrorBanner) el.loginErrorBanner.classList.add("hidden");
    });

    el.tabLoginWarden.addEventListener("click", () => {
      el.tabLoginWarden.classList.add("active");
      el.tabLoginStudent.classList.remove("active");
      if (el.loginSelectedRole) el.loginSelectedRole.value = "WARDEN";
      if (el.lblIdentifier) el.lblIdentifier.textContent = "Hostel Warden ID";
      if (el.loginIdentifier) el.loginIdentifier.placeholder = "e.g. WARDEN-MAR";
      if (el.loginErrorBanner) el.loginErrorBanner.classList.add("hidden");
    });
  }

  // Demo Quick Fill Buttons (Registered Users)
  if (el.btnFillStudent1 && el.tabLoginStudent) {
    el.btnFillStudent1.addEventListener("click", () => {
      el.tabLoginStudent.click();
      el.loginIdentifier.value = "2024506057";
      el.loginPassword.value = "student123";
      el.loginErrorBanner.classList.add("hidden");
    });
  }

  // Login Submission
  if (el.loginForm) {
    el.loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (el.loginErrorBanner) el.loginErrorBanner.classList.add("hidden");

      const identifier = el.loginIdentifier.value.trim();
      const password = el.loginPassword.value;
      const role = el.loginSelectedRole ? el.loginSelectedRole.value : "STUDENT";

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password, role })
        });

        const json = await res.json();

        if (json.success) {
          currentUser = json.user;
          sessionStorage.setItem("e_outpass_user", JSON.stringify(currentUser));
          localStorage.setItem("eop_user", JSON.stringify(currentUser));
          showToast(json.message, "success");
          checkAuthState();
        } else {
          if (el.loginErrorText) el.loginErrorText.textContent = json.error || "Authentication failed.";
          if (el.loginErrorBanner) el.loginErrorBanner.classList.remove("hidden");
        }
      } catch (err) {
        if (el.loginErrorText) el.loginErrorText.textContent = "Server connection error. Please ensure backend is running.";
        if (el.loginErrorBanner) el.loginErrorBanner.classList.remove("hidden");
      }
    });
  }

  // Logout
  if (el.btnLogout) {
    el.btnLogout.addEventListener("click", () => {
      currentUser = null;
      sessionStorage.removeItem("e_outpass_user");
      localStorage.removeItem("eop_user");
      localStorage.removeItem("eop_token");
      showToast("Logged out successfully.", "info");
      checkAuthState();
    });
  }

  // ==========================================
  // WARDEN PORTAL: Data Fetch & Render
  // ==========================================
  async function fetchStats() {
    try {
      const headers = {};
      const params = new URLSearchParams();
      if (currentUser && currentUser.role === "WARDEN") {
        headers["x-user-id"] = currentUser.id;
        headers["x-user-role"] = currentUser.role;
        params.append("wardenId", currentUser.id);
      }
      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`/api/stats${qs}`, { headers });
      const json = await res.json();
      if (json.success) {
        state.stats = json.data;
        el.kpiPending.textContent = json.data.pendingCount ?? 0;
        el.kpiApproved.textContent = json.data.approvedToday ?? 0;
        el.kpiOutside.textContent = json.data.currentlyOutside ?? 0;
        el.kpiRejected.textContent = json.data.rejectedToday ?? 0;
        el.tabPendingCount.textContent = json.data.pendingCount ?? 0;
        el.tabAllCount.textContent = json.data.totalRequests ?? 0;

        if (json.data.urgentPending > 0) {
          el.kpiUrgentSub.innerHTML = `<span class="red-text font-bold">🚨 ${json.data.urgentPending} departing in &lt; 3h</span>`;
        } else {
          el.kpiUrgentSub.textContent = "All queues normal";
        }
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }

  async function fetchWardenRequests() {
    try {
      const params = new URLSearchParams();
      const headers = {};
      if (currentUser && currentUser.role === "WARDEN") {
        headers["x-user-id"] = currentUser.id;
        headers["x-user-role"] = currentUser.role;
        params.append("wardenId", currentUser.id);
      }
      if (state.currentView === "PENDING") params.append("status", "PENDING");
      if (state.filterBlock !== "ALL") params.append("hostelBlock", state.filterBlock);
      if (state.filterType !== "ALL") params.append("outpassType", state.filterType);
      if (state.searchQuery.trim()) params.append("search", state.searchQuery.trim());

      const endpoint = state.currentView === "PENDING"
        ? `/api/outpasses/pending?${params.toString()}`
        : `/api/outpasses?${params.toString()}`;

      const res = await fetch(endpoint, { headers });
      const json = await res.json();

      if (json.success) {
        state.requests = json.data;
        renderWardenTable(json.data);
      }
    } catch (err) {
      console.error("Error loading warden requests:", err);
    }
  }

  function renderWardenTable(records) {
    if (!records || records.length === 0) {
      el.outpassTableBody.innerHTML = "";
      el.emptyState.classList.remove("hidden");
      el.outpassTable.classList.add("hidden");
      el.showingCountText.textContent = "Showing 0 requests";
      return;
    }

    el.emptyState.classList.add("hidden");
    el.outpassTable.classList.remove("hidden");
    el.showingCountText.textContent = `Showing ${records.length} ${records.length === 1 ? "request" : "requests"}`;

    el.outpassTableBody.innerHTML = records.map(req => {
      const isUrgent = req.status === "PENDING" && new Date(req.departureTime).getTime() - Date.now() <= 3 * 3600 * 1000;
      const isEmergency = req.outpassType === "EMERGENCY_PASS";
      const rowClass = isEmergency || isUrgent ? "urgent-row" : "";
      const duration = calculateDuration(req.departureTime, req.expectedReturnTime);

      const parentConsentBadge = req.parentConsent === "VERIFIED" || req.parentConsent === "CONFIRMED_VIA_SMS"
        ? `<span class="consent-badge consent-verified">✔ Consent Verified</span>`
        : `<span class="consent-badge consent-pending">📞 Pending Verification</span>`;

      const actualOut = req.out_time || req.outTime;
      const actualIn = req.in_time || req.inTime;

      return `
        <tr class="${rowClass}" data-id="${req.id}">
          <td>
            <div class="req-id-col">
              <span class="req-id">${req.id}</span>
              ${getTypeBadge(req.outpassType)}
            </div>
          </td>
          <td>
            <div class="student-col">
              <div class="student-avatar">${getInitials(req.studentName)}</div>
              <div class="student-info">
                <span class="student-name-text">${req.studentName}</span>
                <span class="student-meta-sub">${req.studentId} • ${req.department ? req.department.split(' ')[0] : 'Engg'}</span>
              </div>
            </div>
          </td>
          <td>
            <div class="room-col">
              <span class="room-no">Room ${req.roomNumber}</span>
              <span class="block-name">${req.hostelBlock}</span>
            </div>
          </td>
          <td>
            <div class="dest-col">
              <div class="dest-place">${req.destination}</div>
              <div class="dest-reason" title="${req.reason}">${req.reason}</div>
            </div>
          </td>
          <td>
            <div class="time-col">
              <div class="time-row"><span class="time-lbl">OUT:</span><span>${formatDateTime(req.departureTime)}</span></div>
              <div class="time-row"><span class="time-lbl">IN:</span><span class="bold">${formatDateTime(req.expectedReturnTime)}</span></div>
              <div class="time-duration-chip">⏱ ${duration}</div>
            </div>
          </td>
          <td>
            <div class="time-col" style="font-size:0.8rem;">
              <div class="time-row"><span class="time-lbl" style="color:${actualOut ? '#0284c7' : '#94a3b8'};">OUT:</span><span style="font-weight:${actualOut ? '600' : 'normal'}; color:${actualOut ? '#0f172a' : '#94a3b8'};">${actualOut ? formatDateTime(actualOut) : 'Not Exited'}</span></div>
              <div class="time-row"><span class="time-lbl" style="color:${actualIn ? '#16a34a' : '#94a3b8'};">IN:</span><span style="font-weight:${actualIn ? '600' : 'normal'}; color:${actualIn ? '#0f172a' : '#94a3b8'};">${actualIn ? formatDateTime(actualIn) : 'Not Returned'}</span></div>
            </div>
          </td>
          <td>
            <div class="parent-col">
              <span class="parent-name-text">${req.parentName}</span>
              <a href="tel:${req.parentPhone}" class="parent-phone-link">📞 ${req.parentPhone}</a>
              ${parentConsentBadge}
            </div>
          </td>
          <td>
            <div class="action-btn-group">
              ${req.status === "PENDING" ? `
                <button class="btn btn-sm btn-primary btn-review" data-id="${req.id}"><span>Review & Verify</span></button>
                <button class="btn-action-icon approve btn-quick-approve" data-id="${req.id}" title="Quick Approve">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                <button class="btn-action-icon reject btn-quick-reject" data-id="${req.id}" title="Reject with Reason">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              ` : `
                ${getStatusBadge(req.status)}
                <button class="btn btn-sm btn-outline btn-audit-history" data-id="${req.id}" title="View Audit History">
                  📜 History
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join("");

    attachWardenRowEvents();
  }

  function attachWardenRowEvents() {
    document.querySelectorAll(".btn-review").forEach(btn => {
      btn.addEventListener("click", () => openReviewModal(btn.getAttribute("data-id")));
    });

    document.querySelectorAll(".btn-quick-approve").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm(`Approve outpass ${id}?`)) {
          executeWardenDecision(id, "APPROVE", "Quick approve by warden.");
        }
      });
    });

    document.querySelectorAll(".btn-quick-reject").forEach(btn => {
      btn.addEventListener("click", () => openReviewModal(btn.getAttribute("data-id"), true));
    });

    document.querySelectorAll(".btn-audit-history").forEach(btn => {
      btn.addEventListener("click", () => openHistoryModal(btn.getAttribute("data-id")));
    });
  }

  // ==========================================
  // WARDEN: Execute Approval/Rejection ([BE-001])
  // ==========================================
  async function executeWardenDecision(id, action, remarks, rejectionReason) {
    try {
      const endpoint = action === "APPROVE" ? `/api/outpasses/${id}/approve` : `/api/outpasses/${id}/reject`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
          "x-user-name": currentUser.name
        },
        body: JSON.stringify({ remarks, rejectionReason })
      });

      const json = await res.json();
      if (json.success) {
        const studentName = json.data?.outpass?.studentName || (state.selectedRequest && state.selectedRequest.studentName) || "the student";
        const msg = action === "APPROVE"
          ? `Outpass approved! Gate security token generated for ${studentName}.`
          : json.message;
        showToast(msg, "success");
        if (el.reviewModal.open) el.reviewModal.close();
        await fetchStats();
        await fetchWardenRequests();
      } else {
        showToast(json.error || "Action failed", "error");
      }
    } catch (err) {
      showToast("Network error executing decision", "error");
    }
  }

  function openReviewModal(id, focusReject = false) {
    const req = state.requests.find(r => r.id === id);
    if (!req) return;
    state.selectedRequest = req;

    el.modalRequestId.textContent = req.id;
    el.modalTypeBadge.textContent = req.outpassType.replace("_", " ");
    el.modalStatusBadge.textContent = req.status;
    el.modalAvatar.textContent = getInitials(req.studentName);
    el.modalStudentName.textContent = req.studentName;
    el.modalRollNo.textContent = `Roll: ${req.studentId}`;
    el.modalDept.textContent = req.department || "Engineering";
    el.modalBlockRoom.textContent = `${req.hostelBlock} • Room ${req.roomNumber}`;
    el.modalPhone.textContent = `📞 ${req.studentPhone}`;

    const hist = req.studentHistory || {};
    el.modalHistPasses.textContent = hist.totalOutpassesThisSem ?? "2";
    el.modalHistAttendance.textContent = hist.attendance ?? "94%";
    el.modalHistCgpa.textContent = hist.cgpa ?? "8.80";
    el.modalHistOverstays.textContent = hist.overstays ?? "0";

    el.modalDestination.textContent = req.destination;
    el.modalDepTime.textContent = formatDateTime(req.departureTime);
    el.modalRetTime.textContent = formatDateTime(req.expectedReturnTime);
    el.modalDuration.textContent = calculateDuration(req.departureTime, req.expectedReturnTime);
    el.modalReason.textContent = req.reason;

    el.modalParentName.textContent = req.parentName;
    el.modalParentPhone.textContent = req.parentPhone;
    el.btnCallParent.href = `tel:${req.parentPhone}`;

    el.wardenRemarksInput.value = req.wardenRemarks || "";
    el.reviewModal.showModal();

    if (focusReject) {
      el.wardenRemarksInput.focus();
      el.wardenRemarksInput.placeholder = "Specify reason for rejecting this outpass...";
    }
  }

  el.btnApproveOutpass.addEventListener("click", () => {
    if (!state.selectedRequest) return;
    const remarks = el.wardenRemarksInput.value.trim() || "Approved by warden.";
    executeWardenDecision(state.selectedRequest.id, "APPROVE", remarks);
  });

  el.btnRejectOutpass.addEventListener("click", () => {
    if (!state.selectedRequest) return;
    const reason = el.wardenRemarksInput.value.trim();
    if (!reason) {
      alert("A specific rejection reason is mandatory when rejecting an outpass.");
      el.wardenRemarksInput.focus();
      return;
    }
    executeWardenDecision(state.selectedRequest.id, "REJECT", reason, reason);
  });

  el.rejectionPresets.forEach(btn => {
    btn.addEventListener("click", () => {
      el.wardenRemarksInput.value = btn.getAttribute("data-reason");
      el.wardenRemarksInput.focus();
    });
  });

  el.btnCloseReviewModal.addEventListener("click", () => el.reviewModal.close());
  el.btnCancelModal.addEventListener("click", () => el.reviewModal.close());

  // ==========================================
  // STUDENT PORTAL: Setup & Outpass Tracking
  // ==========================================
  function setupStudentPortal() {
    el.studentCardName.textContent = currentUser.name;
    el.studentCardRoll.textContent = `Roll: ${currentUser.id}`;
    el.studentCardDept.textContent = currentUser.department || "Information Technology";
    el.studentCardRoom.textContent = `${currentUser.hostel_block || 'Block A'} • Room ${currentUser.room_number || 'A-304'}`;
    el.studentCardAvatar.textContent = getInitials(currentUser.name);

    fetchStudentRequests();
  }

  async function fetchStudentRequests() {
    try {
      const res = await fetch("/api/outpasses");
      const json = await res.json();
      if (json.success) {
        // Filter outpasses belonging specifically to the logged-in student
        const myRequests = json.data.filter(r => r.studentId.toUpperCase() === currentUser.id.toUpperCase());
        state.studentRequests = myRequests;
        renderStudentTable(myRequests);
      }
    } catch (err) {
      console.error("Failed to load student requests:", err);
    }
  }

  function renderStudentTable(records) {
    if (!records || records.length === 0) {
      el.studentTableBody.innerHTML = "";
      el.studentEmptyState.classList.remove("hidden");
      el.studentTable.classList.add("hidden");
      return;
    }

    el.studentEmptyState.classList.add("hidden");
    el.studentTable.classList.remove("hidden");

    el.studentTableBody.innerHTML = records.map(req => {
      const actualOut = req.out_time || req.outTime;
      const actualIn = req.in_time || req.inTime;
      return `
        <tr>
          <td>
            <div class="req-id-col">
              <span class="req-id">${req.id}</span>
              ${getTypeBadge(req.outpassType)}
            </div>
          </td>
          <td>
            <div class="dest-col">
              <div class="dest-place">${req.destination}</div>
              <div class="dest-reason">${req.reason}</div>
            </div>
          </td>
          <td>${formatDateTime(req.departureTime)}</td>
          <td>${formatDateTime(req.expectedReturnTime)}</td>
          <td>
            <div style="font-size:0.8rem; line-height: 1.45;">
              <div><strong style="color:${actualOut ? '#0284c7' : '#94a3b8'};">OUT:</strong> ${actualOut ? formatDateTime(actualOut) : '<span style="color:#94a3b8;">Pending Exit</span>'}</div>
              <div><strong style="color:${actualIn ? '#16a34a' : '#94a3b8'};">IN:</strong> ${actualIn ? formatDateTime(actualIn) : '<span style="color:#94a3b8;">Pending Return</span>'}</div>
            </div>
          </td>
          <td>${getStatusBadge(req.status)}</td>
          <td class="text-right">
            <div class="action-btn-group">
              <button class="btn btn-sm btn-outline btn-view-history" data-id="${req.id}">
                📜 View History
              </button>
              ${["APPROVED", "CHECKED-OUT", "COMPLETED"].includes(req.status) ? `
                <button class="btn btn-sm btn-primary btn-view-pass" data-id="${req.id}">
                  🎟 Gate Pass
                </button>
              ` : ""}
            </div>
          </td>
        </tr>
      `;
    }).join("");

    document.querySelectorAll(".btn-view-history").forEach(btn => {
      btn.addEventListener("click", () => openHistoryModal(btn.getAttribute("data-id")));
    });

    document.querySelectorAll(".btn-view-pass").forEach(btn => {
      btn.addEventListener("click", () => {
        const pass = state.studentRequests.find(r => r.id === btn.getAttribute("data-id"));
        if (pass) openPassModal(pass);
      });
    });
  }

  // ==========================================
  // MODULE 1: Status History Modal ([DB-001])
  // ==========================================
  async function openHistoryModal(outpassId) {
    try {
      const res = await fetch(`/api/outpasses/${outpassId}/history`);
      const json = await res.json();

      if (!json.success || !json.data || !json.data.history) {
        alert("Failed to load status history for this outpass.");
        return;
      }

      const history = json.data.history;
      if (history.length === 0) {
        el.historyTimelineList.innerHTML = `<p class="text-center">No status changes recorded yet for this outpass.</p>`;
      } else {
        el.historyTimelineList.innerHTML = history.map((h, index) => {
          const dotClass = h.new_status === "APPROVED" ? "approved" : h.new_status === "REJECTED" ? "rejected" : "pending";
          return `
            <div class="timeline-item">
              <div class="timeline-dot ${dotClass}">#${index + 1}</div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-transition">${h.previous_status} ➔ ${h.new_status}</span>
                  <span class="timeline-time">${formatDateTime(h.changed_at)}</span>
                </div>
                <div class="timeline-actor">
                  Changed by: <strong>${h.changed_by_name || h.changed_by}</strong> (${h.changed_by_role})
                </div>
                ${h.remarks || h.rejection_reason ? `
                  <div class="timeline-remarks">
                    💬 "${h.remarks || h.rejection_reason}"
                  </div>
                ` : ""}
              </div>
            </div>
          `;
        }).join("");
      }

      el.statusHistoryModal.showModal();
    } catch (err) {
      alert("Error fetching status history from database.");
    }
  }

  el.btnCloseHistModal.addEventListener("click", () => el.statusHistoryModal.close());
  el.btnCloseHistBtn.addEventListener("click", () => el.statusHistoryModal.close());

  // ==========================================
  // Student Apply Outpass Modal
  // ==========================================
  el.btnStudentApplyPass.addEventListener("click", () => {
    el.simRollNo.value = currentUser.id;
    el.simStudentName.value = currentUser.name;
    el.simDepartment.value = currentUser.department || "Information Technology";
    el.simHostelBlock.value = currentUser.hostel_block || "Marutham (Boys Hostel)";
    el.simRoomNo.value = currentUser.room_number || "M-304";
    el.simParentPhone.value = currentUser.phone || "+91 94432 10987";

    const hostelWardenDirectory = {
      "marutham": "Dr. R. Sundaram (Marutham Boys Hostel • WARDEN-MAR)",
      "kurunji": "Dr. K. Arumugam (Kurunji Boys Hostel • WARDEN-KUR)",
      "bhavani": "Dr. M. Selvam (Bhavani Boys Hostel • WARDEN-BHA)",
      "cauvery": "Dr. S. Meenakshi (Cauvery Girls Hostel • WARDEN-CAU)",
      "ponni": "Dr. P. Lakshmi (Ponni Girls Hostel • WARDEN-PON)",
      "vaigai": "Dr. V. Revathi (Vaigai Girls Hostel • WARDEN-VAI)"
    };
    const blockKey = (currentUser.hostel_block || "Marutham").toLowerCase();
    let assignedName = "Dr. R. Sundaram (Marutham Boys Hostel • WARDEN-MAR)";
    for (const [key, val] of Object.entries(hostelWardenDirectory)) {
      if (blockKey.includes(key)) {
        assignedName = val;
        break;
      }
    }
    if (el.simAssignedWarden) el.simAssignedWarden.value = assignedName;

    const now = new Date();
    const dep = new Date(now.getTime() + 2 * 3600 * 1000);
    const ret = new Date(now.getTime() + 24 * 3600 * 1000);
    const toIsoLocal = (d) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };

    el.simDepTime.value = toIsoLocal(dep);
    el.simRetTime.value = toIsoLocal(ret);
    el.simDestination.value = "";
    el.simReason.value = "";

    el.simulatorModal.showModal();
  });

  el.btnCloseSimulatorModal.addEventListener("click", () => el.simulatorModal.close());
  el.btnCancelSimulator.addEventListener("click", () => el.simulatorModal.close());

  el.simulatorForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      studentId: el.simRollNo.value,
      studentName: el.simStudentName.value,
      department: el.simDepartment.value,
      hostelBlock: el.simHostelBlock.value,
      roomNumber: el.simRoomNo.value,
      outpassType: el.simOutpassType.value,
      destination: el.simDestination.value.trim(),
      departureTime: new Date(el.simDepTime.value).toISOString(),
      expectedReturnTime: new Date(el.simRetTime.value).toISOString(),
      reason: el.simReason.value.trim(),
      parentName: el.simParentName.value.trim(),
      parentPhone: el.simParentPhone.value.trim(),
      parentConsent: "PENDING_CALL"
    };

    try {
      const res = await fetch("/api/outpasses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.success) {
        showToast(`Outpass request submitted! ID: ${json.data.id}`, "success");
        el.simulatorModal.close();
        fetchStudentRequests();
      } else {
        alert(json.error || "Failed to submit request.");
      }
    } catch (err) {
      alert("Error submitting request to server.");
    }
  });

  // Digital Gate Pass Modal
  function openPassModal(record) {
    el.passTokenCode.textContent = record.gatePassToken || record.outboundCode || record.outbound_code || "EOP-SEC-8921";
    el.passStudentName.textContent = record.studentName;
    el.passRollNo.textContent = record.studentId;
    el.passHostelRoom.textContent = `${record.hostelBlock} • Room ${record.roomNumber}`;
    el.passDestination.textContent = record.destination;
    el.passDepWindow.textContent = formatDateTime(record.departureTime);
    el.passRetWindow.textContent = formatDateTime(record.expectedReturnTime);
    el.passRemarks.textContent = record.wardenRemarks || "Approved. Return before curfew.";
    el.passWarden.textContent = record.reviewedBy || "Chief Warden Dr. R. Sundaram";
    el.passTimestamp.textContent = `Authorized: ${formatDateTime(record.reviewedAt || record.updatedAt)}`;

    // 2-Phase Gate Verification Codes
    const outCode = record.outboundCode || record.outbound_code || "OUT-PENDING";
    const inCode = record.inboundCode || record.inbound_code || "IN-PENDING";

    const passOutboundCode = document.getElementById("passOutboundCode");
    const passInboundCode = document.getElementById("passInboundCode");
    if (passOutboundCode) passOutboundCode.textContent = outCode;
    if (passInboundCode) passInboundCode.textContent = inCode;

    const passOutboundSub = document.getElementById("passOutboundSubCode");
    const passInboundSub = document.getElementById("passInboundSubCode");
    if (passOutboundSub) passOutboundSub.textContent = outCode;
    if (passInboundSub) passInboundSub.textContent = inCode;

    // Render Dual QR Codes
    renderQrCode("outboundQrContainer", outCode);
    renderQrCode("inboundQrContainer", inCode);

    el.passModal.showModal();
  }

  function renderQrCode(containerId, text) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    if (typeof QRCode !== "undefined") {
      try {
        new QRCode(container, {
          text: text,
          width: 90,
          height: 90,
          colorDark: "#0f172a",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });
        return;
      } catch (e) {
        console.warn("QRCode rendering error, falling back to SVG:", e);
      }
    }
    // High-contrast clean SVG QR placeholder fallback with code
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:90px; height:90px; background:#fff; border:1px solid #cbd5e1; border-radius:6px; padding:4px;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="#1e293b">
          <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm11 0h2v2h-2v-2zm-3-2h4v2h-4v-2zm6 0h2v4h-2v-4zm-4 4h2v2h-2v-2zm4 2h2v2h-2v-2z"/>
        </svg>
        <span style="font-family:monospace; font-size:10px; font-weight:700; color:#0f172a; margin-top:2px;">${text}</span>
      </div>
    `;
  }

  el.btnClosePassModal.addEventListener("click", () => el.passModal.close());
  el.btnClosePassModalBtn.addEventListener("click", () => el.passModal.close());
  el.btnPrintPass.addEventListener("click", () => window.print());

  // Search and Filter Listeners for Warden View
  let searchTimer = null;
  el.searchInput.addEventListener("input", (e) => {
    const val = e.target.value;
    el.btnClearSearch.classList.toggle("hidden", val.length === 0);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.searchQuery = val;
      fetchWardenRequests();
    }, 250);
  });

  el.btnClearSearch.addEventListener("click", () => {
    el.searchInput.value = "";
    el.btnClearSearch.classList.add("hidden");
    state.searchQuery = "";
    fetchWardenRequests();
  });

  el.blockFilter.addEventListener("change", (e) => {
    state.filterBlock = e.target.value;
    fetchWardenRequests();
  });

  el.typeFilter.addEventListener("change", (e) => {
    state.filterType = e.target.value;
    fetchWardenRequests();
  });

  el.btnRefresh.addEventListener("click", () => {
    fetchStats();
    fetchWardenRequests();
    showToast("Warden queue refreshed", "info");
  });

  el.tabPending.addEventListener("click", () => {
    state.currentView = "PENDING";
    el.tabPending.classList.add("active");
    el.tabAll.classList.remove("active");
    fetchWardenRequests();
  });

  el.tabAll.addEventListener("click", () => {
    state.currentView = "ALL";
    el.tabAll.classList.add("active");
    el.tabPending.classList.remove("active");
    fetchWardenRequests();
  });

  // Initialize
  checkAuthState();
});
