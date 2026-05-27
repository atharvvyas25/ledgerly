/**
 * Ledgerly — Sleek Expense Sharing & Personal Finance
 * Core Screen Navigation & Interactions Script
 * 
 * This file is highly structured, fully reactive, and optimized.
 * It handles the SPA navigation, theme switching, dynamic calendar generation,
 * modal transitions, dynamic trip rendering, real-time expense calculations,
 * and standard greedy settlements matching.
 */

// ==========================================================
// --- 1. CORE APPLICATION STATE ---
// ==========================================================
let trips = [];

let activeTripId = 1;
window.activeTripId = activeTripId;
let tempTripMembers = [];

// --- DYNAMIC USER PROFILE STATE ---
let profile = {
  fullName: "Atharv Vyas",
  nickName: "Atharv",
  email: "atharv@ledgerly.com",
  avatar: "🦊",
  monthlyBudget: 30000,
  weeklyLimit: 15000
};

const saveProfileToLocalStorage = () => {
  localStorage.setItem("ledgerly-profile", JSON.stringify(profile));
  window.profile = profile;
};

// --- LOCAL STORAGE CACHING PIPELINE ---
const saveTripsToLocalStorage = () => {
  localStorage.setItem("ledgerly-trips", JSON.stringify(trips));
};

const loadTripsFromLocalStorage = () => {
  const storedTrips = localStorage.getItem("ledgerly-trips");
  if (storedTrips) {
    try {
      trips = JSON.parse(storedTrips).filter(t => t.id !== 1 && t.id !== 3);
      // Re-hydrate expense date string values back into actual JS Date objects
      trips.forEach(trip => {
        trip.expenses.forEach(exp => {
          if (exp.date) exp.date = new Date(exp.date);
        });
      });
    } catch (e) {
      console.error("Failed to parse ledgerly-trips from localStorage", e);
    }
  } else {
    // Cache the initial premium seed dataset instantly
    saveTripsToLocalStorage();
  }
  window.trips = trips;
  window.saveTripsToLocalStorage = saveTripsToLocalStorage;
  window.loadTripsFromLocalStorage = loadTripsFromLocalStorage;
};

loadTripsFromLocalStorage();

// --- HYDRATE PROFILE CACHE ---
const loadProfileFromLocalStorage = () => {
  const storedProfile = localStorage.getItem("ledgerly-profile");
  if (storedProfile) {
    try {
      profile = JSON.parse(storedProfile);
    } catch (e) {
      console.error("Failed to parse ledgerly-profile", e);
    }
  }
  window.profile = profile;
};
loadProfileFromLocalStorage();

