const express = require("express");
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const dbConnection = require('./config/dbConnection');
const userRoutes = require('./routes/user');
const userMasterRoutes = require('./routes/userMaster');
const adminRoutes = require('./routes/admin.routes');
require("dotenv").config();

// Parse incoming requests with JSON payloads
app.use(express.json());
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
dbConnection();
// PORT 
const PORT = process.env.PORT || 5000;
app.use('/user', userRoutes);
app.use('/userMaster', userMasterRoutes);
app.use('/admin', adminRoutes);
app.get("/", function (request, response) {
  response.send("Hello World!");
});

app.listen(PORT, function () {
  console.log("Started application on port %d", PORT);
});