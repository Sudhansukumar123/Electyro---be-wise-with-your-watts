# ⚡ ELECTYRO — Be Wise With Your Watts

> *"Creativity is intelligence having fun — and sustainability is intelligence caring for tomorrow."*  
> — **Albert Einstein** *(adapted)*

---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg)](https://expressjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384.svg)](https://www.chartjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black.svg)](https://threejs.org/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Gateway-02042B.svg?logo=razorpay)](https://razorpay.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI_Coach-8E44AD.svg)](https://deepmind.google/technologies/gemini/)

---

## 📌 Project Overview

**ELECTYRO** is an intelligent, full-stack smart energy management and electricity billing platform. It empowers homeowners, business operators, and utility administrators to track real-time appliance power consumption, analyze multi-month energy trends, consult an AI Energy Coach powered by **Google Gemini**, and pay utility bills seamlessly using an authentic **Razorpay Payment Gateway**.

### ✨ Highlights & Core Capabilities

- 🔌 **1. Appliance-Wise Electricity Tracking**
  - Real-time active power draw (Watts/kW) monitoring.
  - Interactive daily runtime adjustment controls (+/- hours per day).
  - Categorized breakdown (Cooling, Heating, Kitchen, Lighting, Entertainment).
  - Automated calculation of house load share (%) and estimated monthly electricity cost.

- 📊 **2. Multi-Month Energy Consumption Analytics**
  - Comparative bar & doughnut chart visualizers powered by **Chart.js**.
  - Historical energy tracking across recent months (May, June, July).
  - Automatic detection and spotlighting of top energy-consuming devices (e.g. Air Conditioner).
  - Energy slab & tariff cost analysis.

- 🤖 **3. Gemini AI Energy Coach**
  - AI assistant integrated via `@google/genai` TypeScript SDK.
  - Server-side API endpoint (`/api/ai-coach`) shielding sensitive credentials.
  - Context-aware recommendations for reducing energy bills and optimizing high-load appliances.

- 💳 **4. Razorpay Payment Gateway Integration**
  - Authentic Checkout modal supporting **UPI / QR Code**, **Credit/Debit Cards**, **Net Banking**, and **Wallets**.
  - Express transaction authorization with instant verification status.
  - Animated pulsing success badge with confetti celebration.
  - Itemized transaction receipt display and downloadable PDF receipts.

- 🌐 **5. Interactive 3D Energy Mesh Visualizer**
  - Real-time WebGL rendering powered by **Three.js**.
  - Dynamic orbital visualizer representing household energy flow grid.

- 👥 **6. Multi-Role Management System**
  - **Consumer Portal**: Personal energy stats, bill payments, appliance toggles.
  - **Staff Portal**: Meter readings, bill generation, payment logs.
  - **Admin Portal**: User management, tariff rate configuration, system logs.

---

## 🛠️ Tech Stack & Dev Tools

### **Frontend & User Interface**
- **HTML5 & CSS3**: Custom dark-mode glassmorphic styling, responsive flexbox/grid layouts.
- **Tailwind CSS**: Utility-first CSS library for layout, typography, and state colors.
- **FontAwesome 6.5**: High-definition iconography.
- **Google Fonts**: *Plus Jakarta Sans* and *Outfit* font pairings.

### **Data Visualization & Graphics**
- **Chart.js (v4.x)**: Canvas-based responsive charting library (Line, Bar, Doughnut).
- **Three.js (v0.185)**: WebGL 3D rendering library for interactive grid visualizers.

### **Backend & APIs**
- **Node.js**: Modern JavaScript/TypeScript runtime.
- **Express.js (v4.19)**: High-performance web server handling static assets and API routes.
- **@google/genai SDK**: Official Google Gemini AI SDK for intelligence queries.

### **Payment & Integrations**
- **Razorpay Checkout SDK (`v1`)**: Secure client-side checkout modal.

### **Development Tools**
- **Git & GitHub**: Version control and source code management.
- **Render / Cloud Run**: Cloud container hosting platform.
- **NPM**: Package dependency manager.

---

## 📁 Project Folder Structure

```text
electyro/
│
├── css/
│   └── styles.css              # Custom styling, dark glassmorphic UI, animations, Razorpay modal
├── js/
│   ├── app.js                  # Main application UI controller, routing, and Razorpay payment flow
│   ├── charts.js               # Chart.js initialization and multi-month analytics rendering
│   └── db.js                   # Mock database, initial appliance state, and user records
├── components/                 # Reusable UI component modules
├── .env.example                # Template for server environment variables
├── index.html                  # Core HTML single-page application entry point
├── metadata.json               # Platform configuration metadata
├── package.json                # Project dependencies and npm scripts
├── server.js                   # Express server and Gemini AI proxy backend endpoint
└── README.md                   # Complete documentation guide
```

---

## 🏗️ System Architecture Diagram

```mermaid
graph TD
    subgraph Client ["Client Side Browser"]
        UI["Single Page Application (index.html)"]
        APP["UI Logic Engine (js/app.js)"]
        CHARTS["Chart visualizer (js/charts.js)"]
        THREE["3D Energy Canvas (Three.js)"]
        RZP_MODAL["Razorpay Checkout Modal"]
    end

    subgraph Backend ["Server Side Node.js / Express"]
        SRV["Express Web Server (server.js)"]
        API_AI["API Proxy Route (/api/ai-coach)"]
    end

    subgraph Services ["External Cloud Services"]
        GEMINI["Google Gemini AI API"]
        RZP_GATEWAY["Razorpay Payment Gateway"]
    end

    UI --> APP
    APP --> CHARTS
    APP --> THREE
    APP --> RZP_MODAL
    RZP_MODAL -- Payment Request --> RZP_GATEWAY
    RZP_GATEWAY -- Payment Success Txn ID --> APP
    APP -- POST /api/ai-coach --> API_AI
    API_AI -- @google/genai SDK --> GEMINI
    GEMINI -- AI Analysis Stream --> API_AI
    API_AI -- JSON Response --> APP
```

---

## 🧬 Data Model / Class Diagram

```mermaid
classDiagram
    class User {
        +int id
        +string name
        +string email
        +string password
        +string role
        +string status
        +string plan
    }

    class Appliance {
        +int id
        +string name
        +string category
        +int watt
        +float hoursPerDay
        +boolean active
        +string icon
        +calcDailyKwh() float
        +calcMonthlyCost(tariffRate) float
    }

    class Bill {
        +int id
        +int userId
        +string month
        +float kwh
        +float amount
        +string status
        +string dueDate
        +string paidOn
        +string method
    }

    class PaymentTransaction {
        +string transactionId
        +int billId
        +float amount
        +string method
        +string timestamp
        +string status
    }

    User "1" -- "0..*" Appliance : owns
    User "1" -- "0..*" Bill : billed
    Bill "1" -- "0..1" PaymentTransaction : paid_via
```

---

## 🚀 Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/electyro.git
   cd electyro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file or copy `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your optional Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Start the local server:**
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

---

## 🌐 Deploying to Render

1. Create a new **Web Service** on [Render.com](https://render.com).
2. Connect your GitHub repository.
3. Set the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build` *(or leave as default)*
   - **Start Command**: `npm start`
4. Under **Environment Variables**, set:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   - `PORT`: *(Render automatically sets this)*
5. Click **Deploy Web Service**!

---

## 👨‍💻 Author & Credits

**Developed with 💡 and ⚡ by:**

- **Sakthi Ganesh** — Lead Architect & Developer  
  - Email: `sgkan24@gmail.com`
  - Project: ELECTYRO Smart Energy Management

---

*“Be Wise With Your Watts — Save Energy, Empower Tomorrow.”*

