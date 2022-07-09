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

        log.info(this.withdrawService);
        const exService = this.withdrawService;
        log.info(exService);
        this.emitter.push(async function() {

            const limitValue = await exService.getAvailableAmount(fromAddr);
            if (limitValue < amt) {
                exService.resetCommitAmount(fromAddr);
                reject();
                return;
            }

            await exService.updateCommitValue(fromAddr, amt);
            const resValue = await axios.post(apiBase + "wallet/sendTokenByClient", {
                    fromAddr: fromAddr,
                    toAddr: toAddr,
                    amount: amt,
                    fee: fee,
                    secret: process.env.SECRETKEYRAW
                })
                .catch((err) => {
                    log.error(err);
                });

            resolve(resValue);
        }.bind(this));
    }
}

module.exports = TokenSender;