<<<<<<< HEAD
=======
<<<<<<< HEAD
# GuardianRoute-Transport-System
Real-time school bus tracking system built with Node.js, Socket.io, and Leaflet Maps. Features live geolocation, geofencing, driver SOS alerts, and fleet management analytics.
=======
>>>>>>> cd72c95 (Updated README.md)

# 🚍 GuardianRoute  [Live](https://guardian-route-transport-system-n.vercel.app/)

**GuardianRoute: Smart School Transport & Safety System**

GuardianRoute is an AI-powered school bus tracking solution designed to ensure student safety and transport efficiency. It features live GPS monitoring, smart route optimization, automated attendance tracking, and an emergency SOS system for drivers.

## 🚀 Features

- **📍 Live Tracking:** Real-time school bus location updates with zero latency using WebSocket.
- **🧠 AI Route Optimization:** Smart algorithms to optimize routes and save fuel ("Skip-Stop" logic).
- **🆘 Driver SOS:** Dedicated panic button for drivers to send instant emergency alerts to the admin.
- **📊 Admin Dashboard:** Comprehensive panel to manage the fleet, students, and view analytics.
- **📱 Driver App:** Simple interface for drivers to start trips and view student pickup details.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (Custom Responsive), JavaScript (Vanilla)
- **Maps & Visualization:** Leaflet.js, OpenStreetMap, Chart.js
<<<<<<< HEAD
- **Backend:** Node.js, Express.js
=======
- **Backend:** Node.js, Express.jsgit push -u origin main --force

>>>>>>> cd72c95 (Updated README.md)
- **Real-time Communication:** Socket.io

## 📂 Project Structure

```bash
GuardianRoute/
│
├── backend/                # Backend Server Code
│   ├── node_modules/
│   ├── server.js           # Main Entry Point (Express + Socket.io)
│   ├── package.json        # Backend Dependencies
│   └── .env                # Environment Variables
│
├── frontend/               # Frontend Client Code
│   ├── images/             # Logos and Assets
│   │   └── logo.png
│   ├── index.html          # Landing Page (Home)
│   ├── admin-panel.html    # Admin Dashboard
│   ├── driver.html         # Driver Application
│   └── style.css           # Global Stylesheet
│
└── README.md               # Project Documentation

```

## ⚙️ Installation & Local Setup

Follow these steps to run the project locally on your machine.

### Prerequisites

* Install [Node.js](https://nodejs.org/) (v14 or higher).

### Step 1: Clone the Repository

```bash
git clone [https://github.com/your-username/GuardianRoute.git](https://github.com/your-username/GuardianRoute.git)
cd GuardianRoute

```

### Step 2: Setup the Backend

Navigate to the backend folder and install dependencies.

```bash
cd backend
npm install

```

Start the backend server.

```bash
node server.js
# OR if you use nodemon
nodemon server.js

```

*You should see a message like: `Server running on port 3000*`

### Step 3: Run the Frontend

Since this is a static frontend connecting to a local backend, you can simply open the HTML files.

1. Open the `frontend` folder.
2. Open **`index.html`** in your browser to view the Landing Page.
3. Open **`admin-panel.html`** to access the Admin Dashboard.
4. Open **`driver.html`** to simulate the Driver App.

> **Tip:** For the best experience (especially for Geolocation features), use the **"Live Server"** extension in VS Code to serve the frontend files.

## 📱 How to Test

1. **Open Admin Panel:** Keep `admin-panel.html` open in one tab. You will see the map.
2. **Open Driver App:** Open `driver.html` in a separate tab (or on your phone connected to the same network).
3. **Start Trip:** Click "Start Trip" on the Driver App. Allow Location Permissions.
4. **View Results:** You should see the bus marker moving in real-time on the Admin Dashboard map!

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request for any feature enhancements.

---

<<<<<<< HEAD
**Built with ❤️ for WebSprint Hackathon 2026**
=======
**Built with ❤️ for WebSprint Hackathon 2026**
>>>>>>> cd72c95 (Updated README.md)
