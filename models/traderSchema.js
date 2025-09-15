const mongoose = require("mongoose");


// const gradeSchema = new mongoose.Schema(
//     {
//         grade: {
//             type: String,
//             required: true,
//         },
//         price: Number,
//     },
//     { timestamps: true }
// );

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

    },
    traderEmail: {
        type: String,
        required: true,

        lowercase: true,
        trim: true,
    },
    traderPassword: {
        type: String,
        required: true,
        trim: true,
    },

    // grades: [gradeSchema],

    vehicle: {
        vehicleName: {
            type: String,
        },
        vehicleNumber: {
            type: String,
        }
    },
    role: {
        type: String,
        default: "Trader",
        set: () => "Trader",
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Trader", traderSchema);
