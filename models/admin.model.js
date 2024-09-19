// user.models.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
    },
    otp: {
        type: Number,
        default:0,
    },
    availableCoinsToDistribute: {
        type: Number,
        default:0,
    },
    password: {
        type: String,
    },
    debitedAmount: {
        type: Number,
        default: 0
    },
    creditedAmount: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true,
});

const Admin = mongoose.model('admin', adminSchema);
module.exports = Admin;
