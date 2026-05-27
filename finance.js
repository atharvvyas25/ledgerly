/**
 * Ledgerly — Personal Daily Finance Script
 * Centralizes all personal transaction records, dynamic HSL tallies,
 * date-range filters, custom notes, date-time logging, and timeline integrations.
 */

// --- 1. CORE TRANSACTION STATE & STORAGE ENGINE ---
let transactions = [];

const saveTransactionsToLocalStorage = () => {
    const key = window.getStorageKey("transactions");
    localStorage.setItem(key, JSON.stringify(transactions));
    window.transactions = transactions;
};

const loadTransactionsFromLocalStorage = () => {
    const key = window.getStorageKey("transactions");
    const storedTx = localStorage.getItem(key);
    if (storedTx) {
        try {
            transactions = JSON.parse(storedTx);
            // Re-hydrate dates
            transactions.forEach(tx => {
                if (tx.date) tx.date = new Date(tx.date);
            });
        } catch (e) {
            console.error("Failed to parse user transactions from localStorage", e);
        }
    } else {
        // Fresh start for first time sign up: empty transactions
        transactions = [];
    }
    window.transactions = transactions;
    window.loadTransactionsFromLocalStorage = loadTransactionsFromLocalStorage;
};

// Load database immediately
loadTransactionsFromLocalStorage();

// --- 2. FORMATTING HELPERS ---
const getFormattedDateTimeString = (dateInput) => {
    if (!dateInput) return "Just Now";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Just Now";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffTime = today - targetDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Time format: e.g. "07:30 PM"
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const formattedTime = date.toLocaleTimeString('en-IN', timeOptions);

    if (diffDays === 0) {
        return `Today, ${formattedTime}`;
    } else if (diffDays === 1) {
        return `Yesterday, ${formattedTime}`;
    } else {
        // Date format: e.g. "25 May, 07:30 PM"
        const dateOptions = { day: 'numeric', month: 'short' };
        const formattedDate = date.toLocaleDateString('en-IN', dateOptions);
        return `${formattedDate}, ${formattedTime}`;
    }
};

