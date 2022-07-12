const db = require("datastore");
const log = require("metalogger")();
const Promise = require("bluebird");
const cryptoJs = require("crypto-js");

class TxInfo {
  // Create
  async createTxData(targetAddr, fromAddr, toAddr, amount, txHash) {
    const conn = await db.conn();
    if (conn) {
      const insertValue = {
        sWalletAddress: targetAddr,
        sFromAddress: fromAddr,
        sToAddr: toAddr,
        nAmount: amount,
        sTxHash: txHash,
      };

      await conn.query("INSERT INTO txInfo SET ?", insertValue);
    } else {
      return false;
    }

    return true;
  }

  // Read
  async isExists(address) {
    const conn = await db.conn();
    let txInfo = [{}];
    if (conn) {
      txInfo = await conn.query(
        `SELECT count(*) FROM txInfo WHERE sWalletAddress="${address}"`
      );
    }

    return txInfo[0]["count(*)"] > 0 ? true : false;
  }

  async getTxData(address) {
    const conn = await db.conn();
    let txInfos = [{}];
    if (conn) {
      const query = { sWalletAddress: address };
      txInfos = await conn.query(
        "SELECT * FROM txInfo WHERE ?",
        query
      );
    }

    return txInfos;
  }

  // Delete
  async clearTxData(address) {
    const conn = await db.conn();
    if (conn) {
      const deleteValue = {
        sWalletAddress: address,
      };

      await conn.query("DELETE FROM txInfo WHERE ?", deleteValue);
    } else {
      return false;
    }

    return true;
  }
}

module.exports = TxInfo;