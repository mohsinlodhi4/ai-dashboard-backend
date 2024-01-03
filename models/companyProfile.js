const mongoose = require('mongoose');

const CompanyProfile = new mongoose.Schema({
    webUrl: {
        type: String,
        required: true,
    },
    businessTitle: {
        type: String,
    },
    businessDescription: {
        type: String,
    },
    contactDetails: {
        type: Object,
    },
    services: {
        type: Array
    },
    socialLinks: {
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