// --- 3. DYNAMIC RENDERING & CALCULATION ENGINE ---
const renderTransactions = (filterType = "today") => {
    const transactionsList = document.getElementById("transactions-list");
    if (!transactionsList) return;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = todayStart - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = todayStart - 30 * 24 * 60 * 60 * 1000;
    const yearAgo = todayStart - 365 * 24 * 60 * 60 * 1000;

    // 1. Filter transactions based on selected tab
    let filteredTx = transactions;
    if (filterType === "today") {
        filteredTx = transactions.filter(tx => tx.date && tx.date.getTime() >= todayStart);
    } else if (filterType === "week") {
        filteredTx = transactions.filter(tx => tx.date && tx.date.getTime() >= sevenDaysAgo);
    } else if (filterType === "month") {
        filteredTx = transactions.filter(tx => tx.date && tx.date.getTime() >= thirtyDaysAgo);
    } else if (filterType === "year") {
        filteredTx = transactions.filter(tx => tx.date && tx.date.getTime() >= yearAgo);
    }

    // Sort filtered transactions chronologically (newest first)
    filteredTx.sort((a, b) => b.date - a.date);

    // 2. Auto-calculate metrics dynamically FOR THAT FILTER RANGE
    let totalIncome = 0;
    let totalExpense = 0;

    filteredTx.forEach(tx => {
        if (tx.type === "income") {
            totalIncome += tx.amount;
        } else {
            totalExpense += tx.amount;
        }
    });

    const balance = totalIncome - totalExpense;

    // Inject totals
    document.getElementById("total-income").textContent = `₹${totalIncome.toLocaleString('en-IN')}`;
    document.getElementById("total-expense").textContent = `₹${totalExpense.toLocaleString('en-IN')}`;
    document.getElementById("current-balance").textContent = `₹${balance.toLocaleString('en-IN')}`;

    // 3. Render transactions cards
    transactionsList.innerHTML = "";

    if (filteredTx.length === 0) {
        transactionsList.innerHTML = `
      <div style="text-align:center; padding:40px 20px; opacity:0.6; font-size:0.85rem;">
        💸 No transactions logged for this period.
      </div>
    `;
        return;
    }

    filteredTx.forEach(tx => {
        // Dynamic Icon Selection
        let icon = "💸";
        const cat = tx.category ? tx.category.toLowerCase() : "";
        if (cat.includes("food") || cat.includes("drink")) icon = "🍔";
        else if (cat.includes("hotel") || cat.includes("stay") || cat.includes("accommodation")) icon = "🏨";
        else if (cat.includes("transport") || cat.includes("travel") || cat.includes("transit")) icon = "✈️";
        else if (cat.includes("salary") || cat.includes("income")) icon = "💰";
        else if (cat.includes("bill") || cat.includes("rent")) icon = "🧾";
        else if (cat.includes("personal")) icon = "👤";

        const card = document.createElement("div");
        card.className = "transaction-card-node animate-fade-in";
        const isIncome = tx.type === "income";

        card.innerHTML = `
      <div class="tcn-top">
        <div class="tcn-details">
          <div class="tcn-icon-wrap">${icon}</div>
          <div class="tcn-meta">
            <h4 class="tcn-title">${tx.title}</h4>
            <span class="tcn-payer">${tx.category || 'General'}${tx.notes ? ' • ' + tx.notes : ''}</span>
          </div>
        </div>
        <div class="tcn-right">
          <span class="tcn-amount ${isIncome ? 'income-type' : 'expense-type'}">
            ${isIncome ? '+' : '-'}₹${tx.amount.toLocaleString('en-IN')}
          </span>
          <span class="tcn-badge ${isIncome ? 'income-badge' : 'expense-badge'}">
            ${isIncome ? 'Credit' : 'Debit'}
          </span>
        </div>
      </div>
      <div class="tcn-footer">
        <span class="tcn-date">${getFormattedDateTimeString(tx.date)}</span>
        <div class="tcn-actions">
          <button class="tcn-action-btn delete" aria-label="Delete Transaction" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

        // Bind Dynamic delete handler
        card.querySelector(".delete").addEventListener("click", () => {
            transactions = transactions.filter(t => t.id !== tx.id);
            saveTransactionsToLocalStorage();
            renderTransactions(filterType);
            renderHomeTimeline();
            updateHomeScreen();

            // Synchronize history view transactions in real-time if it exists
            const activeTab = document.querySelector("#history-tabs-container .trip-tab.active");
            const tabType = activeTab ? activeTab.getAttribute("data-history-tab") : "daily";
            const searchInput = document.getElementById("history-search");
            const query = searchInput ? searchInput.value : "";
            renderHistory(tabType, query);

            // Fire dynamic soft toast
            const toast = document.getElementById("toast-notification");
            if (toast) {
                toast.querySelector(".toast-message").textContent = `Transaction deleted.`;
                toast.classList.add("show");
                setTimeout(() => toast.classList.remove("show"), 3000);
            }
        });

        transactionsList.appendChild(card);
    });
};

// --- 4. DYNAMIC UNIFIED CHRONOLOGICAL TIMELINE ---
const renderHomeTimeline = () => {
    const timeline = document.getElementById('activity-timeline');
    if (!timeline) return;

    timeline.innerHTML = '';

    const trips = window.trips || [];
    let allActivities = [];

    // Gather dynamic Trip Spends
    const ownerName = (window.profile && window.profile.nickName) || "Atharv";
    trips.forEach(trip => {
        trip.expenses.forEach(exp => {
            allActivities.push({
                id: exp.id,
                title: exp.paidBy === ownerName ? `You paid ${exp.title}` : `${exp.paidBy} paid ${exp.title}`,
                meta: `Shared • ${trip.title.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "")}`,
                amount: exp.amount,
                type: exp.paidBy === ownerName ? 'expense' : 'income',
                date: exp.date || new Date()
            });
        });
    });

    // Gather dynamic Personal Transactions
    transactions.forEach(tx => {
        allActivities.push({
            id: tx.id,
            title: tx.title,
            meta: `${tx.category} • Personal`,
            amount: tx.amount,
            type: tx.type,
            date: tx.date instanceof Date ? tx.date : new Date(tx.date || Date.now())
        });
    });

    // Sort newest first
    allActivities.sort((a, b) => b.date - a.date);

    const displayActivities = allActivities.slice(0, 4);

    if (displayActivities.length === 0) {
        timeline.innerHTML = `
      <div style="text-align:center; padding:30px; opacity:0.6; font-size:0.85rem;">
        ✨ No activity logged yet. Tap "+" below to get started!
      </div>
    `;
        return;
    }

    displayActivities.forEach(act => {
        const item = document.createElement('div');
        item.className = 'timeline-item animate-fade-in';
        const isExpense = act.type === 'expense';
        const colorClass = isExpense ? 'red-bg' : 'green-bg';
        const sign = isExpense ? '-' : '+';
        const amountClass = isExpense ? '' : 'positive';

        let svgContent = '';
        if (act.meta.toLowerCase().includes('personal') && act.type === 'income') {
            svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      `;
        } else if (act.meta.toLowerCase().includes('shared') || act.meta.toLowerCase().includes('trip')) {
            svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      `;
        } else {
            svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      `;
        }

        item.innerHTML = `
      <div class="timeline-icon ${colorClass}">
        ${svgContent}
      </div>
      <div class="timeline-details">
        <h4 class="timeline-title">${act.title}</h4>
        <p class="timeline-meta">${act.meta}</p>
      </div>
      <div class="timeline-amount ${amountClass}">
        ${sign}₹${act.amount.toLocaleString('en-IN')}
      </div>
    `;
        timeline.appendChild(item);
    });
};

