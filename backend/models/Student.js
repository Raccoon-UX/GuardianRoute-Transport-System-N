const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true },
  busId: { type: String, required: true },
  pickupLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  isPresent: { type: Boolean, default: true } // Attendance ke liye
});

module.exports = mongoose.model('Student', StudentSchema);