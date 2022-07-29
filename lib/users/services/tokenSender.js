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

    async sendToken(apiBase, fromAddr, toAddr, amt, fee, balance) {
        const exService = this.withdrawService;
        return this.emitter.push(async function() {
            const availValue = await exService.getAvailableAmount(fromAddr);
            const availAmt = await exService.compareRemainBalnace(availValue, balance);
            const accumAmount = await exService.getAccumAmount(fromAddr);
            const limitValue = await exService.getLimitAmount(fromAddr);

            log.info(`LimitValue : ${limitValue}, AccumAmt : ${accumAmount}, AvailValue : ${availAmt}, Amt : ${amt}`);
            if (limitValue < accumAmount + amt || availAmt < amt) {
                log.info(`limitValue : ${limitValue} : fromAddr : ${fromAddr} : toAddr ${toAddr}, amt : ${amt} : Fee : ${fee}`);
                reject(new Error("Excceded Amount by limit amount"));
                return;
            }

            try {
                log.info(`start SendToken`);
                await exService.updateCommitValue(fromAddr, amt);

                const resValue = await axios.post(apiBase + "wallet/sendTokenByClient", {
                    fromAddr: fromAddr,
                    toAddr: toAddr,
                    amount: amt,
                    fee: fee,
                    secret: process.env.SECRETKEYRAW
                });

                await exService.commitAmount(fromAddr);
                log.info(`Done SendToken`);
                resolve(resValue);
            } catch (error) {
                log.info(`failed SendToken`);
                await exService.resetCommitAmount(fromAddr);
                reject(new Error("Faield to send token"));
            }
        });
    }
}

module.exports = TokenSender;