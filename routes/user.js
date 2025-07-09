const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');

const {
    add_game,
    get_TrendingGame,
    get_TopPlayer,
    get_ActiveUsers,
    get_AllUsers,
    get_AllUsersWithoutPagination,
    get_revenue,
    add_coins,
} = require('../controller/dashboard.controller');

const { get_ListOfGames, update_status_by_id } = require('../controller/listofgames.controller');
const {
    signIn,
    signOut,
} = require('../controller/user.controller');
router.use(express.json());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/add_game', add_game);
router.get('/get_TrendingGame', get_TrendingGame);
router.get('/get_TopPlayer', get_TopPlayer);
router.get('/get_ActiveUsers', get_ActiveUsers);
router.get('/get_AllUsers', get_AllUsers);
router.get('/get_AllUsersWithoutPagination', get_AllUsersWithoutPagination
);

router.get('/get_revenue', get_revenue);
router.put('/add_coins/:userId', add_coins);

router.get('/get_ListOfGames', get_ListOfGames);
router.put('/update_status_by_id/:gameId/:status', update_status_by_id)

router.post('/signin', signIn);
router.post('/signout', signOut);

module.exports = router;