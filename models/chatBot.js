const mongoose = require('mongoose');

const ChatBot = new mongoose.Schema({

    template: {
        // step 1
        name: { type: String, required: true},
        description: { type: String},
        roleDetailedDescription: { type: String},
        introMessage: { type: String},
        trainingDialogues: { type: Array},
        visibility: { type: String, enum: ['public', 'private', 'unlisted'], default: 'public'},
        clonable: { type: Boolean, default: false},
        // step2
        image: { type: String},
        imagePath: { type: String},
        selectedImage: {type: String, default: 'bot1'}, // userUploaded, bot1, bot2, ...
        placeHolderText: { type: String, default: 'What would you like to talk about?'},
    
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true },
    
    status: {type: String, enum: ['published', 'draft'], default: 'draft'},
    totalRuns: {type: Number, default: 0},
    runsDetail: {type: Array}, // [{ date: "", tokens: "", userId: ""}]
    deletedAt: {type: Date, default: null},

},{
    timestamps: true,
});


module.exports = mongoose.model('ChatBot', ChatBot);