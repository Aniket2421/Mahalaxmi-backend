const AdminModel = require('../models/admin.model');
const PaymentModel = require('../models/payment.model');
const UserMasterModel = require('../models/userMaster.model');
const bcrypt = require('bcryptjs');

// const User = require('../models/user.model');
require("dotenv").config();

function validateOTP(otp) {
  // Define a regular expression pattern for exactly 4 digits
  const pattern = /^\d{4}$/;

  // Use the test() method to check if the input matches the pattern
  return pattern.test(otp);
}

const getOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ status: 400, message: "Mobile number is required" });
    }

    const admin = await AdminModel.findOne({ mobileNumber: mobileNumber });

    if (!admin) {
      return res.status(404).json({ status: 404, message: "User with mobile number not found" });
    }


    const otp = Math.floor(1000 + Math.random() * 9000);
    admin.otp = otp;

    await admin.save();

    console.log('Mobile number received:', mobileNumber);


    // Process to send OTP on user mobile
    const message = `Dear customer, your OTP for Login is ${otp}. Use this password to validate your login. Shree Ji Traders`;
    const apiUrl = `${process.env.API_URL}&apikey=${process.env.API_KEY}&apirequest=Text&sender=${process.env.SENDER_ID}&mobile=${mobileNumber}&message=${message}&route=OTP&TemplateID=${process.env.TEMPLATE_ID}&format=JSON`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 'success') {
      return res.status(200).json({ status: 200, message: "OTP sent successfully" });
    } else {
      return res.status(500).json({ status: 500, message: "Failed to send OTP", error: data });
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};


const verifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    if (!mobileNumber) {
      return res.status(400).json({ status: 400, message: "mobile Number is required" });
    };
    if (!otp) {
      return res.status(400).json({ status: 400, message: "otp is required" });
    };
    if (!validateOTP(otp)) {
      return res.status(400).json({ status: 400, message: "Enter valid Otp" });
    };
    const admin = await AdminModel.findOne({ mobileNumber: mobileNumber, otp: otp });
    if (!admin) {
      return res.status(400).json({ status: 400, message: "otp does not match" })
    }
    return res.status(200).json({ status: 200, message: "verified", user: admin });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { newPassword, confirmPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ status: 400, message: "newPassword is required" });
    };
    if (!confirmPassword) {
      return res.status(400).json({ status: 400, message: "confirmPassword is required" });
    };
    if (confirmPassword !== newPassword) {
      return res.status(400).json({ status: 400, message: "password does not match" });
    };
    const admin = await AdminModel.findOne({ _id: userId });
    if (!admin) {
      return res.status(404).json({ status: 400, message: "admin not found with the id" });
    }
    admin.password = confirmPassword;
    await admin.save();
    return res.status(200).json({ status: 200, message: "new password saved", user: admin })
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const signIn = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;
    if (!mobileNumber) {
      return res.status(400).json({ status: 400, message: "Mobile number is required" });
    };
    console.log(mobileNumber)
    if (!password) {
      return res.status(400).json({ status: 400, message: "Password is required" });
    };
    console.log(password)

    const admin = await AdminModel.findOne({ mobileNumber: mobileNumber });
    if (!admin) {
      return res.status(404).json({ status: 404, message: "user not found with the mobile number" });
    };
    if (password !== admin.password) {
      return res.status(400).json({ status: 400, message: "password does not match" });
    }
    return res.status(200).json({ status: 200, message: "User login successfull", user: admin });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const acceptRequestAndTransferAmount = async (req, res) => {
  try {
    const { mobileNumber, requestedAmount } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ status: 400, message: "mobile Number is required" });
    };
    if (!requestedAmount) {
      return res.status(400).json({ status: 400, message: "requested Amount is required" });
    };
    const userMaster = await UserMasterModel.findOne({ mobileNumber: mobileNumber });
    if (!userMaster) {
      return res.status(404).json({ status: 404, message: "user not found" });
    };
    const amount = parseInt(requestedAmount);
    userMaster.requestedAmount = 0
    await userMaster.save();

    const admin = await AdminModel.findOne();
    admin.debitedAmount += amount
    await admin.save();

    return res.status(200).json({ status: 200, message: "withdraw amount request accepted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getWithDrawAmountRequests = async (req, res) => {
  try {
    const userMasters = await UserMasterModel.find({ requestedAmount: { $gt: 0 } });
    if (userMasters.length == 0) {
      return res.status(200).json({ status: 200, message: "No requests found" })
    };

    return res.status(200).json({ status: 200, message: "requests fetched", userMasters: userMasters });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const getPayments = async (req, res) => {
  const payments = await PaymentModel.find().sort({ createdAt: -1 });
  return res.status(200).json({ message: "fetched payment details", payments: payments })
};

const addAvailableCoins = async (req, res) => {
  try {
    const { coins } = req.body;
    if (!coins) {
      return res.status(400).json({ status: 400, message: "coins are required" });
    };
    const coinsInNumber = parseInt(coins);

    const admin = await AdminModel.findOne();
    if (!admin) {
      return res.status(404).json({ message: "user not found" })
    };
    admin.availableCoinsToDistribute += coinsInNumber
    await admin.save();

    return res.status(200).json({ status: 200, message: "available coins added", admin: admin });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAvailableCoins = async (req, res) => {
  try {
    const admin = await AdminModel.findOne();
    if (!admin) {
      return res.status(404).json({ message: "user not found" })
    };

    return res.status(200).json({ status: 200, message: "available coins fetched", availableCoinsToDistribute: admin.availableCoinsToDistribute });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addUser = async (req, res) => {
  // Validate input
  try {
    const { id, password, coins,  } = req.body;

    // Validate required fields
    if (!id || !password ) {
      return res.status(400).json({
        status: 400,
        message: "id, password, and deviceID are required",
      });
    }

    // Check for duplicate user
    const existingUser = await UserMasterModel.findOne({ id });
    if (existingUser) {
      return res.status(409).json({
        status: 409,
        message: "User already exists with this ID",
      });
    }

    // Create new user
    const newUser = new UserMasterModel({
      id,
      password,
      coins: coins || 0,
    });

    await newUser.save();

    return res.status(201).json({
      status: 201,
      message: "User created successfully",
      user: {
        id: newUser.id,
        coins: newUser.coins,
        deviceID: newUser.deviceID,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};







const updateUser = async (req, res) => {
  const { id, password, coins } = req.body;

  // Validate input
  if (!id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    // Find the user by ID
    let user = await UserMasterModel.findOne({ id });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update password (if provided)
    if (password) {
      user.password = password;
    }

    // Update coins (if provided)
    if (coins !== undefined) {
      user.coins = coins;
    }

    // Save changes
    await user.save();

    res.status(200).json({
      message: "User updated successfully!",
      user: {
        id: user.id,
        coins: user.coins,
        password: user.password
      }
    });

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};


const deleteUser =  async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await UserMasterModel.findByIdAndDelete(id);
    console.log(deletedItem);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully', deletedItem });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item', error });
  }
};



module.exports = {
  getOtp,
  verifyOtp,
  changePassword,
  signIn,
  acceptRequestAndTransferAmount,
  getWithDrawAmountRequests,
  getPayments,
  addAvailableCoins,
  getAvailableCoins,
  addUser,
  updateUser,
  deleteUser
};
