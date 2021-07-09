const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middleware/async');
const sendEmail = require("../utils/sendMail");
const User = require("../models/User");
const jose = require("jose");
const mongoose = require('mongoose')
const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch")
const Fawn =require('fawn');

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role,  phoneNumber, } = req.body;

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    role,
  });

  // grab token and send to email
  const confirmEmailToken = user.generateEmailConfirmToken();

// only send confirmEmailToken

  const message = `You are receiving this email because you need to confirm your email address. Please use the code to activate your account: \n\n ${confirmEmailToken}`;
  user.save({ validateBeforeSave: false });

  const sendResult = await sendEmail({
    email: user.email,
    subject: 'Email confirmation code',
    message,
  })

  sendTokenResponse(user, 200, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate emil & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid user', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  if(!user.isEmailConfirmed) {
    return next(new ErrorResponse('Please verify your email to login', 401));
  }

  sendTokenResponse(user, 200, res);
});




exports.getMe = asyncHandler(async (req, res, next) => {
  // user is already available in req due to the protect middleware
  const user = await User.findById(req.user.id);


  if(!user)  return next(new ErrorResponse('User does not exist', 404));

  res.status(200).json({
    success: true,
    data: user,
  });
});


exports.updateDetails = asyncHandler(async (req, res, next) => {
 
  const inputs = req.body
  
 
  const fieldsToUpdate = {
    ...inputs
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});


exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
 
  if(!user)  return next(new ErrorResponse('User does not exist', 404));
  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});


exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please use the code to reset your password: \n\n ${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const user = await User.findOne({
    resetPasswordToken:req.params.resettoken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

exports.confirmEmail = asyncHandler(async (req, res, next) => {
  // grab token from email
  const { token } = req.query;

  if (!token) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  // get user by token
  const user = await User.findOne({
    confirmEmailToken:token,
    isEmailConfirmed: false,
  });

  if (!user) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  // update confirmed to true
  user.confirmEmailToken = undefined;
  user.isEmailConfirmed = true;

  // save
  user.save({ validateBeforeSave: false });

  // return token
  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user:user
  });
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT);
// Google Login
exports.googleLogin = asyncHandler(async(req, res) => {
  const { idToken } = req.body;

  client
    .verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT,
    })
    .then((response) => {
      // console.log('GOOGLE LOGIN RESPONSE',response)
      const {
        email_verified,
        given_name,
        family_name,
        email,
        locale,
      } = response.payload;
      if (email_verified) {
        User.findOne({ email }).exec(async(err, user) => {
          if (user) {
            sendTokenResponse(user, 200, res);
            
          } else {
            let user = await User.create({
              name:given_name,
              email,
            
            });
          user.save({validateBeforeSave:false})
          sendTokenResponse(user, 200, res);
          }
        });
      } else {
        return next(new ErrorResponse('Google login failed, please try again', 400));
        
      }
    });
});



