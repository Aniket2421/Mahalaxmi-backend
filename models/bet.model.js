const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
    user: {
        type: String,
        ref: 'PUser',
        required: true,
    },
    winStatus: {
        type: String,
    },
    choice: {
        type: String,
        required: true,
    },
    coins: {
        type: Number,
        required: true,
    },
    PlayerANumber: {
        type: Number,
        default: 0,
    },
    PlayerBNumber: {
        type: Number,
        default: 0,
    },
    Total: {
        type: Number,
    },
    revenue: {
        type: Number,
        default: 0,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const TwoCardTPBet = mongoose.model('TwoCardTPBet', betSchema);

const dragenTigerLionBetSchema = new mongoose.Schema({
    user: {
        type: String,
        ref: 'User',
        required: true,
    },
    winStatus: {
        type: String, // Adjust the type based on your card representation
        // required: true,
    },
    choice: {
        type: [String],
        required: true,
    },
    coins: {
        type: Number,
        required: true,
    },
    DragenNumber: {
        type: Number,
        default: 0,
    },
    LionNumber: {
        type: Number,
        default: 0,
    },
    TigerNumber: {
        type: Number,
        default: 0,
    },
    Total: {
        type: Number,
    },
    revenue: {
        type: Number,
        default: 0,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});


const DragenTigerLionBet = mongoose.model('DragenTigerLionBet', dragenTigerLionBetSchema);
module.exports = {
    TwoCardTPBet,
    DragenTigerLionBet,
};