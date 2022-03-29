const db = require("datastore");
const log = require('metalogger')();
const Promise = require('bluebird');
const cryptoJs = require("crypto-js");

class Users {

    async getUser(email) {
        const conn = await db.conn();
        let users = [{}];
        if (conn) {
            const query = { email: email };
            users = await conn.query("SELECT * FROM users WHERE ?", query);
        }

        return users;
    }

    async getUsersDesc() {
        const conn = await db.conn();
        let users = [{}];
        if (conn) {
            users = await conn.query("SELECT `id`, `name`, `phonenumer`, `email`, `wallet_address`, `balance`, `withdraw_limit` FROM users ORDER BY id DESC");
        }

        return users;
    }

    async addUser(name, phonenum, email, passwd, addr, mnemo, pk, uuid, balance) {
        const conn = await db.conn();
        if (conn) {
            const insertValue = {
                name: name,
                phonenumer: phonenum,
                email: email,
                password: passwd,
                wallet_address: addr,
                mnemonic: mnemo,
                privateKey: pk,
                uuid: uuid,
                balance: balance,
            };

            await conn.query("INSERT INTO users SET ?", insertValue);
        } else {
            return false;
        }

        return true;
    }

    async isExistsUser(email, phonenum) {
        const conn = await db.conn();
        let users = [{}];
        if (conn) {
            users = await conn.query(
                `SELECT count(*) FROM users WHERE email="${email}" AND phonenumer="${phonenum}"`
            );
        }

        return users[0]["count(*)"] > 0 ? true : false;
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

    async GetPkByAddress(address) {
        const conn = await db.conn();
        let users = [{}];
        if (conn) {
            const query = { wallet_address: address };
            users = await conn.query("SELECT `privateKey` FROM users WHERE ?", query);
        }

        return users;
    }
}

module.exports = Users;