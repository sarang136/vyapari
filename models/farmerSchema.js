const mongoose = require('mongoose');
const farmerSchema = new mongoose.Schema({

    farmerName: {
        type: String,
        required: true,
    },
    farmerProfileImage: {
        type: String,
    },
    farmerAddress: {
        type: String,
    },
    farmerArea: {
        type: String,
    },
    farmerContact: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    farmerEmail: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    farmerPassword: {
        type: String,
        // required: true,
        trim: true,
    },
    role: {
        type: String,
        default: "Farmer",
        set: () => "Farmer",
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("Farmer", farmerSchema);