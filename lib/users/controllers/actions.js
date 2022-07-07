const path = require("path");
const cryptoJs = require("crypto-js");
const axios = require("axios");

const { functionsIn } = require("lodash");
const db = require("datastore");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const sendMail = require("users/services/mailService");
const TimerService = require("users/services/timerService");

const API_BASE =
    process.env.NODE_ENV == "production" ?
    "https://app.srt-wallet.io/" :
    "https://app.dev.srt-wallet.io/";

/* jshint -W079 */
const Promise = require("bluebird"),
    config = require("config"),
    log = require("metalogger")(),
    representor = require("kokua"),
    _ = require("lodash");

const Users = require("users/models/users");
const actions = {},
    model = new Users(),
    timerService = new TimerService();

const responseMediaType = "application/hal+json";

actions.getUser = async function(req, res, next) {
    let response = { status: "ok" };
    const userList = await model.getUsersDesc();
    response.users = userList;

    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.registerUser = async function(req, res, next) {
    try {
        const isExistUser = await model.isExistsUser(
            req.body.email,
            req.body.phonenum
        );
        if (isExistUser) {
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

    const addrData = await axios
        .post(API_BASE + "wallet/create_account")
        .catch(function(error) {
            log.error(error);
            const response = { status: "failed" };
            response.body = res.body;
            res.status(500).json(response);
            return;
        });

    try {
        await model.addUser(
            req.body.name,
            req.body.phonenum,
            req.body.email,
            req.body.password,
            addrData.data.addr,
            addrData.data.seed,
            addrData.data.pk,
            "ToDo",
            "0"
        );
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
    passport.authenticate(
        "local", { session: false },
        (authError, user, info) => {
            if (authError) {
                log.error(authError);
                const response = { status: "AuthFailed" };
                return res.status(401).send(response);
            }
            if (!user) {
                const response = { status: "NoUser" };
                return res.status(401).send(response);
            }

            return req.login(user, (loginError) => {
                if (loginError) {
                    log.error(loginError);
                    const response = { status: "AuthFailed" };
                    return res.status(401).send(response);
                }

                const token = jwt.sign({
                        id: user["email"],
                        address: user["wallet_address"],
                    },
                    process.env.JWT_SECRET, { expiresIn: "60m", issuer: "SRT" }
                );

                const response = { status: "OK", seed: "SRTDummy", token: token };
                return res.status(200).send(response);
            });
        }
    )(req, res, next);
};

actions.getUserInfo = async function(req, res, next) {
    const users = await model.getUser(req.query.id);
    const token = jwt.sign({
            id: users[0]["email"],
            address: users[0]["wallet_address"],
        },
        process.env.JWT_SECRET, { expiresIn: "60m", issuer: "SRT" }
    );

    const destTime = await timerService.getTimer("NearPolarPrivateSale");
    const dummyAddr = process.env.NODE_ENV == 'production' ?
        "0xD7D93495bd5e84d91Ef6c5769992865620A95DF8" :
        "0xfd6D98Be3Ac00C251Da66F9874D2cda378F5Cb8F";
    const dummyAmt = "1000";
    const dummyFee = "600";

    const transferFee = await axios
        .post(API_BASE + "wallet/getTransferFee", {
            fromAddr: users[0]["wallet_address"],
            toAddr: dummyAddr,
            amount: dummyAmt,
            fee: dummyFee
        })
        .catch((err) => {
            log.error(err);
        });

    res.header("Authorization", token);
    const response = {
        status: "ok",
        balance: users[0]["balance"],
        addr: users[0]["wallet_address"],
        name: users[0]["name"],
        email: users[0]["email"],
        phonenumber: users[0]["phonenumer"],
        destDateTime: destTime[0]["destTime"].toISOString(),
        transferFee: transferFee,
        token: token,
    };

    res.status(200).json(response);
};

actions.getbalance = async function(req, res, next) {
    try {
        let tBalance = "0";
        log.info(`Id : ${req.query.id}`);
        const users = await model.getUser(req.query.id);
        log.info(users.length);

        const user = users[0];
        log.info(user);
        const tAddress = user["wallet_address"];

        log.info(API_BASE + "wallet/balanceof");
        log.info(tAddress);

        const balance = await axios
            .get(API_BASE + "wallet/balanceof", {
                params: { addr: tAddress },
            })
            .catch((err) => {
                log.error(err);
            });

        tBalance = balance.data.balance;
        await model.UpdateBalanceByWallet(tAddress, balance.data.balance);

        const token = jwt.sign({
                id: user["email"],
                address: user["wallet_address"],
            },
            process.env.JWT_SECRET, { expiresIn: "60m", issuer: "SRT" }
        );

        res.header("Authorization", token);
        const response = {
            status: "ok",
            balance: tBalance,
            addr: tAddress,
            token: token,
        };

        res.status(200).json(response);
    } catch (error) {
        log.error(error.message);
        const response = { status: "failed" };
        res.status(500).json(response);
        return;
    }
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

    const result = await axios
        .post(API_BASE + "wallet/transferFromAdmin", {
            addr: userList[0]["wallet_address"],
            amountVal: amountVal,
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

    const response = { status: "ok" };
    res.status(200).json(response);
};

actions.updatepassword = async function(req, res, next) {
    try {
        const addr = req.body.addr;
        const newpasswd = req.body.newpasswd;

        await model.OverwriteUserPassword(addr, newpasswd);
        const response = { status: "ok" };
        res.status(200).json(response);
    } catch (error) {
        log.error(error);
        const response = { status: "failed" };
        response.body = res.body;
        res.status(500).json(response);
        return;
    }
};

actions.resetUserPassword = async function(req, res, next) {
    try {
        const addr = req.body.addr;
        const newpasswd = req.body.newpasswd;

        await model.OverwriteUserPassword(addr, newpasswd);
        const response = { status: "ok" };
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

        const keyQuery = { wallet_address: toAddr };
        const query = await conn.query("SELECT * FROM users WHERE ?", keyQuery);
        log.error("query" + query);

        const res = await axios.post(API_BASE + "wallet/approve", {
            toAddr: toAddr,
            pk: pk,
            toPk: query[0]["privateKey"],
        });

        const response = { status: "ok" };
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
    const userList = await model.getUsersDesc();

    try {
        for (const user in userList) {
            const address = userList[user]["wallet_address"];
            const balance = await axios
                .get(API_BASE + "wallet/balanceof", {
                    params: { addr: address },
                })
                .catch(function(error) {
                    log.error(error);
                    resErrorMessege(res);
                    return;
                });

            await model.UpdateBalanceByWallet(address, balance.data.balance);
            log.info(`Update Balance: ${balance} :: Address: ${address}`);
        }
    } catch (error) {
        log.error(error);
        let response = { status: "failed" };
        response = representor(response, responseMediaType);

        res.set("Content-Type", responseMediaType).status(500).json(response);

        return;
    }

    let response = { status: "ok" };

    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.getPkByEmail = async function(req, res, next) {
    const addr = req.body.addr;
    const pw = req.body.pw;

    const userList = await model.GetPkByAddress(addr);

    let pk = "";

    if (userList.length != 0) {
        pk = userList[0]["privateKey"];
    }

    let response = { status: "ok" };
    response.pk = pk;

    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.getPkByEmail = async function(req, res, next) {
    const addr = req.body.addr;
    const userList = await model.GetPkByAddress(addr);

    let pk = "";

    if (userList.length != 0) {
        pk = userList[0]["privateKey"];
    }

    let response = { status: "ok" };
    response.pk = pk;

    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.updateEmail = async function(req, res, next) {
    const pw = req.body.pw;
    const oldEmail = req.body.oldEmail;
    const newEmail = req.body.newEmail;

    await model.updateEmail(oldEmail, newEmail);

    let response = { status: "ok" };
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.sendEmailResetPasswd = async function(req, res, next) {
    const email = req.query.email;

    const users = await model.getUser(email);
    if (users.length == 0) {
        let response = { status: "NotexistsUser" };
        response = representor(response, responseMediaType);
        res.set("Content-Type", responseMediaType).status(200).json(response);
        return;
    }

    let response = { status: "ok" };

    const token = jwt.sign({
            id: users[0]["email"],
            address: users[0]["wallet_address"],
        },
        process.env.JWT_SECRET, { expiresIn: "10m", issuer: "SRT" }
    );

    sendMail(API_BASE, email, token);
    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.updatePasswdByUser = async function(req, res, next) {
    const token = req.query.token;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let response = { status: "ok" };
        // Render internal representation into proper HAL+JSON
        response = representor(response, responseMediaType);

        const template = `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        <style>
            body {
                padding-top: 50px;
            }
        </style>
    </head>
    
    <body>
    
        <div class="container">
            <div class="jumbotron">
                <form action="${API_BASE}users/updatePasswdByToken" method="get">
                    <h3>새로운 비밀번호</h3>
                    <p>비밀번호 : <input name="pwd" /></p><br>
                    <input type="hidden" name="token" value="${token}" />
                    <input type='submit'>
                </form>
            </div>
        </div>
    
    </body>
    
    </html>`;

        res.status(200).send(template);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            // 유효기간 초과
            return res.status(419).json({
                code: 419,
                message: "토큰이 만료되었습니다",
            });
        }
        return res.status(401).json({
            code: 401,
            message: "유효하지 않은 토큰입니다",
        });
    }
};

actions.updatePasswdByToken = async function(req, res, next) {
    const token = req.query.token;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const addr = decoded.address;
        const newpasswd = req.query.pwd;

        await model.OverwriteUserPassword(addr, newpasswd);
        let response = { status: "ok" };
        // Render internal representation into proper HAL+JSON
        response = representor(response, responseMediaType);
        const rebaseUrl =
            process.env.NODE_ENV == "production" ?
            "https://srt-wallet.io/" :
            "https://dev.srt-wallet.io/";
        res.status(200).redirect(rebaseUrl);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            // 유효기간 초과
            return res.status(419).json({
                code: 419,
                message: "토큰이 만료되었습니다",
            });
        }
        return res.status(401).json({
            code: 401,
            message: "유효하지 않은 토큰입니다",
        });
    }
};

actions.getTokenPrice = async function(req, res, next) {
    const tokenPrice = await axios
        .get(API_BASE + "wallet/getTokenPrice")
        .catch(function(error) {
            log.error(error);
            resErrorMessege(res);
            return;
        });

    const response = {
        status: "ok",
        price: tokenPrice.data.price,
    };
    res.status(200).json(response);
};

actions.deleteUserByAdmin = async function(req, res, next) {
    const pw = req.body.pw;
    const email = req.body.email;

    await model.deleteUserByEmail(email);

    let response = { status: "ok" };
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.deleteUserByAddr = async function(req, res, next) {
    const pw = req.body.pw;
    const addr = req.body.addr;

    await model.deleteUserByAddr(addr);

    let response = { status: "ok" };
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.createTimer = async function(req, res, next) {
    const timerName = req.body.timerName;
    const date = req.body.destTime;

    await timerService.createCountDown(timerName, date);

    let response = { status: "ok" };
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

actions.getTimer = async function(req, res, next) {
    const timerName = req.query.timerName;
    const timer = await timerService.getCountDown(timerName);

    res.render("countDown", { destTime: timer });
};

actions.removeTimer = async function(req, res, next) {
    const timerName = req.body.timerName;
    await timerService.removeCountDown(timerName);
    let response = { status: "ok" };
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(200).json(response);
};

function resErrorMessege(res) {
    let response = { status: "ok" };

    // Render internal representation into proper HAL+JSON
    response = representor(response, responseMediaType);

    res.set("Content-Type", responseMediaType).status(404).json(response);
}

module.exports = actions;