const { spieler, check, matchedData, sanitize } = require('spieler')();

const router = require('express').Router({ mergeParams: true });
const actions = require('./actions');

const log = require("metalogger")();

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
router.post('/login', userValidator, actions.login);
router.post('/register', userValidator, actions.registerUser);
router.get('/deligate', userValidator, actions.deligate);
router.get('/getbalance', userValidator, actions.getbalance);
router.get('/getuser', userValidator, actions.getUser);

module.exports = router;