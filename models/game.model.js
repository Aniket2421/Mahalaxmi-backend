// user.models.js
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    gamename: {
        type: String,
    },
    user: {
        type: Number,
        default: 200,
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
});

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;