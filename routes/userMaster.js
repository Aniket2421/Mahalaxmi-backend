const express = require("express");
const router = express.Router();
const { login, verifyOtp, recharge, withDrawAmount, deductUserAmount,
    getAllUserMasters, getuserMasterById, addUserAmount, paymentToAdmin, getUser, changeGameVersion, isUserIdLoggedInAnotherDevice } = require("../controller/userMaster.controller");

router.use(express.json());

router.post('/login', login);  //working
router.post('/verifyOtp', verifyOtp);   //working
router.put('/recharge', recharge);
router.post('/withDrawAmount', withDrawAmount );
router.post('/paymentToAdmin', paymentToAdmin );
router.post('/getUser', getUser );                  //working//
router.post("/deductUserAmount",deductUserAmount)
router.post("/addUserAmount",addUserAmount)
router.get("/getAllUserMasters",getAllUserMasters)        
router.post('/changeGameVersion', changeGameVersion);   
router.get('/getuserMasterById/:userId', getuserMasterById); //working//
router.post('/isUserIdLoggedInAnotherDevice', isUserIdLoggedInAnotherDevice); //working//


module.exports = router;
