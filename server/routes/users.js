var express = require('express');
var router = express.Router();

const userController = require('../controllers/UserController');
const authentication = require('../middlewares/userToken');
const passwordValidation = require('../middlewares/passwordValidation');

/* GET users listing. */
router.post('/login', userController.login);
router.post('/login/facebook', userController.loginByFacebook);
router.post('/register', passwordValidation, userController.register);
router.post('/register/facebook', userController.registerFacebook);
router.put('/users', authentication, userController.updateProfile);
router.get('/users/:userId', authentication, userController.getUser);
router.post('/change-password', authentication, passwordValidation, userController.changePassword);
router.post('/test-upload', authentication, userController.testImageUpload);
router.post('/forgot-password', userController.forgotPassword);
module.exports = router;
