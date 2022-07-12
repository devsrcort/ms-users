/* jshint -W079 */
const Promise = require("bluebird"),
  config = require("config"),
  log = require("metalogger")(),
  representor = require("kokua"),
  BN = require("bn.js"),
  _ = require("lodash");

const { default: axios } = require("axios");
const TxInfoModel = require("users/models/txInfo");

class TransactionService {
  constructor() {
    this.model = new TxInfoModel();
  }

  async createTxData(targetAddr, fromAddr, toAddr, amount, txHash) {
    return await this.model.createTxData(
      targetAddr,
      fromAddr,
      toAddr,
      amount,
      txHash
    );
  }

  async getTxData(targetAddr) {
    return await this.model.getTxData(targetAddr);
  }

  async isExists(targetAddr) {
    return await this.model.isExists(targetAddr);
  }

  async clearTxData(targetAddr) {
    return await this.model.clearTxData(targetAddr);
  }

  async createInitialDatas(targetAddr, recvData) {
    for (const item in recvData) {
      const fromAddr = recvData[item]["from"];
      const toAddr = recvData[item]["to"];
      const decimal = recvData[item]["tokenDecimal"];
      const txHash = recvData[item]["hash"];
      const amount = recvData[item]["value"];

      const modAmt = this.convertAmount(amount, decimal);
      await this.createTxData(targetAddr, fromAddr, toAddr, modAmt, txHash);
    }

    return true;
  }

  async getFormmatedTxData(targetAddr) {
    const txDatas = await this.getTxData(targetAddr);
    const result = [];
    for (const idx in txDatas) {
      const item = {};

      item.address = txDatas[idx]["sWalletAddress"];
      item.fromAddr = txDatas[idx]["sFromAddress"];
      item.toAddr = txDatas[idx]["sToAddr"];
      item.amount = txDatas[idx]["nAmount"];
      item.txHash = txDatas[idx]["sTxHash"];

      result.push(item);
    }
    log.info(result);
    return result;
  }

  convertAmount(value, decimal) {
    const floatting = new BN(10).pow(new BN(decimal));
    return new BN(value).div(floatting).toString();
  }
}

module.exports = TransactionService;
