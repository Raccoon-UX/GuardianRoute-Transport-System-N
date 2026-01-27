require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

// Models Import
const Bus = require('./models/Bus');
const Student = require('./models/Student'); // <-- Yeh line zaroori hai

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Frontend Serve karne ke liye

// Database Connection
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-commute";
mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// --- API ROUTES ---

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
    console.error("Save Error:", err); // Error terminal mein dikhega
    res.status(500).json({ error: err.message });
  }
});

// 3. Mark Attendance (Present/Absent)
app.post('/api/attendance', async (req, res) => {
  const { studentId, status } = req.body;
  try {
    await Student.findByIdAndUpdate(studentId, { isPresent: status });
    res.json({ message: "Attendance Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Optimized Route (Skip-Stop Logic)
app.get('/api/route/:busId', async (req, res) => {
  try {
    // Sirf 'Present' students ko dhundo
    const activeStudents = await Student.find({ busId: req.params.busId, isPresent: true });
    
    // Sort by Roll No (Simple sequencing)
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


// --- backend/server.js (Add this below Student APIs) ---

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

// 7. Update Bus Status (Active/Maintenance)
app.post('/api/buses/status', async (req, res) => {
  const { busId, status } = req.body;
  try {
    await Bus.findOneAndUpdate({ busId }, { status });
    res.json({ message: "Status Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- SOCKET IO ---
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  console.log('⚡ Client Connected:', socket.id);

  socket.on('driverLocation', (data) => {
    io.emit('updateMap', data);
  });

  socket.on('disconnect', () => console.log('Client Disconnected'));
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});