const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true } // Real apps me password hash karte hain, abhi simple rakhenge
});

module.exports = mongoose.model('Admin', AdminSchema);