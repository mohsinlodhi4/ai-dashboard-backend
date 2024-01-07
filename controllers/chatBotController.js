const sendEmail = require("../utils/emails/sendEmail.js");
const clientURL = process.env.CLIENT_URL;
const {successResponse, errorResponse} = require('../utils/functions.js');
const moment = require('moment');
const mongoose = require('mongoose');
const CustomError = require('../exceptions/customError.js')
const ChatBot = require('../models/chatBot.js')
const {openai} = require("../utils/constants.js")

async function createOrUpdateChatBot(req, res){
    try {
        const userId = req.user_id;
        const image = req.file;
        let data = req.body;
        let {chatBotId} = data
        // delete data._id;
        if(image){
            const imagePath = image ? image?.path : null;
            const imageName = image ? image?.url : null;
            data = {...data, image: imageName, imagePath};
        }
        let chatBot;
        if(chatBotId) {
            chatBot = await ChatBot.updateOne({_id: chatBotId, userId}, { $set: { template: data, } }, {new: true});
        } else {
            chatBot = await ChatBot.create({template: data, userId, });
        }
        return res.json(chatBot);
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
        const chatBot = await ChatBot.findOne({_id: chatBotId})
        const userId = getUserIdFromToken(req);
        
        if (!chatBot) {
            return res.status(404).json(errorResponse( 'ChatBot not found'));
        }
        if(chatBot.template.visibility != 'public' && chatBot.userId.toString() != userId) {
            return res.status(403).json(errorResponse("Chatbot is not publically accessible."));
        }

        res.json(successResponse('Chatbot details fetched successfully.', {chatBot}));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getChatbots(req, res){
    try {

        const userId = req.user_id;
        const { page = 1, limit = 10 } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            select: 'template.name template.description visibility status clonable totalRuns',
            sort: { createdAt: -1 }, // Sort by createdAt in descending order
        };

        const chatBots = await ChatBot.paginate({ userId }, options);
        res.json(chatBots);
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