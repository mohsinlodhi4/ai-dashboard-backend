const sendEmail = require("../utils/emails/sendEmail.js");
const clientURL = process.env.CLIENT_URL;
const {successResponse, errorResponse} = require('../utils/functions.js');
const moment = require('moment');
const mongoose = require('mongoose');
const CustomError = require('../exceptions/customError.js')
const ChatBot = require('../models/chatBot.js')
const {openai} = require("../utils/constants.js")
const jwt = require('jsonwebtoken');

async function createOrUpdateChatBot(req, res){
    try {
        const userId = req.user_id;
        const image = req.file;
        let data = req.body;
        let {chatBotId, status} = data
        if(!status){
            status = 'draft';
        }
        console.log("status", status)
        // delete data._id;
        if(image){
            const imagePath = image ? image?.path : null;
            const imageName = image ? image?.url : null;
            data = {...data, image: imageName, imagePath};
        }
        let chatBot;
        if(chatBotId) {
            chatBot = await ChatBot.findOneAndUpdate({_id: chatBotId, userId}, { $set: { template: data, status, } }, {new: true});
        } else {
            chatBot = await ChatBot.create({template: data, userId, status, });
        }
        return res.json(successResponse("Chatbot saved successfully.", chatBot));
    } catch (error) {
        console.error(error);
        return res.status(400).json(errorResponse(error.message));
    }
}

async function deleteChatBot(req, res){
    try {
        const chatBotId = req.params.id;
        const userId = req.user_id;

        await ChatBot.deleteOne({_id: chatBotId, userId});
        res.json(successResponse('ChatBot deleted successfully'));
    } catch (error) {
        console.error(error);
        res.status(500).json(errorResponse('Internal Server Error'));
    }
}

async function getChatBotDetails(req, res){
    try {
        const chatBotId = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(chatBotId)) {
            return res.status(400).json(errorResponse( 'Invalid chatbot id'));
        }
        const chatBot = await ChatBot.findOne({_id: chatBotId})
        const userId = getUserIdFromToken(req);
        
        if (!chatBot) {
            return res.status(404).json(errorResponse( 'ChatBot not found'));
        }
        if(chatBot.template.visibility != 'public' && chatBot.userId.toString() != userId) {
            return res.status(403).json(errorResponse("Chatbot is not publically accessible."));
        }

        res.json(successResponse('Chatbot details fetched successfully.', chatBot));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getChatbots(req, res){
    try {

        const userId = req.user_id;
        const { page = 1, limit = 30 } = req.query;

        const totalCount = await ChatBot.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);

        const chatBots = await ChatBot.find({userId})
            .sort({ createdAt: -1 }) // Assuming you have a createdAt field for the timestamp
            .skip((page - 1) * limit)
            .limit(limit)
            .select('template.name template.description visibility status clonable totalRuns')

        res.json(successResponse("chatbots fetched successfully", {chatBots, totalPages, totalCount}));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

function getUserIdFromToken(req){
    const token = req.header('authorization')?.split(' ')?.[1];

    if(!token) return null;
    try{
        const user = jwt.verify(token, process.env.JWT_ENCRYPTION_KEY);
        return user.id
    }catch(e){
        console.log(e);
        return null
    }
}

module.exports = {
    createOrUpdateChatBot,
    deleteChatBot,
    getChatBotDetails,
    getChatbots,
}