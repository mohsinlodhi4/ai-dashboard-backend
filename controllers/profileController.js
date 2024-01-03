const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');
const CompanyProfile = require('../models/companyProfile');
const crypto = require("crypto");
const sendEmail = require("../utils/emails/sendEmail.js");
const clientURL = process.env.CLIENT_URL;
const {successResponse, errorResponse} = require('../utils/functions');
const {scrapeWebsiteAndExtractData} = require("../services/scrapper"); 

// step 1
async function submitWebUrlAndScrapeData(req, res) {
    const userId = req.user_id;
    const {webUrl} = req.body;
    await CompanyProfile.updateOne(
        {
            userId: userId
        }, 
        {
            $set: {
                webUrl: webUrl,
            }
        }, 
        {upsert: true}
    )
    try {

        const scrapedData = await scrapeWebsiteAndExtractData(webUrl)
        return res.json(successResponse("Web url analyzed successfully.", scrapedData));
    } catch(e) {
        console.log("scraping error:", e);
        return res.status(400).json(errorResponse("Something went wrong. Please verify your url is correct."));
    }
}

// step 2,3
async function submitCompanyDetails(req, res){
    try {
        const userId = req.user_id;
        const image = req.file;
        let data = req.body;
        delete data._id;
        if(image){
            const logoFilePath = image ? image?.path : null;
            const logoFileName = image ? image?.url : null;
            data = {...data, logoFileName, logoFilePath};
        }

        await CompanyProfile.updateOne(
            {
                userId: userId
            }, 
            {
                $set: {
                    ...data,
                }
            }, 
            {upsert: true}
        )
        return res.json(successResponse("Profile Details saved successfully"));

    }catch(e) {
        console.log("submitCompanyDetails Error:",e)
        return res.status(400).json(errorResponse("Profile Details could not be Saved", ));
    }
}

async function markProfileAsComplete(req, res){
    const userId = req.user_id;
    if( !(await CompanyProfile.findOne({userId})) ) {
        return res.status(400).json(errorResponse("Profile not found"))
    }

    await User.updateOne(
        {
            _id: userId
        }, 
        {
            $set: {
                profileCompleted: true,
            }
        }
    );
    return res.json(successResponse("Profile marked as complete."))
}

async function getCompanyProfile(req, res){
    const userId = req.user_id;
    const companyProfile = await CompanyProfile.findOne({userId})
    if(companyProfile) {
        return res.json(successResponse("Profile Details fetched successfully", companyProfile ));
    }
    return res.status(400).json(errorResponse("Profile not found"))
}

module.exports = {
    submitWebUrlAndScrapeData,
    submitCompanyDetails,
    markProfileAsComplete,
    getCompanyProfile,
}