const request = require("supertest");
const assert = require("chai").assert;
const sinon = require("sinon");
const fh = require("../support/fixture-helper.js");
const log = require("metalogger")();

const TimerService = require("users/services/timerService");

describe("timer service test", () => {
    const testService = new TimerService();

    it("timer Service - CRUD", async() => {
        const ExpectedDate = new Date("2019-01-01T12:30:00.000Z");
        const ExpectedUpdateDate = new Date("2020-01-01T12:30:00.000Z");

        await testService.addTimer("Test", "2019-01-01T12:30:00.000Z");

        let testTimer = await testService.getTimer("Test");

        assert.equal(
            new Date(testTimer.slice(-1)[0]["destTime"]).valueOf(),
            ExpectedDate.valueOf(),
            `Date is not equals ${ExpectedDate}, ${new Date(
        testTimer.slice(-1)[0]["destTime"]
      )}`
        );

        await testService.updateTimer("Test", "2020-01-01T12:30:00.000Z");
        testTimer = await testService.getTimer("Test");

        assert.equal(
            new Date(testTimer.slice(-1)[0]["destTime"]).valueOf(),
            ExpectedUpdateDate.valueOf(),
            `Date is not equals ${ExpectedUpdateDate}, ${new Date(
        testTimer.slice(-1)[0]["destTime"]
      )}`
        );

        testService.deleteTimer("Test");

        testTimer = await testService.getTimer("Test");
        assert.equal(testTimer.length, 0, "testTimer is not length 0");
    });
});