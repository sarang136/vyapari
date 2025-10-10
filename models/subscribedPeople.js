const mongoose = require('mongoose');

const subscriptionsPeople = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    amountPaid: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ["pending", "active", "expired"],
        required: true,
    }

}, { timestamps: true });

module.exports = mongoose.model('SubscribedPeople', subscriptionsPeople);