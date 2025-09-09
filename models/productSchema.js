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
    }
})


module.exports = mongoose.model('Product', productSchema)