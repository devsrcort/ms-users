/* jshint -W079 */
const Promise = require("bluebird"),
    config = require("config"),
    log = require("metalogger")(),
    representor = require("kokua"),
    _ = require("lodash");

const { reject } = require("bluebird");
const Timer = require("users/models/timer");

class TimeService {
    constructor() {
        this.model = new Timer();
    }

    async addTimer(name, strDate) {
        const destDate = new Date(Date.parse(strDate));
        return await this.model.addTimer(name, destDate.toISOString().slice(0, 19).replace('T', ' '));
    }

    async updateTimer(name, strDate) {
        const destDate = new Date(strDate);
        return await this.model.updateTimer(name, destDate.toISOString().slice(0, 19).replace('T', ' '));
    }

    async deleteTimer(name) {
        return await this.model.deleteTimer(name);
    }

    async getTimer(name) {
        return await this.model.getTimer(name);
    }

    async createCountDown(name, strDstDate) {
        await this.addTimer(name, strDstDate);
    }

    async getCountDown(name) {
        const timer = await this.getTimer(name);

        if (timer.length == 0) {
            return null;
        }
        log.info(timer);
        return timer[0]['destTime'];
    }
}

module.exports = TimeService;