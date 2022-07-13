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

  async createTxData(targetAddr, fromAddr, toAddr, amount, txHash, timeStamp) {
    return await this.model.createTxData(
      targetAddr,
      fromAddr,
      toAddr,
      amount,
      txHash,
      timeStamp
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
    for (const idx in recvData) {
      const data = this.convertRawTransferDataToObject(recvData[idx]);

      await this.createTxData(
        targetAddr,
        data.fromAddr,
        data.toAddr,
        data.modAmt,
        data.txHash,
        data.timeStamp
      );
    }

    return true;
  }

  async insertTransferData(targetAddr, recvData) {
    for (const idx in recvData) {
      const data = this.convertRawTransferDataToObject(recvData[idx]);

      const isExistsHash = await this.model.isExistsHash(targetAddr, data.txHash);
      if (isExistsHash) {
        continue;
      }

      await this.createTxData(
        targetAddr,
        data.fromAddr,
        data.toAddr,
        data.modAmt,
        data.txHash,
        data.timeStamp
      );
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
      item.timeStamp = txDatas[idx]["sTimeStamp"];

      result.push(item);
    }
    return result;
  }

  convertRawTransferDataToObject(rawData) {
    const obj = {};
    obj.address = rawData['address'];
    obj.fromAddr = rawData["from"];
    obj.toAddr = rawData["to"];
    obj.decimal = rawData["tokenDecimal"];
    obj.txHash = rawData["hash"];
    obj.amount = rawData["value"];
    obj.timeStamp = rawData["timeStamp"];
    obj.modAmt = this.convertAmount(obj.amount, obj.decimal);

    return obj;
  }

  convertAmount(value, decimal) {
    const floatting = new BN(10).pow(new BN(decimal));
    return new BN(value).div(floatting).toString();
  }
}

module.exports = TransactionService;
