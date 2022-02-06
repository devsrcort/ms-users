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

    // const header = { 'HOST': "srt-wallet.io" } // Create Wallets
    // axios({
    //     method: "POST",
    //     url: API_BASE + 'wallet/create_account',
    //     headers: header
    // }).then(function a(res) {
    //     console.log("Success to create wallet");
    //     console.log(res);
    // }).catch(function(error) {
    //     console.log(error);
    // })


    const conn = await db.conn();
    console.log("Success Conn");
    const insertValue = { name: req.body.name, phonenumer: req.body.phonenum, email: req.body.email, password: req.body.password };
    const result = await conn.query('INSERT INTO users SET ?', insertValue, function(error, results, fiedls) { if (error) console.log(error) });
    console.log("Success Query");
    conn.commit();
    console.log("Success Commit");

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