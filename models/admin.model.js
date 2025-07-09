// user.models.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    ID: {
        type: String,
    },
   
    password: {
        type: String,
    },
    Coin: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const Admin = mongoose.model('admin', adminSchema);
module.exports = Admin;
