const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const mongoUri = "mongodb+srv://sarang:0vpWoCbrRoi1fRsq@cluster0.au98o.mongodb.net/";
        await mongoose.connect(mongoUri);
    } catch (error) {
        console.log("database not connected");
        throw error;
    }
}

module.exports = connectDb;