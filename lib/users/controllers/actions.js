const cryptoJs = require("crypto-js");

const { functionsIn } = require("lodash");
const axios = require("axios");
const db = require("datastore");

const API_BASE = "https://app.srt-wallet.io/";

/* jshint -W079 */
const Promise = require("bluebird"),
    config = require("config"),
    log = require("metalogger")(),
    representor = require("kokua"),
    _ = require("lodash");

const Users = require("users/models/users");
const actions = {},
    model = new Users();

const responseMediaType = "application/hal+json";

actions.getUser = async function(req, res, next) {
    let response = { status: "ok" };
    let userList = await model.getUsersDesc();
    response.users = userList;

    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);

    res.set('Content-Type', responseMediaType)
        .status(200)
        .json(response);
};

actions.registerUser = async function(req, res, next) {
    const conn = await db.conn();

    try {
        const dupQurey = { email: req.body.email };
        const duplicateValue = await conn.query(
            "SELECT count(*) FROM users WHERE ?",
            dupQurey
        );
        if (duplicateValue[0]["count(*)"] > 0) {
            const response = { status: "failed" };
            response.body = res.body;
            res.status(500).json(response);
            return;
        }
    } catch (error) {
        log.error(error);
        const response = { status: "failed" };
        response.body = res.body;
        res.status(500).json(response);
        return;
    }

    const header = { HOST: "srt-wallet.io" }; // Create Wallets
    let addrData = await axios
        .post(API_BASE + "wallet/create_account")
        .catch(function(error) {
            log.error(error);
            const response = { status: "failed" };
            response.body = res.body;
            res.status(500).json(response);
            return;
        });

    try {
        const insertValue = {
            name: req.body.name,
            phonenumer: req.body.phonenum,
            email: req.body.email,
            password: req.body.password,
            wallet_address: addrData.data.addr,
            mnemonic: addrData.data.seed,
            privateKey: addrData.data.pk,
            uuid: "ToDo",
        };

        await conn.query("INSERT INTO users SET ?", insertValue);
    } catch (err) {
        log.error(err);
        const response = { status: "failed" };
        response.body = res.body;
        res.status(500).json(response);
        return;
    }

    const response = { status: "ok" };
    response.body = res.body;
    res.status(200).json(response);
};

actions.deligate = async function(req, res, next) {
    const response = { status: "ok" };
    response.req = req.body;
    res.status(200).json(response);
};

actions.login = async function(req, res, next) {
    const conn = await db.conn();
    try {
        const loginQuery = { email: req.body.login };
        const query = await conn.query("SELECT * FROM users WHERE ?", loginQuery);

        log.error(query);
        if (query[0]["password"] === req.body.password) {
            const response = { status: "ok", seed: query[0]["mnemonic"] };
            response.req = req.body;
            res.set({
                "x-amzn-remapped-authorization": cryptoJs.AES.encrypt(
                    query[0]["mnemonic"],
                    query[0]["password"]
                ).toString(),
            });
            res.status(200).json(response);
            return;
        }

        const response = { status: "failed" };
        response.body = res.body;
        res.status(401).json(response);
        return;
    } catch (err) {
        log.error(err);
        const response = { status: "failed" };
        response.body = res.body;
        res.status(401).json(response);
        return;
    }
};

actions.getbalance = async function(req, res, next) {
    try {
        const users = await model.getUser(req.query.id);

        if (users.length == 0) {
            resErrorMessege(res);
            return
        }

        token = cryptoJs.AES.encrypt(
            users[0]["mnemonic"],
            users[0]["password"]
        ).toString();

        if (users[0].balance == 0) {
            const balance = await axios.get(API_BASE + "wallet/balanceof", {
                params: { addr: users[0]["wallet_address"] },
            });

            await model.UpdateBalance(users[0]["wallet_address"], balance.data.balance);
        }

        const response = {
            status: "ok",
            balance: users[0]['balance'],
            addr: users[0]["wallet_address"],
        };
        res.set({
            "x-amzn-remapped-authorization": token,
        });

        res.status(200).json(response);
    } catch (error) {
        log.error(error);
        const response = { status: "failed" };
        response.body = res.body;
        res.status(500).json(response);
        return;
    }
};

