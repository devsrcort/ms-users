/* jshint -W079 */
const Promise = require("bluebird"),
    config = require("config"),
    log = require("metalogger")(),
    representor = require("kokua"),
    _ = require("lodash");

const { reject } = require("bluebird");
const WithdrawInfo = require("users/models/withdrawInfo");

class WithdrawInfoService {
    constructor() {
        this.model = new WithdrawInfo();
        this.stndRatioStride = 1;
        this.intialRatio = 0.1;
        this.feeValue = 400;
        this.activeRatio = 1;
        this.isEnable = true;
    }

    async createWithdrawInfo(address, initAmt) {
        const chunk = Math.ceil(initAmt * this.intialRatio);
        await this.model.createWithdrawInfo(address, initAmt, chunk);
    }

    async getWithdrawInfo(address) {
        const infos = await this.model.getWithdrawInfo(address);
        return infos[0];
    }

    async getRatio(address) {
        const infos = await this.getWithdrawInfo(address);
        return (infos == undefined || infos.length == 0) ? 0 : infos['nRatio'];
    }

    async isExists(address) {
        const isExists = await this.model.isExists(address);
        return isExists;
    }

    async getAvailableAmount(address) {
        const info = await this.getWithdrawInfo(address);
        if (info == undefined || info.length == 0) {
            return 0;
        }

        const limitValue = info['nLimitAmount'];
        const totalAmount = info['nAccumAmount'] + info['nCommitAmount'];
        const availAmt = limitValue - totalAmount;

        return availAmt < 0 ? 0 : availAmt;
    }

    async getLimitAmount(address) {
        const info = await this.getWithdrawInfo(address);
        if (info == undefined || info.length == 0) {
            return 0;
        }  

        return info['nLimitAmount'];
    }

    async compareRemainBalnace(availAmt, balance) {
        const amt = Math.min((balance - this.feeValue), availAmt);
        return amt < 0 ? 0 : amt;
    }

    async commitAmount(address) {
        const info = await this.getWithdrawInfo(address);
        const accumAmt = info['nAccumAmount'] + info['nCommitAmount'];
        await this.model.commitAmount(address, accumAmt);
    }

    async getCommitAmount(address) {
        return await this.model.getCommitAmount(address);
    }

    async getAccumAmount(address) {
        return await this.model.getAccumAmount(address);
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

    async setAccumAmount(address, amount) {
        const info = await this.getWithdrawInfo(address);
        await this.model.resetAccumAmount(address, amount);
    }

    async resetCommitAmount(address) {
        await this.model.resetCommitAmount(address);
    }

    async updateActiveRatio(ratio) {
        this.activeRatio = ratio;
    }

    async syncActiveRatio(address) {
        const myRatio = await this.getRatio(address);
        if (myRatio != this.activeRatio) {
            await this.updateRatio(address, this.activeRatio);
            await this.updateAmountValue(address, this.activeRatio);
        }

        return true;
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
}

module.exports = WithdrawInfoService;