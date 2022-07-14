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
            await exService.updateCommitValue(fromAddr, amt);
            const limitValue = await exService.getAvailableAmount(fromAddr);

            log.info(`LimitValue : ${limitValue} : Amt : ${amt}`);
            if (limitValue < amt) {
                await exService.resetCommitAmount(fromAddr);
                log.info(`limitValue : ${limitValue} : fromAddr : ${fromAddr} : toAddr ${toAddr}, amt : ${amt} : Fee : ${fee}`);
                reject();
                return;
            }

            try {
                log.info(`start SendToken`);

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