// --- 4B. DYNAMIC HOME SCREEN DATA BINDINGS ---
const updateHomeScreen = () => {
    // 1. Dynamic GenZ Greeting
    const greetingEl = document.querySelector('#home-view .greeting');
    if (greetingEl) {
        const getPool = () => {
            const hour = new Date().getHours();
            const nickName = (window.profile && window.profile.nickName) || "Atharv";
            if (hour >= 5 && hour < 12) {
                return [
                    `Rise & grind, ${nickName} 🌅`,
                    `What's good, ${nickName}? ☀️`,
                    `Yo ${nickName}, secure the bag 💼`,
                    `Rise & shine, ${nickName} ☕`,
                    `Wakey wakey, ${nickName} 🍳`,
                    `No cap, good morning ${nickName} ☀️`
                ];
            } else if (hour >= 12 && hour < 17) {
                return [
                    `Slay the day, ${nickName} ⚡`,
                    `Main character energy, ${nickName} 💅`,
                    `No cap, you're cooking, ${nickName} 🍳`,
                    `Keep shining, ${nickName} ✨`,
                    `${nickName} is serving looks & ledger 💸`,
                    `Yo ${nickName}, let's get that bread 🍞`
                ];
            } else {
                return [
                    `Vibe check passed, ${nickName} 🎧`,
                    `Big flex tonight, ${nickName} 💸`,
                    `Unwind time, ${nickName} 🌙`,
                    `Chill vibes, ${nickName} 💤`,
                    `Yo ${nickName}, let's secure the bag 💼`,
                    `Serving looks & ledger, ${nickName} 💅`
                ];
            }
        };

        const nickName = (window.profile && window.profile.nickName) || "Atharv";
        let greeting = sessionStorage.getItem('ledgerly-greeting');
        if (greeting && !greeting.includes(nickName)) {
            greeting = null;
        }
        if (!greeting) {
            const pool = getPool();
            const index = Math.floor(Math.random() * pool.length);
            greeting = pool[index];
            sessionStorage.setItem('ledgerly-greeting', greeting);
        }
        greetingEl.textContent = greeting;

        // Dynamically roll a new slang greeting when the user taps on it
        if (!greetingEl.dataset.bound) {
            greetingEl.dataset.bound = "true";
            greetingEl.style.cursor = 'pointer';
            greetingEl.title = 'Tap to roll another greeting! 🎲';
            greetingEl.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.15s ease';

            greetingEl.addEventListener('click', () => {
                const pool = getPool();
                const current = greetingEl.textContent;
                let next = current;
                while (next === current && pool.length > 1) {
                    const index = Math.floor(Math.random() * pool.length);
                    next = pool[index];
                }

                // Spring scale roll micro-animation!
                greetingEl.style.transform = 'scale(0.92) translateY(-2px)';
                greetingEl.style.opacity = '0.5';

                setTimeout(() => {
                    sessionStorage.setItem('ledgerly-greeting', next);
                    greetingEl.textContent = next;
                    greetingEl.style.transform = '';
                    greetingEl.style.opacity = '1';
                }, 150);
            });
        }
    }

    // 2. Dynamic Date
    const currentDateEl = document.getElementById('current-date');
    if (currentDateEl) {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        currentDateEl.textContent = new Date().toLocaleDateString('en-IN', options);
    }

    // 3. Weekly Summary Calculation (last 7 days of daily finance + trips paid by user)
    const now = new Date();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    const personalExpensesThisWeek = transactions
        .filter(tx => tx.type === 'expense' && tx.date && tx.date.getTime() >= sevenDaysAgo)
        .reduce((sum, tx) => sum + tx.amount, 0);

    const ownerName = (window.profile && window.profile.nickName) || "Atharv";
    const trips = window.trips || [];
    const tripExpensesThisWeek = trips.reduce((sum, trip) => {
        return sum + trip.expenses
            .filter(exp => exp.paidBy === ownerName && exp.date && exp.date.getTime() >= sevenDaysAgo)
            .reduce((s, e) => s + e.amount, 0);
    }, 0);

    const totalSpentThisWeek = personalExpensesThisWeek + tripExpensesThisWeek;

    const weeklySpentAmountEl = document.getElementById('weekly-spent-amount');
    const weeklySpentSubtitleEl = document.getElementById('weekly-spent-subtitle');
    if (weeklySpentAmountEl && weeklySpentSubtitleEl) {
        weeklySpentAmountEl.textContent = `₹${totalSpentThisWeek.toLocaleString('en-IN')} spent this week`;

        const weeklyBudget = (window.profile && window.profile.weeklyLimit) ? Number(window.profile.weeklyLimit) : 15000;
        if (totalSpentThisWeek <= weeklyBudget) {
            const pct = Math.round((weeklyBudget - totalSpentThisWeek) / weeklyBudget * 100);
            weeklySpentSubtitleEl.innerHTML = `
        <span class="trend-icon">↓</span>
        <span>${pct}% less than weekly limit (₹${weeklyBudget.toLocaleString('en-IN')})</span>
      `;
        } else {
            const pct = Math.round((totalSpentThisWeek - weeklyBudget) / weeklyBudget * 100);
            weeklySpentSubtitleEl.innerHTML = `
        <span class="trend-icon" style="color: var(--color-danger)">↑</span>
        <span style="color: var(--color-danger); font-weight: 600;">${pct}% over weekly limit (₹${weeklyBudget.toLocaleString('en-IN')})</span>
      `;
        }
    }

    // 4. Trips Card Updates (Active Trips count & descriptive stats & dynamic buddy avatars)
    const activeTripsCountEl = document.getElementById('active-trips-count');
    const tripsCardDescEl = document.getElementById('trips-card-desc');
    if (activeTripsCountEl && tripsCardDescEl) {
        const ongoingTripsCount = trips.filter(t => t.status === 'ongoing').length;
        activeTripsCountEl.textContent = `${ongoingTripsCount} Active`;

        const totalSpentTrips = trips.reduce((sum, t) => sum + t.expenses.reduce((s, e) => s + e.amount, 0), 0);
        tripsCardDescEl.textContent = `₹${totalSpentTrips.toLocaleString('en-IN')} spent across ${trips.length} trips`;
    }

    const avatarGroupContainer = document.querySelector('#home-trips-card .avatar-group');
    if (avatarGroupContainer) {
        const uniqueMembers = [];
        const seenNames = new Set();
        trips.forEach(t => {
            t.members.forEach(m => {
                if (m.name !== ownerName && !seenNames.has(m.name)) {
                    seenNames.add(m.name);
                    uniqueMembers.push(m);
                }
            });
        });

        const visibleMembers = uniqueMembers.slice(0, 3);
        const extraCount = uniqueMembers.length - visibleMembers.length;

        let html = visibleMembers.map(m => `
      <span class="stack-avatar" style="
        background-color: ${m.color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--color-card-bg);
        margin-left: -6px;
        font-size: 0.6rem;
        font-weight: 800;
        color: white;
      ">${m.initials}</span>
    `).join('');

        if (extraCount > 0) {
            html += `<div class="avatar-more" style="width: 24px; height: 24px; font-size: 0.6rem; margin-left: -6px;">+${extraCount}</div>`;
        }
        avatarGroupContainer.innerHTML = html;
    }

    // 5. Daily Finance Card Updates (budget label progress, and Track description)
    const homeFinanceBadgeEl = document.getElementById('home-finance-badge');
    const financeCardDescEl = document.getElementById('finance-card-desc');
    const financeSpentPercentageEl = document.getElementById('finance-spent-percentage');
    const financeProgressFillEl = document.getElementById('finance-progress-fill');

    if (financeCardDescEl && financeSpentPercentageEl && financeProgressFillEl) {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const thisMonthExpenses = transactions
            .filter(tx => tx.type === 'expense' && tx.date && tx.date.getTime() >= startOfMonth)
            .reduce((sum, tx) => sum + tx.amount, 0);

        const monthlyBudget = (window.profile && window.profile.monthlyBudget) ? Number(window.profile.monthlyBudget) : 30000;
        const pct = Math.min(100, Math.round((thisMonthExpenses / monthlyBudget) * 100));

        financeCardDescEl.textContent = `₹${thisMonthExpenses.toLocaleString('en-IN')} spent this month`;
        financeSpentPercentageEl.textContent = `${pct}%`;
        financeProgressFillEl.style.width = `${pct}%`;

        if (homeFinanceBadgeEl) {
            if (thisMonthExpenses <= monthlyBudget) {
                homeFinanceBadgeEl.textContent = 'On Track';
                homeFinanceBadgeEl.className = 'card-badge success';
            } else {
                homeFinanceBadgeEl.textContent = 'Over Limit';
                homeFinanceBadgeEl.className = 'card-badge danger';
            }
        }
    }
};

