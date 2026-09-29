/* ============================================================
   ELECTYRO — Chart.js Management & Visualizations
   ============================================================ */

let charts = {};

function destroyCharts() {
  Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} });
  charts = {};
}

function initPageCharts() {
  const role = state.user.role;
  const page = state.page;

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 12, weight: '500' },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        titleFont: { family: 'Outfit', size: 13, weight: '700' },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        cornerRadius: 10
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } }
    }
  };

  if (role === 'user' && page === 'overview') {
    // 30-Day Power Usage Trend Chart
    const ctx = document.getElementById('chart-usage-trend');
    if (ctx) {
      charts['usage-trend'] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: DB.dailyUsage.map(d => d.date.slice(5)),
          datasets: [{
            label: 'Usage (kWh)',
            data: DB.dailyUsage.map(d => d.kwh),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.12)',
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 6,
            pointBackgroundColor: '#10b981',
            borderWidth: 2.5,
          }]
        },
        options: { ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }
      });
    }

    // Recent Months Appliance Comparison Chart
    const rmCtx = document.getElementById('chart-recent-months-apps');
    if (rmCtx) {
      const apps = getUserAppliances().slice(0, 6);
      charts['recent-months-apps'] = new Chart(rmCtx, {
        type: 'bar',
        data: {
          labels: apps.map(a => a.name),
          datasets: [
            {
              label: 'May (kWh)',
              data: apps.map(a => +(a.watt * a.hoursPerDay / 1000 * 28 * 0.85).toFixed(1)),
              backgroundColor: 'rgba(6, 182, 212, 0.7)',
              borderRadius: 4,
            },
            {
              label: 'June (kWh)',
              data: apps.map(a => +(a.watt * a.hoursPerDay / 1000 * 30 * 0.95).toFixed(1)),
              backgroundColor: 'rgba(245, 158, 11, 0.7)',
              borderRadius: 4,
            },
            {
              label: 'July (kWh)',
              data: apps.map(a => +(a.watt * a.hoursPerDay / 1000 * 30).toFixed(1)),
              backgroundColor: 'rgba(16, 185, 129, 0.85)',
              borderRadius: 4,
            }
          ]
        },
        options: {
          ...chartDefaults,
          plugins: {
            ...chartDefaults.plugins,
            legend: {
              display: true,
              position: 'top',
              labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 }, usePointStyle: true }
            }
          }
        }
      });
    }

    // Appliance Electricity Distribution Pie/Doughnut Chart
    const pieCtx = document.getElementById('chart-appliance-pie');
    if (pieCtx) {
      const apps = getUserAppliances();
      const labels = apps.map(a => a.name);
      const data = apps.map(a => +(a.watt * a.hoursPerDay / 1000 * 30).toFixed(1));
      charts['appliance-pie'] = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: ['#10b981', '#06b6d4', '#f59e0b', '#f43f5e', '#a855f7', '#3b82f6', '#ec4899', '#64748b'],
            borderWidth: 0,
            spacing: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 }, padding: 10, usePointStyle: true }
            }
          }
        }
      });
    }
  }

  if (role === 'user' && page === 'analytics') {
    // Daily pattern (hourly)
    const hourlyCtx = document.getElementById('chart-daily-pattern');
    if (hourlyCtx) {
      const hours = Array.from({length:24}, (_,i) => `${i}:00`);
      const hourlyData = hours.map((_,i) => {
        if (i < 6) return 0.3 + Math.random()*0.5;
        if (i < 9) return 1 + Math.random()*1.5;
        if (i < 12) return 2 + Math.random()*2;
        if (i < 14) return 3 + Math.random()*2;
        if (i < 18) return 2 + Math.random()*1.5;
        if (i < 22) return 3.5 + Math.random()*2.5;
        return 1 + Math.random();
      });
      charts['daily-pattern'] = new Chart(hourlyCtx, {
        type: 'bar',
        data: {
          labels: hours,
          datasets: [{
            label: 'kWh',
            data: hourlyData,
            backgroundColor: hourlyData.map(v => v > 4 ? 'rgba(245,158,11,0.8)' : v > 2 ? 'rgba(16,185,129,0.7)' : 'rgba(100,116,139,0.4)'),
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: { ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }
      });
    }

    // Appliance comparison
    const compCtx = document.getElementById('chart-app-compare');
    if (compCtx) {
      const apps = getUserAppliances().sort((a,b) => (b.watt*b.hoursPerDay) - (a.watt*a.hoursPerDay));
      charts['app-compare'] = new Chart(compCtx, {
        type: 'bar',
        data: {
          labels: apps.map(a => a.name.length > 14 ? a.name.slice(0,14)+'…' : a.name),
          datasets: [{
            label: 'Daily kWh',
            data: apps.map(a => +(a.watt*a.hoursPerDay/1000).toFixed(2)),
            backgroundColor: ['#10b981','#f59e0b','#06b6d4','#f43f5e','#a855f7','#3b82f6','#ec4899','#64748b'].slice(0, apps.length),
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: { ...chartDefaults, indexAxis: 'y', plugins: { ...chartDefaults.plugins, legend: { display: false } } }
      });
    }

    // Distribution doughnut
    const distCtx = document.getElementById('chart-distribution');
    if (distCtx) {
      const cats = {};
      getUserAppliances().forEach(a => {
        const daily = a.watt * a.hoursPerDay / 1000;
        cats[a.category] = (cats[a.category]||0) + daily;
      });
      charts['distribution'] = new Chart(distCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(cats).map(c => c.charAt(0).toUpperCase()+c.slice(1)),
          datasets: [{ data: Object.values(cats).map(v => +v.toFixed(1)), backgroundColor: ['#10b981','#f59e0b','#06b6d4','#f43f5e','#a855f7','#3b82f6'], borderWidth: 0, spacing: 4 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '68%',
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 }, padding: 12, usePointStyle: true, pointStyleWidth: 8 } } }
        }
      });
    }

    // Monthly comparison
    const mcCtx = document.getElementById('chart-monthly-compare');
    if (mcCtx) {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
      charts['monthly-compare'] = new Chart(mcCtx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            { label: 'Usage (kWh)', data: [280,310,295,320,342,389,calcMonthlyKwh()], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: '#10b981' },
            { label: 'Cost (₹)', data: [2240,2480,2360,2560,2736,3112,calcMonthlyCost()], borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: '#f59e0b', yAxisID: 'y1' }
          ]
        },
        options: {
          ...chartDefaults,
          scales: {
            ...chartDefaults.scales,
            y1: { position:'right', grid:{display:false}, ticks:{color:'#f59e0b',font:{size:11}} }
          }
        }
      });
    }
  }

  if (role === 'staff' && page === 'overview') {
    const ctx = document.getElementById('chart-staff-usage');
    if (ctx) {
      const users = DB.users.filter(u=>u.role==='user');
      charts['staff-usage'] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: users.map(u => u.name.split(' ')[0]),
          datasets: [{
            label: 'Monthly kWh',
            data: users.map(u => {
              const apps = DB.appliances.filter(a=>a.userId===u.id);
              return +apps.reduce((s,a)=>s+(a.watt*a.hoursPerDay/1000*30),0).toFixed(0);
            }),
            backgroundColor: users.map((_,i) => i%2===0 ? 'rgba(16,185,129,0.7)' : 'rgba(6,182,212,0.7)'),
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: { ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }
      });
    }
  }

  if (role === 'staff' && page === 'reports') {
    const rCtx = document.getElementById('chart-report-usage');
    if (rCtx) {
      const users = DB.users.filter(u=>u.role==='user');
      charts['report-usage'] = new Chart(rCtx, {
        type: 'bar',
        data: {
          labels: users.map(u => u.name.split(' ')[0]),
          datasets: [{
            label: 'kWh',
            data: users.map(u => +DB.appliances.filter(a=>a.userId===u.id).reduce((s,a)=>s+(a.watt*a.hoursPerDay/1000*30),0).toFixed(0)),
            backgroundColor: 'rgba(16,185,129,0.7)',
            borderRadius: 6,
          }]
        },
        options: { ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }
      });
    }
    const cCtx = document.getElementById('chart-report-collection');
    if (cCtx) {
      charts['report-collection'] = new Chart(cCtx, {
        type: 'doughnut',
        data: {
          labels: ['Paid','Pending','Overdue','Upcoming'],
          datasets: [{ data: [2,1,1,1], backgroundColor: ['#10b981','#f59e0b','#f43f5e','#06b6d4'], borderWidth: 0, spacing: 4 }]
        },
        options: { responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{ legend:{ position:'bottom', labels:{color:'#94a3b8',font:{family:'Plus Jakarta Sans',size:11},padding:12,usePointStyle:true,pointStyleWidth:8} } } }
      });
    }
  }

  if (role === 'admin' && page === 'overview') {
    const rCtx = document.getElementById('chart-admin-revenue');
    if (rCtx) {
      charts['admin-revenue'] = new Chart(rCtx, {
        type: 'line',
        data: {
          labels: DB.revenue.map(r=>r.month),
          datasets: [{
            label: 'Revenue (₹)',
            data: DB.revenue.map(r=>r.amount),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.12)',
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointRadius: 3,
            pointBackgroundColor: '#10b981',
          }]
        },
        options: { ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }
      });
    }
    const gCtx = document.getElementById('chart-admin-growth');
    if (gCtx) {
      charts['admin-growth'] = new Chart(gCtx, {
        type: 'bar',
        data: {
          labels: DB.revenue.map(r=>r.month),
          datasets: [{
            label: 'New Users',
            data: [1,0,1,0,1,1,2,1,0,1,1,0],
            backgroundColor: 'rgba(245,158,11,0.6)',
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: { ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }
      });
    }
    const pCtx = document.getElementById('chart-admin-plans');
    if (pCtx) {
      const plans = { basic: 0, premium: 0 };
      DB.users.filter(u=>u.role==='user').forEach(u => { plans[u.plan||'basic']++; });
      charts['admin-plans'] = new Chart(pCtx, {
        type: 'doughnut',
        data: {
          labels: ['Basic','Premium'],
          datasets: [{ data: [plans.basic, plans.premium], backgroundColor: ['#06b6d4','#f59e0b'], borderWidth: 0, spacing: 4 }]
        },
        options: { responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{ legend:{ position:'bottom', labels:{color:'#94a3b8',font:{family:'Plus Jakarta Sans',size:12},padding:16,usePointStyle:true,pointStyleWidth:8} } } }
      });
    }
  }

  if (role === 'admin' && page === 'analytics') {
    const rdCtx = document.getElementById('chart-admin-rev-detail');
    if (rdCtx) {
      charts['admin-rev-detail'] = new Chart(rdCtx, {
        type: 'bar',
        data: {
          labels: DB.revenue.map(r=>r.month),
          datasets: [{
            label: 'Revenue (₹)',
            data: DB.revenue.map(r=>r.amount),
            backgroundColor: DB.revenue.map((_,i) => i===DB.revenue.length-1 ? 'rgba(16,185,129,0.85)' : 'rgba(16,185,129,0.35)'),
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: { ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }
      });
    }
    const udCtx = document.getElementById('chart-admin-usage-dist');
    if (udCtx) {
      charts['admin-usage-dist'] = new Chart(udCtx, {
        type: 'polarArea',
        data: {
          labels: ['Cooling','Heating','Lighting','Kitchen','Entertainment','Laundry'],
          datasets: [{
            data: [45, 22, 8, 12, 8, 5],
            backgroundColor: ['rgba(6,182,212,0.6)','rgba(244,63,94,0.6)','rgba(245,158,11,0.6)','rgba(16,185,129,0.6)','rgba(168,85,247,0.6)','rgba(59,130,246,0.6)'],
            borderWidth: 0,
          }]
        },
        options: {
          responsive:true, maintainAspectRatio:false,
          scales: { r: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { display: false } } },
          plugins: { legend: { position:'bottom', labels:{color:'#94a3b8',font:{family:'Plus Jakarta Sans',size:11},padding:10,usePointStyle:true,pointStyleWidth:8} } }
        }
      });
    }
    const bsCtx = document.getElementById('chart-admin-bill-status');
    if (bsCtx) {
      const statuses = {};
      DB.bills.forEach(b => { statuses[b.status] = (statuses[b.status]||0)+1; });
      charts['admin-bill-status'] = new Chart(bsCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(statuses).map(s=>s.charAt(0).toUpperCase()+s.slice(1)),
          datasets: [{ data: Object.values(statuses), backgroundColor: ['#10b981','#f59e0b','#f43f5e','#06b6d4'], borderWidth: 0, spacing: 4 }]
        },
        options: { responsive:true, maintainAspectRatio:false, cutout:'60%', plugins:{ legend:{ position:'bottom', labels:{color:'#94a3b8',font:{family:'Plus Jakarta Sans',size:11},padding:10,usePointStyle:true,pointStyleWidth:8} } } }
      });
    }
  }
}
