const db = require("datastore");
const log = require('metalogger')();
const Promise = require('bluebird');
const cryptoJs = require("crypto-js");

class WithdrawInfo {
    // Create
    async createWithdrawInfo(address, initAmt, chuck) {
        const conn = await db.conn();
        if (conn) {
            const insertValue = {
                sWalletAddress: address,
                nInitBalance: initAmt,
                nAmountChuck: chuck,
            };

            await conn.query("INSERT INTO withdrawInfo SET ?", insertValue);
        } else {
            return false;
        }

        return true;
    }

    // Read
    async isExists(address) {
        const conn = await db.conn();
        let withdrawInfo = [{}];
        if (conn) {
            withdrawInfo = await conn.query(
                `SELECT count(*) FROM withdrawInfo WHERE sWalletAddress="${address}"`
            );
        }

        return withdrawInfo[0]["count(*)"] > 0 ? true : false;
    }

    async getWithdrawInfo(address) {
        const conn = await db.conn();
        let withdrawInfo = [{}];
        if (conn) {
            const query = { sWalletAddress: address };
            withdrawInfo = await conn.query("SELECT * FROM withdrawInfo WHERE ?", query);
        }

        return withdrawInfo;
    }

    // Update
    async commitAmmount(address, amt) {
        const conn = await db.conn();

        if (conn) {
            const query = `UPDATE withdrawInfo SET nCommitAmount=0, nAccumAmount=${amt} WHERE sWalletAddress = ${address}`;
            await conn.query(query);
        }

        return true;
    }
}

module.exports = WithdrawInfo;