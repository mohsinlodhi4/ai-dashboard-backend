const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Role = require('../models/role');
const User = require('../models/user');
const Token = require('../models/token');
const Product = require('../models/product');
const Coupon = require('../models/coupon');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Address = require('../models/address');
const Claim = require('../models/claim');
const ClaimItem = require('../models/claimItem');
const crypto = require("crypto");
const sendEmail = require("../utils/emails/sendEmail.js");
const clientURL = process.env.CLIENT_URL;
const {successResponse, errorResponse} = require('../utils/functions');
const moment = require('moment');

const getRidersList = async(req, res) =>{
    try{
        
        const role = await Role.findOne({name: 'rider'});
        const riders = await User.find({role: role?._id});

        return res.status(200).json(successResponse('Riders fetched successfully.',{ riders }));

    }catch(e){
        return res.status(400).json(errorResponse( e.message, req.body ) );
    }
}
const getCustomersList = async(req, res) =>{
    try{
        
        const role = await Role.findOne({name: 'customer'});
        const customers = await User.find({role: role?._id});

        return res.status(200).json(successResponse('Customers fetched successfully.',{ customers }));

    }catch(e){
        return res.status(400).json(errorResponse( e.message, req.body ) );
    }
}
const getUsersList = async(req, res) =>{
    try{
        
        const users = await User.find({});

        return res.status(200).json(successResponse('Users fetched successfully.',{ users }));

    }catch(e){
        return res.status(400).json(errorResponse( e.message, req.body ) );
    }
}
const getCouponsList = async(req, res) =>{
    try{

        const coupons = await Coupon.find().populate('user', '-createdAt -updatedAt -__v');

        return res.status(200).json(successResponse('Coupons fetched successfully.',{ coupons }));

    }catch(e){
        return res.status(400).json(errorResponse( e.message, req.body ) );
    }
}

const getUserCoupons = async(req, res) =>{
    try{
        const {id}  = req.params;
        if(!id) throw new Error('User id not found');

        const coupons = await Coupon.find({user: id}).populate('user', '-createdAt -updatedAt -__v');

        return res.status(200).json(successResponse('Coupons fetched successfully.',{ coupons }));

    }catch(e){
        return res.status(400).json(errorResponse( e.message, req.body ) );
    }
}
const getClaimableItems = async(req, res) =>{
    try{

        const claimItems = await ClaimItem.find();

        return res.status(200).json(successResponse('Claim items fetched successfully.',{ claimItems }));

    }catch(e){
        return res.status(400).json(errorResponse( e.message, req.body ) );
    }
}

const getRevenueDetails = async (req, res)=>{
    try{
        const {dateFrom, dateTo}  = req.body;

        const filters = {};
        if(dateFrom){
            filters.createdAt = {
                $gte: new Date(dateFrom)
            }
        }
        if(dateTo){
            filters.createdAt = {
                ...filters.createdAt,
                $lte: new Date(dateTo)
            }
        }

        const total = (await Order
                            .aggregate([
                                { $match: filters },
                                { $group: { _id:null, total: {$sum: '$total'} } }
                            ]))[0]?.total;

        const currentMonthTotal = (await Order
                            .aggregate([
                                { $match: { createdAt: { $gte: moment().startOf('month').toDate() } } },
                                { $group: { _id:null, total: {$sum: '$total'} } }
                            ]))[0]?.total || 0;
        const lastMonthTotal = (await Order
                            .aggregate([
                                { $match: { createdAt: { $gte: moment().subtract(1, 'months').startOf('month').toDate(), $lt: moment().startOf('month').toDate() } } },
                                { $group: { _id:null, total: {$sum: '$total'} } }
                            ]))[0]?.total || 0;
        const revenue = {total, currentMonthTotal, lastMonthTotal};

        return res.status(200).json(successResponse('Revenue Details fetched successfully.',{ revenue }));

    }catch(e){
        return res.status(400).json(errorResponse( e.message, req.body ) );
    }
}

module.exports = {
    getRidersList,
    getCustomersList,
    getUsersList,
    getCouponsList,
    getUserCoupons,
    getClaimableItems,

    getRevenueDetails,
}