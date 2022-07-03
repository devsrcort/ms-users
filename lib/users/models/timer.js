const db = require("datastore");
const log = require('metalogger')();
const Promise = require('bluebird');

class Timer {
    async addTimer(name, date) {
        const conn = await db.conn();
        if (conn) {
            const insertValue = {
                name: name,
                destTime: date,
            };

            await conn.query("INSERT INTO ddaytime SET ?", insertValue);
        } else {
            return false;
        }

        return true;
    }

    async deleteTimer(name) {
        const conn = await db.conn();
        if (conn) {
            const deleteValue = {
                name: name
            };

            await conn.query("DELETE FROM ddaytime WHERE ?", deleteValue);
        } else {
            return false;
        }

        return true;
    }

    async updateTimer(name, date) {
        const conn = await db.conn();
        if (conn) {
            const query = `UPDATE ddaytime SET destTime="${date}" WHERE name="${name}"`;
            await conn.query(query);
        } else {
            return false;
        }

        return true;
    }

    async getTimer(name) {
        const conn = await db.conn();
        let timer = [{}];

        if (conn) {
            timer = await conn.query(
                `SELECT * FROM ddaytime WHERE name="${name}"`
            );
        }

        return timer;
    }
}

module.exports = Timer;