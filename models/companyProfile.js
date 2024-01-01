const mongoose = require('mongoose');

const CompanyProfile = new mongoose.Schema({
    webUrl: {
        type: String,
        required: true,
    },
    contactDetails: {
        type: Object,
    },
    services: {
        type: Array
    },
    targetCustomers: {
        type: Array
    },
    targegtLocations: {
        type: Array,
    },
    businessAddress: {
        type: String,
    },
    additionalInformation: {
        type: String,
    },
    logoFileName: {
        type: String,
    },
    logoFilePath: {
        type: String,
    },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true },

},{
    timestamps: true,
});


module.exports = mongoose.model('CompanyProfile', CompanyProfile);