const mongoose = require('mongoose');

const ChatBotTemplate = new mongoose.Schema({
    // step 1
    name: { type: String, required: true},
    description: { type: String},
    roleDetailedDescription: { type: String},
    introMessage: { type: String},
    trainingDialogues: { type: Array},
    // step2
    image: { type: String},
    placeHolderText: { type: String},

},{
    timestamps: true,
});


module.exports = mongoose.model('ChatBotTemplate', ChatBotTemplate);