const initApp = () => {
  // ==========================================================
  // --- 2. DOM ELEMENTS CACHE ---
  // ==========================================================
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const currentDateEl = document.getElementById('current-date');
  const dateStripContainer = document.getElementById('date-strip');

  // Bottom Navigation & Overlays
  const dockItems = document.querySelectorAll('.dock-list .dock-item:not(.fab-item)');
  const toastNotification = document.getElementById('toast-notification');

  // Modals & Bottom Sheets Toggles
  const addModal = document.getElementById('add-modal');
  const openAddModalBtn = document.getElementById('open-add-modal');
  const closeAddModalBtn = document.getElementById('close-add-modal');
  const closeModalOverlay = document.getElementById('close-modal-overlay');

  const tripsEntryModal = document.getElementById('trips-entry-modal');
  const homeTripsCard = document.getElementById('home-trips-card');
  const dockTripsTab = document.getElementById('dock-trips-tab');
  const closeTripsHubBtn = document.getElementById('close-trips-hub-btn');
  const closeTripsHubOverlay = document.getElementById('close-trips-hub-overlay');
  const btnTripsEntryNew = document.getElementById('btn-trips-entry-new');
  const btnTripsEntryList = document.getElementById('btn-trips-entry-list');

  const addMemberModal = document.getElementById('add-member-modal');
  const openAddMemberBtn = document.getElementById('open-add-member-btn');
  const closeAddMemberBtn = document.getElementById('close-add-member-btn');
  const closeMemberOverlay = document.getElementById('close-member-overlay');
  const addMemberForm = document.getElementById('add-member-form');
  const tripMembersListContainer = document.getElementById('trip-members-list');

  const openTripExpenseModalBtn = document.getElementById('open-trip-expense-modal');
  const closeTripExpenseBtn = document.getElementById('close-trip-expense-btn');
  const closeTripExpenseOverlay = document.getElementById('close-trip-expense-overlay');
  const tripExpenseForm = document.getElementById('trip-expense-form');

  // Modal 5: View Expense Details Cache
  const viewExpenseDetailsModal = document.getElementById('view-expense-details-modal');
  const closeExpenseDetailsBtn = document.getElementById('close-expense-details-btn');
  const closeExpenseDetailsOverlay = document.getElementById('close-expense-details-overlay');

  const edIcon = document.getElementById('detail-exp-icon');
  const edAmount = document.getElementById('detail-exp-amount');
  const edTitle = document.getElementById('detail-exp-title');
  const edCategory = document.getElementById('detail-exp-category');
  const edPayer = document.getElementById('detail-exp-payer');
  const edSplit = document.getElementById('detail-exp-split');
  const edDate = document.getElementById('detail-exp-date');
  const edNotes = document.getElementById('detail-exp-notes');

  const edEditBtn = document.getElementById('detail-exp-edit-btn');
  const edDeleteBtn = document.getElementById('detail-exp-delete-btn');

  // Modal 6: Manage Members Cache
  const manageMembersModal = document.getElementById('manage-members-modal');
  const closeManageMembersBtn = document.getElementById('close-manage-members-btn');
  const closeManageMembersOverlay = document.getElementById('close-manage-members-overlay');
  const openManageMembersBtn = document.getElementById('open-manage-members-btn');
  const detailsAddMemberForm = document.getElementById('details-add-member-form');
  const detailsMemberName = document.getElementById('details-member-name');
  const detailsMembersScrollContainer = document.getElementById('details-members-scroll-container');

  // View Screen Back triggers
  const createTripBackBtn = document.getElementById('create-trip-back');
  const existingTripsBackBtn = document.getElementById('existing-trips-back');
  const detailsBackBtn = document.getElementById('details-back-btn');
  const addTripFromListBtn = document.getElementById('add-trip-from-list');

  // Create Trip form components
  const createTripForm = document.getElementById('create-trip-form');
  const tripNameInput = document.getElementById('trip-name');
  const tripDestInput = document.getElementById('trip-destination');
  const previewTripName = document.getElementById('preview-trip-name');
  const previewTripDest = document.getElementById('preview-trip-dest');
  const bannerPreview = document.getElementById('banner-preview');

  const tripsCardsContainer = document.getElementById('trips-cards-list-container');

  // Reference Date for Calendar Strip
  const systemDate = new Date();

  // ==========================================================
  // --- 3. SINGLE PAGE NAVIGATION ROUTING (SPA SWITCHER) ---
  // ==========================================================
  const navigateTo = (viewId) => {
    // Hide all views
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.remove('active');
    });

    // Show active view
    const activeView = document.getElementById(viewId);
    if (activeView) {
      activeView.classList.add('active');

      const scrollBody = activeView.querySelector('.view-body-scroll');
      if (scrollBody) {
        scrollBody.scrollTop = 0;
      }
    }

    // Reset bottom nav highlights
    document.querySelectorAll('.dock-item').forEach(item => {
      item.classList.remove('active');
    });

    if (viewId === 'home-view' || viewId === 'history-view') {
      document.querySelector('.dock-item[data-tab="home"]').classList.add('active');
    } else if (viewId === 'existing-trips-view' || viewId === 'create-trip-view' || viewId === 'trip-details-view') {
      document.querySelector('.dock-item[data-tab="trips"]').classList.add('active');
    } else if (viewId === 'finance-view') {
      document.querySelector('.dock-item[data-tab="analytics"]').classList.add('active');
    } else if (viewId === 'profile-view') {
      const item = document.querySelector('.dock-item[data-tab="profile"]');
      if (item) item.classList.add('active');
    }
  };
  window.navigateTo = navigateTo;

  // Screen Back Handlers
  createTripBackBtn.addEventListener('click', () => navigateTo('home-view'));
  existingTripsBackBtn.addEventListener('click', () => navigateTo('home-view'));
  detailsBackBtn.addEventListener('click', () => navigateTo('existing-trips-view'));

  const historyBackBtn = document.getElementById('history-back-btn');
  if (historyBackBtn) {
    historyBackBtn.addEventListener('click', () => navigateTo('home-view'));
  }

  addTripFromListBtn.addEventListener('click', () => {
    resetCreateTripForm();
    navigateTo('create-trip-view');
  });

  // Bottom navigation elements handler
  dockItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      if (targetTab === 'home') {
        navigateTo('home-view');
      } else if (targetTab === 'trips') {
        toggleModal(tripsEntryModal, true);
      } else if (targetTab === 'analytics') {
        navigateTo('finance-view');
      } else if (targetTab === 'profile') {
        navigateTo('profile-view');
      } else {
        showToast(`Viewing ${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)} Section`);
      }
    });
  });

  // Home header avatar click handler (navigates to Profile Tab)
  const headerAvatar = document.querySelector('.profile-avatar');
  if (headerAvatar) {
    headerAvatar.style.cursor = 'pointer';
    headerAvatar.title = 'View Profile & Settings';
    headerAvatar.addEventListener('click', () => {
      navigateTo('profile-view');
      showToast('Navigated to Profile');
    });
  }

  // ==========================================================
  // --- 4. THEME SWITCHER (DARK / LIGHT TOGGLE) ---
  // ==========================================================
  const activeSavedTheme = localStorage.getItem('ledgerly-theme') || 'dark';
  htmlEl.setAttribute('data-theme', activeSavedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('ledgerly-theme', newTheme);
    showToast(`Switched to ${newTheme.toUpperCase()} mode`);
  });

  // ==========================================================
  // --- 5. DYNAMIC CALENDAR STRIP GENERATOR ---
  // ==========================================================
  const formatDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-IN', options);
  };
  currentDateEl.textContent = formatDate(systemDate);

  const generateDateStrip = () => {
    dateStripContainer.innerHTML = '';
    const dayOfWeek = systemDate.getDay();
    const mondayDiff = systemDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(systemDate);
    startOfWeek.setDate(mondayDiff);
    const weekDaysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const cellDate = new Date(startOfWeek);
      cellDate.setDate(startOfWeek.getDate() + i);

      const cell = document.createElement('div');
      cell.classList.add('date-cell');

      const isToday = cellDate.getDate() === systemDate.getDate() &&
        cellDate.getMonth() === systemDate.getMonth() &&
        cellDate.getFullYear() === systemDate.getFullYear();

      if (isToday) cell.classList.add('today');

      cell.innerHTML = `
        <span class="date-day">${weekDaysShort[i]}</span>
        <span class="date-number">${cellDate.getDate()}</span>
      `;

      cell.addEventListener('click', () => {
        document.querySelectorAll('.date-cell').forEach(c => c.classList.remove('today'));
        cell.classList.add('today');
        cell.style.transform = 'scale(0.95)';
        setTimeout(() => cell.style.transform = '', 150);
      });
      dateStripContainer.appendChild(cell);
    }
  };
  generateDateStrip();

  // ==========================================================
  // --- 6. GENERIC BOTTOM SHEET MODAL DRAWER TOGGLER ---
  // ==========================================================
  const toggleModal = (modalElement, isOpen, focusElementId = null) => {
    console.log(`[toggleModal] modal:`, modalElement, `isOpen:`, isOpen, `focusElementId:`, focusElementId);
    if (!modalElement) {
      console.error("[toggleModal ERROR] modalElement is null/undefined!");
      return;
    }
    if (isOpen) {
      modalElement.classList.add('open');
      modalElement.setAttribute('aria-hidden', 'false');
      if (focusElementId) {
        setTimeout(() => {
          const el = document.getElementById(focusElementId);
          if (el) {
            console.log(`[toggleModal] Focusing element: #${focusElementId}`);
            el.focus();
          } else {
            console.warn(`[toggleModal WARNING] Could not find focus element: #${focusElementId}`);
          }
        }, 300);
      }
    } else {
      modalElement.classList.remove('open');
      modalElement.setAttribute('aria-hidden', 'true');
    }
  };
  window.toggleModal = toggleModal;

  // Bind: Global Add Transaction Sheet
  openAddModalBtn.addEventListener('click', () => toggleModal(addModal, true, 'amount'));
  closeAddModalBtn.addEventListener('click', () => toggleModal(addModal, false));
  closeModalOverlay.addEventListener('click', () => toggleModal(addModal, false));

  // Bind: Trips Hub Entry Sheet
  homeTripsCard.addEventListener('click', () => toggleModal(tripsEntryModal, true));
  dockTripsTab.addEventListener('click', () => toggleModal(tripsEntryModal, true));
  closeTripsHubBtn.addEventListener('click', () => toggleModal(tripsEntryModal, false));
  closeTripsHubOverlay.addEventListener('click', () => toggleModal(tripsEntryModal, false));

  btnTripsEntryNew.addEventListener('click', () => {
    toggleModal(tripsEntryModal, false);
    resetCreateTripForm();
    navigateTo('create-trip-view');
  });

  btnTripsEntryList.addEventListener('click', () => {
    toggleModal(tripsEntryModal, false);
    navigateTo('existing-trips-view');
  });

  // Bind: Add Member Dialog Sheet
  openAddMemberBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleModal(addMemberModal, true, 'member-name');
  });
  closeAddMemberBtn.addEventListener('click', () => toggleModal(addMemberModal, false));
  closeMemberOverlay.addEventListener('click', () => toggleModal(addMemberModal, false));

  const openAddExpenseForTrip = (tripId) => {
    console.log(`[openAddExpenseForTrip] Invoked with tripId:`, tripId);
    activeTripId = tripId;
    window.activeTripId = tripId;
    const selectedTrip = trips.find(t => t.id === tripId);
    console.log(`[openAddExpenseForTrip] selectedTrip match:`, selectedTrip);
    if (selectedTrip) {
      const ownerName = (window.profile && window.profile.nickName) || "Atharv";
      const payerSelect = document.getElementById("trip-expense-payer");
      if (payerSelect) {
        payerSelect.innerHTML = selectedTrip.members.map(m => `
          <option value="${m.name}">${m.name} ${m.name === ownerName ? '(You)' : ''}</option>
        `).join("");
        console.log(`[openAddExpenseForTrip] Payer dropdown populated.`);
      } else {
        console.warn(`[openAddExpenseForTrip WARNING] #trip-expense-payer select element NOT found in DOM!`);
      }
    } else {
      console.warn(`[openAddExpenseForTrip WARNING] No trip found matching ID:`, tripId);
    }

    const titleEl = document.getElementById('trip-expense-modal-title');
    const saveBtnEl = document.getElementById('trip-expense-save-btn');
    const editIdEl = document.getElementById('edit-expense-id');

    if (titleEl) titleEl.textContent = "Add Trip Expense";
    if (saveBtnEl) saveBtnEl.textContent = "Save Expense";
    if (editIdEl) editIdEl.value = "";
    if (tripExpenseForm) tripExpenseForm.reset();

    const modalEl = document.getElementById('add-trip-expense-modal');
    console.log(`[openAddExpenseForTrip] Invoking toggleModal for addTripExpenseModal:`, modalEl);
    toggleModal(modalEl, true, 'trip-expense-amount');
  };
  window.openAddExpenseForTrip = openAddExpenseForTrip;

  // Bind: Add Trip Expense Sheet (Reset edit forms state on creation trigger)
  openTripExpenseModalBtn.addEventListener('click', (e) => {
    console.log(`[Click] openTripExpenseModalBtn tapped! activeTripId:`, activeTripId);
    if (activeTripId) {
      openAddExpenseForTrip(activeTripId);
    } else {
      console.error(`[Click ERROR] openTripExpenseModalBtn clicked but activeTripId is null/undefined!`);
      // Try to fallback to the first available trip in the array as a failsafe
      if (trips && trips.length > 0) {
        console.log(`[Click Failsafe] Falling back to first available trip ID:`, trips[0].id);
        openAddExpenseForTrip(trips[0].id);
      } else {
        showToast("No active adventure found to register expenses to!");
      }
    }
  });
  closeTripExpenseBtn.addEventListener('click', () => {
    console.log("[Click] closeTripExpenseBtn tapped");
    toggleModal(document.getElementById('add-trip-expense-modal'), false);
  });
  closeTripExpenseOverlay.addEventListener('click', () => {
    console.log("[Click] closeTripExpenseOverlay tapped");
    toggleModal(document.getElementById('add-trip-expense-modal'), false);
  });

  // Bind: View Expense Details Modal overlays Close clicks
  closeExpenseDetailsBtn.addEventListener('click', () => toggleModal(viewExpenseDetailsModal, false));
  closeExpenseDetailsOverlay.addEventListener('click', () => toggleModal(viewExpenseDetailsModal, false));

  // Bind: Manage Members Modal triggers
  openManageMembersBtn.addEventListener('click', () => {
    const selectedTrip = trips.find(t => t.id === activeTripId);
    if (selectedTrip) {
      renderManageMembers(selectedTrip);
      toggleModal(manageMembersModal, true, 'details-member-name');
    }
  });
  closeManageMembersBtn.addEventListener('click', () => toggleModal(manageMembersModal, false));
  closeManageMembersOverlay.addEventListener('click', () => toggleModal(manageMembersModal, false));

  // Bind: Details Add Buddy color presets picker
  document.querySelectorAll('#details-color-row .color-dot-btn').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('#details-color-row .color-dot-btn').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  // Escape key hides any opened sheet
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.bottom-sheet.open').forEach(sheet => toggleModal(sheet, false));
    }
  });

  // ==========================================================
  // --- 7. FORM SUBMISSIONS ---
  // ==========================================================

  // B. Create Trip Setup Form Submission
  createTripForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = tripNameInput.value.trim();
    const destination = tripDestInput.value.trim();

    const activeChip = document.querySelector('#trip-type-chips .type-chip.active');
    const tripType = activeChip ? activeChip.textContent : 'Friends';

    const activePreset = document.querySelector('.cover-presets-row .preset-btn.active');
    const gradIndex = activePreset ? activePreset.getAttribute('data-grad') : '1';

    // Formats standard YYYY-MM-DD input value to human-readable "D MMM" (e.g. "25 May")
    const formatDateStr = (dateStr) => {
      if (!dateStr) return "TBD";
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return "TBD";
      const options = { day: 'numeric', month: 'short' };
      return dateObj.toLocaleDateString('en-IN', options);
    };

    const startVal = document.getElementById('trip-start-date').value;
    const endVal = document.getElementById('trip-end-date').value;

    const ownerName = (window.profile && window.profile.nickName) || "Atharv";
    const ownerInitials = (window.profile && window.profile.nickName) ? window.profile.nickName.substring(0, 2).toUpperCase() : "AV";

    const newTrip = {
      id: Date.now(),
      title: `${name} ✈️`,
      destination: destination,
      startDate: formatDateStr(startVal),
      endDate: formatDateStr(endVal),
      type: tripType,
      cover: `default-banner-gradient-${gradIndex}`,
      status: "ongoing",
      members: [
        { id: 1, name: ownerName, initials: ownerInitials, color: "#FBB700" },
        ...tempTripMembers
      ],
      expenses: []
    };

    // unshift places the new trip at the front of the database array (rendering it on top)
    trips.unshift(newTrip);
    saveTripsToLocalStorage();
    renderTrips();
    if (window.updateHomeScreen) window.updateHomeScreen();

    showToast(`Created Adventure: ${name} to ${destination}!`);
    tempTripMembers = [];
    navigateTo('existing-trips-view');
  });

  // C. Add Custom buddy avatar details
  addMemberForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const buddyName = document.getElementById('member-name').value.trim();
    if (!buddyName) return;

    // Get selected avatar emoji instead of split initials!
    const activeBuddyAvatarBtn = document.querySelector('#buddy-avatar-row .avatar-preset-btn.active');
    const initials = activeBuddyAvatarBtn ? activeBuddyAvatarBtn.getAttribute('data-avatar') : '🦁';

    // Get color selected
    const activeColorBtn = document.querySelector('.avatar-color-row .color-dot-btn.active');
    const chosenColor = activeColorBtn ? activeColorBtn.getAttribute('data-color') : '#10B981';

    // Inject chip into preview area
    const chip = document.createElement('div');
    chip.className = 'member-avatar-chip';
    chip.innerHTML = `
      <span class="mac-avatar" style="background-color: ${chosenColor}; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">${initials}</span>
      <span class="mac-name">${buddyName}</span>
      <button class="mac-delete" type="button" aria-label="Remove">&times;</button>
    `;

    chip.querySelector('.mac-delete').addEventListener('click', () => {
      chip.remove();
      tempTripMembers = tempTripMembers.filter(m => m.name !== buddyName);
    });

    tripMembersListContainer.appendChild(chip);

    tempTripMembers.push({
      id: Date.now(),
      name: buddyName,
      initials: initials,
      color: chosenColor
    });

    toggleModal(addMemberModal, false);
    showToast(`Added Buddy: ${buddyName}`);
    addMemberForm.reset();
  });

  // D. Add Trip Expense Form Submission (Recalculating math in real-time)
  tripExpenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('trip-expense-amount').value);
    const title = document.getElementById('trip-expense-title').value.trim();
    const category = document.getElementById('trip-expense-category').value;
    const paidBy = document.getElementById('trip-expense-payer').value;
    const splitScheme = document.getElementById('trip-expense-split').value;
    const notes = document.getElementById('trip-expense-notes').value.trim();
    const editId = document.getElementById('edit-expense-id').value;

    const selectedTrip = trips.find(t => t.id === activeTripId);
    if (selectedTrip) {
      if (editId) {
        // --- EDIT MODE ---
        const exp = selectedTrip.expenses.find(e => e.id === Number(editId));
        if (exp) {
          exp.title = title;
          exp.amount = amount;
          exp.category = category;
          exp.paidBy = paidBy;
          exp.personal = splitScheme === 'personal';
          exp.notes = notes;
          showToast(`Updated Expense: ${title}`);
        }
      } else {
        // --- CREATION MODE ---
        selectedTrip.expenses.push({
          id: Date.now(),
          title: title,
          amount: amount,
          category: category,
          paidBy: paidBy,
          personal: splitScheme === 'personal',
          notes: notes,
          date: new Date() // Stores actual current timestamp
        });
        showToast(`Logged Expense: ${title} (₹${amount})`);
      }

      saveTripsToLocalStorage();
      renderTripDetails(selectedTrip);
      renderTrips(); // updates the directory shared spends
      if (window.renderHomeTimeline) window.renderHomeTimeline();
      if (window.updateHomeScreen) window.updateHomeScreen();

      toggleModal(document.getElementById('add-trip-expense-modal'), false);
      tripExpenseForm.reset();
      document.getElementById('edit-expense-id').value = ""; // Reset edit state
    }
  });

  // ==========================================================
  // --- 8. SELECTION HIGHLIGHTS & INTERACTIONS ---
  // ==========================================================

  // A. Ongoing vs Completed Filter Tab Switcher
  const tripTabs = document.querySelectorAll('.trips-tab-container .trip-tab');
  tripTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tripTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabStatus = tab.getAttribute('data-status');
      const tabIndicator = document.querySelector('.tab-indicator');

      if (tabStatus === 'completed') {
        tabIndicator.style.transform = 'translateX(100%)';
      } else {
        tabIndicator.style.transform = 'translateX(0)';
      }

      // Hide or show dynamic items based on status
      const allCards = document.querySelectorAll('.trip-card-item');
      allCards.forEach(card => {
        const tId = Number(card.getAttribute('data-trip-id'));
        const trip = trips.find(t => t.id === tId);
        if (trip) {
          if (tabStatus === 'completed' && trip.status !== 'completed') {
            card.style.display = 'none';
          } else {
            card.style.display = 'block';
          }
        }
      });

      showToast(`Showing ${tabStatus.toUpperCase()} adventures`);
    });
  });

  // B. Cover preset gradients click selector
  document.querySelectorAll('.cover-presets-row .preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.cover-presets-row .preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const gradIndex = btn.getAttribute('data-grad');
      bannerPreview.className = `trip-banner-preview default-banner-gradient-${gradIndex}`;
    });
  });

  // C. Trip Style Type chips selector
  document.querySelectorAll('#trip-type-chips .type-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#trip-type-chips .type-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // D. Buddy Avatar Color dots row selector
  document.querySelectorAll('.avatar-color-row .color-dot-btn').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.avatar-color-row .color-dot-btn').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  // E. Dynamic Preview Text Mapping for Creation Form
  tripNameInput.addEventListener('input', () => {
    previewTripName.textContent = tripNameInput.value.trim() || 'My New Trip';
  });

  tripDestInput.addEventListener('input', () => {
    previewTripDest.textContent = tripDestInput.value.trim() || 'Destination';
  });

  const resetCreateTripForm = () => {
    createTripForm.reset();
    bannerPreview.className = 'trip-banner-preview default-banner-gradient-1';
    previewTripName.textContent = 'My New Trip';
    previewTripDest.textContent = 'Destination';
    const ownerName = (window.profile && window.profile.nickName) || "Atharv";
    const ownerInitials = (window.profile && window.profile.nickName) ? window.profile.nickName.substring(0, 2).toUpperCase() : "AV";
    tripMembersListContainer.innerHTML = `
      <div class="member-avatar-chip static">
        <span class="mac-avatar" style="background-color: var(--color-primary-yellow); color: var(--color-charcoal);">${ownerInitials}</span>
        <span class="mac-name">${ownerName} (You)</span>
      </div>
    `;
    tempTripMembers = [];
  };

  // ==========================================================
  // --- 9. DYNAMIC RENDERING ENGINE ---
  // ==========================================================

  function renderTrips() {
    tripsCardsContainer.innerHTML = "";

    if (trips.length === 0) {
      tripsCardsContainer.innerHTML = `
        <div style="text-align:center; padding:60px 20px; opacity:0.6; font-size:0.9rem; color: var(--color-text-secondary);">
          ✈️ No adventures planned yet. Click "+" in the top right to start planning!
        </div>
      `;
      return;
    }

    trips.forEach((trip) => {
      const totalAmount = trip.expenses.reduce((acc, exp) => acc + exp.amount, 0);

      const membersHTML = trip.members.map((member) => `
        <span 
          class="stack-avatar"
          style="
            background-color: ${member.color};
            margin-left: -6px;
            border: 2px solid var(--color-card-bg);
            font-size: 0.6rem;
            font-weight: 800;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          "
        >
          ${member.initials}
        </span>
      `).join("");

      tripsCardsContainer.innerHTML += `
        <article class="trip-card-item animate-fade-in" data-trip-id="${trip.id}">
          <div class="tci-banner ${trip.cover}">
            <div class="tci-banner-overlay">
              <div class="tci-meta-left">
                <h4 class="tci-title">${trip.title}</h4>
                <span class="tci-loc">${trip.destination}</span>
              </div>
              <span class="tci-dates">${trip.startDate} - ${trip.endDate}</span>
            </div>
          </div>
          <div class="tci-body">
            <div class="tci-stats-row">
              <div class="tci-stat-node">
                <span class="tci-stat-label">Shared Spent</span>
                <strong class="tci-stat-val">₹${totalAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div class="tci-stat-node">
                <span class="tci-stat-label">Status</span>
                <strong class="tci-stat-val success-text">${trip.status}</strong>
              </div>
            </div>
            <div class="tci-footer">
              <div class="tci-progress-bar-stack">
                <div class="tci-progress-label">
                  <span>Trip Progress</span>
                  <span>Active</span>
                </div>
                <div class="progress-track" style="height: 4px;">
                  <div class="progress-fill" style="width: 60%;"></div>
                </div>
              </div>
              <div class="trip-avatars-stack" style="flex-direction: row; padding: 0;">
                ${membersHTML}
              </div>
            </div>
          </div>
        </article>
      `;
    });

    bindTripCards();
  }

  function bindTripCards() {
    const allTripCards = document.querySelectorAll(".trip-card-item");
    allTripCards.forEach((card) => {
      card.addEventListener("click", () => {
        const tripId = Number(card.getAttribute("data-trip-id"));
        activeTripId = tripId;
        window.activeTripId = tripId;
        const selectedTrip = trips.find((trip) => trip.id === tripId);
        if (selectedTrip) {
          renderTripDetails(selectedTrip);
          navigateTo("trip-details-view");
        }
      });
    });
  }

  // Formats date/timestamp relative to current local time (Today's time, Yesterday, or N days ago)
  const getRelativeTimeString = (dateInput) => {
    if (!dateInput) return "Just Now";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Just Now";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffTime = today - targetDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const formattedTime = date.toLocaleTimeString('en-IN', timeOptions);

    if (diffDays === 0) {
      return formattedTime; // e.g. "11:30 AM"
    } else if (diffDays === 1) {
      return `Yesterday, ${formattedTime}`; // e.g. "Yesterday, 11:30 AM"
    } else {
      return `${diffDays} days ago`; // e.g. "2 days ago"
    }
  };

  let currentViewingTripId = null;
  let currentViewingExpenseId = null;

  const openExpenseDetails = (trip, exp) => {
    currentViewingTripId = trip.id;
    currentViewingExpenseId = exp.id;

    let icon = "🍔";
    if (exp.category === "Hotel") icon = "🏨";
    else if (exp.category === "Travel" || exp.category === "Transport") icon = "✈️";
    else if (exp.category === "Shopping") icon = "🛍️";

    const ownerName = (window.profile && window.profile.nickName) || "Atharv";
    edIcon.textContent = icon;
    edAmount.textContent = `₹${exp.amount.toLocaleString('en-IN')}`;
    edTitle.textContent = exp.title;
    edCategory.textContent = exp.category || 'Food';
    edPayer.textContent = `${exp.paidBy} ${exp.paidBy === ownerName ? '(You)' : ''}`;
    edSplit.textContent = exp.personal ? 'Personal Expense (Solo)' : 'Split Equally (1/N)';
    edDate.textContent = getRelativeTimeString(exp.date);
    edNotes.textContent = exp.notes || 'No custom notes logged.';

    toggleModal(viewExpenseDetailsModal, true);
  };

  // Bind Details Modal Edit & Delete Triggers
  edDeleteBtn.addEventListener('click', () => {
    const trip = trips.find(t => t.id === currentViewingTripId);
    if (trip) {
      trip.expenses = trip.expenses.filter(e => e.id !== currentViewingExpenseId);
      renderTripDetails(trip);
      renderTrips(); // updates directory spent total
      if (window.renderHomeTimeline) window.renderHomeTimeline();
      if (window.updateHomeScreen) window.updateHomeScreen();
      toggleModal(viewExpenseDetailsModal, false);
      showToast("Expense removed successfully!");
    }
  });

  edEditBtn.addEventListener('click', () => {
    const trip = trips.find(t => t.id === currentViewingTripId);
    if (!trip) return;
    const exp = trip.expenses.find(e => e.id === currentViewingExpenseId);
    if (!exp) return;

    toggleModal(viewExpenseDetailsModal, false);

    document.getElementById('trip-expense-modal-title').textContent = "Edit Trip Expense";
    document.getElementById('trip-expense-save-btn').textContent = "Update Expense";

    document.getElementById('trip-expense-amount').value = exp.amount;
    document.getElementById('trip-expense-title').value = exp.title;
    document.getElementById('trip-expense-category').value = exp.category || 'Food';
    document.getElementById('trip-expense-payer').value = exp.paidBy;
    document.getElementById('trip-expense-split').value = exp.personal ? 'personal' : 'equally';
    document.getElementById('trip-expense-notes').value = exp.notes || '';
    document.getElementById('edit-expense-id').value = exp.id;

    toggleModal(document.getElementById('add-trip-expense-modal'), true, 'trip-expense-amount');
  });

  // Renders the list of buddies inside the Manage Members bottom drawer
  const renderManageMembers = (selectedTrip) => {
    detailsMembersScrollContainer.innerHTML = "";
    const ownerName = (window.profile && window.profile.nickName) || "Atharv";

    selectedTrip.members.forEach(member => {
      const isOwner = member.name === ownerName;
      const row = document.createElement('div');
      row.className = "manage-member-row animate-fade-in";
      row.innerHTML = `
        <div class="mmr-left">
          <span class="mmr-avatar" style="background-color: ${member.color};">${member.initials}</span>
          <span class="mmr-name">${member.name} ${isOwner ? '(You)' : ''}</span>
        </div>
        ${isOwner ? '' : `
          <button class="mmr-remove-btn" type="button" aria-label="Remove buddy">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        `}
      `;

      if (!isOwner) {
        row.querySelector('.mmr-remove-btn').addEventListener('click', () => {
          // Remove member
          selectedTrip.members = selectedTrip.members.filter(m => m.id !== member.id);
          saveTripsToLocalStorage();

          // Refresh views
          renderTripDetails(selectedTrip);
          renderTrips();
          renderManageMembers(selectedTrip);
          if (window.updateHomeScreen) window.updateHomeScreen();

          showToast(`Removed ${member.name} from the trip.`);
        });
      }

      detailsMembersScrollContainer.appendChild(row);
    });
  };

  // Bind Manage Members Add Buddy form submission
  detailsAddMemberForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const buddyName = detailsMemberName.value.trim();
    if (!buddyName) return;

    const selectedTrip = trips.find(t => t.id === activeTripId);
    if (!selectedTrip) return;

    // Check if name is already added
    const exists = selectedTrip.members.some(m => m.name.toLowerCase() === buddyName.toLowerCase());
    if (exists) {
      showToast(`${buddyName} is already on this trip!`);
      return;
    }

    // Get selected avatar emoji instead of initials!
    const activeDetailsBuddyBtn = document.querySelector('#details-buddy-avatar-row .avatar-preset-btn.active');
    const initials = activeDetailsBuddyBtn ? activeDetailsBuddyBtn.getAttribute('data-avatar') : '🦁';

    // Get color selected
    const activeColorBtn = document.querySelector('#details-color-row .color-dot-btn.active');
    const chosenColor = activeColorBtn ? activeColorBtn.getAttribute('data-color') : '#10B981';

    const newMember = {
      id: Date.now(),
      name: buddyName,
      initials: initials,
      color: chosenColor
    };

    selectedTrip.members.push(newMember);
    saveTripsToLocalStorage();

    // Refresh views
    renderTripDetails(selectedTrip);
    renderTrips();
    renderManageMembers(selectedTrip);
    if (window.updateHomeScreen) window.updateHomeScreen();

    showToast(`Added ${buddyName} to the trip!`);
    detailsAddMemberForm.reset();
  });

  function renderTripDetails(selectedTrip) {
    console.log(`[renderTripDetails] Setting activeTripId =`, selectedTrip.id);
    activeTripId = selectedTrip.id;
    window.activeTripId = selectedTrip.id;
    // 1. Title, Destination, Dates, Banner
    document.getElementById("details-trip-title").textContent = selectedTrip.title;
    document.getElementById("details-trip-dest").textContent = selectedTrip.destination;
    document.getElementById("details-trip-dates").textContent = `${selectedTrip.startDate} - ${selectedTrip.endDate}`;

    const detailsHero = document.getElementById("details-hero-banner");
    detailsHero.className = `trip-details-hero ${selectedTrip.cover}`;

    // 2. Members Avatars
    const detailsAvatarsList = document.getElementById("details-avatars-list");
    detailsAvatarsList.innerHTML = "";
    selectedTrip.members.forEach((member) => {
      detailsAvatarsList.innerHTML += `
        <span class="stack-avatar" style="background-color: ${member.color}">
          ${member.initials}
        </span>
      `;
    });
    document.getElementById("details-members-count").textContent = `${selectedTrip.members.length} Members`;

    // 3. Update Payer Select Options dynamically
    const ownerName = (window.profile && window.profile.nickName) || "Atharv";
    const payerSelect = document.getElementById("trip-expense-payer");
    if (payerSelect) {
      payerSelect.innerHTML = selectedTrip.members.map(m => `
        <option value="${m.name}">${m.name} ${m.name === ownerName ? '(You)' : ''}</option>
      `).join("");
    }

    // 4. Spent Metrics calculations
    const totalSpent = selectedTrip.expenses.reduce((acc, exp) => acc + exp.amount, 0);
    document.getElementById("details-total-spend").textContent = `₹${totalSpent.toLocaleString('en-IN')}`;

    const userPaid = selectedTrip.expenses
      .filter(exp => exp.paidBy === ownerName)
      .reduce((acc, exp) => acc + exp.amount, 0);
    document.getElementById("details-user-paid").textContent = `₹${userPaid.toLocaleString('en-IN')}`;

    // 5. Category breakups
    const categories = ["Food", "Travel", "Hotel", "Shopping"];
    categories.forEach(cat => {
      const catSpent = selectedTrip.expenses
        .filter(exp => exp.category.toLowerCase() === cat.toLowerCase() || (cat === "Travel" && exp.category.toLowerCase() === "transport"))
        .reduce((acc, exp) => acc + exp.amount, 0);

      const pct = totalSpent > 0 ? Math.round((catSpent / totalSpent) * 100) : 0;

      document.getElementById(`cat-amt-${cat}`).textContent = `₹${catSpent.toLocaleString('en-IN')}`;
      document.getElementById(`cat-pct-${cat}`).textContent = `${pct}%`;
      document.getElementById(`cat-fill-${cat}`).style.width = `${pct}%`;
    });

    // 6. Settlements calculations (Splitwise greedy algorithmic matcher)
    const settlementsContainer = document.getElementById("details-settlements-list");
    settlementsContainer.innerHTML = "";

    const N = selectedTrip.members.length;
    if (N > 1 && totalSpent > 0) {
      const memberBalances = {};
      selectedTrip.members.forEach(m => { memberBalances[m.name] = 0; });

      selectedTrip.expenses.forEach(exp => {
        const amt = exp.amount;
        if (exp.personal) {
          // A personal solo expense does not create shared debt or credit balances
          return;
        }

        // Ensure paidBy exists in memberBalances (failsafe for deleted members)
        if (memberBalances[exp.paidBy] === undefined) {
          memberBalances[exp.paidBy] = 0;
        }

        const share = amt / N;
        selectedTrip.members.forEach(m => {
          memberBalances[m.name] = (memberBalances[m.name] || 0) - share;
        });
        memberBalances[exp.paidBy] += amt;
      });

      const debtors = [];
      const creditors = [];
      Object.keys(memberBalances).forEach(name => {
        const bal = memberBalances[name];
        if (bal < -0.01) debtors.push({ name, balance: -bal });
        else if (bal > 0.01) creditors.push({ name, balance: bal });
      });

      let dIdx = 0;
      let cIdx = 0;
      let settlementsFound = false;

      while (dIdx < debtors.length && cIdx < creditors.length) {
        const debtor = debtors[dIdx];
        const creditor = creditors[cIdx];
        const settleAmt = Math.min(debtor.balance, creditor.balance);

        debtor.balance -= settleAmt;
        creditor.balance -= settleAmt;

        const debtorMem = selectedTrip.members.find(m => m.name === debtor.name);
        const creditorMem = selectedTrip.members.find(m => m.name === creditor.name);

        settlementsContainer.innerHTML += `
          <div class="settlement-row-card animate-fade-in">
            <div class="src-left">
              <span class="src-avatar" style="background-color: ${debtorMem?.color || '#999'};">${debtorMem?.initials || '??'}</span>
              <span class="src-text"><strong>${debtor.name}</strong> owes <strong>${creditor.name}</strong></span>
            </div>
            <div class="src-amt-pill ${creditor.name === 'Atharv' ? 'green-badge' : ''}">
              ₹${Math.round(settleAmt).toLocaleString('en-IN')}
            </div>
          </div>
        `;

        settlementsFound = true;
        if (debtor.balance < 0.01) dIdx++;
        if (creditor.balance < 0.01) cIdx++;
      }

      if (!settlementsFound) {
        settlementsContainer.innerHTML = `
          <div style="text-align:center; padding:25px; opacity:0.6; font-size:0.9rem;">
            ✨ Everyone is perfectly balanced! No settlements pending.
          </div>
        `;
        document.getElementById("settle-summary-text").textContent = "All Balanced";
        document.getElementById("settle-summary-text").className = "settle-badge success";
      } else {
        document.getElementById("settle-summary-text").textContent = "Balances Calculated";
        document.getElementById("settle-summary-text").className = "settle-badge info";
      }
    } else {
      settlementsContainer.innerHTML = `
        <div style="text-align:center; padding:25px; opacity:0.6; font-size:0.9rem;">
          🎉 Add members and log expenses to see settlement details!
        </div>
      `;
      document.getElementById("settle-summary-text").textContent = "No Dues";
      document.getElementById("settle-summary-text").className = "settle-badge success";
    }

    // 7. Dynamic Expenses Timeline
    const timelineContainer = document.getElementById("details-expenses-timeline");
    timelineContainer.innerHTML = "";

    if (selectedTrip.expenses.length === 0) {
      timelineContainer.innerHTML = `
        <div style="text-align:center; padding:40px 20px; opacity:0.6; font-size:0.9rem;">
          💸 No expenses logged yet. Tap "Add Expense" below to start tracking!
        </div>
      `;
    } else {
      [...selectedTrip.expenses].reverse().forEach(exp => {
        let icon = "🍔";
        if (exp.category === "Hotel") icon = "🏨";
        else if (exp.category === "Travel" || exp.category === "Transport") icon = "✈️";
        else if (exp.category === "Shopping") icon = "🛍️";

        const card = document.createElement('div');
        card.className = 'timeline-card-node animate-fade-in';
        card.innerHTML = `
          <div class="tcn-top">
            <div class="tcn-details">
              <div class="tcn-icon-wrap">${icon}</div>
              <div class="tcn-meta">
                <h4 class="tcn-title">${exp.title}</h4>
                <span class="tcn-payer">Paid by <strong>${exp.paidBy}</strong></span>
              </div>
            </div>
            <div class="tcn-right">
              <span class="tcn-amount">₹${exp.amount.toLocaleString('en-IN')}</span>
              <span class="tcn-badge ${exp.personal ? 'personal-badge' : 'shared-badge'}">
                ${exp.personal ? 'Personal' : 'Shared'}
              </span>
            </div>
          </div>
          <div class="tcn-footer">
            <span class="tcn-date">${getRelativeTimeString(exp.date)}</span>
            <div class="tcn-actions">
              <button class="tcn-action-btn delete" aria-label="Delete Expense" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        `;

        // Dynamic inline delete click trigger
        card.querySelector('.delete').addEventListener('click', (e) => {
          e.stopPropagation(); // Stop click from triggering parent card Details Sheet
          selectedTrip.expenses = selectedTrip.expenses.filter(e => e.id !== exp.id);
          saveTripsToLocalStorage();
          renderTripDetails(selectedTrip);
          renderTrips();
          if (window.renderHomeTimeline) window.renderHomeTimeline();
          if (window.updateHomeScreen) window.updateHomeScreen();
          showToast(`Expense "${exp.title}" deleted.`);
        });

        // Click anywhere on the expense timeline card to open Modal 5 (Details Drawer)
        card.addEventListener('click', (e) => {
          if (e.target.closest('.tcn-actions') || e.target.closest('.delete')) {
            return;
          }
          openExpenseDetails(selectedTrip, exp);
        });

        timelineContainer.appendChild(card);
      });
    }
  }

  // --- PROFILE & SIGN UP EVENT LISTENERS ---
  const signupForm = document.getElementById('signup-form');
  const editProfileForm = document.getElementById('edit-profile-form');
  const editProfileModal = document.getElementById('edit-profile-modal');
  const openEditProfileBtn = document.getElementById('open-edit-profile-btn');
  const closeEditProfileBtn = document.getElementById('close-edit-profile-btn');
  const closeEditProfileOverlay = document.getElementById('close-edit-profile-overlay');

  const renderProfileDetails = () => {
    if (!profile) return;

    const avatarInitialsEl = document.getElementById('profile-avatar-initials');
    const profileNameEl = document.getElementById('profile-full-name');
    const profileAliasEl = document.getElementById('profile-alias-tag');
    const profileEmailEl = document.getElementById('profile-email-text');
    const profileMonthlyBudgetEl = document.getElementById('profile-monthly-budget');
    const profileWeeklyLimitEl = document.getElementById('profile-weekly-limit');

    if (avatarInitialsEl) {
      avatarInitialsEl.textContent = profile.avatar || "🦊";
      avatarInitialsEl.style.fontSize = "2.2rem";
    }
    if (profileNameEl) profileNameEl.textContent = profile.fullName || "Atharv Vyas";
    if (profileAliasEl) profileAliasEl.textContent = `@${profile.nickName ? profile.nickName.toLowerCase().replace(/\s+/g, '') : 'atharv'}`;
    if (profileEmailEl) profileEmailEl.textContent = profile.email || "atharv@ledgerly.com";
    if (profileMonthlyBudgetEl) profileMonthlyBudgetEl.textContent = `₹${Number(profile.monthlyBudget).toLocaleString('en-IN')}`;
    if (profileWeeklyLimitEl) profileWeeklyLimitEl.textContent = `₹${Number(profile.weeklyLimit).toLocaleString('en-IN')}`;

    // Update homepage header avatar with proper relative positioning & higher z-index to show above active ring
    const headerAvatarEl = document.querySelector('.profile-avatar');
    if (headerAvatarEl) {
      headerAvatarEl.innerHTML = `
        <div class="avatar-ring"></div>
        <div style="font-size: 1.3rem; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary-yellow), var(--color-soft-yellow)); color: var(--color-charcoal); font-weight: 800; position: relative; z-index: 2; border: 2px solid var(--color-app-bg);">
          ${profile.avatar || "🦊"}
        </div>
        <span class="notification-indicator"></span>
      `;
    }

    // Pre-highlight active avatar in the Edit drawer picker row
    const editAvatarBtn = document.querySelector(`#edit-avatar-row .avatar-preset-btn[data-avatar="${profile.avatar || '🦊'}"]`);
    if (editAvatarBtn) {
      const btns = document.querySelectorAll('#edit-avatar-row .avatar-preset-btn');
      btns.forEach(b => { b.classList.remove('active'); b.style.borderColor = 'transparent'; });
      editAvatarBtn.classList.add('active');
      editAvatarBtn.style.borderColor = 'var(--color-primary-yellow)';
    }

    const editNameInput = document.getElementById('edit-profile-name');
    const editAliasInput = document.getElementById('edit-profile-alias');
    const editEmailInput = document.getElementById('edit-profile-email');
    const editBudgetInput = document.getElementById('edit-profile-budget');
    const editLimitInput = document.getElementById('edit-profile-limit');

    // Ensure we fallback to empty strings instead of "undefined" which fails HTML email form validations
    if (editNameInput) editNameInput.value = profile.fullName || "";
    if (editAliasInput) editAliasInput.value = profile.nickName || "";
    if (editEmailInput) editEmailInput.value = profile.email || "";
    if (editBudgetInput) editBudgetInput.value = profile.monthlyBudget || 30000;
    if (editLimitInput) editLimitInput.value = profile.weeklyLimit || 15000;

    if (window.updateHomeScreen) window.updateHomeScreen();
  };
  window.renderProfileDetails = renderProfileDetails;

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('signup-name').value.trim();
      const alias = document.getElementById('signup-alias').value.trim();
      const email = document.getElementById('signup-email').value.trim();

      const activeAvatarBtn = document.querySelector('#signup-avatar-row .avatar-preset-btn.active');
      const avatarVal = activeAvatarBtn ? activeAvatarBtn.getAttribute('data-avatar') : '🦊';

      profile = {
        fullName: name,
        nickName: alias,
        email: email,
        avatar: avatarVal,
        monthlyBudget: 30000,
        weeklyLimit: 15000
      };

      saveProfileToLocalStorage();
      renderProfileDetails();

      showToast(`Welcome aboard, ${alias}! 🚀`);

      const dock = document.querySelector('.bottom-dock');
      if (dock) dock.style.display = 'flex';
      navigateTo('home-view');
    });
  }

  console.log("[Setup] Binding openEditProfileBtn event listeners...");
  if (openEditProfileBtn) {
    console.log("[Setup] openEditProfileBtn found in DOM. Registering click listener.");
    openEditProfileBtn.addEventListener('click', (e) => {
      console.log("[Click] openEditProfileBtn clicked! Target modal:", editProfileModal);
      toggleModal(editProfileModal, true, 'edit-profile-name');
    });
  } else {
    console.warn("[Setup WARNING] openEditProfileBtn NOT found in DOM!");
  }

  const profileAvatarContainer = document.getElementById('profile-avatar-container');
  if (profileAvatarContainer) {
    console.log("[Setup] profileAvatarContainer found in DOM. Registering click listener.");
    profileAvatarContainer.addEventListener('click', (e) => {
      console.log("[Click] profileAvatarContainer clicked! Target modal:", editProfileModal);
      toggleModal(editProfileModal, true, 'edit-profile-name');
    });
  } else {
    console.warn("[Setup WARNING] profileAvatarContainer NOT found in DOM!");
  }

  if (closeEditProfileBtn) {
    closeEditProfileBtn.addEventListener('click', () => {
      console.log("[Click] closeEditProfileBtn clicked!");
      toggleModal(editProfileModal, false);
    });
  }
  if (closeEditProfileOverlay) {
    closeEditProfileOverlay.addEventListener('click', () => {
      console.log("[Click] closeEditProfileOverlay clicked!");
      toggleModal(editProfileModal, false);
    });
  }

  if (editProfileForm) {
    editProfileForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('edit-profile-name').value.trim();
      const alias = document.getElementById('edit-profile-alias').value.trim();
      const email = document.getElementById('edit-profile-email').value.trim();

      const currentBudget = profile.monthlyBudget || 30000;
      const currentLimit = profile.weeklyLimit || 15000;

      const activeEditAvatarBtn = document.querySelector('#edit-avatar-row .avatar-preset-btn.active');
      const editAvatarVal = activeEditAvatarBtn ? activeEditAvatarBtn.getAttribute('data-avatar') : '🦊';

      profile = {
        fullName: name,
        nickName: alias,
        email: email,
        avatar: editAvatarVal,
        monthlyBudget: currentBudget,
        weeklyLimit: currentLimit
      };

      saveProfileToLocalStorage();
      renderProfileDetails();

      toggleModal(editProfileModal, false);
      showToast("Profile details saved!");
    });
  }

  const checkAuthGuard = () => {
    const storedProfile = localStorage.getItem("ledgerly-profile");
    const lastProfile = localStorage.getItem("ledgerly-last-profile");
    const dock = document.querySelector('.bottom-dock');

    // Auto-login if either active session or last session profile exists!
    const activeSession = storedProfile || lastProfile;

    if (activeSession) {
      if (!localStorage.getItem("ledgerly-profile")) {
        localStorage.setItem("ledgerly-profile", activeSession);
      }
      try {
        profile = JSON.parse(activeSession);
      } catch (e) {
        console.error(e);
      }
      renderProfileDetails();
      window.pendingTargetView = 'home-view';
    } else {
      const restoreCard = document.getElementById("restore-session-card");
      if (restoreCard) restoreCard.style.display = "none";

      window.pendingTargetView = 'signup-view';
    }

    // Hide dock by default during the intro screen
    if (dock) dock.style.display = 'none';
    navigateTo('intro-view');

    // Set transition triggers for entering the app
    const introEnterBtn = document.getElementById('intro-enter-btn');
    let introTransitionTriggered = false;

    const triggerAppEntry = () => {
      if (introTransitionTriggered) return;
      introTransitionTriggered = true;

      const introView = document.getElementById('intro-view');
      if (introView) {
        introView.classList.add('fade-out');
      }

      const targetView = window.pendingTargetView || 'signup-view';

      // Standard view transition
      navigateTo(targetView);

      // Restore bottom dock if entering home dashboard
      if (targetView === 'home-view') {
        if (dock) dock.style.display = 'flex';
      } else {
        if (dock) dock.style.display = 'none';
      }

      // Cleanup intro screen after transition completes (600ms)
      setTimeout(() => {
        if (introView) {
          introView.classList.remove('active', 'fade-out');
        }
      }, 600);
    };

    if (introEnterBtn) {
      introEnterBtn.addEventListener('click', triggerAppEntry);
    }

    // Auto-transition safety timer of 2.5 seconds (2500ms)
    setTimeout(triggerAppEntry, 2500);
  };

  // Bind Restore Last Session Trigger
  const restoreBtn = document.getElementById('restore-session-btn');
  if (restoreBtn) {
    restoreBtn.addEventListener('click', () => {
      const lastProfile = localStorage.getItem("ledgerly-last-profile");
      if (lastProfile) {
        try {
          profile = JSON.parse(lastProfile);
          saveProfileToLocalStorage();
          renderProfileDetails();
          showToast(`Welcome back, ${profile.nickName || 'User'}! 👋`);

          const dock = document.querySelector('.bottom-dock');
          if (dock) dock.style.display = 'flex';
          navigateTo('home-view');
        } catch (e) {
          console.error("Failed to restore last session", e);
        }
      }
    });
  }

  // Bind Explore with Demo Data Trigger
  const demoSeedBtn = document.getElementById('demo-seed-btn');
  if (demoSeedBtn) {
    demoSeedBtn.addEventListener('click', () => {
      // 1. Generate Demo Profile
      profile = {
        fullName: "Atharv Vyas",
        nickName: "Atharv",
        email: "atharv@ledgerly.com",
        avatar: "🦊",
        monthlyBudget: 30000,
        weeklyLimit: 15000
      };
      saveProfileToLocalStorage();

      // 2. Seed beautiful dynamic transactions
      const now = new Date();
      const demoTx = [
        {
          id: 1,
          title: "Monthly Salary Credit",
          amount: 25000,
          type: "income",
          category: "Salary",
          date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000), // 2 days ago
          notes: "Company salary credit"
        },
        {
          id: 2,
          title: "Apartment Rent",
          amount: 8000,
          type: "expense",
          category: "Bills",
          date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000), // yesterday
          notes: "Flat rent payment"
        },
        {
          id: 3,
          title: "Gourmet Pizza & Coffee",
          amount: 450,
          type: "expense",
          category: "Food",
          date: new Date(now.getTime() - 2 * 60 * 60 * 1000), // today, 2 hrs ago
          notes: "Dinner out with friends"
        }
      ];
      localStorage.setItem("ledgerly-transactions", JSON.stringify(demoTx));
      if (window.loadTransactionsFromLocalStorage) {
        window.loadTransactionsFromLocalStorage();
      }

      // 3. Seed beautiful dynamic trips
      const demoTrips = [
        {
          id: 101,
          title: "Goa Getaway 🌴",
          destination: "Goa, India",
          startDate: "12 May",
          endDate: "18 May",
          type: "Friends",
          cover: "default-banner-gradient-1",
          status: "ongoing",
          members: [
            { id: 1, name: "Atharv", initials: "AT", color: "#FBB700" },
            { id: 2, name: "Rahul", initials: "RA", color: "#10B981" },
            { id: 3, name: "Neha", initials: "NE", color: "#EF4444" },
            { id: 4, name: "Rohit", initials: "RO", color: "#8B5CF6" }
          ],
          expenses: [
            {
              id: 201,
              title: "Resort Stay Booking",
              amount: 18000,
              category: "Hotel",
              paidBy: "Rahul",
              personal: false,
              date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
            },
            {
              id: 202,
              title: "Beachside Shack Seafood",
              amount: 3200,
              category: "Food",
              paidBy: "Atharv",
              personal: false,
              date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
            },
            {
              id: 203,
              title: "Cab Fare to Airport",
              amount: 1500,
              category: "Travel",
              paidBy: "Neha",
              personal: false,
              date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
            }
          ]
        }
      ];
      localStorage.setItem("ledgerly-trips", JSON.stringify(demoTrips));
      if (window.loadTripsFromLocalStorage) {
        window.loadTripsFromLocalStorage();
      }

      // Refresh rendering systems
      renderProfileDetails();
      if (window.renderTrips) window.renderTrips();
      if (window.renderHomeTimeline) window.renderHomeTimeline();
      if (window.updateHomeScreen) window.updateHomeScreen();

      showToast("Logged in to Demo Mode! 🚀");
      const dock = document.querySelector('.bottom-dock');
      if (dock) dock.style.display = 'flex';
      navigateTo('home-view');
    });
  }

  // Helper to wire click event listeners for avatar selector presets
  const setupAvatarPickers = () => {
    const registerPicker = (rowId) => {
      const row = document.getElementById(rowId);
      if (!row) return;
      const btns = row.querySelectorAll('.avatar-preset-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          btns.forEach(b => {
            b.classList.remove('active');
            b.style.borderColor = 'transparent';
          });
          btn.classList.add('active');
          btn.style.borderColor = 'var(--color-primary-yellow)';
        });
      });
    };

    registerPicker('signup-avatar-row');
    registerPicker('edit-avatar-row');
    registerPicker('buddy-avatar-row');
    registerPicker('details-buddy-avatar-row');
  };

  // ==========================================================
  // --- 10. INITIALIZATION RUN ---
  // ==========================================================
  renderTrips();
  checkAuthGuard();
  setupAvatarPickers();
  setTimeout(() => {
    if (window.renderHomeTimeline) window.renderHomeTimeline();
    if (window.updateHomeScreen) window.updateHomeScreen();
  }, 100);

  // ==========================================================
  // --- 11. HELPER UTILITIES ---
  // ==========================================================
  const showToast = (message) => {
    toastNotification.querySelector('.toast-message').textContent = message;
    toastNotification.classList.add('show');

    setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3000);
  };
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}