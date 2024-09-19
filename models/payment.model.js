// user.models.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    mobileNumber: {
        type: String,
    },
    amount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const Payment = mongoose.model('payment', paymentSchema);
module.exports = Payment;