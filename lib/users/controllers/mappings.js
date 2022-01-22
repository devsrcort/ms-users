const { spieler, check, matchedData, sanitize } = require('spieler')();

const router = require('express').Router({ mergeParams: true });
const actions = require('./actions');

const log = require("metalogger")();

const userValidation = check('users',
        'flight_no must be at least 3 chars long and contain letters and numbers')
    .exists()
    .isLength({ min: 3 })
    .matches(/[a-zA-Z]{1,4}\d+/);

const registerValidation = check('departure_date_time',
        'departure_date_time must be in YYYY-MM-ddThh:mm format')
    .exists()
    .matches(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);

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
router.get('/register', registerValidation, actions.registerUser);
router.get('/deligate', registerValidation, actions.deligate);

module.exports = router;