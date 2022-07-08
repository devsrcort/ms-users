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

    async updateRatio(address, ratio) {
        await this.model.updateRatio(address, ratio);
    }

    async updateAmountValue(address) {
        const info = await this.getWithdrawInfo(address);
        const limitValue = info['nRatio'] * info['nAmountChuck'];

        await this.model.updateAmountValue(address, limitValue);
    }

    async updateCommitValue(address, amt) {
        await this.model.updateCommitAmount(address, amt);
    }

    async deleteWithdrawInfo(address) {
        await this.model.deleteWithrawInfo(address);
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
        return address == "0xd7d93495bd5e84d91ef6c5769992865620a95df8" ? true : false;
    }

}

module.exports = WithdrawInfoService;