/* ============================================================
   ELECTYRO — Core Application Logic & Navigation Router
   ============================================================ */

// ============================================================
//  LANDING PAGE — Canvas Particle Network
// ============================================================
(function initLandingCanvas() {
  const canvas = document.getElementById('landing-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [], mouse = {x:-999, y:-999};

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  const N = 75;
  for (let i = 0; i < N; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1.5 + Math.random() * 1.5,
      color: Math.random() > 0.75 ? '#f59e0b' : '#10b981'
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    
    // Connections
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.09 * (1 - dist / 140)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
      
      // Mouse magnetic effect
      const mdx = particles[i].x - mouse.x;
      const mdy = particles[i].y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 180) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.22 * (1 - mdist / 180)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.75;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    requestAnimationFrame(draw);
  }
  draw();

  // Animated stat counters
  const counters = document.querySelectorAll('[data-count]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = +el.dataset.count;
        let current = 0;
        const step = target / 50;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = current >= 1000000 ? (current / 1000000).toFixed(1) + 'M+' : current >= 1000 ? Math.floor(current / 1000) + 'K+' : Math.floor(current);
        }, 25);
        obs.unobserve(el);
      }
    });
  });
  counters.forEach(c => obs.observe(c));
})();

// ============================================================
//  AUTHENTICATION & MODAL CONTROLS
// ============================================================
function showLogin() {
  document.getElementById('login-modal').classList.add('show');
}
function hideLogin() {
  document.getElementById('login-modal').classList.remove('show');
}

function quickSelectRole(role) {
  if (role === 'user') {
    document.getElementById('login-email').value = 'user@electyro.com';
    document.getElementById('login-pass').value = 'user123';
  } else if (role === 'staff') {
    document.getElementById('login-email').value = 'staff@electyro.com';
    document.getElementById('login-pass').value = 'staff123';
  } else if (role === 'admin') {
    document.getElementById('login-email').value = 'admin@electyro.com';
    document.getElementById('login-pass').value = 'admin123';
  }
}

function togglePasswordVisibility() {
  const input = document.getElementById('login-pass');
  const icon = document.getElementById('login-pass-icon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa-solid fa-eye-slash text-xs';
  } else {
    input.type = 'password';
    icon.className = 'fa-solid fa-eye text-xs';
  }
}

function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  const user = DB.users.find(u => u.email === email && u.password === pass);
  
  if (!user) {
    toast('Invalid email or password', 'error');
    return;
  }
  if (user.status === 'inactive') {
    toast('Account is deactivated. Contact system admin.', 'error');
    return;
  }

  state.user = user;
  state.page = 'overview';
  
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('login-modal').classList.remove('show');
  document.getElementById('app').classList.remove('hidden');
  
  renderApp();
  toast(`Welcome back, ${user.name}!`);
}

function handleLogout() {
  state.user = null;
  destroyCharts();
  document.getElementById('app').classList.add('hidden');
  document.getElementById('landing').classList.remove('hidden');
  toast('Signed out successfully', 'info');
}

// ============================================================
//  MAIN APP RENDERER
// ============================================================
function renderApp() {
  const u = state.user;
  
  // Sidebar Header
  document.getElementById('sidebar-name').textContent = u.name;
  document.getElementById('sidebar-role').textContent = u.role.charAt(0).toUpperCase() + u.role.slice(1);
  document.getElementById('sidebar-avatar').textContent = u.name.split(' ').map(w => w[0]).join('');
  document.getElementById('topbar-role-badge').textContent = u.role.toUpperCase();

  // Navigation Items (No Shader Showcase)
  const navItems = getNavItems(u.role);
  document.getElementById('nav-list').innerHTML = navItems.map(item => `
    <div class="nav-item ${state.page === item.id ? 'active' : ''}" onclick="navigate('${item.id}')">
      <i class="fa-solid ${item.icon}"></i>
      <span>${item.label}</span>
    </div>
  `).join('');

  document.getElementById('page-title').textContent = navItems.find(n => n.id === state.page)?.label || 'Overview';
  destroyCharts();
  renderPage();
}

function getNavItems(role) {
  if (role === 'user') return [
    { id: 'overview', icon: 'fa-gauge-high', label: 'Overview' },
    { id: 'appliances', icon: 'fa-plug-circle-bolt', label: 'My Appliances' },
    { id: 'analytics', icon: 'fa-chart-mixed', label: 'Analytics' },
    { id: 'bills', icon: 'fa-file-invoice-dollar', label: 'Bills & Payments' },
    { id: 'settings', icon: 'fa-sliders', label: 'Settings' },
  ];
  if (role === 'staff') return [
    { id: 'overview', icon: 'fa-gauge-high', label: 'Overview' },
    { id: 'users', icon: 'fa-users', label: 'Assigned Users' },
    { id: 'reports', icon: 'fa-chart-pie', label: 'Reports' },
    { id: 'tickets', icon: 'fa-headset', label: 'Support Tickets' },
  ];
  return [ // admin
    { id: 'overview', icon: 'fa-gauge-high', label: 'Overview' },
    { id: 'users', icon: 'fa-users', label: 'All Users' },
    { id: 'staff-mgmt', icon: 'fa-user-shield', label: 'Staff Management' },
    { id: 'analytics', icon: 'fa-chart-line', label: 'Analytics' },
    { id: 'tariffs', icon: 'fa-coins', label: 'Tariffs & Billing' },
    { id: 'settings', icon: 'fa-sliders', label: 'System Settings' },
  ];
}

function navigate(page) {
  state.page = page;
  renderApp();
  document.getElementById('sidebar').classList.remove('mobile-open');
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ma = document.getElementById('main-area');
  if (window.innerWidth <= 768) {
    sb.classList.toggle('mobile-open');
  } else {
    state.sidebarOpen = !state.sidebarOpen;
    sb.classList.toggle('collapsed', !state.sidebarOpen);
    ma.classList.toggle('expanded', !state.sidebarOpen);
  }
}

function renderPage() {
  const el = document.getElementById('page-content');
  const role = state.user.role;
  const page = state.page;

  if (role === 'user') {
    if (page === 'overview') el.innerHTML = userOverview();
    else if (page === 'appliances') el.innerHTML = userAppliances();
    else if (page === 'analytics') el.innerHTML = userAnalytics();
    else if (page === 'bills') el.innerHTML = userBills();
    else if (page === 'settings') el.innerHTML = userSettings();
  } else if (role === 'staff') {
    if (page === 'overview') el.innerHTML = staffOverview();
    else if (page === 'users') el.innerHTML = staffUsers();
    else if (page === 'reports') el.innerHTML = staffReports();
    else if (page === 'tickets') el.innerHTML = staffTickets();
  } else {
    if (page === 'overview') el.innerHTML = adminOverview();
    else if (page === 'users') el.innerHTML = adminUsers();
    else if (page === 'staff-mgmt') el.innerHTML = adminStaff();
    else if (page === 'analytics') el.innerHTML = adminAnalytics();
    else if (page === 'tariffs') el.innerHTML = adminTariffs();
    else if (page === 'settings') el.innerHTML = adminSettings();
  }
  
  el.classList.remove('fade-in');
  void el.offsetWidth;
  el.classList.add('fade-in');
  initPageCharts();
}

// ============================================================
//  USER DASHBOARD VIEWS
// ============================================================
function getUserAppliances() { return DB.appliances.filter(a => a.userId === state.user.id); }
function getUserBills() { return DB.bills.filter(b => b.userId === state.user.id); }

