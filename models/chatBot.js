const mongoose = require('mongoose');

const ChatBot = new mongoose.Schema({

    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatBotTemplate', required:true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true },

    visibility: { type: String, enum: ['public', 'private', 'unlisted'], default: 'public'},
    clonable: { type: Boolean, default: false},
    totalRuns: {type: Number, default: 0},
    runs: {type: Array}, // [{ date: "", tokens: "", userId: ""}]

},{
    timestamps: true,
});


module.exports = mongoose.model('ChatBot', ChatBot);