const request = require("supertest");
const assert = require("chai").assert;
const sinon = require("sinon");
const fh = require("../support/fixture-helper.js");
const log = require("metalogger")();

const TransactionService = require("users/services/transactionService");

describe("transaction service test", () => {
  const infoService = new TransactionService();
  it("transaction serivce - CRUD test", async () => {
    const ExpectedAddress = "0x54c858B5E5c11A11095C74976E2A675734e7f9c6";
    const ExpectedAmount = "1000";
    const ExpectedFromAddr = "0x54c858B5E5c11A11095C74976E2A675734e7f9c6";
    const ExpectedToAddr = "0xfd6D98Be3Ac00C251Da66F9874D2cda378F5Cb8F";
    const ExpectedHash =
      "0x135c66c96618edaa5ed0021381c8e76fd4ebcd64b6d49fdb468b9e850ddd7998";
    const isSuccess = await infoService.createTxData(
      ExpectedAddress,
      ExpectedFromAddr,
      ExpectedToAddr,
      ExpectedAmount,
      ExpectedHash
    );

    assert.equal(isSuccess, true, "Failed to create tx data");

    const txDatas = await infoService.getTxData(ExpectedAddress);

    assert.equal(
      txDatas[0]["sWalletAddress"],
      ExpectedAddress,
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["sWalletAddre"]}`
    );
    assert.equal(
      txDatas[0]["sFromAddress"],
      ExpectedFromAddr,
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["sFromAddress"]}`
    );
    assert.equal(
      txDatas[0]["sToAddr"],
      ExpectedToAddr,
      `Do not matched ${ExpectedToAddr} : ${txDatas[0]["sToAddr"]}`
    );
    assert.equal(
      txDatas[0]["nAmount"],
      ExpectedAmount,
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["nAmount"]}`
    );
    assert.equal(
      txDatas[0]["sTxHash"],
      ExpectedHash,
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["sTxHash"]}`
    );

    await infoService.clearTxData(ExpectedAddress);
    const isExists = await infoService.isExists(ExpectedAddress);

    assert.equal(isExists, false);
  });

  it("transaction service - intialize txdata", async () => {
    const ExpectedAddress = "0xd2681a05e1a095291dbbff9be15f7e7d85745d00";
    const ExpectedAmount = "833333";
    const ExpectedFromAddr = "0x60846cc8f6b882e48dd4b5a0b4a414e776539885";
    const ExpectedToAddr = "0xd2681a05e1a095291dbbff9be15f7e7d85745d00";
    const ExpectedHash =
      "0x05e567f50ab5def6e14f3b63347601a41f92b9c9e939cf401d0153e69e8e06cc";

    let isExists = await infoService.isExists(ExpectedAddress);
    if (!isExists) {
      assert.equal(isExists, false, "Remain elements");
      await infoService.createInitialDatas(ExpectedAddress);
    }

    const txDatas = await infoService.getTxData(ExpectedAddress);
    assert.equal(
      txDatas[0]["sWalletAddress"],
      ExpectedAddress,
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["sWalletAddress"]}`
    );
    assert.equal(
      txDatas[0]["sFromAddress"],
      ExpectedFromAddr,
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["sFromAddress"]}`
    );
    assert.equal(
      txDatas[0]["sToAddr"],
      ExpectedToAddr,
      `Do not matched ${ExpectedToAddr} : ${txDatas[0]["sToAddr"]}`
    );
    assert.equal(
      txDatas[0]["nAmount"],
      ExpectedAmount,
      `Do not matched ${ExpectedAmount} : ${txDatas[0]["nAmount"]}`
    );
    assert.equal(
      txDatas[0]["sTxHash"],
      ExpectedHash,
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["sTxHash"]}`
    );

    await infoService.clearTxData(ExpectedAddress);
    isExists = await infoService.isExists(ExpectedAddress);

    assert.equal(isExists, false);
  });
});
