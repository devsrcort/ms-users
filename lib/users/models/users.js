const db = require("datastore");
const log = require('metalogger')();
const Promise = require('bluebird');
const cryptoJs = require("crypto-js");

class Users {

    async getUsersDesc() {
        const conn = await db.conn();
        let users = [{}];
        if (conn) {
            users = await conn.query("SELECT `id`, `name`, `phonenumer`, `email`, `wallet_address`, `balance`, `withdraw_limit` FROM users ORDER BY id DESC");
        }

        return users;
    }

    async OverwriteUserPassword(address, newPasswd) {
        const conn = await db.conn();

        if (conn) {
            const query = 'UPDATE users SET password = "' +
                cryptoJs.MD5(newPasswd).toString() +
                '" WHERE wallet_address = "' +
                address + '"';

            await conn.query(query);
        }

        return true;
    }

    async UpdateBalanceByWallet(address, balance) {
        const conn = await db.conn();

        if (conn) {
            const query = 'UPDATE users SET balance = "' +
                balance +
                '" WHERE wallet_address = "' +
                address +
                '"';

            await conn.query(query);
        }

        return true;
    }
}

module.exports = Users;