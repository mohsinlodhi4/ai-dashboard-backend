const sendEmail = require("../utils/emails/sendEmail.js");
const clientURL = process.env.CLIENT_URL;
const {successResponse, errorResponse} = require('../utils/functions.js');
const moment = require('moment');
const mongoose = require('mongoose');
const CustomError = require('../exceptions/customError.js')
const ChatSession = require('../models/chatSession.js')
const { openai } = require("../utils/constants.js")
/* This file is not being used, chatBotController.js is latest file */


const sendMessage = async (req, res) =>{
    try{

        const userId = req.user_id;
        const userText = req.body.text
        let sessionId = req.body.sessionId;

        if(sessionId && !(await ChatSession.findOne({userId, _id: sessionId}, '_id')) ) {
            throw new CustomError("Invalid session id for user");
        }

        const resp = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
              messages: [
                { role: "user", content: userText}
              ]  
          })
        const messageResponse = resp.choices[0].message.content;
        
        let newMessages  = [
            {
                from: 'user',
                to: 'system',
                content: userText,
                createdAt: (new Date()).toISOString()
            },
            {
                from: 'system',
                to: 'user',
                content: messageResponse,
                createdAt: (new Date()).toISOString()
            },
        ]
        let chatSession;
        if(sessionId) {
            chatSession = await ChatSession.findOneAndUpdate(
                { _id: sessionId },
                { $push: { messages: { $each: newMessages } } },
            );
        } else {
            let chatTitle = userText.substring(0, 20)
            if(chatTitle.length == 20) {
                chatTitle = `${chatTitle}...`
            }

            chatSession = await ChatSession.create({
                userId,
                messages: newMessages,
                title: chatTitle  
            })
            sessionId = chatSession._id;
        }
              

        return res.status(200).json(successResponse('Message Saved successfully.',{sessionId, message: newMessages[1]}));
    }catch(e){
        console.log(e);
        if(e instanceof CustomError){
            return res.status(e.statusCode).json(errorResponse( e.message, e.data ) );
        }
        return res.status(400).json(errorResponse( e.message ) );
    }
}

const getChatSessionList = async (req, res) =>{
    try{
        let {perPage, pageNumber} = req.query;
        let messages;
        if(!pageNumber){
            messages = await ChatSession.find({userId: req.user_id}, 'userId createdAt title').sort({createdAt: -1});
        }else{
            perPage = perPage ? parseInt(perPage)  : 20;
            pageNumber = parseInt(pageNumber);
            const skip = perPage * (pageNumber-1);
            messages = await ChatSession.find({userId: req.user_id}, 'userId createdAt title').sort({createdAt: -1}).skip(skip).limit(perPage);
        }

        return res.status(200).json(successResponse('Chat list fetched successfully.',{messages}));
    }catch(e){
        return res.status(400).json(errorResponse( e.message ) );
    }
}
const getChatSession = async (req, res) =>{
    try{
        let {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            throw new CustomError("Invalid chat session id");
        }
        const message = await ChatSession.findOne({_id: id});

        return res.status(200).json(successResponse('Chat Session details fetched.',{message}));
    }catch(e){
        console.log(e)
        if(e instanceof CustomError) {
            return res.status(e.statusCode).json(errorResponse( e.message, e.data ) );
        }
        return res.status(400).json(errorResponse( e.message ) );
    }
}

module.exports = {
    sendMessage,
    getChatSessionList,
    getChatSession,
}