// --- 4C. DYNAMIC ACTIVITY HISTORY ENGINE ---
const renderHistory = (tabType = "daily", searchQuery = "") => {
    const dailyListEl = document.getElementById("history-daily-list");
    const tripsListEl = document.getElementById("history-trips-list");
    if (!dailyListEl || !tripsListEl) return;

    const query = searchQuery.trim().toLowerCase();

    if (tabType === "daily") {
        dailyListEl.style.display = "flex";
        tripsListEl.style.display = "none";
        dailyListEl.innerHTML = "";

        const sortedTx = [...transactions].sort((a, b) => b.date - a.date);
        const filteredTx = sortedTx.filter(tx => {
            const titleMatch = tx.title && tx.title.toLowerCase().includes(query);
            const catMatch = tx.category && tx.category.toLowerCase().includes(query);
            const notesMatch = tx.notes && tx.notes.toLowerCase().includes(query);
            return titleMatch || catMatch || notesMatch;
        });

        if (filteredTx.length === 0) {
            dailyListEl.innerHTML = `
        <div style="text-align:center; padding:40px 20px; opacity:0.6; font-size:0.85rem;">
          🔍 No daily transactions match your search.
        </div>
      `;
            return;
        }

        filteredTx.forEach(tx => {
            let icon = "💸";
            const cat = tx.category ? tx.category.toLowerCase() : "";
            if (cat.includes("food") || cat.includes("drink")) icon = "🍔";
            else if (cat.includes("hotel") || cat.includes("stay") || cat.includes("accommodation")) icon = "🏨";
            else if (cat.includes("transport") || cat.includes("travel") || cat.includes("transit")) icon = "✈️";
            else if (cat.includes("salary") || cat.includes("income")) icon = "💰";
            else if (cat.includes("bill") || cat.includes("rent")) icon = "🧾";
            else if (cat.includes("personal")) icon = "👤";

            const card = document.createElement("div");
            card.className = "transaction-card-node animate-fade-in";
            const isIncome = tx.type === "income";

            card.innerHTML = `
        <div class="tcn-top">
          <div class="tcn-details">
            <div class="tcn-icon-wrap">${icon}</div>
            <div class="tcn-meta">
              <h4 class="tcn-title">${tx.title}</h4>
              <span class="tcn-payer">${tx.category || 'General'}${tx.notes ? ' • ' + tx.notes : ''}</span>
            </div>
          </div>
          <div class="tcn-right">
            <span class="tcn-amount ${isIncome ? 'income-type' : 'expense-type'}">
              ${isIncome ? '+' : '-'}₹${tx.amount.toLocaleString('en-IN')}
            </span>
            <span class="tcn-badge ${isIncome ? 'income-badge' : 'expense-badge'}">
              ${isIncome ? 'Credit' : 'Debit'}
            </span>
          </div>
        </div>
        <div class="tcn-footer">
          <span class="tcn-date">${getFormattedDateTimeString(tx.date)}</span>
          <div class="tcn-actions">
            <button class="tcn-action-btn delete" aria-label="Delete Transaction" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;

            card.querySelector(".delete").addEventListener("click", () => {
                transactions = transactions.filter(t => t.id !== tx.id);
                saveTransactionsToLocalStorage();

                renderTransactions(document.querySelector("#finance-filters-container .finance-filter.active")?.getAttribute("data-filter") || "today");
                renderHomeTimeline();
                updateHomeScreen();
                renderHistory("daily", searchQuery);

                const toast = document.getElementById("toast-notification");
                if (toast) {
                    toast.querySelector(".toast-message").textContent = `Transaction deleted.`;
                    toast.classList.add("show");
                    setTimeout(() => toast.classList.remove("show"), 3000);
                }
            });

            dailyListEl.appendChild(card);
        });
    } else {
        dailyListEl.style.display = "none";
        tripsListEl.style.display = "flex";
        tripsListEl.innerHTML = "";

        let allTripExpenses = [];
        const trips = window.trips || [];
        trips.forEach(trip => {
            trip.expenses.forEach(exp => {
                allTripExpenses.push({
                    ...exp,
                    tripTitle: trip.title,
                    tripId: trip.id
                });
            });
        });

        allTripExpenses.sort((a, b) => b.date - a.date);

        const filteredExpenses = allTripExpenses.filter(exp => {
            const titleMatch = exp.title && exp.title.toLowerCase().includes(query);
            const catMatch = exp.category && exp.category.toLowerCase().includes(query);
            const tripMatch = exp.tripTitle && exp.tripTitle.toLowerCase().includes(query);
            const payerMatch = exp.paidBy && exp.paidBy.toLowerCase().includes(query);
            return titleMatch || catMatch || tripMatch || payerMatch;
        });

        if (filteredExpenses.length === 0) {
            tripsListEl.innerHTML = `
        <div style="text-align:center; padding:40px 20px; opacity:0.6; font-size:0.85rem;">
          🔍 No trip expenses match your search.
        </div>
      `;
            return;
        }

        filteredExpenses.forEach(exp => {
            let icon = "🍔";
            if (exp.category === "Hotel") icon = "🏨";
            else if (exp.category === "Travel" || exp.category === "Transport") icon = "✈️";
            else if (exp.category === "Shopping") icon = "🛍️";

            const card = document.createElement("div");
            card.className = "transaction-card-node animate-fade-in";

            card.innerHTML = `
        <div class="tcn-top">
          <div class="tcn-details">
            <div class="tcn-icon-wrap">${icon}</div>
            <div class="tcn-meta">
              <h4 class="tcn-title">${exp.title}</h4>
              <span class="tcn-payer">Paid by <strong>${exp.paidBy}</strong> • Trip: ${exp.tripTitle}</span>
            </div>
          </div>
          <div class="tcn-right">
            <span class="tcn-amount expense-type">
              -₹${exp.amount.toLocaleString('en-IN')}
            </span>
            <span class="tcn-badge expense-badge">
              ${exp.personal ? 'Personal' : 'Shared'}
            </span>
          </div>
        </div>
        <div class="tcn-footer">
          <span class="tcn-date">${getFormattedDateTimeString(exp.date)}</span>
          <div class="tcn-actions">
            <button class="tcn-action-btn delete" aria-label="Delete Expense" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;

            card.querySelector(".delete").addEventListener("click", () => {
                const targetTrip = trips.find(t => t.id === exp.tripId);
                if (targetTrip) {
                    targetTrip.expenses = targetTrip.expenses.filter(e => e.id !== exp.id);
                    if (window.saveTripsToLocalStorage) window.saveTripsToLocalStorage();

                    if (window.renderTrips) window.renderTrips();
                    if (window.renderTripDetails && window.activeTripId === exp.tripId) {
                        window.renderTripDetails(targetTrip);
                    }
                    renderHomeTimeline();
                    updateHomeScreen();
                    renderHistory("trips", searchQuery);

                    const toast = document.getElementById("toast-notification");
                    if (toast) {
                        toast.querySelector(".toast-message").textContent = `Expense "${exp.title}" deleted.`;
                        toast.classList.add("show");
                        setTimeout(() => toast.classList.remove("show"), 3000);
                    }
                }
            });

            tripsListEl.appendChild(card);
        });
    }
};

