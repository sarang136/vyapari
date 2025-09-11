const mongoose = require('mongoose');

const createAdminSchema = mongoose.Schema({
    adminName: {
        type: String,
    },
    adminContact: {
        type: String,
    },
    adminEmail: {
        type: String,
    },
    adminPassword: {
        type: String,
    },
})


module.exports = mongoose.model('Admin', createAdminSchema);