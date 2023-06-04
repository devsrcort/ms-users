const queue = require('queue');
const log = require("metalogger")();

class TxEmitterService {
    constructor() {
        this.myQueue = queue({
            concurrency: 1,
            autostart: true,
            results: []
        });
        log.info(`My Queue time out is :: ${this.myQueue.timeout}`);

    }

    addSuccessCallback(cb) {
        this.myQueue.on('success', cb);
    }

    removeSuccessCallback(cb) {
        this.myQueue.removeListener('success', cb);
    }

    push(cb) {
        this.myQueue.push(cb);
    }
}

module.exports = TxEmitterService;