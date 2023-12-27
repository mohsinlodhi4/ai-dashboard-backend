const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Token = require('../models/token');
const Role = require('../models/role');
const crypto = require("crypto");
const sendEmail = require("../utils/emails/sendEmail.js");
const clientURL = process.env.CLIENT_URL;
const {successResponse, errorResponse} = require('../utils/functions');


const register = async (req, res)=>{
    try{
        const {name, email, password} = req.body;
        const roleName = req.params.role;

        const role = await Role.findOne({name: roleName}).select('_id name');
        if(!role || role.name == 'admin') return res.status(400).json( errorResponse('Invalid Role', {role: roleName}) );
        
        const oldUser = await User.findOne({ email: email});
        if(oldUser) return res.status(400).json(errorResponse('Email is already taken'));


        let hashPassword = await bcrypt.hash(password, 10);


        let user = await User.create({name, email, password: hashPassword, role: role._id,});
        let token = jwt.sign({id: user._id}, process.env.JWT_ENCRYPTION_KEY);
        user.role = role;
        user = user.toObject();
        user.token = token;

        return res.status(200).json(successResponse('Registration successfull.',{user}));

    }catch(e){
        return res.status(400).json(errorResponse( e.message ) );
    }
    
}

const login = async (req, res)=>{
    try{
        const {email, password} = req.body;
        const roleName = req.params.role;

            const role = await Role.findOne({name: roleName}).select('_id name');
            if(!role) return res.status(400).json( errorResponse('Invalid Role', {role: roleName}) );
            
            let user = await User.findOne({email: email, role: role._id});

            if( !user || !(await bcrypt.compare(password, user.password)) ){
                return res.status(400).json(errorResponse('Invalid Email or Password')); 
            }
            user.role = role;

            if(user.status == 'in-active'){
                return res.status(401).json( errorResponse('Your account is locked', {}) );
            }

            let token = jwt.sign({id: user._id}, process.env.JWT_ENCRYPTION_KEY);
            user = user.toObject();
            user.token = token;

            return res.status(200).json(successResponse('Login successfull.',{ user:user }));
    
        }catch(e){
            console.log(e);
            return res.status(400).json(errorResponse('something went wrong.') );
        }
}

const userFromToken = async (req, res)=>{
    let token = req.query.token;
    if(!token) return res.status(401).json(errorResponse('Token Not found'));

    try{

        let {id}  = jwt.verify(token, process.env.JWT_ENCRYPTION_KEY);
        let user = await User.findById(id);
        if(!user) return res.status(400).json(errorResponse('User not found'));

        user = user.toObject();
        user.token = token;

        return res.json(successResponse('User fetched', {user}))

    }catch(e){
        return res.status(401).json(errorResponse('Invalid Token'));
    }
}

const requestPasswordReset = async (req, res) => {

    try{
        const {email} = req.body;
        if(!email) return res.status(400).json(errorResponse('Email is required'));
        
        const user = await User.findOne({ email });
        
        if (!user) return res.status(400).json( errorResponse("User does not exist") );
        let token = await Token.findOne({ userId: user._id });
        if (token) await token.deleteOne();
        let resetToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(resetToken, 10);

        await new Token({
            userId: user._id,
            token: hash,
            // createdAt: Date.now(),
        }).save();

        const link = `${clientURL}/passwordReset?token=${resetToken}&id=${user._id}`;
        sendEmail(user.email,"Password Reset Request",{name: user.name,link: link,},"template/requestResetPassword.handlebars");

        return res.json(successResponse('Reset link has been sent to the email'));

    }catch(e){
        return res.status(401).json(errorResponse(e.message));
    }
}

const submitPasswordReset = async (req, res) => {

    const {userId, token, password} = req.body;
    if(!userId || !token || !password) return res.status(401).json(errorResponse("User Id token and password is required", req.body));

    try{

        let passwordResetToken = await Token.findOne({ userId });
        if (!passwordResetToken) {
      return res.status(401).json(errorResponse("Invalid or expired password reset token"));
    }
    const isValid = await bcrypt.compare(token, passwordResetToken.token);
    if (!isValid) {
      return res.status(401).json(errorResponse("Invalid or expired password reset token"));
    }
    const hash = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    );
    const user = await User.findById({ _id: userId });
    sendEmail(
      user.email,
      "Password Reset Successfully",
      {
        name: user.name,
      },
      "template/resetPassword.handlebars"
      );
      await passwordResetToken.deleteOne();
      
      return res.json(successResponse('Reset link has been sent to the email'));
    }catch(e){
        let message = e.message.indexOf('Cast to ObjectId')!=-1 ? 'Invalid User id' : e.message;
        return res.status(401).json(errorResponse(message, req.body));
    }

  }

  
const changeMyPassword = async (req, res) => {

    const userId = req.user_id;
    const {currentPassword, changePassword, confirmChangePassword} = req.body;
    if(!currentPassword || !changePassword || !confirmChangePassword) return res.status(401).json(errorResponse("Current password and changed password is required.", req.body));
    
    try{
        if(changePassword != confirmChangePassword) return res.status(401).json(errorResponse("confirm passwords don't match", req.body));
        const user = await User.findById(userId);
        if( !user || !(await bcrypt.compare(currentPassword, user.password)) ){
            return res.status(400).json(errorResponse('Invalid Current Password')); 
        }
        const hash = await bcrypt.hash(changePassword, 10);
        await User.updateOne(
                { _id: userId },
                { $set: { password: hash } },
                { new: true }
            );
        const role = await Role.findById(user.role);
        if(role?.name == 'rider'){
            user.textPassword = changePassword;
            user.save();
        }
        // sendEmail(
        // user.email,
        // "Password Reset Successfully",
        // {
        //     name: user.name,
        // },
        // "template/resetPassword.handlebars"
        // );
        
        return res.json(successResponse('Password Reset successfull'));
    }catch(e){
        let message = e.message.indexOf('Cast to ObjectId')!=-1 ? 'Invalid User id' : e.message;
        return res.status(401).json(errorResponse(message, req.body));
    }

  }

module.exports = {
    register,
    login,
    userFromToken,
    requestPasswordReset,
    submitPasswordReset,
    changeMyPassword,
}