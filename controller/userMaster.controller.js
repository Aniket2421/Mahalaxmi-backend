const UserMasterModel = require('../models/userMaster.model');
const PaymentModel = require('../models/payment.model');
const AdminModel = require('../models/admin.model');
require("dotenv").config();
const unirest = require("unirest");
const axios = require('axios');
const { ObjectId } = require('mongodb');

//mobile number validations
function validateMobileNumber(number) {

  const regex = /^[6-9]\d{9}$/;

  return regex.test(number);
};

function validateOTP(otp) {
  // Define a regular expression pattern for exactly 4 digits
  const pattern = /^\d{6}$/;

  // Use the test() method to check if the input matches the pattern
  return pattern.test(otp);
}

const verifyMobile = async (req, res) => {
    try {
      const { mobileNumber, game_version } = req.body;

      if (mobileNumber) {
        if (!validateMobileNumber(mobileNumber)) {
          return res.status(400).json({ status: 400, message: "Enter valid mobile number"})
        };
      };
      const user = await UserMasterModel.findOne({ mobileNumber: mobileNumber });
      if (user) {
        //create 4 digit random number
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.otp = otp;
        await user.save();
        const newUserWithoutOtp = user.toObject();
        // Exclude the 'otp' field from the response
        delete newUserWithoutOtp.otp;

        //process to send otp on user mobile
        const message = `Dear customer, your OTP for Login is ${otp} Use this password to validate your login. Shree Ji Traders`;
        const apiUrl = `${process.env.API_URL}&apikey=${process.env.API_KEY}&apirequest=Text&sender=${process.env.SENDER_ID}&mobile=${mobileNumber}&message=${message}&route=OTP&TemplateID=${process.env.TEMPLATE_ID}&format=JSON`;
        
        const response = fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          // console.log('Response:', data);
          // Process the response data here
        })
        .catch(error => {
            console.error('Error:',error);
        });

        return res.status(200).json({
          status: 200,
          message: "OTP sent successfully",
          demoId: "Demo123",
          user: newUserWithoutOtp,
        });
      }
      // console.log("idvh")
      const otp = Math.floor(100000 + Math.random() * 900000);

      let newUser;
      if (mobileNumber) {
        newUser = await UserMasterModel.create({ mobileNumber, game_version, otp });
      };
      const newUserWithoutOtp = newUser.toObject();
      // Exclude the 'otp' field from the response
      delete newUserWithoutOtp.otp;

      //process to send otp on user mobile
      const message = `Dear customer, your OTP for Login is ${otp} Use this password to validate your login. Shree Ji Traders`;
      const apiUrl = `${process.env.API_URL}&apikey=${process.env.API_KEY}&apirequest=Text&sender=${process.env.SENDER_ID}&mobile=${mobileNumber}&message=${message}&route=OTP&TemplateID=${process.env.TEMPLATE_ID}&format=JSON`;
      
      const response = fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        // console.log('Response:', data);
        // Process the response data here
      })
      .catch(error => {
          console.error('Error:',error);
        });
      return res.status(200).json({ status: 200, message: "OTP sent successfully", demoId: "Demo123", user: newUserWithoutOtp});
    }
    catch (error) {
      return res.status(500).json({ message: error.message });
    }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp, mobileNumber } = req.body;
    if (!validateOTP(otp)) {
      return res.status(400).json({ status: 400, message: "Enter valid Otp"});
    };
    const userMaster = await UserMasterModel.findOne({ mobileNumber: mobileNumber, otp: otp });
    if (!userMaster) {
      return res.status(400).json({ status: 400, message: "otp does not match"})
    }
    return res.status(200).json({ status: 200, message: "verified", user: userMaster });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const recharge = async (req, res) => {
  try {
    const { userId, mobileNumber, coins } = req.body;
    const objectId = new ObjectId(userId);
    const coinsInNumber = parseInt(coins)

    const userMaster = await UserMasterModel.findOne({
      $or: [
        {  _id: objectId },
        { mobileNumber: mobileNumber },
      ],
    });
    if(!userMaster) {
      return res.status(400).json({ status: 400, message: "user not found with id or mobile number" });
    };
    userMaster.coins += coinsInNumber
    await userMaster.save();
    const admin = await AdminModel.findOne();
    if ( admin.availableCoinsToDistribute < coinsInNumber ) {
      return res.status(400).json({ status: 400, message: "cant recharge because available coins are less than recharge amount" }); 
    }
    admin.availableCoinsToDistribute -= coinsInNumber
    admin.creditedAmount += coinsInNumber
    await admin.save();
    return res.status(200).json({ status: 200, message: "recharge successfull", userMaster: userMaster });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const withDrawAmount = async (req, res) => {
  try {
    const { mobileNumber, upiId, requestedAmount } = req.body;
    if (!mobileNumber) {
      return res.status(400).json({ status: 400, message: "mobile Number is required" });
    };
    if (!upiId) {
      return res.status(400).json({ status: 400, message: "UPI Id is required" });
    };
    if (!requestedAmount) {
        return res.status(400).json({ status: 400, message: "Requested Amount is required" });
    };
    const userMaster = await UserMasterModel.findOne({ mobileNumber: mobileNumber });
    if (!userMaster) {
      return res.status(400).json({ status: 404, message: "user not found"})
    };
    if (requestedAmount > userMaster.coins) {
      return res.status(400).json({ status: 400, message: "requested withdraw amount is greater than actual coins" })
    };
    const amount = parseInt(requestedAmount);
    userMaster.upiId = upiId
    userMaster.requestedAmount = requestedAmount
    userMaster.coins -= amount
    await userMaster.save();

    return res.status(200).json({ status: 200, message: "with draw request sent successfully", userMaster: userMaster });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// deduct amount
const deductUserAmount = async (req, res) => {
  try {
    const { mobileNumber, coins } = req.body;
    if (!mobileNumber) {
      return res.status(400).json({ status: 400, message: "mobile Number is required" });
    };

    if (!coins) {
        return res.status(400).json({ status: 400, message: "coins required" });
    };
    const userMaster = await UserMasterModel.findOne({ mobileNumber: mobileNumber });
    if (!userMaster) {
      return res.status(400).json({ status: 404, message: "user not found"})
    };
    if (coins > userMaster.coins) {
      return res.status(400).json({ status: 400, message: "Requested coins are greater than actual coins" })
    };


    userMaster.coins -= coins
    await userMaster.save();

    return res.status(200).json({ status: 200, message: "coins deducted successfully", userMaster: userMaster });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addUserAmount = async (req, res) => {
  try {
    const { mobileNumber, coins } = req.body;
    if (!mobileNumber) {
      return res.status(400).json({ status: 400, message: "mobile Number is required" });
    };

    if (!coins) {
        return res.status(400).json({ status: 400, message: "coins required" });
    };

    if (coins < 0) {
      return res.status(400).json({ status: 400, message: "invalid coins" });
  };
  
    const userMaster = await UserMasterModel.findOne({ mobileNumber: mobileNumber });
    if (!userMaster) {
      return res.status(400).json({ status: 404, message: "user not found"})
    };


    userMaster.coins += coins
    await userMaster.save();

    return res.status(200).json({ status: 200, message: "coins added successfully", userMaster: userMaster });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const paymentToAdmin = async (req, res) => {
  try {
    const { name, mobileNumber, amount } = req.body;
    const userMaster = await UserMasterModel.findOne({ mobileNumber: mobileNumber });
    if (!userMaster) {
      return res.status(400).json({ status: 404, message: "user not found"})
    };
    const payment = await PaymentModel.create({ name, mobileNumber, amount });
    userMaster.paymentId.push(payment._id)
    await userMaster.save();
    return res.status(200).json({ status: 200, message: "payment to admin initialized" })
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const userMaster = await UserMasterModel.findOne({ mobileNumber: mobileNumber });
    if (!userMaster) {
      return res.status(400).json({ status: 404, message: "user not found"})
    };
    return res.status(200).json({ status: 200, message: "user fetched", userMaster: userMaster })
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllUserMasters = async (req, res) => {
  try {
    const userMasters = await UserMasterModel.find().select({ _id: 1, mobileNumber: 1, coins: 1 })
    return res.status(200).json({ message: "Usermasters fetched", userMasters: userMasters });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const changeGameVersion=async (req,res)=>{
  try {
    const {version}=req.body
    // console.log(version)
    if(!version){
      return res.status(400).json({ message: 'version is required' })
    }
    const users =await UserMasterModel.updateMany({},{$set:{game_version:version}});
    // (err,result)=>{
    //   if(err){
    //   return res.status(500).json( 'Error updating documents:', err )

    //   }else{
    //   return res.status(200).json( 'Documents updated successfully:', result )

    //   }
    return res.status(200).json({ users: users })

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getuserMasterById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userMaster = await UserMasterModel.findOne({ _id: userId });
    if (!userMaster) {
      return res.status(404).json({ message: 'user Master not found' });
    };
    return res.status(200).json({ status: 200, message: "User Master fetched", userMaster: userMaster });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
    verifyMobile,
    verifyOtp,
    recharge,
    withDrawAmount,
    paymentToAdmin,
    getUser,
    deductUserAmount,
    addUserAmount,
    getAllUserMasters,
    changeGameVersion,
    getuserMasterById,
}