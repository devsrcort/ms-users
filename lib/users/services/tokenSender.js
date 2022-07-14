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
        const exService = this.withdrawService;
        this.emitter.push(async function() {
            const availValue = await exService.getAvailableAmount(fromAddr);
            const limitValue = await exService.getLimitAmount(fromAddr);

            log.info(`LimitValue : ${limitValue} : AvailValue : ${availValue} Amt : ${amt}`);
            if (limitValue < availValue + amt) {
                log.info(`limitValue : ${limitValue} : fromAddr : ${fromAddr} : toAddr ${toAddr}, amt : ${amt} : Fee : ${fee}`);
                reject();
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
                reject();
            }
        });
    }
}

module.exports = TokenSender;