const sendEmail = require("../utils/emails/sendEmail.js");
const clientURL = process.env.CLIENT_URL;
const {successResponse, errorResponse} = require('../utils/functions.js');
const moment = require('moment');
const mongoose = require('mongoose');
const CustomError = require('../exceptions/customError.js')
const ChatBotTemplate = require('../models/chatBotTemplate.js')
const ChatBot = require('../models/chatBot.js')
const {openai} = require("../utils/constants.js")

async function createChatBot(req, res){

}

module.exports = {
    createChatBot
}