const UserModel = require('../models/users');
const FeedbackModel = require('../models/feedback');
const userModelMethod = new UserModel();
const jwtHelper = require('../helpers/jwtHelper');
const asyncBusboy = require('async-busboy');
const fs = require('fs');
const mkdirp = require('mkdirp');
const mailer = require('../helpers/mailer');
const env = require('../config/env')();
const path = require('path');
// const imageHelper = path.resolve(__dirname, '../helpers/imageHelper.js');
const commonHelper = require('../helpers/common');

module.exports = {
  /**
  * @api {post} /login/ User Login
  * @apiName Login
  * @apiGroup User
  *
  * @apiParam {String} username User's unique Email or Username.
  * @apiParam {String} password User's password.
  * @apiParam {String} deviceToken device token of the user's mobile.
  *
  * @apiSuccess {String} status Status of the response.
  * @apiSuccess {String} message Message received from the server.
  * @apiSuccess {Object} user User data of the logged in user.
  * @apiSuccess {String} token Jwt token to authorize user.
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "success",
  *       "message": "user logged in successfully",
  *       "user": {
  *                 "_id": "594b0fe3886b356edc3db92e",
  *                 "updatedAt": "2017-07-05T17:46:33.962Z",
  *                 "createdAt": "2017-06-22T00:31:31.851Z",
  *                 "email": "paramjit@mobilyte.com",
  *                 "username": "paramjit",
  *                 "facebookId": "",
  *                 "__v": 0,
  *                 "deviceToken": "059734985363479nv545575346534565952345",
  *                 "status": "active",
  *                 "otpExpiresAt": "2017-06-22T00:30:53.165Z",
  *                 "otp": "",
  *                 "phoneNumber": "",
  *                 "profilePic": "/images/users/594b0fe3886b356edc3db92e/profile-pic/Screenshot-from-2017-04-27-00:34:22.png"
  *               },
  *      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjoiNTk0YjBmZTM4ODZiMzU2ZWRjM2RiOTJlIiwiZXhwIjoxNTMwODEyNzk0LCJpYXQiOjE0OTkyNzY3OTR9.v1nEpR8yXJwqG_H3s3eLLe1VUwhkl2hSREHMm7Lm2FI"
  * }
  *
  * @apiError WrongPassword Password provided is incorrect
  * @apiError UserNotFound The id of the User was not found.
  * @apiError UsernameRequired Username field is required.
  * @apiError PasswordRequired Password field is required.
  * @apiError UserSuspended User has been suspended by the Admin.
  *
  * @apiErrorExample Error-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "error",
  *       "message": "user does not exist"
  *     }
  *
  *
  */
  login: async (req, res) => {
    const {username, password } = req.body;
    if (!username) return res.json({ status: 'error', message: 'username is required' });
    if (username.length < 3) return res.json({ status: 'error', message: 'username should not be less than 3 characters' });
    if (!password) return res.json({ status: 'error', message: 'password is required' });
    const deviceToken = req.body.deviceToken || '';

    try {
      const userData = await UserModel.findOneAndUpdate({ $or: [{ username }, { email: username }] }, { $set: { deviceToken } }, { new: true });
      if (!userData || userData.status === 'deleted') return res.json({ status: 'error', message: 'user does not exist' });
      if (userData.status === 'suspended') {
        return res.json({ status: 'error', message: 'you have been suspended by the admin' });
      }
      const comparePassword = await userModelMethod.comparePassword(password, userData);
      if (!comparePassword) return res.json({
        status: 'error', message: "Oops! The username or password you enter doesn't work, try again."
      });
      userData.password = undefined;
      return res.json({ status: 'success', message: 'user logged in successfully', user: userData, token: jwtHelper.issueToken(userData._id, deviceToken) });
    } catch (errors) {
      return res.json({ status: 'error', message: 'could not login', errors });
    }
  },
  /**
  * @api {post} /login/facebook User Login by Facebook
  * @apiName Login-Facebook
  * @apiGroup User
  *
  * @apiParam {String} facebookId Users unique facebook Id.
  * @apiParam {String} deviceToken device token of the user's mobile.
  *
  * @apiSuccess {String} status Status of the response.
  * @apiSuccess {String} message Message received from the server.
  * @apiSuccess {Object} user User data of the logged in user.
  * @apiSuccess {String} token Jwt token to authorize user.
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "success",
  *       "message": "user logged in successfully",
  *       "user": {
  *                 "_id": "594b0fe3886b356edc3db92e",
  *                 "updatedAt": "2017-07-05T17:46:33.962Z",
  *                 "createdAt": "2017-06-22T00:31:31.851Z",
  *                 "email": "mangal@mobilyte.com",
  *                 "username": "mangal",
  *                 "facebookId": "",
  *                 "__v": 0,
  *                 "deviceToken": "0597349853 63479nv5455753465 34565952345",
  *                 "status": "active",
  *                 "otpExpiresAt": "2017-06-22T00:30:53.165Z",
  *                 "otp": "",
  *                 "phoneNumber": "",
  *                 "profilePic": "/images/users/594b0fe3886b356edc3db92e/profile-pic/Screenshot-from-2017-04-27-00:34:22.png"
  *               },
  *      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjoiNTk0YjBmZTM4ODZiMzU2ZWRjM2RiOTJlIiwiZXhwIjoxNTMwODEyNzk0LCJpYXQiOjE0OTkyNzY3OTR9.v1nEpR8yXJwqG_H3s3eLLe1VUwhkl2hSREHMm7Lm2FI"
  * }
  *
  * @apiError UserNotFound The id of the User was not found.
  * @apiError FacebookIdRequired FacebookId is required.
  *
  * @apiErrorExample Error-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "error",
  *       "message": "user does not exist"
  *     }
  */
  loginByFacebook: async (req, res) => {
    const facebookId = req.body.facebookId;
    if (!facebookId) return res.json({ status: 'error', message: 'facebookId is required' });
    const email = req.body.email || '';
    const username = req.body.username || '';
    const deviceToken = req.body.deviceToken || '';
    try {
      const userExists = await UserModel.findOneAndUpdate({ facebookId }, { $set: { deviceToken } });
      if (!userExists) {
        return res.json({ status: 'success', message: 'user does not exist' });
      } else {
        if (userExists.status === 'deleted') return res.json({ status: 'error', message: 'user has been deleted' });
        if (userExists.status === 'suspended') {
          return res.json({ status: 'error', message: 'you have been suspended by the admin' });
        }
        return res.json({ status: 'success', message: 'user logged in successfully', user: userExists, token: jwtHelper.issueToken(userExists._id, deviceToken) });
      }
    } catch (errors) {
      return res.json({ status: 'error', message: 'could not login', errors });
    }
  },

  /**
  * @api {post} /register Register a user
  * @apiName Register
  * @apiGroup User
  *
  * @apiParam {String} username Users username.
  * @apiParam {String} password Password field minimum length 8, should have at least 1 number and Capital Alphabet.
  * @apiParam {String} email Users unique email Id.
  *
  * @apiSuccess {String} status Status of the response.
  * @apiSuccess {String} message Message received from the server.
  * @apiSuccess {Object} user User data of the logged in user.
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "success",
  *       "message": "user created successfully",
  *       "user": {
  *                 "__v": 0,
  *                 "updatedAt": "2017-07-05T18:40:31.261Z",
  *                 "createdAt": "2017-07-05T18:40:31.261Z",
  *                 "email": "test@hono.com",
  *                 "username": "testUsername",
  *                 "_id": "595d329fc083236476432193",
  *                 "deviceToken": "",
  *                 "status": "active",
  *                 "otpExpiresAt": "2017-07-05T18:39:41.624Z",
  *                 "otp": "",
  *                 "phoneNumber": "",
  *                 "profilePic": ""
  *               }
  *     }
  *
  * @apiError UsernameExists The username of the User already exists.
  * @apiError EmailExists The email of the User already exists.
  * @apiError PasswordInvalid The password should have atleast 8 characters along with a number and capital alphabet.
  * @apiError UsernameRequired Username field is required.
  * @apiError EmailRequired Email field is required.
  * @apiError PasswordRequired Password field is required.
  *
  * @apiErrorExample Error-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "error",
  *       "message": "could not create user"
  *     }
  */
  register: async (req, res) => {
    const {email, username, password } = req.body;
    if (!email) return res.json({ status: 'error', message: 'email is required' });
    if (!username) return res.json({ status: 'error', message: 'username is required' });
    if (!password) return res.json({ status: 'error', message: 'password is required' });
    const deviceToken = req.body.deviceToken || '';

    const User = new UserModel({
      email,
      password,
      username
    });
    try {
      const user = await User.save();
      const options = {
        subject: 'Welcome To Hono',
        data: {
          url: env.SITEURL + "images/header.jpg",
          username: user.username,
        },
      };
      mailer.sendRegisterMail(email, options, (err) => { });
      return res.json({ status: 'success', message: 'user created successfully', user, token: jwtHelper.issueToken(user._id, deviceToken) });
    } catch (errors) {
      return res.json({ status: 'error', message: 'could not create user', errors });
    }
  },

  /**
  * @api {post} /register Register a user by Facebook
  * @apiName Register-Facebook
  * @apiGroup User
  *
  * @apiParam {String} username Users username.
  * @apiParam {String} facebookId user's facebookId.
  * @apiParam {String} email Users unique email Id.
  *
  * @apiSuccess {String} status Status of the response.
  * @apiSuccess {String} message Message received from the server.
  * @apiSuccess {Object} user User data of the logged in user.
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "success",
  *       "message": "user created successfully",
  *       "user": {
  *                 "__v": 0,
  *                 "updatedAt": "2017-07-05T18:40:31.261Z",
  *                 "createdAt": "2017-07-05T18:40:31.261Z",
  *                 "email": "test@hono.com",
  *                 "facebookId": "r3498543rjthrkjgh32540932432",
  *                 "username": "tstUsername",
  *                 "_id": "595d329fc083236476432193",
  *                 "deviceToken": "",
  *                 "status": "active",
  *                 "otpExpiresAt": "2017-07-05T18:39:41.624Z",
  *                 "otp": "",
  *                 "phoneNumber": "",
  *                 "profilePic": ""
  *               }
  *     }
  *
  * @apiError UsernameExists The username of the User already exists.
  * @apiError EmailExists The email of the User already exists.
  * @apiError FacebookIdExists The facebook id already exists.
  * @apiError UsernameRequired Username field is required.
  * @apiError EmailRequired Email field is required.
  * @apiError FacebookIdRequired facebookId field is required.
  *
  * @apiErrorExample Error-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "error",
  *       "message": "could not create user"
  *     }
  */
  registerFacebook: async (req, res) => {
    const { email, username, facebookId} = req.body;
    if (!email) return res.json({ status: 'error', message: 'email is required' });
    if (!username) return res.json({ status: 'error', message: 'username is required' });
    if (!facebookId) return res.json({ status: 'error', message: 'facebookId is required' });
    const deviceToken = req.body.deviceToken || '';
    const User = new UserModel({
      email,
      username,
      facebookId,
    });
    try {
      const user = await User.save();
      const options = {
        subject: 'Welcome To Hono',
        data: {
          url: env.SITEURL + "images/header.jpg",
          username: user.username,
        },
      };
      mailer.sendRegisterMail(email, options, (err) => { });
      return res.json({ status: 'success', message: 'user created successfully', user, token: jwtHelper.issueToken(user._id, deviceToken) });
    } catch (errors) {
      return res.json({ status: 'error', message: 'could not create user', errors });
    }
  },

  /**
  * @api {post} /change-password Update a user's password
  * @apiName Change Password
  * @apiGroup User
  *
  * @apiParam {String} email User's unique email.
  * @apiParam {String} password User's password.
  *
  * @apiSuccess {String} status Status of the response.
  * @apiSuccess {String} message Message received from the server.
  * @apiSuccess {Object} user Updated user data.
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "success",
  *       "message": "Your password has been updated",
  *     }
  *
  * @apiError EmailRequired Email field is required.
  * @apiError PasswordRequired Password field is required.
  * @apiError UserSuspended User has been suspended by the Admin.
  *
  * @apiErrorExample Error-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "error",
  *       "message": "could not update password"
  *     }
  */
  changePassword: async (req, res) => {
    const { email, password } = req.body;
    const userId = req.userId;
    if (!email) return res.json({ status: 'error', message: 'email is required' });
    if (!password) return res.json({ status: 'error', message: 'password is required' });
    try {
      const user = await UserModel.findOne({ email, _id: userId }, { email: 1, password: 1, status: 1 });
      if (!user || user.status === 'deleted') return res.json({ status: 'error', message: 'user does not exist' });
      if (user.status === 'suspended') {
        return res.json({ status: 'error', message: 'you have been suspended by the admin' });
      }
      user.password = password;
      const userData = user.save();
      return res.json({ status: 'success', message: 'Your password has been updated' });
    } catch (errors) {
      return res.json({ status: 'error', message: 'could not update password', errors });
    }
  },
  /**
  * @api {put} /users Update a user
  * @apiName Update User
  * @apiGroup User
  *
  * @apiParam {String} profilePic User's new Profile Pic.
  *
  * @apiSuccess {String} status Status of the response.
  * @apiSuccess {String} message Message received from the server.
  * @apiSuccess {Object} user Updated user data.
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "success",
  *       "message": "user has been updated",
  *     }
  *
  * @apiError ImageUploadFailed Unable to upload image.
  * @apiError ProfilePicRequired profilePic field is required.
  *
  * @apiErrorExample Error-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "error",
  *       "message": "could not update user"
  *     }
  */
  updateProfile: async (req, res) => {
    const userId = req.userId;
    try {
      const { files } = await asyncBusboy(req, {
        onFile: function (fieldname, file, filename, encoding, mimetype) {
          console.log(filename);
          const imgPath = '/images/users/' + userId + '/profile-pic/';
          const uploadDir = APP_PATH + '/public' + imgPath;
          mkdirp(uploadDir, async (err) => {
            let originalFilename = filename;
            originalFilename = originalFilename.replace(/ /g, '-');
            const userImgPath = imgPath + originalFilename;
            const copyToPath = uploadDir + originalFilename;
            // file.pipe(fs.createWriteStream(copyToPath));

            var fstream = fs.createWriteStream(copyToPath);
            file.pipe(fstream);
            fstream.on('close', function () {
                console.log("Upload Finished of " + filename);
                return res.json({ status: 'success', message: 'user has been updated' });
            });
            var userData = await UserModel.findOneAndUpdate({ _id: userId }, { $set: { profilePic: userImgPath } }, { new: true });
          });
        }
      });
      if (req.headers['content-length'] < 1000) {
        return res.json({ status: 'error', message: 'please provide an image' });
      }
    } catch (errors) {
      return res.json({ status: 'error', message: 'could not update user', errors });
    }
  },

  /**
  * @api {get} /users/:userId get a user
  * @apiName Get user's data
  * @apiGroup User
  *
  * @apiParam {String} userId user's Id.
  *
  * @apiSuccess {String} status Status of the response.
  * @apiSuccess {String} message Message received from the server.
  * @apiSuccess {Object} user user data.
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "success",
  *       "message": "",
  *       "user": {
  *                 "_id": "594c4b02a807180d0ea89f7a",
  *                 "email": "test@hono.com",
  *                 "username": "testUsername",
  *                 "status": "active",
  *                 "profilePic": ""
  *               }
  *     }
  *
  * @apiError UserDoesNotExist Unable to find specified user.
  * @apiError InvalidUserIdRequired Invalid User Id provided.
  *
  * @apiErrorExample Error-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "error",
  *       "message": "could not get user"
  *     }
  */
  getUser: async (req, res) => {
    const userId = req.params.userId;
    try {
      const user = await UserModel.findOne({ _id: userId }, { email: 1, username: 1, profilePic: 1, status: 1 });
      return res.json({ status: 'success', message: '', user });
    } catch (errors) {
      return res.json({ status: 'error', message: 'could not get user', errors });
    }
  },

  /**
  * @api {post} /feedback Post a user's Feedback
  * @apiName Add Feedback
  * @apiGroup User
  *
  * @apiParam {String} feedback user's Feedback.
  *
  * @apiSuccess {String} status Status of the response.
  * @apiSuccess {String} message Message received from the server.
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "success",
  *       "message": "Feedback received",
  *     }
  *
  *
  * @apiErrorExample Error-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "status": "error",
  *       "message": "Could not add feedback"
  *     }
  */
  saveFeedback: async (req, res) => {
    const userId = req.userId;
    const email = req.email;
    const feedback = req.body.feedback;
    if (!feedback) return res.json({ status: 'error', message: 'Feedback is required' });
    try {
      const newFeedback = new FeedbackModel({
        userId,
        message: feedback
      });
      const userFeedback = await newFeedback.save();
      const options = {
        subject: 'New Feedback',
        data: {
          url: env.SITEURL + "images/header.jpg",
          username: req.username,
          message: feedback
        },
      };
      mailer.sendFeedbackMail(email, options, (err) => { });
      return res.json({ status: 'success', message: 'Feedback received' });
    } catch (errors) {
      return res.json({ status: 'error', message: 'Could not add feedback', errors });
    }
  },

  testImageUpload: async (req, res) => {
    const userId = req.userId;
    const sharp = require('sharp');
    let i = 0;
    try {
      const { files } = await asyncBusboy(req, {
        onFile: function (fieldname, file, filename, encoding, mimetype) {
          const imgPath = '/images/users/' + userId + '/test/';
          const uploadDir = APP_PATH + '/public' + imgPath;
          mkdirp(uploadDir, async (err) => {
            let originalFilename = filename;
            originalFilename = originalFilename.replace(/ /g, '-');
            const userImgPath = imgPath + originalFilename;
            const copyToPath = uploadDir + originalFilename;
            // file.pipe(fs.createWriteStream(copyToPath));
            // const childProcess = require('child_process').fork(imageHelper);
            // childProcess.on('message', function(message){
            //   console.log(message);
            // });
            // childProcess.on('error', function(error){
            //   console.log(error.stack);
            // });

            // childProcess.on('exit', function(){
            //   console.log('process exited');
            // });
            // childProcess.send(copyToPath);

            sharp('/hono/trunk/server/public/images/users/596f93884cf34826741717c8/test/IMG_20170724_214555.jpg').resize(500, 281).background({ r: 0, g: 0, b: 0, alpha: 0 })
              .embed().toFile('/hono/trunk/server/public/images/users/596f93884cf34826741717c8/test/IMG_20170724_214555_min.jpg', (err, info) => {
                console.log(err);
                console.log(info);
              })
            i++;
            return res.json({ status: 'success', message: 'user has been updated' });
          });
        }
      });
      if (!files && (i === 0)) {
        return res.json({ status: 'error', message: 'profilePic is required' });
      }
    } catch (errors) {
      console.log(errors);
      return res.json({ status: 'error', message: 'could not update user', errors });
    }
  },

  forgotPassword: async (req, res) => {
    const email = req.body.email;
    if (!email) return res.json({ status: 'error', message: 'Email is required' });
    try {
      let newPassword = await commonHelper.generateNewPassword();
      const user = await UserModel.findOne({ email, status: 'active' });
      if (!user) return res.json({ status: 'error', message: 'user not found' });
      user.password = newPassword;
      await user.save();
      const options = {
        subject: 'Forgot your password',
        data: {
          url: env.SITEURL + "images/header.jpg",
          password: newPassword,
          username: user.username
        },
      };
      await mailer.sendForgotMail(email, options, (err) => {
        if (err) return res.json({ status: 'error', message: 'Could not send email' });
        else return res.json({ status: 'success', message: 'A temporary password has been sent to your email address' });
      });
    } catch (errors) {
      return res.json({ status: 'error', message: 'could not update user', errors });
    }
  },

};
