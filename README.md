# 🏷️ ESL Gateway - Automated Digital Nameplate System

An enterprise-grade, web-based IoT management system designed for **ESL 7.50 DDS (Dual-Sided 192KB Pipeline)** electronic shelf labels and smart conference room display tags. Built on the **MERN** stack and powered by direct browser-to-hardware **Web Bluetooth Low Energy (BLE)** communication.


## 🚀 Key Features

* **Direct Web-to-Hardware BLE Communication:** Flash dual-sided e-paper tags wirelessly directly from modern web browsers using the Web Bluetooth API (`navigator.bluetooth`) without external hardware dongles or driver installations.
* **1-to-1 Strict Hardware MAC Binding:** Ensures zero risk of cross-updating; each display queue entry is strictly mapped to its unique physical MAC address.
* **Master Plate Sync ("Sync Row 1 to All"):** Instantly clone layout and text data from the master row to all queued devices while fully preserving individual physical MAC addresses.
* **High-Speed Batch Update Engine:** Fully automated queue execution with auto-reconnect fallback and configurable flash intervals for multi-tag batch programming.
* **Dual-Sided Real-Time Visual Canvas:** Live preview rendering for Front & Back displays, auto-fitting fonts dynamically with support for photos/logos and QR codes.
* **Excel / CSV Bulk Ingestion:** Upload bulk employee/conference lists (`.xlsx` / `.csv`) to automatically populate Names, Designations, Projects, and MAC addresses into the queue.
* **State-Based Session Authentication:** Secure, lightweight login guard preventing unauthorized tag modifications with persistent local storage session recovery.

---

## 🛠️ Architecture & Tech Stack

* **Frontend:** React.js, HTML5 Canvas API (192KB dual-buffer binary rendering), Modern CSS, Vite
* **Backend:** Node.js, Express.js (MERN Architecture)
* **Database:** MongoDB / Mongoose (Optional persistent storage for plate records)
* **IoT / Wireless Protocol:** Web Bluetooth API (BLE GATT Services & Characteristics)
* **Hardware Target:** ESL 7.50 Inch Dual-Display E-Paper Tag (Dual-Sided 192KB display pipeline)

---

## 📂 Project Structure

digital-nameplate/
├── backend/
│   ├── models/
│   │   └── Nameplate.js          
│   ├── routes/
│   │   └── nameplate.js          
│   ├── .env                     
│   ├── package.json
│   └── server.js                 
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/               
│   │   ├── components/
│   │   │   └── NamePlateManager.jsx  
│   │   ├── utils/
│   │   │   └── eslRenderer.js    
│   │   ├── App.jsx               
│   │   ├── Login.jsx             
│   │   └── main.jsx              
│   ├── package.json
│   └── vite.config.js
│
├── name.xlsx                     
├── .gitignore
└── README.md


# 1. Project folder me jayein
cd D:\digital-nameplate\backend
# 2. Dependencies install karein
npm install
# 4. Backend server start karein
npm start

# 1. Frontend folder me jayein
cd D:\digital-nameplate\frontend
# 2. Dependencies install karein
npm install
# 3. Vite development server start karein
npm run dev


Dashboard access karne ke liye default credentials:

Username: admin

Password: admin@123