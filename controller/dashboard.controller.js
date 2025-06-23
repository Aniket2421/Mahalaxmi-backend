const Game = require("../models/game.model");
const User = require("../models/user.model");
const UserMasterModel = require('../models/userMaster.model');
const { TwoCardTPBet, DragenTigerLionBet } = require('../models/bet.model');
const AdminModel = require('../models/admin.model');

/******************************************************
 * @add_game
 * @route http://localhost:5000/user/add_game
 * @description Save New Game in Database
 * @returns Game object
 ******************************************************/
const add_game = async (req, res) => {
    try {
        const {
            gamename
        } = req.body;
        // Check required fields are provided
        if (!gamename) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }
        // Check if the Game is unique
        const existingGame = await Game.findOne({
            $or: [{
                gamename
            }]
        });
        if (existingGame) {
            return res.status(400).json({
                message: "Game  already exists."
            });
        }
        const newGame = new Game({
            gamename,
        });
        // Save the new Game
        const savedGame = await newGame.save();
        res.status(201).json({
            message: "Game added successfully",
            Game: savedGame
        });
    } catch (error) {
        console.error("Error adding game:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

/******************************************************
 * @get_TrendingGame
 * @route http://localhost:5000/user/get_TrendingGame
 * @description get TrendingGames
 * @returns Game object
 ******************************************************/
const get_TrendingGame = async (req, res) => {
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
                totalRevenue: parseFloat(displayedRevenue.toFixed(2)),
            });
            gameDetails.sort((a, b) => b.totalRevenue - a.totalRevenue);
        }
        res.status(200).json({ message: 'Trendings Games', games: gameDetails });
    } catch (error) {
        console.error('Error get Trending game:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Helper function to get total revenue for a specific game
const getGameTotalRevenue = async (game) => {
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
 * @get_TopPlayer
 * @route http://localhost:5000/user/get_TopPlayer
 * @description get Top Plaers
 * @returns Player object
 ******************************************************/
const get_TopPlayer = async (req, res) => {
    try {
        const players = await UserMasterModel.find().sort({
            coins: -1
        }).limit(5);
        if (!players) {
            return res.status(404).json({
                message: "Not Found Any Record"
            });
        }
        res.status(200).json({
            message: "Top Players",
            Player: players
        });
    } catch (error) {
        console.error("Error adding game:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

/******************************************************
 * @get_ActiveUsers
 * @route http://localhost:5000/user/get_ActiveUsers
 * @description get Active Users currently
 * @returns user object
 ******************************************************/
const get_ActiveUsers = async (req, res) => {
    try {
        const results = await UserMasterModel.find({
            status: "Active"
        });
        const count = await UserMasterModel.countDocuments({
            status: "Active"
        });
        if (!results) {
            return res.status(404).json({
                message: "Not Found Any Record"
            });
        }
        res.status(200).json({
            message: "Active Users",
            Users: results,
            Total: count
        });
    } catch (error) {
        console.error("Error get Users:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

/******************************************************
 * @get_AllUsers
 * @route http://localhost:5000/user/get_AllUsers
 * @description get All Users
 * @returns user object
 ******************************************************/
const get_AllUsers = async (req, res) => {
    try {
        const results = await UserMasterModel.find().sort({ createdAt: -1 });
        if (!results) {
            return res.status(404).json({
                message: "Not Found Any Record"
            });
        }
        res.status(200).json({
            message: "All Users",
            Users: results
        });
    } catch (error) {
        console.error("Error get Users:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

/******************************************************
 * @get_revenue
 * @route http://localhost:5000/user/get_revenue
 * @description get Revenue Object
 * @returns Revenue object
 ******************************************************/
// const get_revenue = async(req, res) => {
//     try {
//         // Fetch all bet records from both TwoCardTPBet and DragenTigerLionBet
//         const resultsTwoCardTP = await TwoCardTPBet.find();
//         const resultsDragenTigerLion = await DragenTigerLionBet.find();
//         // Concatenate the results from both games
//         const allResults = [...resultsTwoCardTP, ...resultsDragenTigerLion];
//         if (!allResults || allResults.length === 0) {
//             return res.status(404).json({
//                 message: "Not Found Any Record"
//             });
//         }
//         // Calculate positive and negative revenue for all games
//         const positiveRevenue = allResults.reduce((sum, result) => {
//             return sum + (result.revenue > 0 ? result.revenue : 0);
//         }, 0);
//         const negativeRevenue = allResults.reduce((sum, result) => {
//             return sum + (result.revenue < 0 ? Math.abs(result.revenue) : 0);
//         }, 0);
//         const revenue = positiveRevenue - negativeRevenue;
//         res.status(200).json({
//             message: "Revenue Object",
//             totalRevenue: parseFloat(revenue.toFixed(2)),
//         });
//     } catch (error) {
//         console.error("Error get Revenue:", error);
//         res.status(500).json({
//             message: "Internal Server Error"
//         });
//     }
// };

const get_revenue = async (req, res) => {
    try {
        const admin = await AdminModel.findOne();
        if (!admin) {
            return res.status(404).json({ message: "user not found" })
        };
        // console.log(admin)
        const credit = admin.creditedAmount;
        const debit = admin.debitedAmount;
        res.status(200).json({
            message: "Revenue Object",
            credit, debit
        });
    } catch (error) {
        console.error("Error get Revenue:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}


/******************************************************
 * @add_coins
 * @route http://localhost:5000/user/add_coins
 * @description Add Coins to the User Account
 * @returns Success Message
 ******************************************************/
const add_coins = async (req, res) => {
    try {
        const {
            userId
        } = req.params; // Use req.params to get the userId from the route parameters
        const {
            coins
        } = req.body;
        // Check required fields are provided
        if (!coins) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }
        const user = await User.findOne({
            'userId': userId
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }
        // Add coins to the user's account
        user.balance += coins;
        // Save the updated user
        await user.save();
        res.status(201).json({
            message: "Coins added successfully",
            user
        });
    } catch (error) {
        console.error("Error adding Coins:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const updateGame = async (req, res) => {
    return res.status(200).json({ status: 200, message: "updated", isUpdate: true });
};

module.exports = {
    add_game,
    get_TrendingGame,
    get_TopPlayer,
    get_ActiveUsers,
    get_AllUsers,
    get_revenue,
    add_coins,
    updateGame,
};