actions.regUserFirebase = async function(req, res, next) {
    const emailVal = req.body.email;
    const passwdVal = req.body.passwd;

    createUserWithEmailAndPassword(auth, emailVal, passwdVal)
        .then((userCredential) => {
            const user = userCredential.user;

            user
                .getIdToken()
                .then(async function(idToken) {
                    const userQuery = [user.uid, emailVal, passwdVal];
                    const conn = await db.conn();
                    const query = await conn.query(
                        "UPDATE users SET uuid=? WHERE email=? AND password = ?",
                        userQuery
                    );

                    return idToken;
                })
                .then(function(token) {
                    res.set({
                        "x-amzn-remapped-authorization": token,
                    });
                    let response = { status: "Success" };

                    res.status(200).json(response);
                    return;
                })
                .catch((error) => {
                    let response = { status: "UnknownError" };
                    res.status(500).json(response);
                    log.error(error);
                    return;
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            let response = { status: "UnknownError" };
            if (errorCode === "auth/email-already-in-use") {
                response = { status: "AlreadyInUse" };
            } else {
                response = {
                    status: errorCode,
                };
            }

            log.error("Error : " + errorCode);
            log.error("Msg :: " + errorMessage);
            res.status(500).json(response);

            return;
        });

    res.status(200);
};

actions.transferFromUser = async function(req, res, next) {
    const addr = req.body.addr;
    const amountVal = req.body.amount;
    const apkVal = req.body.pk;

    const conn = await db.conn();
    const queryVal = { wallet_address: addr };
    const userList = await conn.query(
        "SELECT * FROM users WHERE UPPER() LIKE (?)",
        queryVal
    );

    let result = await axios
        .post(API_BASE + "wallet/transferFromAdmin", {
            addr: userList[0]["wallet_address"],
            amountVal: amount,
            pk: userList[0]["privateKey"],
            apk: apkVal,
        })
        .catch(function(error) {
            log.error(error);
            const response = { status: "failed" };
            response.body = res.body;
            res.status(500).json(response);
            return;
        });

    let response = { status: "ok" };
    res.status(200).json(response);
};

actions.updatepassword = async function(req, res, next) {
    try {
        const addr = req.body.addr;
        const newpasswd = req.body.newpasswd;

        model.OverwriteUserPassword(addr, newpasswd)
        let response = { status: "ok" };
        res.status(200).json(response);

    } catch (error) {
        log.error(error);
        const response = { status: "failed" };
        response.body = res.body;
        res.status(500).json(response);
        return;
    }
};

actions.approveUser = async function(req, res, next) {
    try {
        const toAddr = req.body.toAddr;
        const pk = req.body.pk;

        const conn = await db.conn();
        log.error(toAddr);
        log.error(pk);

        const keyQuery = { "wallet_address": toAddr };
        const query = await conn.query("SELECT * FROM users WHERE ?", keyQuery);
        log.error("query" + query);

        const res = await axios.post(API_BASE + "wallet/approve", {
            toAddr: toAddr,
            pk: pk,
            toPk: query[0]["privateKey"],
        });

        let response = { status: "ok" };
        res.status(200).json(response);
    } catch (error) {
        log.error(error);
        const response = { status: "failed" };
        response.body = res.body;
        res.status(500).json(response);
        return;
    }
};

actions.updatebalances = async function(req, res, next) {
    userList = await model.getUsersDesc();

    try {
        for (const user in userList) {
            const address = user["wallet_address"];
            const balance = await axios.get(API_BASE + "wallet/balanceof", {
                params: { addr: address },
            });

            await model.UpdateBalance(address, balance);

            log.info(`Update Balance : ${balance} Address : ${address}`);
        }
    } catch (error) {
        log.error(error);
        const response = { status: "failed" };
        response = representor(response, responseMediaType);

        res.set('Content-Type', responseMediaType)
            .status(500)
            .json(response);

        return;
    }

    const response = { status: "ok" };

    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);

    res.set('Content-Type', responseMediaType)
        .status(200)
        .json(response);
}

function resErrorMessege(res) {
    const response = { status: "ok" };

    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);

    res.set('Content-Type', responseMediaType)
        .status(404)
        .json(response);
}


module.exports = actions