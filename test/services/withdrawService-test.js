const request = require("supertest");
const assert = require("chai").assert;
const sinon = require("sinon");
const fh = require("../support/fixture-helper.js");
const log = require("metalogger")();

const WithdrawInfoService = require("users/services/withdrawInfoService");

describe("withdraw service test", () => {
    const infoService = new WithdrawInfoService();
    it("withdraw CRUD Service", () => {
        const testAddr = "0x54c858B5E5c11A11095C74976E2A675734e7f9c6";
        const balance = 10000;
        const chuck = balance * 0.1;

        // await infoService.createWithdrawInfo(testAddr, balance, chuck);

    });

    // it("withdraw CRUD Service", () => {
    //     const testAddr = "0x54c858B5E5c11A11095C74976E2A675734e7f9c6";
    //     const balance = 10000;
    //     const chuck = balance * 0.1;

    //     await infoService.createWithdrawInfo(testAddr, balance, chuck);
    //     // await testService.createWithdrawInfo(testAddr, balance, chuck);
    //     const withdrawInfo = testService.getWithrawInfo(testAddr);

    //     assert.equal(withdrawInfo['sWalletAddress'], testAddr, `Wallet address is wrong ${withdrawInfo[0]['sWalletAddress']}`);
    //     assert.equal(withdrawInfo['nAccumAmount'], 0, `nAccumAmount is wrong ${withdrawInfo[0]['nAccumAmount']}`);
    //     assert.equal(withdrawInfo['nCommitAmount'], 0, `nCommitAmount is wrong ${withdrawInfo[0]['nCommitAmount']}`);
    //     assert.equal(withdrawInfo['nRatio'], 0, `nRatio is wrong ${withdrawInfo[0]['nRatio']}`);
    //     assert.equal(withdrawInfo['nInitBalance'], balance, `nInitBalance is wrong ${withdrawInfo[0]['nInitBalance']}`);
    //     assert.equal(withdrawInfo['nLimitAmount'], 0, `nLimitAmount is wrong ${withdrawInfo[0]['nLimitAmount']}`);
    //     assert.equal(withdrawInfo['nAmountChuck'], chuck, `nAmountChuck is wrong ${withdrawInfo[0]['nAmountChuck']}`);
    // });
});