// user.models.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
    },
    game: {
        type: String,
        enum: ['TwoCardTP', 'DragenTigerLion'], // Add more games as needed
    },
    balance: {
        type: Number,
        required: true,
        default: 1000,
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
    username: {
        type: String,
    },
    mobileNumber: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;