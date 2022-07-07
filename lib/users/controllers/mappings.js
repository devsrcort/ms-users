const { spieler, check, matchedData, sanitize } = require('spieler')();

const router = require('express').Router({ mergeParams: true });

const log = require("metalogger")();
const { isLoggedIn, isNotLoggedIn, verifyToken, adminCheck } = require('routes/middlewares');

router.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

const actions = require('./actions');

const addUserValidation = spieler([
    check('name').exists().withMessage('name met be provied')
    .trim(),

    check('phonenumber').exists().withMessage('phonenumber met be provied')
    .isLength({ min: 11 })
    .trim(),

    check("email").exists().withMessage('email must be provided')
    .isEmail().withMessage('email format is invalid')
    .trim().normalizeEmail(),
]);

const deligateValidation = spieler([
    check('wallet_address').exists().withMessage('wallet address must be provied')
    .trim()
]);

const userValidator = spieler([

]);

const addUserValidator = spieler([
    addUserValidation,
    //dateTimeValidation
]);

const deligateValidator = spieler([
    deligateValidation
]);

const adminValidator = spieler([
    check("adminPw").exists().withMessage("adminPw met be provied").trim(),
]);

router.get('/', userValidator, actions.getUser);
router.get('/deligate', userValidator, actions.deligate);
router.get('/getuser', userValidator, actions.getUser);
router.post('/transferFromUser', userValidator, actions.transferFromUser);
router.post('/updatepassword', userValidator, actions.updatepassword);
router.post('/resetUserPassword', userValidator, actions.resetUserPassword);
router.post('/approveUser', userValidator, actions.approveUser);

// User Function
router.get('/getbalance', verifyToken, actions.getbalance);
router.get('/getUserInfo', verifyToken, actions.getUserInfo);
router.post('/register', isNotLoggedIn, actions.registerUser);
router.post('/login', isNotLoggedIn, actions.login);
router.get('/getTokenPrice', actions.getTokenPrice);
router.post('/sendTokenByClient', verifyToken, actions.sendTokenByClient);

// Create Timer
router.post('/createTimer', actions.createTimer);
router.get('/getTimer', actions.getTimer);
router.post('/removeTimer', actions.removeTimer);

// Admin Func
// Temporary
router.get('/updatebalances', userValidator, actions.updatebalances);
router.post('/getPkByEmail', adminValidator, adminCheck, actions.getPkByEmail);
router.post('/updateEmail', adminValidator, adminCheck, actions.updateEmail);
router.post('/deleteUserByAdmin', adminValidator, adminCheck, actions.deleteUserByAdmin);
router.post('/deleteUserByAddr', adminValidator, adminCheck, actions.deleteUserByAddr);

// router.post('/regUserFirebase', userValidator, actions.regUserFirebase);

// Email
router.get('/sendEmailResetPasswd', actions.sendEmailResetPasswd);
router.get('/updatePasswdByMail', actions.updatePasswdByUser);
router.get('/updatePasswdByToken', actions.updatePasswdByToken);

module.exports = router;