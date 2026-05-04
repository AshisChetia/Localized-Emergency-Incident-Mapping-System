# 🏛️ LEIMS: Localized Emergency Incident Mapping System

**LEIMS** is a premium, AI-powered governance platform designed to bridge the gap between citizens and local authorities. It streamlines incident reporting, automates department routing using Computer Vision, and ensures real-time accountability in municipal management.

---

## 🚀 The Working Model

LEIMS operates on a strict **Localized Jurisdiction Model** tailored for efficient urban governance:

*   **One Pincode, One Municipality**: Each geographical zone (defined by Pincode) is managed by exactly one **Chief Authority** (Municipality).
*   **The Quad-Department Structure**: Under each Municipality, the system supports exactly four specialized sub-departments:
    1.  **PWD**: Infrastructure, roads, and structural issues.
    2.  **Water Supply**: Pipe bursts, flooding, and water quality.
    3.  **Electricity**: Power hazards, streetlights, and grid issues.
    4.  **Garbage Management**: Sanitation, waste disposal, and civic cleanliness.
*   **Tiered Access**: The Chief Authority has a bird's-eye view of every incident in their pincode, while Department Managers focus exclusively on tasks assigned to their specific expertise.

---

## ✨ Key Features

### 🛠️ For Citizens
*   **AI Auto-Routing**: Upload a photo of an issue, and our **Gemini-powered Vision AI** automatically identifies the problem and routes it to the correct department (e.g., PWD or Electricity) without user intervention.
*   **GPS Precision**: One-tap location capturing ensures authorities know exactly where the incident is, with integrated Google Maps verification.
*   **Community Upvoting**: Similar issues are grouped; citizens can upvote existing reports to signal high-priority emergencies to the government.
*   **Real-time Messaging**: Chat directly with the assigned department manager for updates or to provide more context.
*   **Automated Notifications**: Receive branded email updates whenever your report is submitted or its status changes.

### 🛡️ For Authorities & Managers
*   **Strategic Dashboard**: A high-contrast command center featuring live incident maps and statistical charts of high-impact reports.
*   **Team Management**: Chief Authorities can add and manage exactly one manager for each of the four sub-departments.
*   **Status Workflow**: Move reports through a professional lifecycle: `Reported` → `Under Review` → `In Progress` → `Resolved` → `Closed`.
*   **Evidence-Based Resolution**: View high-resolution incident photos and GPS coordinates before dispatched teams arrive on site.

---

## 💻 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, Vite, Lucide Icons, Leaflet (Maps) |
| **Backend** | Node.js, Express.js |
| **Database** | TiDB (MySQL Compatible Serverless DB) |
| **AI Engine** | Google Gemini 2.5 Flash (Vision & NLP) |
| **Email** | Nodemailer (SMTP Integration) |
| **Styling** | Vanilla CSS with Custom Design Tokens (Olive & Gold Aesthetic) |

---

## 🛠️ Running Guide

### Prerequisites
*   Node.js (v18+)
*   MySQL/TiDB Database
*   Gemini API Key (Google AI Studio)

### 1. Backend Setup
```bash
cd Backend
npm install
# Create a .env file with:
# PORT=5000
# DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
# JWT_SECRET
# GEMINI_API_KEY
# EMAIL_USER, EMAIL_PASS
npm run dev
```

### 2. Frontend Setup
```bash
cd Frontend
npm install
# Update src/services/api.js if needed to point to backend URL
npm run dev
```

---

## 🎨 Aesthetic Design
The platform uses a **Premium Professional Palette**:
*   🟢 **Olive Green** (`#5C6F4A`): Represents stability and governance.
*   🟡 **Accent Gold** (`#D4AF37`): Highlights critical alerts and high-priority incidents.
*   🌑 **Charcoal** (`#2E2A1F`): Used for deep typography and professional contrast.
*   ⚪ **Off-White** (`#FAF9F6`): Provides a clean, modern canvas for data visualization.

---

## 📜 Website Details
*   **Version**: 2.0.0 (Standardized Jurisdiction Update)
*   **License**: Proprietary / Major Project
*   **Developer**: LEIMS Engineering Team
