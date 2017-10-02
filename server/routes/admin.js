const express = require('express');

const router = express.Router();
const adminController = require('../controllers/AdminController.js');
const settingController = require('../controllers/SettingController.js');
const Authentication = require(APP_PATH + '/middlewares/admin_TokenAuth.js');
const spaceController = require('../controllers/SpaceController');

router.post('/login', adminController.login);
// router.post('/register', adminController.Usersave);
router.post('/account-confirm/:otp', adminController.confirmAdminAccount);
router.post('/change-password', Authentication, adminController.changePassword);
router.get('/admin/:id', Authentication, adminController.getAdminDetail);
router.put('/admin', Authentication, adminController.updateAdmin);
router.post('/updateimg', Authentication, adminController.updateProfile);
router.post('/forgot-password', adminController.sendPasswordLink);
router.post('/reset-password', adminController.resetPassword);

router.post('/settings', Authentication, settingController.SpaceTypesave);
router.put('/settings', Authentication, settingController.updateSpaceType);
router.get('/settings', Authentication, settingController.getSpacelist);
router.get('/settings/:id', Authentication, settingController.getSingleSpaceType);
router.get('/settings-delete/:id', Authentication, settingController.deleteSpaceType);

router.get('/feedback', Authentication, adminController.getFeedback);
router.get('/dashboard', Authentication, adminController.getDashboardData);

router.get('/users', Authentication, adminController.getUsers);
router.get('/users/:userId', Authentication, adminController.getUser);
router.post('/users/:userId/suspend', Authentication, adminController.suspendUser);
router.post('/users/:userId/activate', Authentication, adminController.activateUser);

router.get('/spaces', Authentication, adminController.getSpaces);
router.get('/spaces/:spaceId', Authentication, adminController.getSpace);
router.get('/spaces/:spaceId/posts', Authentication, adminController.getAllPostsInSpace);
router.post('/spaces/:spaceId/posts', Authentication, adminController.addPost);
router.put('/spaces/:spaceId', Authentication, spaceController.updateSpace);
router.post('/space-delete', Authentication, adminController.deleteSpace);

router.get('/posts', Authentication, adminController.getAllPosts);
router.get('/posts/:postId', Authentication, adminController.getPost);
router.put('/posts/:postId', Authentication, adminController.updatePost);
router.post('/post-delete', Authentication, adminController.deletePost);
router.get('/posts/:postId/comments', Authentication, adminController.getComments);
router.post('/posts/:postId/comments/:commentId', Authentication, adminController.deleteComment);
router.post('/posts/:postId/comments', adminController.addComment);

//router.post('/posts', authentication, adminController.addPost);

module.exports = router;
