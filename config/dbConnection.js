const mongoose = require("mongoose");
require("dotenv").config();

const dbConnection = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then((conn) => {
            console.log(`App is connected to MongoDB database on ${conn.connection.host}`)
        })
        .catch((err) => {
            console.log(`Error is ${err}`);
            process.exit(1)
        })
}
module.exports = dbConnection;