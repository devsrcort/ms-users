const request = require("supertest");
const assert = require("chai").assert;
const sinon = require("sinon");
const fh = require("../support/fixture-helper.js");
const log = require("metalogger")();

const WithdrawService = require("users/services/withdrawService");

describe("withdraw service test", () => {
    const testService = new WithdrawService();

    it("withdraw Service", () => {
        assert.equal(true, true);
    });
});