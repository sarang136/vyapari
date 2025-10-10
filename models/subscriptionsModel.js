const mongoose = require('mongoose');

const SubsModel = new mongoose.Schema({
    duration: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    forWhom:{
        type : String,
        enum:["farmer", "trader"],
        required: true,
    }
}, { timestamps: true })

module.exports = mongoose.model('Subscription', SubsModel);