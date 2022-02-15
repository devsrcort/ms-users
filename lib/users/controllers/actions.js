const cryptoJs = require('crypto-js');

const { functionsIn } = require('lodash');
const axios = require('axios');
const db = require("datastore");

const API_BASE = 'https://app.srt-wallet.io/';

/* jshint -W079 */
const Promise = require('bluebird'),
    config = require('config'),
    log = require('metalogger')(),
    representor = require('kokua'),
    _ = require('lodash');

const actions = {};

const responseMediaType = 'application/hal+json';

actions.getUser = async function(req, res, next) {

    const conn = await db.conn();
    console.log(req.query);
    const pagenum = req.query.page === '0' ? 1 : parseInt(req.query.page);
    const response = { "status": "ok" };
    // const userList = await conn.query("SELECT * FROM users ORDER BY id DESC LIMIT " + (pagenum - 1) * 50 + ", 50");
    const userList = await conn.query("SELECT * FROM users ORDER BY id DESC");

    userList.forEach(item => async function() {
        let balance = await axios.get(
            API_BASE + 'wallet/balanceof', { "params": { "addr": item['wallet_address'] } }
        ).catch(function(error) {
            console.log(error);
            const response = { "status": "failed" };
            response.body = res.body;
            res.status(500).json(response);
            return;
        });

        item['balance'] = balance.data.balance;
    })
    response.users = userList;

    res.status(200).json(response)
};

actions.registerUser = async function(req, res, next) {

    const conn = await db.conn();

    try {
        const dupQurey = { email: req.body.email };
        const duplicateValue = await conn.query("SELECT count(*) FROM users WHERE ?", dupQurey);
        if (duplicateValue[0]['count(*)'] > 0) {
            const response = { "status": "failed" };
            response.body = res.body;
            res.status(500).json(response);
            return;
        }
    } catch (error) {
        console.log(error);
        const response = { "status": "failed" };
        response.body = res.body;
        res.status(500).json(response);
        return;
    }

    const header = { 'HOST': "srt-wallet.io" } // Create Wallets
    let addrData = await axios.post(
        API_BASE + 'wallet/create_account'
    ).catch(function(error) {
        console.log(error);
        const response = { "status": "failed" };
        response.body = res.body;
        res.status(500).json(response);
        return;
    })


    try {
        const insertValue = { name: req.body.name, phonenumer: req.body.phonenum, email: req.body.email, password: req.body.password, wallet_address: addrData.data.addr, mnemonic: addrData.data.seed, privateKey: addrData.data.pk };
        const result = await conn.query('INSERT INTO users SET ?', insertValue);

    } catch (err) {
        console.log(err);
        const response = { "status": "failed" };
        response.body = res.body;
        res.status(500).json(response);
        return;
    }

    const testValue = await conn.query("SELECT * FROM users");
    console.log(testValue);

    const response = { "status": "ok" };
    response.body = res.body;
    res.status(200).json(response);
};

actions.deligate = async function(req, res, next) {

    const response = { "status": "ok" };
    response.req = req.body;
    res.status(200).json(response);
};

actions.login = async function(req, res, next) {
    const conn = await db.conn();
    try {
        const loginQuery = { email: req.body.login };
        const query = await conn.query("SELECT * FROM users WHERE ?", loginQuery);

        console.log(query);
        if (query[0]['password'] === req.body.password) {
            const response = { "status": "ok", "seed": query[0]['mnemonic'] };
            response.req = req.body;
            res.set({
                'x-amzn-remapped-authorization': cryptoJs.AES.encrypt(query[0]['mnemonic'], query[0]['password']).toString()
            });
            res.status(200).json(response);
            return;
        }

        const response = { "status": "failed" };
        response.body = res.body;
        res.status(401).json(response);
        return;

    } catch (err) {
        console.log(err);
        const response = { "status": "failed" };
        response.body = res.body;
        res.status(401).json(response);
        return;
    }
};

actions.getbalance = async function(req, res, next) {

    const header = { 'HOST': "srt-wallet.io" } // Create Wallets

    const conn = await db.conn();

    try {
        const query = { email: req.query.id };
        const addrVal = await conn.query("SELECT * FROM users WHERE ?", query);

        token = cryptoJs.AES.encrypt(addrVal[0]['mnemonic'], addrVal[0]['password']).toString();
        // console.log(req.get('Authorization'));
        // console.log(token);
        // if (req.get('Authorization') != token) {
        //     console.log(req.get('Authorization'));
        //     console.log(token);
        //     const response = { "status": "failed" };
        //     response.body = res.body;
        //     res.status(500).json(response);
        //     return;
        // }

        let balance = await axios.get(
            API_BASE + 'wallet/balanceof', { "params": { "addr": addrVal[0]['wallet_address'] } }
        ).catch(function(error) {
            console.log(error);
            const response = { "status": "failed" };
            response.body = res.body;
            res.status(500).json(response);
            return;
        })

        const response = { "status": "ok", "balance": balance.data.balance, "addr": addrVal[0]['wallet_address'] };
        res.set({
            'x-amzn-remapped-authorization': token
        });

        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        const response = { "status": "failed" };
        response.body = res.body;
        res.status(500).json(response);
        return;
    }
};


module.exports = actions;