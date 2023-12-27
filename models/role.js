const mongoose = require('mongoose');

const Role = new mongoose.Schema({
    name: { type: String, required: true},
    permissions: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Permission' } ],

},{
    timestamps: true,
});


module.exports = mongoose.model('Role', Role);