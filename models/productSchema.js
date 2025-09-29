const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    farmerContact: {
        type: String,
        required: true,
    },
    farmerName: {
        type: String,
        required: true,
    },
    traderName: {
        type: String,
        required: true,
    },
    grade: {
        type: String,
    },
    gradePrice: {
        type: String
    },
    priceWithoutGrade: {
        type: String,
    },
    totalPrice: {
        type: String,
        required: true,
    },
    quantity: {
        type: String,
        required: true
    },
    weight: {
        type: String,
    },
    deliveryWay: {
        type: String,
        required: true,
        enum: ["delivered", "dropped"],
        lowercase: true,
    },
    vehicleName: {
        type: String,
    },
    vehicleNumber: {
        type: String,
    },
    vehiclePhoto: {
        type: String,
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ["paid", "unpaid"],
        lowercase: true,
        default: "unpaid"
    },
    BillType: {
        type: String,
        enum: ["G4", "Shimla"],
        required: true
    },
    traderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trader'
    }
}, { timestamps: true })


module.exports = mongoose.model('Product', productSchema)