/* jshint -W079 */
const Promise = require("bluebird"),
    config = require("config"),
    log = require("metalogger")(),
    representor = require("kokua"),
    _ = require("lodash");

const { reject } = require("bluebird");
const WithdrawInfo = require("users/models/withdrawInfo");
const { login } = require("../controllers/actions");

class WithdrawInfoService {
    constructor() {
        this.model = new WithdrawInfo();
        this.stndRatioStride = 1;
        this.intialRatio = 0.1;

        this.isEnable = false;
    }

    async createWithdrawInfo(address, initAmt) {
        const chunk = Math.ceil(initAmt * this.intialRatio);
        await this.model.createWithdrawInfo(address, initAmt, chunk);
    }

    async getWithdrawInfo(address) {
        const infos = await this.model.getWithdrawInfo(address);
        return infos[0];
    }

    async getAvailableAmount(address) {
        const info = await this.getWithdrawInfo(address);
        log.info(`InAvailableAmtn Info ${address}`);
        log.info(info);
        const limitValue = info['nLimitAmount'];
        const totalAmount = info['nAccumAmount'] + info['nCommitAmount'];
        const availAmt = limitValue - totalAmount;

        return availAmt < 0 ? 0 : availAmt;
    }

    async commitAmount(address) {
        const info = await this.getWithdrawInfo(address);
        const accumAmt = info['nAccumAmount'] + info['nCommitAmount'];
        await this.model.commitAmount(address, accumAmt);
    }
    async getCommitAmount(address) {
        return await this.model.getCommitAmount(address);
    }

    async updateRatio(address, ratio) {
        await this.model.updateRatio(address, ratio);
    }

    async updateAmountValue(address) {
        const info = await this.getWithdrawInfo(address);
        const limitValue = info['nRatio'] * info['nAmountChuck'];

        await this.model.updateAmountValue(address, limitValue);
    }

    async updateCommitValue(address, amt) {
        log.info(`fromAddr : ${address} : Amount : ${amt}`);
        await this.model.updateCommitAmount(address, amt);
    }

    async deleteWithdrawInfo(address) {
        await this.model.deleteWithrawInfo(address);
    }

    async resetAccumAmount(address) {
        const info = await this.getWithdrawInfo(address);
        const resetValue = (info['nRatio'] - 1) * info['nAmountChuck'];

        await this.model.resetAccumAmount(address, resetValue);
    }

    async resetCommitAmount(address) {
        await this.model.resetCommitAmount(address);
    }

    enable() {
        this.isEnable = true;
    }

    disable() {
        this.isEnable = false;
    }

    isEnabled() {
        return this.isEnable;
    }

    isTestAccount(address) {
        return address == "0xd7d93495bd5e84d91ef6c5769992865620a95df8" || address == "0x54c858B5E5c11A11095C74976E2A675734e7f9c6" ? true : false;
    }

}

module.exports = WithdrawInfoService;