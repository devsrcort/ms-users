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
                nAmountChuck: chuck
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
            const query = `SELECT count(*) FROM withdrawInfo WHERE sWalletAddress="${address}"`;
            withdrawInfo = await conn.query(query);
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

    async getCommitAmount(address) {
        const conn = await db.conn();
        let withdrawInfo = [{}];
        if (conn) {
            const query = { sWalletAddress: address };
            withdrawInfo = await conn.query("SELECT * FROM withdrawInfo WHERE ?", query);
        }

        return withdrawInfo[0]['nCommitAmount'];
    }

    async getAccumAmount(address) {
        const conn = await db.conn();
        let withdrawInfo = [{}];
        if (conn) {
            const query = { sWalletAddress: address };
            withdrawInfo = await conn.query("SELECT * FROM withdrawInfo WHERE ?", query);
        }

        return withdrawInfo[0]['nAccumAmount'];
    }

    // Update
    async updateCommitAmount(address, amt) {
        const conn = await db.conn();

        if (conn) {
            const query = `UPDATE withdrawInfo SET nCommitAmount=${amt} WHERE sWalletAddress = "${address}"`;
            await conn.query(query);
        }

        return true;
    }

    async commitAmount(address, amt) {
        const conn = await db.conn();

        if (conn) {
            const query = `UPDATE withdrawInfo SET nCommitAmount=0, nAccumAmount=${amt} WHERE sWalletAddress = "${address}"`;
            await conn.query(query);
        }

        return true;
    }

    async resetCommitAmount(address, amt) {
        const conn = await db.conn();

        if (conn) {
            const query = `UPDATE withdrawInfo SET nCommitAmount=0 WHERE sWalletAddress = "${address}"`;
            await conn.query(query);
        }

        return true;
    }

    async resetAccumAmount(address, amt) {
        const conn = await db.conn();

        if (conn) {
            const query = `UPDATE withdrawInfo SET nCommitAmount=0, nAccumAmount=${amt} WHERE sWalletAddress = "${address}"`;
            await conn.query(query);
        }

        return true;
    }

    async updateRatio(address, ratioCnt) {
        const conn = await db.conn();

        if (conn) {
            const query = `UPDATE withdrawInfo SET nRatio=${ratioCnt} WHERE sWalletAddress="${address}"`;
            await conn.query(query);
        }

        return true;
    }

    async updateAmountValue(address, amt) {
        const conn = await db.conn();

        if (conn) {
            const query = `UPDATE withdrawInfo SET nLimitAmount=${amt} WHERE sWalletAddress = "${address}"`;
            await conn.query(query);
        }

        return true;
    }

    async deleteWithrawInfo(address) {
        const conn = await db.conn();
        if (conn) {
            const deleteValue = {
                sWalletAddress: address
            };

            await conn.query("DELETE FROM withdrawInfo WHERE ?", deleteValue);
        } else {
            return false;
        }

        return true;
    }
}

module.exports = WithdrawInfo;