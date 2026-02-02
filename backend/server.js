require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

// Models Import
const Bus = require('./models/Bus');
const Student = require('./models/Student'); 
const Admin = require('./models/Admin'); // ✅ NEW: Admin Model Import

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend'))); 

// Database Connection
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-commute";
mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// --- 🧠 SMART LOGIC CONFIGURATION ---
const SCHOOL_LOCATION = { lat: 19.0760, lng: 72.8777 }; // Mumbai Central (Center Point)
const MAX_SPEED_LIMIT = 60; // km/h
const GEOFENCE_RADIUS_KM = 10; // 10km ke bahar gayi toh alert


// --- 🔐 AUTHENTICATION ROUTES (NEW) ---

// 1. Admin Signup
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) return res.status(400).json({ success: false, message: "Username already taken!" });

        const newAdmin = new Admin({ username, password });
        await newAdmin.save();
        res.json({ success: true, message: "Admin Registered Successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error registering admin" });
    }
});

// 2. Admin Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(400).json({ success: false, message: "User not found!" });

        // Simple Password Check
        if (admin.password !== password) {
            return res.status(400).json({ success: false, message: "Wrong Password!" });
        }

        res.json({ success: true, message: "Login Successful!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Login Error" });
    }
});


// --- API ROUTES (EXISTING) ---

// 1. Get All Students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Add New Student
app.post('/api/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ message: "Student Added!", student });
  } catch (err) {
    console.error("Save Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Mark Attendance
app.post('/api/attendance', async (req, res) => {
  const { studentId, status } = req.body;
  try {
    await Student.findByIdAndUpdate(studentId, { isPresent: status });
    res.json({ message: "Attendance Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Optimized Route
app.get('/api/route/:busId', async (req, res) => {
  try {
    const activeStudents = await Student.find({ busId: req.params.busId, isPresent: true });
    activeStudents.sort((a, b) => a.rollNo.localeCompare(b.rollNo));

    const routePoints = activeStudents.map(s => ({
      lat: s.pickupLocation.lat,
      lng: s.pickupLocation.lng,
      name: s.name
    }));

    res.json(routePoints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get All Buses
app.get('/api/buses', async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Add New Bus
app.post('/api/buses', async (req, res) => {
  try {
    const newBus = new Bus(req.body);
    await newBus.save();
    res.status(201).json(newBus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Update Bus Status
app.post('/api/buses/status', async (req, res) => {
  const { busId, status } = req.body;
  try {
    await Bus.findOneAndUpdate({ busId }, { status });
    res.json({ message: "Status Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- 📐 MATH HELPER FUNCTION (Haversine Formula) ---
// Do coordinates ke beech distance nikalne ke liye
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Earth Radius (km)
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; 
  return d; // Distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}


// --- SOCKET IO (Real-time Logic) ---
const io = new Server(server, { 
    cors: { origin: "*" } 
});

io.on('connection', (socket) => {
  console.log('🔌 New Client Connected:', socket.id);

  socket.on('parentJoined', (data) => {
      console.log(`👨‍👩‍👧 Parent Connected: ${data?.mobile || 'Anonymous'}`);
  });

  // --- 🚨 MAIN TRACKING & ALERT LOGIC ---
  socket.on('driverLocation', (data) => {
    const { busId, location, speed } = data; // Driver se location aur speed aayegi

    // 1. Broadcast location to EVERYONE (Admin + Parents)
    io.emit('updateMap', data);

    // 2. CHECK: Over-Speeding Logic
    // Agar speed 60 se zyada hai (aur speed exist karti hai)
    if (speed && speed > MAX_SPEED_LIMIT) {
        console.log(`⚠️ SPEED ALERT: ${busId} is at ${speed} km/h`);
        io.emit('newAlert', {
            type: 'danger',
            message: `Over-Speeding Detected! Bus ${busId} is at ${speed} km/h.`
        });
    }

    // 3. CHECK: Geofence Logic (Route Deviation)
    // Check karo ki Bus School (Center) se kitna door hai
    const distanceFromSchool = getDistanceFromLatLonInKm(
        location.lat, location.lng, 
        SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng
    );

    if (distanceFromSchool > GEOFENCE_RADIUS_KM) {
        // Sirf kabhi-kabhi log karo taaki spam na ho
        if(Math.random() > 0.9) { 
            io.emit('newAlert', {
                type: 'warning',
                message: `Route Deviation! Bus ${busId} is ${distanceFromSchool.toFixed(1)}km away from school zone.`
            });
        }
    }
  });

  // SOS Alert
  socket.on('sosAlert', (data) => {
      console.log(`🚨 SOS Alert from ${data.busId}`);
      io.emit('newAlert', { type: 'critical', message: `🚨 SOS EMERGENCY: Bus ${data.busId} needs help!` });
  });

  socket.on('disconnect', () => console.log('❌ Client Disconnected'));
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});