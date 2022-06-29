const { spieler, check, matchedData, sanitize } = require('spieler')();

const router = require('express').Router({ mergeParams: true });
router.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
const actions = require('./actions');

const log = require("metalogger")();
const { isLoggedIn, isNotLoggedIn } = require('routes/middlewares');

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


router.get('/', userValidator, actions.getUser);
router.get('/deligate', userValidator, actions.deligate);
router.get('/getuser', userValidator, actions.getUser);
router.post('/transferFromUser', userValidator, actions.transferFromUser);
router.post('/updatepassword', userValidator, actions.updatepassword);
router.post('/resetUserPassword', userValidator, actions.resetUserPassword);
router.post('/approveUser', userValidator, actions.approveUser);

// User Function
router.get('/getbalance', actions.getbalance);
router.get('/getUserInfo', actions.getUserInfo);
router.post('/register', isNotLoggedIn, actions.registerUser);
router.post('/login', isNotLoggedIn, actions.login);
router.get('/getTokenPrice', actions.getTokenPrice);

// Admin Func
// Temporary
router.get('/updatebalances', userValidator, actions.updatebalances);
router.post('/getPkByEmail', actions.getPkByEmail);
router.post('/updateEmail', actions.updateEmail);
router.post('/deleteUserByAdmin', actions.deleteUserByAdmin);
router.post('/deleteUserByAddr', actions.deleteUserByAddr);

// router.post('/regUserFirebase', userValidator, actions.regUserFirebase);

// Email
router.get('/sendEmailResetPasswd', actions.sendEmailResetPasswd);
router.get('/updatePasswdByMail', actions.updatePasswdByUser);
router.get('/updatePasswdByToken', actions.updatePasswdByToken);

module.exports = router;