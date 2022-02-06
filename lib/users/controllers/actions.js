const { functionsIn } = require('lodash');
const axios = require('axios');
const db = require("datastore");

const API_BASE = 'http://srt-wallet.io/';

/* jshint -W079 */
const Promise = require('bluebird'),
    config = require('config'),
    log = require('metalogger')(),
    representor = require('kokua'),
    _ = require('lodash');

const actions = {};

const responseMediaType = 'application/hal+json';

actions.getUser = async function(req, res, next) {

    const response = { "status": "ok" };
    response.req = req.body;
    res.status(200).json(response);
};

actions.registerUser = async function(req, res, next) {

    const header = { 'HOST': "srt-wallet.io" } // Create Wallets
    let addrData = await axios.post(
        API_BASE + 'wallet/create_account'
    ).catch(function(error) {
        console.log(error);
    })

    console.log(addrData.data);

    const conn = await db.conn();
    console.log("Success Conn");
    try {
        const insertValue = { name: req.body.name, phonenumer: req.body.phonenum, email: req.body.email, password: req.body.password, wallet_address: addrData.data.addr, mnemonic: addrData.data.seed, privateKey: addrData.data.pk };
        const result = await conn.query('INSERT INTO users SET ?', insertValue);

    } catch (err) {
        console.log(err);
    }

    const testValue = await conn.query("SELECT * FROM users");
    console.log(testValue);

    const response = { "status": "ok" };
    response.body = res.body;
    res.status(200).json(response);
    console.log("Done");

};

actions.deligate = async function(req, res, next) {

    const response = { "status": "ok" };
    response.req = req.body;
    res.status(200).json(response);
};

actions.login = async function(req, res, next) {
    const response = { "status": "ok" };
    response.req = req.body;
    res.status(200).json(response);
};

actions.getbalance = async function(req, res, next) {
    const response = { "status": "ok" };
    response.req = req.body;
    res.status(200).json(response);
};


module.exports = actions;