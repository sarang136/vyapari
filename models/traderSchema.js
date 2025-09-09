const mongoose = require("mongoose");


const gradeSchema = new mongoose.Schema(
    {
        grade: {
            type: String,
            unique : true
        },
        price: Number,
    },
    { timestamps: true }
);

const traderSchema = new mongoose.Schema({
    traderName: {
        type: String,
        required: true,
    },
    traderProfileImage: {
        type: String,
    },
    traderAddress: {
        type: String,
    },
    traderArea: {
        type: String,
    },
    traderContact: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    traderEmail: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    traderPassword: {
        type: String,
        required: true,
        trim: true,
    },

    grades: [gradeSchema],

    role: {
        type: String,
        default: "Trader",
        set: () => "Trader",
    },
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Trader", traderSchema);
