const Duration = require('duration');
const db = require("datastore");
const log = require('metalogger')();

class Checks {

    async dbQueryCheck() {
        const start = new Date();
        const conn = await db.conn();
        const query = 'select count(*) from users';
        let errMsg = "";

        const response = {};

        try {
            const users = await conn.query(query);
        } catch (err) {
            errMsg = err;
        } finally {
            const elapsed = new Duration(start, new Date());
            const status = errMsg ? 'fail' : 'pass';

            response.status = status;
            response.metricValue = elapsed.milliseconds;
            response.metricUnit = "ms";

            if (errMsg) {
                response.output = errMsg;
            }
        }

        return response;
    }
}

module.exports = Checks;