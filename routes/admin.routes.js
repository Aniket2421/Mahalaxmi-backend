const express = require("express");
const router = express.Router();
const { getOtp, verifyOtp, changePassword, signIn, acceptRequestAndTransferAmount, getAvailableCoins, getWithDrawAmountRequests, getPayments, addAvailableCoins, } = require("../controller/admin.controller");
const {updateGame} = require('../controller/dashboard.controller');

router.post('/getOtp', getOtp);
router.post('/verifyOtp', verifyOtp);
router.post('/changePassword/:userId', changePassword);
router.post('/signIn', signIn);
router.post('/acceptRequestAndTransferAmount', acceptRequestAndTransferAmount);
router.get('/getWithDrawAmountRequests', getWithDrawAmountRequests);
router.get('/getPayments', getPayments);
router.get('/updateGame', updateGame);
router.post('/addAvailableCoins', addAvailableCoins);
router.get('/getAvailableCoins', getAvailableCoins);
module.exports = router;
