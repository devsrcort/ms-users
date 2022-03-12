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

// Import the functions you need from the SDKs you need
// /var admin = require("firebase-admin");

// var serviceAccount = require("path/to/serviceAccountKey.json");

//admin.initializeApp({
// credential: admin.credential.cert(serviceAccount),
// });

// const { initializeApp } = require("firebase/app");
// const {
//     getAuth,
//     createUserWithEmailAndPassword,
//     verifyIdToken,
// } = require("firebase/auth");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: config.firebase.apiKey,
//     authDomain: config.firebase.authDomain,
//     projectId: config.firebase.projectId,
//     storageBucket: config.firebase.storageBucket,
//     messagingSenderId: config.firebase.messagingSenderId,
//     appId: config.firebase.appId,
// };

// // Initialize Firebase
// const auth = getAuth();

const actions = {};

const responseMediaType = "application/hal+json";

actions.getUser = async function(req, res, next) {
    const conn = await db.conn();
    console.log(req.query);
    const pagenum = req.query.page === "0" ? 1 : parseInt(req.query.page);
    const response = { status: "ok" };
    const userList = await conn.query("SELECT * FROM users ORDER BY id DESC");

    userList.forEach(
        (item) =>
        async function() {
            let balance = await axios
                .get(API_BASE + "wallet/balanceof", {
                    params: { addr: item["wallet_address"] },
                })
                .catch(function(error) {
                    console.log(error);
                    const response = { status: "failed" };
                    response.body = res.body;
                    res.status(500).json(response);
                    return;
                });

            item["balance"] = balance.data.balance;
        }
    );
    response.users = userList;

    res.status(200).json(response);
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
        console.log(error);
        const response = { status: "failed" };
        response.body = res.body;
        res.status(500).json(response);
        return;
    }

    const header = { HOST: "srt-wallet.io" }; // Create Wallets
    let addrData = await axios
        .post(API_BASE + "wallet/create_account")
        .catch(function(error) {
            console.log(error);
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
        const result = await conn.query("INSERT INTO users SET ?", insertValue);
    } catch (err) {
        console.log(err);
        const response = { status: "failed" };
        response.body = res.body;
        res.status(500).json(response);
        return;
    }

    const testValue = await conn.query("SELECT * FROM users");
    console.log(testValue);

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

        console.log(query);
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
        console.log(err);
        const response = { status: "failed" };
        response.body = res.body;
        res.status(401).json(response);
        return;
    }
};

actions.getbalance = async function(req, res, next) {
    const header = { HOST: "srt-wallet.io" }; // Create Wallets

    const conn = await db.conn();

    try {
        const query = { email: req.query.id };
        const addrVal = await conn.query("SELECT * FROM users WHERE ?", query);

        token = cryptoJs.AES.encrypt(
            addrVal[0]["mnemonic"],
            addrVal[0]["password"]
        ).toString();
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

        let balance = await axios
            .get(API_BASE + "wallet/balanceof", {
                params: { addr: addrVal[0]["wallet_address"] },
            })
            .catch(function(error) {
                console.log(error);
                const response = { status: "failed" };
                response.body = res.body;
                res.status(500).json(response);
                return;
            });

        const response = {
            status: "ok",
            balance: balance.data.balance,
            addr: addrVal[0]["wallet_address"],
        };
        res.set({
            "x-amzn-remapped-authorization": token,
        });

        res.status(200).json(response);
    } catch (error) {
        console.log(error);
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
                    console.log(error);
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

            console.log("Error : " + errorCode);
            console.log("Msg :: " + errorMessage);
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
            console.log(error);
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
        const newpasswd = req.body.newpasswd;
        const name = req.body.name;
        const addr = req.body.addr;

        const conn = await db.conn();
        const query =
            'UPDATE users SET password = "' +
            cryptoJs.MD5(newpasswd).toString() +
            '" WHERE wallet_address = "' +
            addr +
            '"';
        const user = await conn.query(query);

        let response = { status: "ok" };
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
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
            toPk: userList[0]["privateKey"],
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

module.exports = actions;