function calcDailyKwh() {
  return getUserAppliances().reduce((sum, a) => sum + (a.active ? (a.watt * a.hoursPerDay / 1000) : 0), 0);
}
function calcMonthlyKwh() { return calcDailyKwh() * 30; }
function calcMonthlyCost() { return Math.round(calcMonthlyKwh() * 8); }
function calcCarbon() { return (calcMonthlyKwh() * 0.82).toFixed(1); }
function calcLiveLoad() {
  return getUserAppliances().reduce((sum, a) => sum + (a.active ? a.watt : 0), 0);
}

function userOverview() {
  const dk = calcDailyKwh();
  const mk = calcMonthlyKwh();
  const mc = calcMonthlyCost();
  const activeCount = getUserAppliances().filter(a => a.active).length;
  const totalApps = getUserAppliances().length;
  const pendingBill = getUserBills().find(b => b.status === 'pending');
  const liveLoad = calcLiveLoad();
  const appliances = getUserAppliances();

  // Sort appliances by monthly consumption for analytics
  const sortedApps = [...appliances].sort((a, b) => (b.watt * b.hoursPerDay) - (a.watt * a.hoursPerDay));
  const topApp = sortedApps[0] || { name: 'Air Conditioner', watt: 1500, hoursPerDay: 8 };
  const topAppMonthlyKwh = +(topApp.watt * topApp.hoursPerDay / 1000 * 30).toFixed(1);
  const topAppMonthlyCost = Math.round(topAppMonthlyKwh * 8);
  const topAppPercentage = mk > 0 ? ((topAppMonthlyKwh / mk) * 100).toFixed(1) : '52.2';

  return `
    <!-- Top Summary Metrics Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div class="stat-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold" style="color:var(--text-muted)">Live Power Draw</span>
          <span class="pulse-dot"></span>
        </div>
        <div class="text-2xl font-bold font-display text-emerald-400">${(liveLoad / 1000).toFixed(2)} <span class="text-xs font-normal text-slate-400">kW</span></div>
        <div class="text-xs mt-1 text-slate-400">Active load: ${liveLoad} Watts</div>
      </div>

      <div class="stat-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold" style="color:var(--text-muted)">Daily Usage</span>
          <i class="fa-solid fa-bolt text-xs text-cyan-400"></i>
        </div>
        <div class="text-2xl font-bold font-display">${fmtKwh(dk)}</div>
        <div class="text-xs mt-1 text-emerald-400"><i class="fa-solid fa-arrow-down mr-1"></i>8.4% vs avg</div>
      </div>

      <div class="stat-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold" style="color:var(--text-muted)">Est. Monthly Cost</span>
          <i class="fa-solid fa-indian-rupee-sign text-xs text-amber-400"></i>
        </div>
        <div class="text-2xl font-bold font-display">${fmtCurrency(mc)}</div>
        <div class="text-xs mt-1 text-amber-400"><i class="fa-solid fa-arrow-up mr-1"></i>3.2% vs last month</div>
      </div>

      <div class="stat-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold" style="color:var(--text-muted)">Active Appliances</span>
          <i class="fa-solid fa-plug text-xs text-slate-400"></i>
        </div>
        <div class="text-2xl font-bold font-display">${activeCount} <span class="text-xs font-normal text-slate-400">/ ${totalApps} running</span></div>
        <div class="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div class="h-full bg-emerald-400 transition-all duration-500" style="width:${(activeCount / Math.max(totalApps, 1) * 100)}%"></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold" style="color:var(--text-muted)">Eco Efficiency</span>
          <i class="fa-solid fa-leaf text-xs text-emerald-400"></i>
        </div>
        <div class="text-2xl font-bold font-display">${calcCarbon()} <span class="text-xs font-normal text-slate-400">kg CO2</span></div>
        <div class="text-xs mt-1 text-emerald-400">Eco-Score: 92/100</div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- SECTION 1: APPLIANCE-WISE ELECTRICITY TRACKING              -->
    <!-- ============================================================ -->
    <div class="glass-card p-6 mb-8 border-emerald-500/20">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 class="font-display font-bold text-xl text-white">1. Appliance-Wise Electricity Tracking</h2>
          </div>
          <p class="text-xs text-slate-400 mt-1">Real-time status, power draw, daily runtime, and electricity cost per device in your home.</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="document.getElementById('appliance-modal').classList.add('show')" class="btn-primary btn-sm">
            <i class="fa-solid fa-plus text-xs"></i> Add Appliance
          </button>
        </div>
      </div>

      <!-- Appliance Filter Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        <button onclick="filterOverviewCategory('all', this)" class="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold cursor-pointer">All Devices (${appliances.length})</button>
        <button onclick="filterOverviewCategory('cooling', this)" class="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 text-xs font-semibold hover:text-white cursor-pointer">Cooling</button>
        <button onclick="filterOverviewCategory('heating', this)" class="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 text-xs font-semibold hover:text-white cursor-pointer">Heating</button>
        <button onclick="filterOverviewCategory('kitchen', this)" class="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 text-xs font-semibold hover:text-white cursor-pointer">Kitchen</button>
        <button onclick="filterOverviewCategory('lighting', this)" class="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 text-xs font-semibold hover:text-white cursor-pointer">Lighting</button>
        <button onclick="filterOverviewCategory('entertainment', this)" class="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 text-xs font-semibold hover:text-white cursor-pointer">Entertainment</button>
      </div>

      <!-- Appliance Tracking Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="overview-appliance-grid">
        ${appliances.map(a => {
          const dailyKwh = +(a.active ? (a.watt * a.hoursPerDay / 1000) : 0).toFixed(2);
          const dailyCost = Math.round(dailyKwh * 8);
          const monthlyKwh = +(a.watt * a.hoursPerDay / 1000 * 30).toFixed(1);
          const monthlyCost = Math.round(monthlyKwh * 8);
          const loadShare = mk > 0 ? ((monthlyKwh / mk) * 100).toFixed(1) : '0';

          return `
            <div class="p-4 rounded-xl border transition-all ${a.active ? 'bg-slate-900/80 border-emerald-500/40 shadow-lg shadow-emerald-500/5' : 'bg-slate-950/60 border-slate-800/80 opacity-70'} app-track-card" data-category="${a.category}">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl ${a.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-sm">
                    <i class="fa-solid ${a.icon}"></i>
                  </div>
                  <div>
                    <h4 class="font-semibold text-sm text-white leading-tight">${a.name}</h4>
                    <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">${a.category}</span>
                  </div>
                </div>
                <div onclick="toggleAppOverview(${a.id})" class="toggle ${a.active ? 'on' : ''} scale-75" title="Toggle Power"></div>
              </div>

              <!-- Power & Runtime Stats -->
              <div class="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/60 text-xs">
                <div>
                  <span class="text-[10px] text-slate-500 block">Wattage</span>
                  <span class="font-bold text-white font-mono">${a.watt} W</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-500 block">Daily Runtime</span>
                  <div class="flex items-center gap-1 font-bold text-white font-mono">
                    <button onclick="adjustRuntime(${a.id}, -1)" class="w-4 h-4 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-[10px]">-</button>
                    <span>${a.hoursPerDay}h</span>
                    <button onclick="adjustRuntime(${a.id}, 1)" class="w-4 h-4 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-[10px]">+</button>
                  </div>
                </div>
              </div>

              <!-- Energy & Cost Breakdown -->
              <div class="space-y-1.5 text-xs border-t border-slate-800/60 pt-2.5">
                <div class="flex justify-between items-center text-slate-400">
                  <span>Today's Energy:</span>
                  <span class="font-mono font-semibold text-white">${dailyKwh} kWh (${fmtCurrency(dailyCost)})</span>
                </div>
                <div class="flex justify-between items-center text-slate-400">
                  <span>Est. Monthly:</span>
                  <span class="font-mono font-semibold text-emerald-400">${monthlyKwh} kWh (${fmtCurrency(monthlyCost)})</span>
                </div>
              </div>

              <!-- Load Bar -->
              <div class="mt-3">
                <div class="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                  <span>House Load Share</span>
                  <span class="font-mono text-slate-400">${loadShare}%</span>
                </div>
                <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full ${+loadShare > 30 ? 'bg-amber-400' : 'bg-emerald-400'}" style="width: ${Math.min(+loadShare, 100)}%"></div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- SECTION 2: ANALYTICS OF RECENT MONTHS APPLIANCE USAGE       -->
    <!-- ============================================================ -->
    <div class="glass-card p-6 mb-8 border-cyan-500/20">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-chart-column text-cyan-400 text-lg"></i>
            <h2 class="font-display font-bold text-xl text-white">2. Appliance Usage Analytics — Recent Months</h2>
          </div>
          <p class="text-xs text-slate-400 mt-1">Detailed analysis of electricity consumption and top energy-consuming appliances in ${state.user.name}'s home.</p>
        </div>
        <div class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-2">
          <i class="fa-solid fa-house-user text-cyan-400"></i> ${state.user.name}'s Residence
        </div>
      </div>

      <!-- Spotlight: What appliance used more electricity in recent months -->
      <div class="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl flex-shrink-0">
            <i class="fa-solid ${topApp.icon || 'fa-snowflake'}"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="badge badge-amber text-[10px]">HIGHEST ENERGY CONSUMER</span>
              <span class="text-xs text-slate-400">Recent Months Analysis</span>
            </div>
            <h3 class="text-lg font-bold text-white mt-1">
              ${topApp.name} used the most electricity in recent months!
            </h3>
            <p class="text-xs text-slate-300 mt-0.5">
              In July 2025, your <strong>${topApp.name}</strong> consumed <strong>${topAppMonthlyKwh} kWh</strong> (~<strong>${fmtCurrency(topAppMonthlyCost)}</strong>), accounting for <strong class="text-amber-400">${topAppPercentage}%</strong> of your total home electricity bill.
            </p>
          </div>
        </div>
        <div class="px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1 min-w-[200px]">
          <div class="text-slate-400">AI Optimization Tip:</div>
          <div class="text-emerald-400 font-semibold flex items-center gap-1.5">
            <i class="fa-solid fa-lightbulb"></i> Set AC to 24°C
          </div>
          <div class="text-[11px] text-slate-400">Saves up to ₹690/month in bill!</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Multi-Month Appliance Bar Chart -->
        <div class="lg:col-span-2 glass-card p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-display font-semibold text-base text-white">Appliance Consumption Comparison (May - July)</h3>
              <span class="text-xs text-slate-400">Electricity units (kWh) consumed per appliance over recent months</span>
            </div>
            <span class="badge badge-blue text-[10px]">RECENT MONTHS</span>
          </div>
          <div class="chart-wrap" style="height:260px"><canvas id="chart-recent-months-apps"></canvas></div>
        </div>

        <!-- Appliance Share Doughnut Chart -->
        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-display font-semibold text-base text-white">Bill Share (%)</h3>
              <span class="text-xs text-slate-400">Appliance load distribution</span>
            </div>
          </div>
          <div class="chart-wrap" style="height:260px"><canvas id="chart-appliance-pie"></canvas></div>
        </div>
      </div>

      <!-- Recent Months Appliance Breakdown Table -->
      <div class="overflow-x-auto rounded-xl border border-slate-800/80">
        <table class="data-table">
          <thead>
            <tr>
              <th>Appliance Name</th>
              <th>Category</th>
              <th>Wattage</th>
              <th>May Usage</th>
              <th>June Usage</th>
              <th>July Usage</th>
              <th>Bill Share</th>
              <th>Est. Cost (July)</th>
            </tr>
          </thead>
          <tbody>
            ${sortedApps.map((a, i) => {
              const julKwh = +(a.watt * a.hoursPerDay / 1000 * 30).toFixed(1);
              const junKwh = +(julKwh * 0.95).toFixed(1);
              const mayKwh = +(julKwh * 0.88).toFixed(1);
              const cost = Math.round(julKwh * 8);
              const share = mk > 0 ? ((julKwh / mk) * 100).toFixed(1) : '0';

              return `
                <tr>
                  <td class="font-semibold text-white flex items-center gap-2">
                    <i class="fa-solid ${a.icon} text-slate-400 text-xs"></i>
                    ${a.name}
                    ${i === 0 ? '<span class="badge badge-amber text-[9px] py-0 px-1.5 ml-1">#1 Top Consumer</span>' : ''}
                  </td>
                  <td><span class="text-xs text-slate-400 uppercase font-semibold">${a.category}</span></td>
                  <td class="font-mono text-xs text-slate-300">${a.watt} W</td>
                  <td class="font-mono text-xs text-slate-400">${mayKwh} kWh</td>
                  <td class="font-mono text-xs text-slate-300">${junKwh} kWh</td>
                  <td class="font-mono text-xs font-bold text-emerald-400">${julKwh} kWh</td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-xs font-semibold text-white">${share}%</span>
                      <div class="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div class="h-full ${i === 0 ? 'bg-amber-400' : 'bg-emerald-400'}" style="width:${Math.min(+share, 100)}%"></div>
                      </div>
                    </div>
                  </td>
                  <td class="font-mono font-bold text-amber-400">${fmtCurrency(cost)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Gemini AI Energy Coach Box -->
      <div class="mt-6 p-5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex flex-col md:flex-row items-start gap-4">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg flex-shrink-0">
          <i class="fa-solid fa-brain"></i>
        </div>
        <div class="flex-1 w-full">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-display font-semibold text-white text-sm">Gemini AI Appliance Analyst</h4>
            <span class="text-[10px] text-emerald-400 font-semibold">ONLINE</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-950 text-xs text-slate-300 border border-slate-800 mb-3" id="ai-coach-output">
            Hello ${state.user.name.split(' ')[0]}! Based on recent months, your <strong>${topApp.name}</strong> accounts for <strong>${topAppPercentage}%</strong> of your total bill. Asking me for customized tips on reducing high appliance consumption!
          </div>
          <div class="flex gap-2">
            <input id="ai-coach-input" class="input-field text-xs py-2 px-3 flex-1" placeholder="Ask Gemini AI about your home appliances..." onkeydown="if(event.key==='Enter') askAICoach(null)">
            <button onclick="askAICoach(null)" class="btn-primary py-2 px-4 text-xs font-semibold">Ask AI</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- SECTION 3: CURRENT BILL PAYMENT WITH RAZORPAY INTEGRATION     -->
    <!-- ============================================================ -->
    <div class="glass-card p-6 border-amber-500/30">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-file-invoice-dollar text-amber-400 text-lg"></i>
            <h2 class="font-display font-bold text-xl text-white">3. Current Bill Payment & Razorpay Gateway</h2>
          </div>
          <p class="text-xs text-slate-400 mt-1">Pay your active electricity invoice instantly via Razorpay supporting UPI, Credit/Debit Cards, and Net Banking.</p>
        </div>
        <div>
          <span class="badge ${pendingBill ? 'badge-amber' : 'badge-green'} text-xs font-bold px-3 py-1">
            ${pendingBill ? 'ACTION REQUIRED: BILL PENDING' : 'ALL BILLS PAID'}
          </span>
        </div>
      </div>

      ${pendingBill ? `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <!-- Bill Summary Details -->
          <div class="lg:col-span-7 p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <span class="text-xs text-slate-400 block">Billing Period</span>
                <span class="text-lg font-bold text-white font-display">${pendingBill.month} (July 2025)</span>
              </div>
              <div class="text-right">
                <span class="text-xs text-slate-400 block">Due Date</span>
                <span class="text-xs font-bold text-amber-400">August 15, 2025</span>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3 text-xs">
              <div class="p-3 rounded-lg bg-slate-950 border border-slate-800/60">
                <span class="text-slate-400 block text-[10px]">Electricity Consumed</span>
                <span class="font-bold text-white text-sm font-mono">${fmtKwh(pendingBill.kwh)}</span>
              </div>
              <div class="p-3 rounded-lg bg-slate-950 border border-slate-800/60">
                <span class="text-slate-400 block text-[10px]">Tariff Slab</span>
                <span class="font-bold text-cyan-400 text-sm font-mono">₹8.00 / kWh</span>
              </div>
              <div class="p-3 rounded-lg bg-slate-950 border border-slate-800/60">
                <span class="text-slate-400 block text-[10px]">Consumer ID</span>
                <span class="font-bold text-slate-300 text-sm font-mono">#ELE-90284</span>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span class="text-xs text-amber-300 block font-medium">Total Payable Amount</span>
                <span class="text-3xl font-extrabold font-display text-emerald-400">${fmtCurrency(pendingBill.amount)}</span>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-slate-400 block">Status</span>
                <span class="badge badge-amber font-bold">UNPAID</span>
              </div>
            </div>
          </div>

          <!-- Razorpay Payment Portal Action Box -->
          <div class="lg:col-span-5 p-6 rounded-xl bg-gradient-to-br from-[#0c2340] to-[#071324] border border-[#3399cc]/40 flex flex-col justify-between space-y-5 shadow-xl">
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2 text-[#3399cc] font-extrabold text-lg">
                  <i class="fa-solid fa-shield-halved"></i>
                  <span>Razorpay Express</span>
                </div>
                <span class="text-[10px] bg-[#3399cc]/20 text-[#38bdf8] px-2 py-0.5 rounded font-bold">100% SECURE</span>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">
                Complete your energy payment securely using Razorpay gateway with instant verification.
              </p>
            </div>

            <!-- Accepted Methods Row -->
            <div class="space-y-2">
              <span class="text-[11px] font-semibold text-slate-400 block">Supported Payment Modes:</span>
              <div class="grid grid-cols-3 gap-2">
                <button onclick="openRazorpayModal(${pendingBill.id}, 'upi')" class="p-2.5 rounded-lg bg-slate-900/90 hover:bg-[#3399cc]/20 border border-slate-700/80 hover:border-[#3399cc] text-xs font-semibold text-white flex flex-col items-center gap-1 transition">
                  <i class="fa-solid fa-qrcode text-emerald-400 text-sm"></i>
                  <span>UPI / QR</span>
                </button>
                <button onclick="openRazorpayModal(${pendingBill.id}, 'card')" class="p-2.5 rounded-lg bg-slate-900/90 hover:bg-[#3399cc]/20 border border-slate-700/80 hover:border-[#3399cc] text-xs font-semibold text-white flex flex-col items-center gap-1 transition">
                  <i class="fa-solid fa-credit-card text-amber-400 text-sm"></i>
                  <span>Card</span>
                </button>
                <button onclick="openRazorpayModal(${pendingBill.id}, 'netbanking')" class="p-2.5 rounded-lg bg-slate-900/90 hover:bg-[#3399cc]/20 border border-slate-700/80 hover:border-[#3399cc] text-xs font-semibold text-white flex flex-col items-center gap-1 transition">
                  <i class="fa-solid fa-building-columns text-cyan-400 text-sm"></i>
                  <span>NetBanking</span>
                </button>
              </div>
            </div>

            <!-- Main Razorpay Trigger Button -->
            <button onclick="openRazorpayModal(${pendingBill.id}, 'upi')" class="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#3399cc] to-[#006699] hover:from-[#3babe3] hover:to-[#0077b6] text-white font-extrabold text-sm shadow-lg shadow-[#3399cc]/30 flex items-center justify-center gap-2 transition cursor-pointer">
              <i class="fa-solid fa-[# Razorpay] fa-bolt"></i>
              <span>Pay ${fmtCurrency(pendingBill.amount)} with Razorpay</span>
              <i class="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      ` : `
        <!-- When Bill is Paid -->
        <div class="p-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
          <div class="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3 class="text-xl font-bold text-white font-display">All Electricity Bills Cleared!</h3>
          <p class="text-xs text-slate-300 max-w-md mx-auto">
            Your account has no outstanding payments due. Thank you for using ELECTYRO Smart Energy Platform.
          </p>
          <div class="pt-2">
            <button onclick="navigate('bills')" class="btn-secondary btn-sm">
              <i class="fa-solid fa-clock-rotate-left text-xs"></i> View Payment History
            </button>
          </div>
        </div>
      `}
    </div>
  `;
}

// ---- Category filter for Section 1 ----
function filterOverviewCategory(cat, btn) {
  const cards = document.querySelectorAll('.app-track-card');
  cards.forEach(c => {
    if (cat === 'all' || c.getAttribute('data-category') === cat) {
      c.style.display = 'block';
    } else {
      c.style.display = 'none';
    }
  });

  if (btn && btn.parentElement) {
    btn.parentElement.querySelectorAll('button').forEach(b => {
      b.className = 'px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 text-xs font-semibold hover:text-white cursor-pointer';
    });
    btn.className = 'px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold cursor-pointer';
  }
}

// ---- Runtime Adjuster for Section 1 ----
function adjustRuntime(appId, delta) {
  const a = DB.appliances.find(a => a.id === appId);
  if (a) {
    a.hoursPerDay = Math.max(1, Math.min(24, a.hoursPerDay + delta));
    renderApp();
    toast(`Updated ${a.name} runtime to ${a.hoursPerDay} hours/day`, 'info');
  }
}

// ---- Toggle appliance power ----
function toggleAppOverview(id) {
  const a = DB.appliances.find(a => a.id === id);
  if (a) {
    a.active = !a.active;
    renderApp();
    toast(`${a.name} turned ${a.active ? 'ON' : 'OFF'}`, a.active ? 'success' : 'info');
  }
}

function openPayModal(billId) {
  openRazorpayModal(billId, 'upi');
}

// ============================================================
//  AUTHENTIC RAZORPAY PAYMENT GATEWAY MODAL
// ============================================================
function openRazorpayModal(billId, initialTab = 'upi') {
  const b = DB.bills.find(x => x.id === billId);
  if (!b) return;

  const modalContainer = document.getElementById('pay-modal-content');
  if (!modalContainer) return;

  modalContainer.className = 'rzp-modal-box';
  modalContainer.innerHTML = `
    <!-- Razorpay Header -->
    <div class="rzp-header flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#3399cc] text-white flex items-center justify-center font-black text-xl shadow-lg">
          <i class="fa-solid fa-bolt"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-display font-extrabold text-base text-white">Razorpay Checkout</h3>
            <span class="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">LIVE</span>
          </div>
          <span class="text-xs text-slate-400">ELECTYRO Energy &bull; Order #ord_RZP${b.id}8291</span>
        </div>
      </div>
      <div class="text-right flex items-center gap-3">
        <div>
          <span class="text-[10px] text-slate-400 block uppercase font-bold">Amount Due</span>
          <span class="text-lg font-extrabold text-emerald-400 font-display">${fmtCurrency(b.amount)}</span>
        </div>
        <button onclick="closePayModal()" class="text-slate-400 hover:text-white p-2">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>
    </div>

    <!-- Razorpay Body (Tabs + Content) -->
    <div class="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
      <!-- Tabs Sidebar -->
      <div class="md:col-span-4 space-y-2 border-r border-slate-800/80 pr-4">
        <div onclick="switchRzpTab('upi')" id="rzp-tab-upi" class="rzp-tab-btn ${initialTab === 'upi' ? 'active' : ''}">
          <i class="fa-solid fa-qrcode text-emerald-400"></i>
          <span>UPI / QR Code</span>
        </div>
        <div onclick="switchRzpTab('card')" id="rzp-tab-card" class="rzp-tab-btn ${initialTab === 'card' ? 'active' : ''}">
          <i class="fa-solid fa-credit-card text-amber-400"></i>
          <span>Cards (Debit/Credit)</span>
        </div>
        <div onclick="switchRzpTab('netbanking')" id="rzp-tab-netbanking" class="rzp-tab-btn ${initialTab === 'netbanking' ? 'active' : ''}">
          <i class="fa-solid fa-building-columns text-cyan-400"></i>
          <span>Net Banking</span>
        </div>
        <div onclick="switchRzpTab('wallet')" id="rzp-tab-wallet" class="rzp-tab-btn">
          <i class="fa-solid fa-wallet text-purple-400"></i>
          <span>Wallets & PayLater</span>
        </div>

        <div class="pt-6 text-[10px] text-slate-500 space-y-1">
          <div class="flex items-center gap-1.5 text-slate-400">
            <i class="fa-solid fa-[#lock] fa-lock text-emerald-400"></i> 256-Bit SSL Encrypted
          </div>
          <div>Razorpay Trusted Partner</div>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div class="md:col-span-8 space-y-4" id="rzp-tab-content">
        <!-- Rendered dynamically by switchRzpTab() -->
      </div>
    </div>
  `;

  document.getElementById('pay-modal').classList.add('show');
  switchRzpTab(initialTab, b.id, b.amount);
}

function closePayModal() {
  document.getElementById('pay-modal').classList.remove('show');
}

function switchRzpTab(tab, billId = 3, amount = 3320) {
  document.querySelectorAll('.rzp-tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`rzp-tab-${tab}`);
  if (activeBtn) activeBtn.classList.add('active');

  const content = document.getElementById('rzp-tab-content');
  if (!content) return;

  const formattedAmount = fmtCurrency(amount);

  if (tab === 'upi') {
    content.innerHTML = `
      <div class="space-y-4">
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span class="text-xs text-slate-300 font-semibold">Instant UPI Payment</span>
          <span class="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">ZERO FEE</span>
        </div>

        <!-- Simulated UPI QR Code -->
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
          <div class="w-32 h-32 bg-white rounded-xl p-2 mx-auto flex items-center justify-center border-2 border-[#3399cc]">
            <!-- Interactive QR Placeholder -->
            <div class="w-full h-full bg-slate-900 rounded flex flex-col items-center justify-center text-white text-[10px] gap-1 p-1">
              <i class="fa-solid fa-qrcode text-3xl text-emerald-400"></i>
              <span>SCAN TO PAY</span>
              <span class="font-bold text-amber-400">${formattedAmount}</span>
            </div>
          </div>
          <p class="text-[11px] text-slate-400">Scan with Google Pay, PhonePe, Paytm, or BHIM</p>
        </div>

        <div>
          <label class="text-xs font-semibold text-slate-400 block mb-1.5">Or Enter UPI ID (VPA)</label>
          <div class="flex gap-2">
            <input id="rzp-upi-id" class="input-field text-xs py-2.5 px-3 flex-1" value="${state.user ? state.user.email.split('@')[0] : 'sakthi'}@okhdfcbank" placeholder="e.g. mobile@upi">
            <button onclick="executeRazorpayPayment(${billId}, 'UPI')" class="btn-primary py-2.5 px-4 text-xs font-bold">
              Pay ${formattedAmount}
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'card') {
    content.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Enter Credit / Debit Card Details</span>
          <div class="flex gap-1 text-slate-300 text-sm">
            <i class="fa-brands fa-cc-visa"></i>
            <i class="fa-brands fa-cc-mastercard"></i>
            <i class="fa-solid fa-credit-card"></i>
          </div>
        </div>

        <div>
          <label class="text-[11px] font-semibold text-slate-400 block mb-1">Card Number</label>
          <input class="input-field text-xs py-2 px-3 font-mono" value="4532 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 8921" placeholder="4532 0000 0000 0000">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[11px] font-semibold text-slate-400 block mb-1">Expiry Date</label>
            <input class="input-field text-xs py-2 px-3 font-mono" value="12/28" placeholder="MM/YY">
          </div>
          <div>
            <label class="text-[11px] font-semibold text-slate-400 block mb-1">CVV Security Code</label>
            <input type="password" maxlength="4" class="input-field text-xs py-2 px-3 font-mono" value="888" placeholder="123">
          </div>
        </div>

        <div>
          <label class="text-[11px] font-semibold text-slate-400 block mb-1">Cardholder Name</label>
          <input class="input-field text-xs py-2 px-3" value="${state.user ? state.user.name : 'Sakthi Ganesh'}">
        </div>

        <button onclick="executeRazorpayPayment(${billId}, 'Card')" class="btn-primary w-full py-3 text-xs font-bold mt-2">
          Pay ${formattedAmount} via Razorpay Card Gateway
        </button>
      </div>
    `;
  } else if (tab === 'netbanking') {
    content.innerHTML = `
      <div class="space-y-4">
        <span class="text-xs text-slate-400 block">Select Popular Indian Banks</span>

        <div class="grid grid-cols-3 gap-2">
          ${[
            { name: 'HDFC Bank', code: 'HDFC', icon: 'fa-building-columns', color: 'text-blue-400' },
            { name: 'ICICI Bank', code: 'ICICI', icon: 'fa-building-columns', color: 'text-amber-400' },
            { name: 'State Bank of India', code: 'SBI', icon: 'fa-building-columns text-cyan-400', color: 'text-cyan-400' },
            { name: 'Axis Bank', code: 'AXIS', icon: 'fa-building-columns', color: 'text-rose-400' },
            { name: 'Kotak Bank', code: 'KOTAK', icon: 'fa-building-columns', color: 'text-red-400' },
            { name: 'Punjab National', code: 'PNB', icon: 'fa-building-columns', color: 'text-emerald-400' }
          ].map((b, idx) => `
            <div onclick="executeRazorpayPayment(${billId}, 'NetBanking (${b.name})')" class="p-2.5 rounded-xl bg-slate-900 hover:bg-[#3399cc]/20 border border-slate-800 hover:border-[#3399cc] text-center cursor-pointer transition">
              <i class="fa-solid ${b.icon} ${b.color} text-base block mb-1"></i>
              <span class="text-[10px] font-semibold text-white block truncate">${b.name}</span>
            </div>
          `).join('')}
        </div>

        <button onclick="executeRazorpayPayment(${billId}, 'NetBanking')" class="btn-primary w-full py-3 text-xs font-bold">
          Proceed to Bank Login (${formattedAmount})
        </button>
      </div>
    `;
  } else { // Wallet
    content.innerHTML = `
      <div class="space-y-3">
        <span class="text-xs text-slate-400 block">Select Digital Wallet or PayLater</span>
        <div class="space-y-2">
          ${['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay', 'Mobikwik'].map(w => `
            <div onclick="executeRazorpayPayment(${billId}, '${w}')" class="p-3 rounded-xl bg-slate-900 hover:bg-[#3399cc]/20 border border-slate-800 hover:border-[#3399cc] flex items-center justify-between cursor-pointer transition">
              <span class="text-xs font-semibold text-white">${w}</span>
              <i class="fa-solid fa-chevron-right text-xs text-slate-500"></i>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// ---- Execute Payment via Razorpay Gateway ----
function executeRazorpayPayment(billId, method) {
  const b = DB.bills.find(x => x.id === billId);
  if (!b) return;

  const content = document.getElementById('rzp-tab-content');
  if (content) {
    content.innerHTML = `
      <div class="py-12 text-center space-y-4 fade-in">
        <div class="w-12 h-12 rounded-full border-4 border-[#3399cc] border-t-transparent animate-spin mx-auto"></div>
        <div class="font-bold text-white text-base font-display">Communicating with Razorpay Gateway...</div>
        <p class="text-xs text-slate-400">Processing ${method} authorization for ${fmtCurrency(b.amount)}</p>
      </div>
    `;
  }

  setTimeout(() => {
    b.status = 'paid';
    b.paidOn = new Date().toISOString().slice(0, 10);
    b.method = method || 'Razorpay UPI';
    const txnId = `pay_RZP${Date.now().toString().slice(-8)}`;
    const userName = state.user ? state.user.name : 'Sakthi Ganesh';

    if (content) {
      content.innerHTML = `
        <div class="relative py-4 px-2 text-center space-y-4 fade-in">
          <!-- Confetti Particles Animation -->
          <div class="rzp-confetti-wrap">
            <div class="rzp-confetti-dot bg-emerald-400" style="left:15%; bottom:20%; animation-delay: 0.1s"></div>
            <div class="rzp-confetti-dot bg-amber-400" style="left:30%; bottom:15%; animation-delay: 0.3s"></div>
            <div class="rzp-confetti-dot bg-cyan-400" style="left:50%; bottom:25%; animation-delay: 0.2s"></div>
            <div class="rzp-confetti-dot bg-purple-400" style="left:70%; bottom:18%; animation-delay: 0.4s"></div>
            <div class="rzp-confetti-dot bg-emerald-300" style="left:85%; bottom:12%; animation-delay: 0.25s"></div>
          </div>

          <!-- Animated Pulsing Green Checkmark Badge -->
          <div class="rzp-success-badge mx-auto my-2">
            <i class="fa-solid fa-check"></i>
          </div>

          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-extrabold border border-emerald-500/40 mb-1">
              <i class="fa-solid fa-shield-halved text-xs"></i> RAZORPAY VERIFIED PAYMENT
            </div>
            <h3 class="text-2xl font-extrabold text-white font-display tracking-tight">Payment Successful!</h3>
            <p class="text-xs text-slate-300 mt-1">Thank you, <strong class="text-emerald-400">${userName}</strong>! Your energy bill has been settled.</p>
          </div>

          <!-- Transaction Receipt Card -->
          <div class="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/30 text-left text-xs space-y-2 max-w-sm mx-auto shadow-inner">
            <div class="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
              <span>Transaction ID:</span>
              <span class="font-mono font-bold text-emerald-400">${txnId}</span>
            </div>
            <div class="flex justify-between items-center text-slate-400">
              <span>Consumer Name:</span>
              <span class="font-semibold text-white">${userName}</span>
            </div>
            <div class="flex justify-between items-center text-slate-400">
              <span>Billing Period:</span>
              <span class="font-semibold text-white">${b.month} (July 2025)</span>
            </div>
            <div class="flex justify-between items-center text-slate-400">
              <span>Payment Mode:</span>
              <span class="font-semibold text-cyan-400">${method}</span>
            </div>
            <div class="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800/80">
              <span class="font-bold text-white">Amount Paid:</span>
              <span class="font-mono font-black text-lg text-amber-400">${fmtCurrency(b.amount)}</span>
            </div>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex items-center justify-center gap-3 pt-2">
            <button onclick="downloadRazorpayReceipt('${txnId}', '${b.month}', ${b.amount}, '${method}')" class="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-2">
              <i class="fa-solid fa-file-pdf text-rose-400"></i> Download Receipt
            </button>
            <button onclick="closePayModal(); renderApp();" class="btn-primary py-2.5 px-6 text-xs font-extrabold shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer">
              <span>Done</span>
              <i class="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      `;
    }

    // Success Toast Notification
    toast(`⚡ Razorpay Payment Successful! ${fmtCurrency(b.amount)} paid by ${userName} [Txn: ${txnId}]`, 'success');
  }, 1200);
}

function downloadRazorpayReceipt(txnId, month, amount, method) {
  toast(`Downloading Official Invoice PDF for Txn #${txnId}...`, 'info');
  setTimeout(() => {
    toast(`Receipt PDF downloaded successfully!`, 'success');
  }, 800);
}

async function askAICoach(predefinedPrompt) {
  const inputEl = document.getElementById('ai-coach-input');
  const outputEl = document.getElementById('ai-coach-output');
  if (!outputEl) return;

  const prompt = predefinedPrompt || (inputEl ? inputEl.value.trim() : '');
  if (!prompt) return;

  if (inputEl) inputEl.value = '';
  outputEl.innerHTML = `<div class="flex items-center gap-2 text-emerald-400"><i class="fa-solid fa-circle-notch fa-spin"></i><span>Analyzing power metrics with Gemini...</span></div>`;

  try {
    const activeApps = getUserAppliances().filter(a => a.active);
    const stats = {
      dailyUsage: calcDailyKwh().toFixed(2),
      monthlyCost: calcMonthlyCost(),
      activeCount: activeApps.length,
      totalCount: getUserAppliances().length
    };

    const response = await fetch("/api/ai-coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, appliances: activeApps, stats })
    });

    const data = await response.json();
    if (data.error) {
      outputEl.innerHTML = `<span class="text-rose-400 font-medium"><i class="fa-solid fa-circle-exclamation mr-1"></i> ${data.error}</span>`;
    } else {
      outputEl.innerHTML = data.text;
    }
  } catch (err) {
    console.error(err);
    outputEl.innerHTML = `<span class="text-rose-400 font-medium"><i class="fa-solid fa-circle-exclamation mr-1"></i> Unable to connect to AI Coach server.</span>`;
  }
}

function userAppliances() {
  const apps = getUserAppliances();
  const activeApps = apps.filter(a => a.active);

  return `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h3 class="font-display font-bold text-lg">Appliance Inventory</h3>
        <p class="text-xs text-slate-400">${activeApps.length} of ${apps.length} appliances currently active (${calcLiveLoad()} W)</p>
      </div>
      <button class="btn-primary btn-sm" onclick="document.getElementById('appliance-modal').classList.add('show')">
        <i class="fa-solid fa-plus"></i> Add Appliance
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      ${apps.map(a => {
        const daily = a.watt * a.hoursPerDay / 1000;
        const monthly = daily * 30;
        const cost = Math.round(monthly * 8);

        return `
        <div class="glass-card p-5 flex flex-col justify-between ${a.active ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5' : ''}">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center ${a.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}">
                <i class="fa-solid ${a.icon} text-lg"></i>
              </div>
              <div class="toggle ${a.active ? 'on' : ''}" onclick="toggleApp(${a.id})"></div>
            </div>
            
            <div class="font-display font-semibold text-base text-white mb-1">${a.name}</div>
            <div class="text-xs text-slate-400 mb-4 capitalize">${a.category} &bull; ${a.watt} Watts</div>

            <div class="grid grid-cols-2 gap-2 text-center mb-4">
              <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div class="text-[10px] text-slate-500 uppercase tracking-wider">Est. Daily</div>
                <div class="text-xs font-bold text-white mt-0.5">${fmtKwh(daily)}</div>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div class="text-[10px] text-slate-500 uppercase tracking-wider">Monthly Cost</div>
                <div class="text-xs font-bold text-amber-400 mt-0.5">${fmtCurrency(cost)}</div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-slate-800/60">
            <span class="text-xs text-slate-400">Runtime: <strong>${a.hoursPerDay} hrs/day</strong></span>
            ${a.active ? '<span class="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium"><span class="pulse-dot"></span> Active</span>' : '<span class="text-xs text-slate-500">Standby</span>'}
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

function toggleApp(id) {
  const a = DB.appliances.find(a => a.id === id);
  if (a) {
    a.active = !a.active;
    renderApp();
    toast(`${a.name} state updated`, a.active ? 'success' : 'info');
  }
}

function userAnalytics() {
  return `
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <div class="glass-card p-5">
        <h3 class="font-display font-semibold text-base mb-4">Hourly Usage Pattern (24h)</h3>
        <div class="chart-wrap" style="height:270px"><canvas id="chart-daily-pattern"></canvas></div>
      </div>
      <div class="glass-card p-5">
        <h3 class="font-display font-semibold text-base mb-4">Appliance Consumption Comparison</h3>
        <div class="chart-wrap" style="height:270px"><canvas id="chart-app-compare"></canvas></div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6 mb-6">
      <div class="glass-card p-5">
        <h3 class="font-display font-semibold text-base mb-4">Category Distribution</h3>
        <div class="chart-wrap" style="height:250px"><canvas id="chart-distribution"></canvas></div>
      </div>
      <div class="lg:col-span-2 glass-card p-5">
        <h3 class="font-display font-semibold text-base mb-4">Monthly kWh vs Billing Trend</h3>
        <div class="chart-wrap" style="height:250px"><canvas id="chart-monthly-compare"></canvas></div>
      </div>
    </div>

    <div class="glass-card p-5">
      <h3 class="font-display font-semibold text-base mb-2">Hourly Intensity Heatmap</h3>
      <p class="text-xs text-slate-400 mb-4">Monitored power load across every hour of the day</p>
      
      <div class="grid grid-cols-6 sm:grid-cols-12 gap-2" id="heatmap-grid">
        ${Array.from({ length: 24 }, (_, h) => {
          const val = Math.random();
          const alpha = 0.15 + val * 0.75;
          return `
          <div class="text-center p-2 rounded-xl border border-emerald-500/20" style="background:rgba(16,185,129,${alpha})">
            <div class="text-xs font-bold text-white font-mono">${(val * 12).toFixed(1)}</div>
            <div class="text-[10px] text-slate-300 mt-0.5">${h}:00</div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

function userBills() {
  const bills = getUserBills();
  const totalPaid = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
  const totalPending = bills.filter(b => b.status === 'pending' || b.status === 'overdue').reduce((s, b) => s + b.amount, 0);

  return `
    <div class="grid sm:grid-cols-3 gap-5 mb-6">
      <div class="stat-card">
        <div class="text-xs font-semibold text-slate-400 mb-1">Total Cleared</div>
        <div class="text-2xl font-bold font-display text-emerald-400">${fmtCurrency(totalPaid)}</div>
      </div>
      <div class="stat-card">
        <div class="text-xs font-semibold text-slate-400 mb-1">Pending Balance</div>
        <div class="text-2xl font-bold font-display text-amber-400">${fmtCurrency(totalPending)}</div>
      </div>
      <div class="stat-card">
        <div class="text-xs font-semibold text-slate-400 mb-1">Total Units Monitored</div>
        <div class="text-2xl font-bold font-display text-white">${fmtKwh(bills.reduce((s, b) => s + b.kwh, 0))}</div>
      </div>
    </div>

    <div class="glass-card overflow-hidden">
      <div class="p-5 border-b border-slate-800 flex items-center justify-between">
        <h3 class="font-display font-semibold text-base">Billing & Invoice Ledger</h3>
        <button class="btn-secondary btn-sm" onclick="toast('Invoice summary exported','success')"><i class="fa-solid fa-download"></i> Export CSV</button>
      </div>

      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>Billing Month</th>
              <th>Energy Consumption</th>
              <th>Amount Due</th>
              <th>Status</th>
              <th>Payment Details</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${bills.map(b => `
              <tr>
                <td class="font-medium text-white">${b.month}</td>
                <td class="font-mono">${fmtKwh(b.kwh)}</td>
                <td class="font-semibold text-amber-400">${b.amount ? fmtCurrency(b.amount) : '—'}</td>
                <td>
                  <span class="badge ${b.status === 'paid' ? 'badge-green' : b.status === 'pending' ? 'badge-amber' : b.status === 'overdue' ? 'badge-red' : 'badge-blue'}">
                    ${b.status.toUpperCase()}
                  </span>
                </td>
                <td class="text-slate-400 text-xs">${b.paidOn ? `${b.method} on ${b.paidOn}` : '—'}</td>
                <td>
                  ${b.status === 'pending' || b.status === 'overdue' ? `
                    <button class="btn-primary btn-sm" onclick="openPayModal(${b.id})">Pay Now</button>
                  ` : `
                    <button class="btn-secondary btn-sm" onclick="viewReceipt(${b.id})">Receipt</button>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function userSettings() {
  const u = state.user;
  return `
    <div class="max-w-2xl space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display font-semibold text-base mb-4">Account Profile</h3>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-semibold text-slate-400 mb-1.5 block">Full Name</label>
            <input class="input-field" value="${u.name}" id="set-name">
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-400 mb-1.5 block">Email Address</label>
            <input class="input-field opacity-60" value="${u.email}" disabled>
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-400 mb-1.5 block">Phone Number</label>
            <input class="input-field" value="+91 98765 43210" id="set-phone">
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-400 mb-1.5 block">Subscribed Plan</label>
            <input class="input-field opacity-60" value="${u.plan ? u.plan.toUpperCase() : 'BASIC'}" disabled>
          </div>
        </div>
        <button class="btn-primary btn-sm mt-5" onclick="toast('Profile changes saved')">Save Changes</button>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display font-semibold text-base mb-4">Notification Preferences</h3>
        <div class="space-y-4">
          ${[
            { label: 'Bill Due Alerts', desc: 'Notify 3 days before payment deadline', on: true },
            { label: 'High Usage Spikes', desc: 'Instant alert when daily draw exceeds limit', on: true },
            { label: 'Weekly AI Optimization Digest', desc: 'Receive custom tips every Monday', on: false },
          ].map(item => `
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium text-white">${item.label}</div>
                <div class="text-xs text-slate-400">${item.desc}</div>
              </div>
              <div class="toggle ${item.on ? 'on' : ''}" onclick="this.classList.toggle('on');toast('Preference saved','info')"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ============================================================
//  STAFF & ADMIN VIEWS
// ============================================================
function staffOverview() {
  const assignedUsers = DB.users.filter(u => u.role === 'user');
  const openTickets = DB.tickets.filter(t => t.status !== 'resolved').length;

  return `
    <div class="grid sm:grid-cols-3 gap-5 mb-6">
      <div class="stat-card">
        <div class="text-xs font-semibold text-slate-400 mb-1">Assigned Consumers</div>
        <div class="text-2xl font-bold font-display text-white">${assignedUsers.length}</div>
      </div>
      <div class="stat-card">
        <div class="text-xs font-semibold text-slate-400 mb-1">Open Tickets</div>
        <div class="text-2xl font-bold font-display text-amber-400">${openTickets}</div>
      </div>
      <div class="stat-card">
        <div class="text-xs font-semibold text-slate-400 mb-1">Collection Efficiency</div>
        <div class="text-2xl font-bold font-display text-emerald-400">92%</div>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <div class="glass-card p-5">
        <h3 class="font-display font-semibold text-base mb-4">Consumer Load Analytics</h3>
        <div class="chart-wrap" style="height:270px"><canvas id="chart-staff-usage"></canvas></div>
      </div>
      <div class="glass-card p-5">
        <h3 class="font-display font-semibold text-base mb-4">Pending Tickets</h3>
        <div class="space-y-3">
          ${DB.tickets.slice(0, 4).map(t => {
            const u = DB.users.find(u => u.id === t.userId);
            return `
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <div class="text-xs font-semibold text-white">${t.subject}</div>
                <div class="text-[11px] text-slate-400">${u ? u.name : 'User'} &bull; ${t.date}</div>
              </div>
              <span class="badge ${t.status === 'open' ? 'badge-red' : 'badge-amber'}">${t.status}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function staffUsers() {
  const users = DB.users.filter(u => u.role === 'user');
  return `
    <div class="glass-card overflow-hidden">
      <div class="p-5 border-b border-slate-800 flex items-center justify-between">
        <h3 class="font-display font-semibold text-base">Consumer Directory</h3>
        <input class="input-field text-xs py-1.5 px-3 max-w-[220px]" placeholder="Search consumer..." oninput="document.querySelectorAll('#staff-users-tbody tr').forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(this.value.toLowerCase())?'':'none'})">
      </div>
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead><tr><th>Consumer Name</th><th>Plan</th><th>Appliances</th><th>Status</th></tr></thead>
          <tbody id="staff-users-tbody">
            ${users.map(u => `
              <tr>
                <td class="font-medium text-white">${u.name}<br><span class="text-xs text-slate-400 font-normal">${u.email}</span></td>
                <td><span class="badge badge-blue">${u.plan ? u.plan.toUpperCase() : 'BASIC'}</span></td>
                <td class="text-slate-300">${DB.appliances.filter(a => a.userId === u.id).length} units</td>
                <td><span class="badge badge-green">${u.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function staffReports() {
  return `
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <div class="glass-card p-5">
        <h3 class="font-display font-semibold text-base mb-4">Consumer Consumption Report</h3>
        <div class="chart-wrap" style="height:260px"><canvas id="chart-report-usage"></canvas></div>
      </div>
      <div class="glass-card p-5">
        <h3 class="font-display font-semibold text-base mb-4">Collection Status Breakdown</h3>
        <div class="chart-wrap" style="height:260px"><canvas id="chart-report-collection"></canvas></div>
      </div>
    </div>
  `;
}

function staffTickets() {
  return `
    <div class="glass-card overflow-hidden">
      <div class="p-5 border-b border-slate-800 flex items-center justify-between">
        <h3 class="font-display font-semibold text-base">Support Queue</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead><tr><th>Ticket ID</th><th>User</th><th>Subject</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            ${DB.tickets.map(t => {
              const u = DB.users.find(u => u.id === t.userId);
              return `
              <tr>
                <td class="font-mono text-xs">#${t.id}</td>
                <td class="text-white font-medium">${u ? u.name : 'Consumer'}</td>
                <td class="text-slate-300">${t.subject}</td>
                <td><span class="badge ${t.priority === 'high' ? 'badge-red' : 'badge-amber'}">${t.priority}</span></td>
                <td><span class="badge ${t.status === 'resolved' ? 'badge-green' : 'badge-amber'}">${t.status}</span></td>
                <td>
                  ${t.status !== 'resolved' ? `<button class="btn-primary btn-sm" onclick="resolveTicket(${t.id})">Mark Resolved</button>` : '<span class="text-xs text-slate-500">Resolved</span>'}
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function resolveTicket(id) {
  const t = DB.tickets.find(t => t.id === id);
  if (t) {
    t.status = 'resolved';
    renderApp();
    toast('Ticket resolved');
  }
}

function adminOverview() {
  const totalUsers = DB.users.filter(u => u.role === 'user').length;
  const totalRevenue = DB.revenue.reduce((s, r) => s + r.amount, 0);

  return `
    <div class="grid sm:grid-cols-4 gap-5 mb-6">
      <div class="stat-card">
        <div class="text-xs font-semibold text-slate-400 mb-1">Total Consumers</div>
        <div class="text-2xl font-bold font-display text-white">${totalUsers}</div>
      </div>
      <div class="stat-card">
        <div class="text-xs font-semibold text-slate-400 mb-1">Annual Revenue</div>
        <div class="text-2xl font-bold font-display text-emerald-400">${fmtCurrency(totalRevenue)}</div>
      </div>
      <div class="stat-card">
        <div class="text-xs font-semibold text-slate-400 mb-1">Staff Operators</div>
        <div class="text-2xl font-bold font-display text-cyan-400">${DB.users.filter(u => u.role === 'staff').length}</div>
      </div>
      <div class="stat-card">
        <div class="text-xs font-semibold text-slate-400 mb-1">Open Tickets</div>
        <div class="text-2xl font-bold font-display text-amber-400">${DB.tickets.filter(t => t.status !== 'resolved').length}</div>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <div class="glass-card p-5">
        <h3 class="font-display font-semibold text-base mb-4">Revenue Trend</h3>
        <div class="chart-wrap" style="height:260px"><canvas id="chart-admin-revenue"></canvas></div>
      </div>
      <div class="glass-card p-5">
        <h3 class="font-display font-semibold text-base mb-4">Subscription Plan Mix</h3>
        <div class="chart-wrap" style="height:260px"><canvas id="chart-admin-plans"></canvas></div>
      </div>
    </div>
  `;
}

function adminUsers() {
  return `
    <div class="glass-card overflow-hidden">
      <div class="p-5 border-b border-slate-800 flex items-center justify-between">
        <h3 class="font-display font-semibold text-base">User Management System</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${DB.users.map(u => `
              <tr>
                <td class="font-medium text-white">${u.name}</td>
                <td><span class="badge ${u.role === 'admin' ? 'badge-amber' : u.role === 'staff' ? 'badge-blue' : 'badge-green'}">${u.role.toUpperCase()}</span></td>
                <td class="text-slate-400">${u.email}</td>
                <td><span class="badge ${u.status === 'active' ? 'badge-green' : 'badge-red'}">${u.status}</span></td>
                <td>
                  <button class="btn-secondary btn-sm" onclick="toast('Status toggled','info')">Toggle Status</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function adminStaff() { return adminUsers(); }
function adminAnalytics() { return userAnalytics(); }
function adminTariffs() {
  return `
    <div class="glass-card p-6">
      <h3 class="font-display font-semibold text-base mb-4">Tariff Rate Structures</h3>
      <div class="space-y-4">
        ${DB.tariffs.map(t => `
          <div class="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div class="font-semibold text-white">${t.name} Slab (${t.slab})</div>
              <div class="text-xs text-slate-400">Rate per unit: ₹${t.rate} / kWh</div>
            </div>
            <button class="btn-secondary btn-sm" onclick="toast('Tariff updated','success')">Edit Rate</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
function adminSettings() { return userSettings(); }

// ============================================================
//  PAYMENT & APPLIANCE MODALS
// ============================================================
function openPayModal(billId) {
  openRazorpayModal(billId, 'upi');
}

function executePayment(billId) {
  executeRazorpayPayment(billId, 'UPI');
}

function viewReceipt(billId) {
  const b = DB.bills.find(x => x.id === billId);
  if (!b) return;
  toast(`Receipt #${b.id}: Paid ${fmtCurrency(b.amount)} on ${b.paidOn}`, 'info');
}

function addAppliance() {
  const name = document.getElementById('new-app-name').value.trim();
  const watt = +document.getElementById('new-app-watt').value;
  const category = document.getElementById('new-app-cat').value;

  if (!name || !watt) {
    toast('Please enter valid appliance details', 'error');
    return;
  }

  const icons = {
    cooling: 'fa-snowflake',
    heating: 'fa-hot-tub-person',
    lighting: 'fa-lightbulb',
    kitchen: 'fa-fire-burner',
    entertainment: 'fa-tv',
    laundry: 'fa-shirt',
    other: 'fa-plug'
  };

  DB.appliances.push({
    id: Date.now(),
    userId: state.user.id,
    name: name,
    watt: watt,
    category: category,
    active: true,
    hoursPerDay: 4,
    icon: icons[category] || 'fa-plug'
  });

  document.getElementById('appliance-modal').classList.remove('show');
  document.getElementById('new-app-name').value = '';
  document.getElementById('new-app-watt').value = '';

  renderApp();
  toast(`${name} added to inventory!`);
}
