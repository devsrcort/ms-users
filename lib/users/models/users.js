const db = require("datastore");
const log = require('metalogger')();
const Promise = require('bluebird');

class Users {

    async getUsersDesc() {
        const conn = await db.conn();
        let users = [{}];
        if (conn) {
            users = await conn.query("SELECT `name`, `phonenumer`, `email`, `wallet_address`, `balance`, `withdraw_limit` FROM users ORDER BY id DESC");
        }

        return users;
    }

    async OverwriteUserPassword(newPasswd) {
        const conn = await db.conn();

        if (conn) {
            const query = 'UPDATE users SET password = "' +
                cryptoJs.MD5(newPasswd).toString() +
                '" WHERE wallet_address = "' +
                addr +
                '"';

            await conn.query(query);
        }

        return true;
    }

    async UpdateBalanceByWallet(address, balance) {
        const conn = await db.conn();
        if (conn) {}
    }
}