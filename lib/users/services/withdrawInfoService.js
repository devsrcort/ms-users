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
    }

    async createWithdrawInfo(address, initAmt, chuck) {
        this.model.createWithdrawInfo(address, initAmt, chuck);
    }

    async getWithrawInfo(address) {
        const infos = this.model.getWithrawInfo(address);
        return infos[0];
    }


}

module.exports = WithdrawInfoService;