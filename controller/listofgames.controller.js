const Game = require('../models/game.model');
const User = require("../models/user.model");
const { TwoCardTPBet, DragenTigerLionBet } = require('../models/bet.model');

/******************************************************
 * @get_ListOfGames
 * @route http://localhost:5000/user/get_ListOfGames
 * @description get List Of gGames
 * @returns Game object
 ******************************************************/
const get_ListOfGames = async(req, res) => {
    try {
        // Fetch the list of trending games
        const Games = await Game.find();
        // Check if any trending games are found
        if (!Games || Games.length === 0) {
            return res.status(404).json({ message: 'Not Found Any Record' });
        }
        // Prepare an array to store game details with active users and total revenue
        const gameDetails = [];
        // Loop through each trending game
        for (const game of Games) {
            // Fetch active users for the game
            const activeUsers = await User.countDocuments({
                game: game.gamename,
                status: 'Active',
            });
            // Fetch total revenue for the game
            const totalRevenue = await getGameTotalRevenue(game.gamename);
            const displayedRevenue = totalRevenue < 0 ? 0 : totalRevenue;
            // Add game details to the array
            gameDetails.push({
                game: game.gamename,
                status: game.status,
                activeUsers,
                totalRevenue: parseFloat(displayedRevenue.toFixed(2)),
            });
        }
        // Return the list of games with active users and total revenue
        res.status(200).json({ message: 'List of Games', games: gameDetails });
    } catch (error) {
        console.error('Error get List of game:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Helper function to get total revenue for a specific game
const getGameTotalRevenue = async(game) => {
    try {
        // Adjust the model based on the game type (TwoCardTPBet or DragenTigerLionBet)
        const BetModel = game === 'TwoCardTP' ? TwoCardTPBet : DragenTigerLionBet;
        // Fetch all bet records for the game
        const results = await BetModel.find();
        // Calculate positive and negative revenue
        const positiveRevenue = results.reduce((sum, result) => {
            return sum + (result.revenue > 0 ? result.revenue : 0);
        }, 0);
        const negativeRevenue = results.reduce((sum, result) => {
            return sum + (result.revenue < 0 ? Math.abs(result.revenue) : 0);
        }, 0);
        return positiveRevenue - negativeRevenue;
    } catch (error) {
        console.error('Error calculating total revenue:', error);
        return 0;
    }
};


/******************************************************
 * @update_status_by_id
 * @route http://localhost:5000/user/update_status_by_id
 * @description Update Status By Game Id
 * @returns Game object
 ******************************************************/
const update_status_by_id = async(req, res) => {
    try {
        const gameId = req.params.gameId;
        const status = req.params.status;
        const filter = { _id: gameId };
        const update = { $set: { status: status } };
        const results = await TrendingGame.updateOne(filter, update);
        if (!results) {
            return res.status(404).json({ message: 'Not Found Any Record' });
        }
        const updatedGame = await TrendingGame.findOne(filter);
        res.status(200).json({ message: 'Game updated successfully', Game: updatedGame });
    } catch (error) {
        console.error('Error get game:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { get_ListOfGames, update_status_by_id };