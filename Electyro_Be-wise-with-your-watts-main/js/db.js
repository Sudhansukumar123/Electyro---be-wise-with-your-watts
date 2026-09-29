/* ============================================================
   ELECTYRO — Mock Database & State Management
   ============================================================ */

// ---- Toast notifications ----
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  const icons = { success: 'fa-check-circle', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${msg}`;
  const container = document.getElementById('toast-container');
  if (container) container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ---- Format helpers ----
function fmtCurrency(n) { return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 }); }
function fmtKwh(n) { return Number(n).toFixed(1) + ' kWh'; }

// ---- Mock Data ----
const DB = {
  users: [
    { id:1, name:'Admin User', email:'admin@electyro.com', password:'admin123', role:'admin', joined:'2024-01-15', status:'active' },
    { id:2, name:'Staff Member', email:'staff@electyro.com', password:'staff123', role:'staff', joined:'2024-03-10', status:'active' },
    { id:3, name:'Sakthi Ganesh', email:'user@electyro.com', password:'user123', role:'user', joined:'2024-06-01', status:'active', plan:'premium' },
    { id:4, name:'Priya Patel', email:'priya@mail.com', password:'priya123', role:'user', joined:'2024-06-15', status:'active', plan:'basic' },
    { id:5, name:'Amit Kumar', email:'amit@mail.com', password:'amit123', role:'user', joined:'2024-07-20', status:'active', plan:'premium' },
    { id:6, name:'Sneha Reddy', email:'sneha@mail.com', password:'sneha123', role:'user', joined:'2024-08-05', status:'inactive', plan:'basic' },
    { id:7, name:'Vikram Singh', email:'vikram@mail.com', password:'vikram123', role:'user', joined:'2024-09-12', status:'active', plan:'premium' },
    { id:8, name:'Neha Gupta', email:'neha@mail.com', password:'neha123', role:'user', joined:'2024-10-01', status:'active', plan:'basic' },
  ],
  appliances: [
    { id:1, userId:3, name:'Air Conditioner', watt:1500, category:'cooling', active:true, hoursPerDay:8, icon:'fa-snowflake' },
    { id:2, userId:3, name:'Refrigerator', watt:200, category:'cooling', active:true, hoursPerDay:24, icon:'fa-temperature-low' },
    { id:3, userId:3, name:'LED Lights', watt:60, category:'lighting', active:true, hoursPerDay:10, icon:'fa-lightbulb' },
    { id:4, userId:3, name:'Washing Machine', watt:1200, category:'laundry', active:false, hoursPerDay:1, icon:'fa-shirt' },
    { id:5, userId:3, name:'Television', watt:120, category:'entertainment', active:true, hoursPerDay:5, icon:'fa-tv' },
    { id:6, userId:3, name:'Microwave Oven', watt:1000, category:'kitchen', active:false, hoursPerDay:0.5, icon:'fa-fire-burner' },
    { id:7, userId:3, name:'Water Heater', watt:2000, category:'heating', active:false, hoursPerDay:1, icon:'fa-hot-tub-person' },
    { id:8, userId:3, name:'Ceiling Fan', watt:75, category:'cooling', active:true, hoursPerDay:12, icon:'fa-fan' },
    { id:9, userId:4, name:'Air Conditioner', watt:1800, category:'cooling', active:true, hoursPerDay:6, icon:'fa-snowflake' },
    { id:10, userId:4, name:'Refrigerator', watt:180, category:'cooling', active:true, hoursPerDay:24, icon:'fa-temperature-low' },
    { id:11, userId:4, name:'LED Lights', watt:40, category:'lighting', active:true, hoursPerDay:8, icon:'fa-lightbulb' },
    { id:12, userId:5, name:'Air Conditioner', watt:2000, category:'cooling', active:true, hoursPerDay:10, icon:'fa-snowflake' },
    { id:13, userId:5, name:'Geyser', watt:2000, category:'heating', active:true, hoursPerDay:2, icon:'fa-hot-tub-person' },
    { id:14, userId:5, name:'Desktop PC', watt:300, category:'entertainment', active:true, hoursPerDay:8, icon:'fa-desktop' },
  ],
  // Daily usage data for last 30 days (user 3)
  dailyUsage: Array.from({length:30}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate() - 29 + i);
    return { date: d.toISOString().slice(0,10), kwh: +(12 + Math.random()*10).toFixed(1) };
  }),
  bills: [
    { id:1, userId:3, month:'2025-05', kwh:342, amount:2736, status:'paid', paidOn:'2025-05-28', method:'UPI' },
    { id:2, userId:3, month:'2025-06', kwh:389, amount:3112, status:'paid', paidOn:'2025-06-25', method:'Card' },
    { id:3, userId:3, month:'2025-07', kwh:415, amount:3320, status:'pending', paidOn:null, method:null },
    { id:4, userId:3, month:'2025-08', kwh:0, amount:0, status:'upcoming', paidOn:null, method:null },
    { id:5, userId:4, month:'2025-07', kwh:280, amount:2240, status:'pending', paidOn:null, method:null },
    { id:6, userId:5, month:'2025-07', kwh:520, amount:4160, status:'overdue', paidOn:null, method:null },
  ],
  tickets: [
    { id:1, userId:3, subject:'Meter reading mismatch', status:'open', date:'2025-07-10', priority:'high' },
    { id:2, userId:4, subject:'Bill calculation query', status:'in-progress', date:'2025-07-12', priority:'medium' },
    { id:3, userId:5, subject:'Request for plan upgrade', status:'resolved', date:'2025-07-05', priority:'low' },
    { id:4, userId:7, subject:'Appliance not showing data', status:'open', date:'2025-07-14', priority:'high' },
  ],
  tariffs: [
    { id:1, name:'Basic', rate:7, slab:'0-200 kWh', status:'active' },
    { id:2, name:'Standard', rate:8.5, slab:'201-500 kWh', status:'active' },
    { id:3, name:'Premium', rate:10, slab:'500+ kWh', status:'active' },
  ],
  revenue: Array.from({length:12}, (_,i) => {
    const m = new Date(2025, i, 1);
    return { month: m.toLocaleString('en',{month:'short'}), amount: 45000 + Math.floor(Math.random()*30000) };
  }),
};

// ---- App state ----
let state = {
  user: null,
  page: 'overview',
  sidebarOpen: true,
};
