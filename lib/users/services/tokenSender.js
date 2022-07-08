/* jshint -W079 */
const Promise = require("bluebird"),
    log = require("metalogger")(),
    _ = require("lodash");

const axios = require("axios");
const { reject, resolve } = require("bluebird");

class TokenSender {
    constructor(jobEmitter, withdrawService) {
        this.emitter = jobEmitter;
        this.withdrawService = withdrawService;
    }

    async sendToken(apiBase, fromAddr, toAddr, amt, fee) {
        this.emitter.push(async() => {
            const limitValue = await this.withdrawInfoService.getAvailableAmount(fromAddr);
            if (limitValue < amt) {
                reject();
                return;
            }

            await this.withdrawService.updateCommitValue(fromAddr, amt);
            const resValue = await axios.post(apiBase + "wallet/sendTokenByClient", {
                    fromAddr: fromAddr,
                    toAddr: toAddr,
                    amount: amt,
                    fee: fee,
                    secret: process.env.SECRETKEY
                })
                .catch((err) => {
                    log.error(err);
                });

            resolve(resValue);
        });
    }
}

module.exports = TokenSender;