// Expose renderer so app.js can invoke it on mutations
window.renderHomeTimeline = renderHomeTimeline;
window.updateHomeScreen = updateHomeScreen;
window.renderHistory = renderHistory;

// --- 5. DOM EVENTS & DYNAMIC FLOWS ---
const initFinance = () => {
    // Render views on load (starts at "today" range by default)
    renderTransactions("today");
    renderHomeTimeline();
    updateHomeScreen();

    // Back button routing
    const financeBackBtn = document.getElementById("finance-back-btn");
    if (financeBackBtn) {
        financeBackBtn.addEventListener("click", () => {
            if (window.navigateTo) window.navigateTo("home-view");
        });
    }

    // Home card click routing
    const homeFinanceCard = document.getElementById("home-finance-card");
    if (homeFinanceCard) {
        homeFinanceCard.addEventListener("click", () => {
            if (window.navigateTo) window.navigateTo("finance-view");
        });
    }

    // Sticky Floating Add Transaction routing inside finance view
    const financeOpenAddModalBtn = document.getElementById("finance-open-add-modal");
    if (financeOpenAddModalBtn) {
        financeOpenAddModalBtn.addEventListener("click", () => {
            if (window.toggleModal) {
                const addModal = document.getElementById("add-modal");
                window.toggleModal(addModal, true, "amount");
            }
        });
    }

    // Range filter triggers
    const filterButtons = document.querySelectorAll("#finance-filters-container .finance-filter");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filterType = btn.getAttribute("data-filter") || "today";
            renderTransactions(filterType);

            // Micro-animation click feedback
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = '', 150);
        });
    });

    // Intercept main transaction submit form
    const addModal = document.getElementById("add-modal");
    const transactionForm = document.getElementById("transaction-form");

    if (transactionForm) {
        // Cache inputs
        const amountInput = document.getElementById("amount");
        const titleInput = document.getElementById("title");
        const typeInput = document.getElementById("type");
        const categoryInput = document.getElementById("category");
        const notesInput = document.getElementById("notes");

        transactionForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const amountVal = parseFloat(amountInput.value);
            const titleVal = titleInput.value.trim();
            const typeVal = typeInput.value;
            const categoryVal = categoryInput.value;
            const notesVal = notesInput ? notesInput.value.trim() : "";

            // Log with current dynamic timestamp
            const dateVal = new Date();

            if (!titleVal || isNaN(amountVal)) return;

            const newTx = {
                id: Date.now(),
                title: titleVal,
                amount: amountVal,
                type: typeVal,
                category: categoryVal,
                date: dateVal,
                notes: notesVal
            };

            // Push to dynamic state array
            transactions.unshift(newTx);
            saveTransactionsToLocalStorage();

            // Refresh filters & Home timeline in real-time
            const activeFilter = document.querySelector("#finance-filters-container .finance-filter.active");
            const currentFilter = activeFilter ? activeFilter.getAttribute("data-filter") : "today";

            renderTransactions(currentFilter);
            renderHomeTimeline();
            updateHomeScreen();

            // Synchronize history view transactions in real-time if it exists
            const activeTab = document.querySelector("#history-tabs-container .trip-tab.active");
            const tabType = activeTab ? activeTab.getAttribute("data-history-tab") : "daily";
            const searchInput = document.getElementById("history-search");
            const query = searchInput ? searchInput.value : "";
            renderHistory(tabType, query);

            // Clear & close modal overlay sheet
            transactionForm.reset();

            if (addModal) {
                addModal.classList.remove("open");
                addModal.setAttribute("aria-hidden", "true");
            }

            // Flash toast message
            const toast = document.getElementById("toast-notification");
            if (toast) {
                toast.querySelector(".toast-message").textContent = `Saved Transaction: ${titleVal}`;
                toast.classList.add("show");
                setTimeout(() => toast.classList.remove("show"), 3000);
            }
        });
    }

    // --- History Screen Triggers & Binding ---
    const homeSeeAllBtn = document.getElementById("home-see-all-btn");
    const historySearch = document.getElementById("history-search");

    if (homeSeeAllBtn) {
        homeSeeAllBtn.addEventListener("click", () => {
            const tabs = document.querySelectorAll("#history-tabs-container .trip-tab");
            tabs.forEach(t => t.classList.remove("active"));
            const dailyTab = document.querySelector("#history-tabs-container .trip-tab[data-history-tab='daily']");
            if (dailyTab) dailyTab.classList.add("active");
            const indicator = document.getElementById("history-tab-indicator");
            if (indicator) indicator.style.transform = "translateX(0)";

            if (historySearch) historySearch.value = "";
            renderHistory("daily", "");
            if (window.navigateTo) window.navigateTo("history-view");
        });
    }

    const historyTabs = document.querySelectorAll("#history-tabs-container .trip-tab");
    historyTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            historyTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const tabType = tab.getAttribute("data-history-tab") || "daily";
            const indicator = document.getElementById("history-tab-indicator");

            if (tabType === "trips") {
                if (indicator) indicator.style.transform = "translateX(100%)";
            } else {
                if (indicator) indicator.style.transform = "translateX(0)";
            }

            const q = historySearch ? historySearch.value : "";
            renderHistory(tabType, q);
        });
    });

    if (historySearch) {
        historySearch.addEventListener("input", () => {
            const activeTab = document.querySelector("#history-tabs-container .trip-tab.active");
            const tabType = activeTab ? activeTab.getAttribute("data-history-tab") : "daily";
            renderHistory(tabType, historySearch.value);
        });
    }

    // Bind Log Out Only Trigger
    const profileLogoutBtn = document.getElementById("profile-logout-btn");
    if (profileLogoutBtn) {
        profileLogoutBtn.addEventListener("click", () => {
            // Drop current user session pointer while retaining all user files and last user reference
            localStorage.removeItem("ledgerly-current-user");
            sessionStorage.removeItem("ledgerly-greeting");

            const toast = document.getElementById("toast-notification");
            if (toast) {
                toast.querySelector(".toast-message").textContent = "Logged out successfully! ⚡";
                toast.classList.add("show");
            }

            setTimeout(() => {
                window.location.reload();
            }, 1500);
        });
    }

    // Bind Reset App & Clear Data Trigger (Factory Reset)
    const profileResetBtn = document.getElementById("profile-reset-btn");
    if (profileResetBtn) {
        profileResetBtn.addEventListener("click", () => {
            // Purge only the active user's scoped files
            const profileKey = window.getStorageKey("profile");
            const tripsKey = window.getStorageKey("trips");
            const txKey = window.getStorageKey("transactions");
            const themeKey = window.getStorageKey("theme");

            localStorage.removeItem(profileKey);
            localStorage.removeItem(tripsKey);
            localStorage.removeItem(txKey);
            localStorage.removeItem(themeKey);

            // Clean up dynamic session pointers
            const currentUser = localStorage.getItem("ledgerly-current-user");
            const lastUser = localStorage.getItem("ledgerly-last-user");
            if (lastUser === currentUser) {
                localStorage.removeItem("ledgerly-last-user");
            }
            localStorage.removeItem("ledgerly-current-user");
            sessionStorage.removeItem("ledgerly-greeting");

            const toast = document.getElementById("toast-notification");
            if (toast) {
                toast.querySelector(".toast-message").textContent = "Your data cleared! Resetting app... ⚡";
                toast.classList.add("show");
            }

            setTimeout(() => {
                window.location.reload();
            }, 1500);
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initFinance);
} else {
    initFinance();
}