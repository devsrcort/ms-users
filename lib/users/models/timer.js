const db = require("datastore");
const log = require("metalogger")();
const Promise = require("bluebird");

class Timer {
  async addTimer(name, date, timerType) {
    const conn = await db.conn();
    if (conn) {
      const insertValue = {
        name: name,
        destTime: date,
        sTimerType: timerType,
        sTimerStatus: "InActivate",
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
        name: name,
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
      timer = await conn.query(`SELECT * FROM ddaytime WHERE name="${name}"`);
    }

    return timer;
  }

  async getActiveSaleTimer() {
    const conn = await db.conn();
    let timer = [{}];

    if (conn) {
      timer = await conn.query(`SELECT * FROM ddaytime WHERE sTimerStatus="Activate" AND sTimerType="Sale"`);
    }

    return timer;
  }

  async setActiveSaleTimer(name) {
    const conn = await db.conn();

    if (conn) {
      await conn.query(
        `UPDATE ddaytime SET sTimerStatus="Activate" WHERE name="${name}"`
      );
      return true;
    }

    return false;
  }

  async clearActiveSalesTimer() {
    const conn = await db.conn();

    if (conn) {
      await conn.query(
        `UPDATE ddaytime SET sTimerStatus="InActivate" WHERE sTimerType="Sale" AND sTimerStatus="Activate"`
      );
      return true;
    }

    return false;
  }
}

module.exports = Timer;
