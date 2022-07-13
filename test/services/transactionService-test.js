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
    const ExpectedTimestamp = 1646632630;
    const isSuccess = await infoService.createTxData(
      ExpectedAddress,
      ExpectedFromAddr,
      ExpectedToAddr,
      ExpectedAmount,
      ExpectedHash,
      ExpectedTimestamp
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
    assert.equal(
      txDatas[0]["sTimeStamp"],
      ExpectedTimestamp,
      `Do not matched ${ExpectedTimestamp} : ${txDatas[0]["sTimeStamp"]}`
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
    const ExpectedTimeStamp = "1646632630";
    const ExpectedHash =
      "0x05e567f50ab5def6e14f3b63347601a41f92b9c9e939cf401d0153e69e8e06cc";
    const strTestData = JSON.parse(`[
        {
          "blockNumber": "14337997",
          "timeStamp": "1646632630",
          "hash": "0x05e567f50ab5def6e14f3b63347601a41f92b9c9e939cf401d0153e69e8e06cc",
          "nonce": "2741",
          "blockHash": "0x4d5803dea3fb8369ec9bd6a6818b90e51fcb4994ae99be1557ab00b6fc452edd",
          "from": "0x60846cc8f6b882e48dd4b5a0b4a414e776539885",
          "contractAddress": "0x22987407fd1fc5a971e3fda3b3e74c88666cda91",
          "to": "0xd2681a05e1a095291dbbff9be15f7e7d85745d00",
          "value": "833333000000000000000000",
          "tokenName": "Smart Reward Token",
          "tokenSymbol": "SRT",
          "tokenDecimal": "18",
          "transactionIndex": "84",
          "gas": "117846",
          "gasPrice": "24222159931",
          "gasUsed": "58923",
          "cumulativeGasUsed": "4694807",
          "input": "deprecated",
          "confirmations": "782033"
        },
        {
          "blockNumber": "14364001",
          "timeStamp": "1646980421",
          "hash": "0x7946b2aa68ad894237e8a2bb67748eb10c00da65790961c6bbadfdb17483864a",
          "nonce": "2911",
          "blockHash": "0x9196f146ad6a8cfae5d66b4909d6b8cdc590320d7e96687f31babbb9032bdbbc",
          "from": "0x60846cc8f6b882e48dd4b5a0b4a414e776539885",
          "contractAddress": "0x22987407fd1fc5a971e3fda3b3e74c88666cda91",
          "to": "0xd2681a05e1a095291dbbff9be15f7e7d85745d00",
          "value": "833333000000000000000000",
          "tokenName": "Smart Reward Token",
          "tokenSymbol": "SRT",
          "tokenDecimal": "18",
          "transactionIndex": "15",
          "gas": "83646",
          "gasPrice": "22297509103",
          "gasUsed": "41823",
          "cumulativeGasUsed": "1297854",
          "input": "deprecated",
          "confirmations": "756029"
        },
        {
          "blockNumber": "14383115",
          "timeStamp": "1647239025",
          "hash": "0x95c11bd083dada1d8e8a91a16ce0f35b7b49f69dfef8bdb1f62d5725d809b0ae",
          "nonce": "3019",
          "blockHash": "0x099864528f7bc1889fda33413fb254511b349ae8a4873dba970730aec9049d3b",
          "from": "0x60846cc8f6b882e48dd4b5a0b4a414e776539885",
          "contractAddress": "0x22987407fd1fc5a971e3fda3b3e74c88666cda91",
          "to": "0xd2681a05e1a095291dbbff9be15f7e7d85745d00",
          "value": "833333000000000000000000",
          "tokenName": "Smart Reward Token",
          "tokenSymbol": "SRT",
          "tokenDecimal": "18",
          "transactionIndex": "55",
          "gas": "83646",
          "gasPrice": "58436169225",
          "gasUsed": "41823",
          "cumulativeGasUsed": "11617577",
          "input": "deprecated",
          "confirmations": "736915"
        },
        {
          "blockNumber": "15119962",
          "timeStamp": "1657523919",
          "hash": "0x6e7b13a781a3f5ad5888070a6412a1d6f66a04024b7099508930b8524c165a99",
          "nonce": "1100",
          "blockHash": "0xf62adf2181566060a8523f60d06dc3ea16dc6f7b1bf12e9f8cbdb9ee794d8f4a",
          "from": "0xd2681a05e1a095291dbbff9be15f7e7d85745d00",
          "contractAddress": "0x22987407fd1fc5a971e3fda3b3e74c88666cda91",
          "to": "0x735038aef13b26b47242c306850e1d7ee3335152",
          "value": "249500000000000000000000",
          "tokenName": "Smart Reward Token",
          "tokenSymbol": "SRT",
          "tokenDecimal": "18",
          "transactionIndex": "28",
          "gas": "69853",
          "gasPrice": "35000000000",
          "gasUsed": "69853",
          "cumulativeGasUsed": "3874819",
          "input": "deprecated",
          "confirmations": "68"
        },
        {
          "blockNumber": "15119962",
          "timeStamp": "1657523919",
          "hash": "0x6e7b13a781a3f5ad5888070a6412a1d6f66a04024b7099508930b8524c165a99",
          "nonce": "1100",
          "blockHash": "0xf62adf2181566060a8523f60d06dc3ea16dc6f7b1bf12e9f8cbdb9ee794d8f4a",
          "from": "0xd2681a05e1a095291dbbff9be15f7e7d85745d00",
          "contractAddress": "0x22987407fd1fc5a971e3fda3b3e74c88666cda91",
          "to": "0x89f980e573e75f7418f9588fe9ad1713f1ad58bd",
          "value": "400000000000000000000",
          "tokenName": "Smart Reward Token",
          "tokenSymbol": "SRT",
          "tokenDecimal": "18",
          "transactionIndex": "28",
          "gas": "69853",
          "gasPrice": "35000000000",
          "gasUsed": "69853",
          "cumulativeGasUsed": "3874819",
          "input": "deprecated",
          "confirmations": "68"
        }
      ]`);
    await infoService.clearTxData(ExpectedAddress);

    let isExists = await infoService.isExists(ExpectedAddress);
    if (!isExists) {
      assert.equal(isExists, false, "Remain elements");
      await infoService.createInitialDatas(ExpectedAddress, strTestData);
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
    assert.equal(
      txDatas[0]["sTimeStamp"],
      ExpectedTimeStamp,
      `Do not matched ${ExpectedTimeStamp} : ${txDatas[0]["sTimeStamp"]}`
    );

    const formattedValue = await infoService.getFormmatedTxData(
      ExpectedAddress
    );

    assert.equal(
      formattedValue[0].address,
      ExpectedAddress,
      `Do not matched ${ExpectedAddress} : ${formattedValue[0].address}`
    );
    assert.equal(
      formattedValue[0].fromAddr,
      ExpectedFromAddr,
      `Do not matched ${ExpectedAddress} : ${formattedValue[0].fromAddr}`
    );
    assert.equal(
      formattedValue[0].toAddr,
      ExpectedToAddr,
      `Do not matched ${ExpectedToAddr} : ${formattedValue[0].toAddr}`
    );
    assert.equal(
      formattedValue[0].amount,
      ExpectedAmount,
      `Do not matched ${ExpectedAmount} : ${formattedValue[0].amount}`
    );
    assert.equal(
      formattedValue[0].txHash,
      ExpectedHash,
      `Do not matched ${ExpectedAddress} : ${formattedValue[0].txHash}`
    );
    assert.equal(
      formattedValue[0].timeStamp,
      ExpectedTimeStamp,
      `Do not matched ${ExpectedTimeStamp} : ${txDatas[0]["sTimeStamp"]}`
    );

    await infoService.clearTxData(ExpectedAddress);
    isExists = await infoService.isExists(ExpectedAddress);

    assert.equal(isExists, false);
  });

  it("transaction service - Insert txdata", async () => {
    const ExpectedAddress = "0xd2681a05e1a095291dbbff9be15f7e7d85745d00";
    const ExpectedAmount = "833333";
    const ExpectedFromAddr = "0x60846cc8f6b882e48dd4b5a0b4a414e776539885";
    const ExpectedToAddr = "0xd2681a05e1a095291dbbff9be15f7e7d85745d00";
    const ExpectedTimeStamp = "1646632630";
    const ExpectedHash =
      "0x05e567f50ab5def6e14f3b63347601a41f92b9c9e939cf401d0153e69e8e06cc";

    const ExpectedLastAddress = "0xd2681a05e1a095291dbbff9be15f7e7d85745d00";
    const ExpectedLastAmount = "400";
    const ExpectedLastFromAddr = "0xd2681a05e1a095291dbbff9be15f7e7d85745d00";
    const ExpectedLastToAddr = "0x89f980e573e75f7418f9588fe9ad1713f1ad58bd";
    const ExpectedLastTimeStamp = "1657523919";
    const ExpectedLastHash =
      "0x6e7b13a781a3f5ad5888070a6412a1d6f66a04024b7099508930b8524c165a99";

    const firstTestData = JSON.parse(`[
        {
          "blockNumber": "14337997",
          "timeStamp": "1646632630",
          "hash": "0x05e567f50ab5def6e14f3b63347601a41f92b9c9e939cf401d0153e69e8e06cc",
          "nonce": "2741",
          "blockHash": "0x4d5803dea3fb8369ec9bd6a6818b90e51fcb4994ae99be1557ab00b6fc452edd",
          "from": "0x60846cc8f6b882e48dd4b5a0b4a414e776539885",
          "contractAddress": "0x22987407fd1fc5a971e3fda3b3e74c88666cda91",
          "to": "0xd2681a05e1a095291dbbff9be15f7e7d85745d00",
          "value": "833333000000000000000000",
          "tokenName": "Smart Reward Token",
          "tokenSymbol": "SRT",
          "tokenDecimal": "18",
          "transactionIndex": "84",
          "gas": "117846",
          "gasPrice": "24222159931",
          "gasUsed": "58923",
          "cumulativeGasUsed": "4694807",
          "input": "deprecated",
          "confirmations": "782033"
        },
        {
          "blockNumber": "14364001",
          "timeStamp": "1646980421",
          "hash": "0x7946b2aa68ad894237e8a2bb67748eb10c00da65790961c6bbadfdb17483864a",
          "nonce": "2911",
          "blockHash": "0x9196f146ad6a8cfae5d66b4909d6b8cdc590320d7e96687f31babbb9032bdbbc",
          "from": "0x60846cc8f6b882e48dd4b5a0b4a414e776539885",
          "contractAddress": "0x22987407fd1fc5a971e3fda3b3e74c88666cda91",
          "to": "0xd2681a05e1a095291dbbff9be15f7e7d85745d00",
          "value": "833333000000000000000000",
          "tokenName": "Smart Reward Token",
          "tokenSymbol": "SRT",
          "tokenDecimal": "18",
          "transactionIndex": "15",
          "gas": "83646",
          "gasPrice": "22297509103",
          "gasUsed": "41823",
          "cumulativeGasUsed": "1297854",
          "input": "deprecated",
          "confirmations": "756029"
        },
        {
          "blockNumber": "14383115",
          "timeStamp": "1647239025",
          "hash": "0x95c11bd083dada1d8e8a91a16ce0f35b7b49f69dfef8bdb1f62d5725d809b0ae",
          "nonce": "3019",
          "blockHash": "0x099864528f7bc1889fda33413fb254511b349ae8a4873dba970730aec9049d3b",
          "from": "0x60846cc8f6b882e48dd4b5a0b4a414e776539885",
          "contractAddress": "0x22987407fd1fc5a971e3fda3b3e74c88666cda91",
          "to": "0xd2681a05e1a095291dbbff9be15f7e7d85745d00",
          "value": "833333000000000000000000",
          "tokenName": "Smart Reward Token",
          "tokenSymbol": "SRT",
          "tokenDecimal": "18",
          "transactionIndex": "55",
          "gas": "83646",
          "gasPrice": "58436169225",
          "gasUsed": "41823",
          "cumulativeGasUsed": "11617577",
          "input": "deprecated",
          "confirmations": "736915"
        }
      ]`);

    const secondTestData = JSON.parse(`[
        {
          "blockNumber": "14337997",
          "timeStamp": "1646632630",
          "hash": "0x05e567f50ab5def6e14f3b63347601a41f92b9c9e939cf401d0153e69e8e06cc",
          "nonce": "2741",
          "blockHash": "0x4d5803dea3fb8369ec9bd6a6818b90e51fcb4994ae99be1557ab00b6fc452edd",
          "from": "0x60846cc8f6b882e48dd4b5a0b4a414e776539885",
          "contractAddress": "0x22987407fd1fc5a971e3fda3b3e74c88666cda91",
          "to": "0xd2681a05e1a095291dbbff9be15f7e7d85745d00",
          "value": "833333000000000000000000",
          "tokenName": "Smart Reward Token",
          "tokenSymbol": "SRT",
          "tokenDecimal": "18",
          "transactionIndex": "84",
          "gas": "117846",
          "gasPrice": "24222159931",
          "gasUsed": "58923",
          "cumulativeGasUsed": "4694807",
          "input": "deprecated",
          "confirmations": "782033"
        },
        {
          "blockNumber": "14364001",
          "timeStamp": "1646980421",
          "hash": "0x7946b2aa68ad894237e8a2bb67748eb10c00da65790961c6bbadfdb17483864a",
          "nonce": "2911",
          "blockHash": "0x9196f146ad6a8cfae5d66b4909d6b8cdc590320d7e96687f31babbb9032bdbbc",
          "from": "0x60846cc8f6b882e48dd4b5a0b4a414e776539885",
          "contractAddress": "0x22987407fd1fc5a971e3fda3b3e74c88666cda91",
          "to": "0xd2681a05e1a095291dbbff9be15f7e7d85745d00",
          "value": "833333000000000000000000",
          "tokenName": "Smart Reward Token",
          "tokenSymbol": "SRT",
          "tokenDecimal": "18",
          "transactionIndex": "15",
          "gas": "83646",
          "gasPrice": "22297509103",
          "gasUsed": "41823",
          "cumulativeGasUsed": "1297854",
          "input": "deprecated",
          "confirmations": "756029"
        },
        {
          "blockNumber": "14383115",
          "timeStamp": "1647239025",
          "hash": "0x95c11bd083dada1d8e8a91a16ce0f35b7b49f69dfef8bdb1f62d5725d809b0ae",
          "nonce": "3019",
          "blockHash": "0x099864528f7bc1889fda33413fb254511b349ae8a4873dba970730aec9049d3b",
          "from": "0x60846cc8f6b882e48dd4b5a0b4a414e776539885",
          "contractAddress": "0x22987407fd1fc5a971e3fda3b3e74c88666cda91",
          "to": "0xd2681a05e1a095291dbbff9be15f7e7d85745d00",
          "value": "833333000000000000000000",
          "tokenName": "Smart Reward Token",
          "tokenSymbol": "SRT",
          "tokenDecimal": "18",
          "transactionIndex": "55",
          "gas": "83646",
          "gasPrice": "58436169225",
          "gasUsed": "41823",
          "cumulativeGasUsed": "11617577",
          "input": "deprecated",
          "confirmations": "736915"
        },
        {
          "blockNumber": "15119962",
          "timeStamp": "1657523919",
          "hash": "0x6e7b13a781a3f5ad5888070a6412a1d6f66a04024b7099508930b8524c165a99",
          "nonce": "1100",
          "blockHash": "0xf62adf2181566060a8523f60d06dc3ea16dc6f7b1bf12e9f8cbdb9ee794d8f4a",
          "from": "0xd2681a05e1a095291dbbff9be15f7e7d85745d00",
          "contractAddress": "0x22987407fd1fc5a971e3fda3b3e74c88666cda91",
          "to": "0x735038aef13b26b47242c306850e1d7ee3335152",
          "value": "249500000000000000000000",
          "tokenName": "Smart Reward Token",
          "tokenSymbol": "SRT",
          "tokenDecimal": "18",
          "transactionIndex": "28",
          "gas": "69853",
          "gasPrice": "35000000000",
          "gasUsed": "69853",
          "cumulativeGasUsed": "3874819",
          "input": "deprecated",
          "confirmations": "68"
        },
        {
          "blockNumber": "15119962",
          "timeStamp": "1657523919",
          "hash": "0x6e7b13a781a3f5ad5888070a6412a1d6f66a04024b7099508930b8524c165a99",
          "nonce": "1100",
          "blockHash": "0xf62adf2181566060a8523f60d06dc3ea16dc6f7b1bf12e9f8cbdb9ee794d8f4a",
          "from": "0xd2681a05e1a095291dbbff9be15f7e7d85745d00",
          "contractAddress": "0x22987407fd1fc5a971e3fda3b3e74c88666cda91",
          "to": "0x89f980e573e75f7418f9588fe9ad1713f1ad58bd",
          "value": "400000000000000000000",
          "tokenName": "Smart Reward Token",
          "tokenSymbol": "SRT",
          "tokenDecimal": "18",
          "transactionIndex": "28",
          "gas": "69853",
          "gasPrice": "35000000000",
          "gasUsed": "69853",
          "cumulativeGasUsed": "3874819",
          "input": "deprecated",
          "confirmations": "68"
        }
      ]`);
    await infoService.clearTxData(ExpectedAddress);

    let isExists = await infoService.isExists(ExpectedAddress);
    if (!isExists) {
      assert.equal(isExists, false, "Remain elements");
      await infoService.createInitialDatas(ExpectedAddress, firstTestData);
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
    assert.equal(
      txDatas[0]["sTimeStamp"],
      ExpectedTimeStamp,
      `Do not matched ${ExpectedTimeStamp} : ${txDatas[0]["sTimeStamp"]}`
    );

    await infoService.insertTransferData(ExpectedAddress, secondTestData);
    const txSecDatas = await infoService.getTxData(ExpectedAddress);

    assert.equal(
        txSecDatas[txSecDatas.length - 1]["sWalletAddress"],
        ExpectedLastAddress,
        `Do not matched ${ExpectedAddress} : ${txSecDatas[txSecDatas.length - 1]["sWalletAddress"]}`
      );
      assert.equal(
        txSecDatas[txSecDatas.length - 1]["sFromAddress"],
        ExpectedLastFromAddr,
        `Do not matched ${ExpectedAddress} : ${txSecDatas[txSecDatas.length - 1]["sFromAddress"]}`
      );
      assert.equal(
        txSecDatas[txSecDatas.length - 1]["sToAddr"],
        ExpectedLastToAddr,
        `Do not matched ${ExpectedToAddr} : ${txSecDatas[txSecDatas.length - 1]["sToAddr"]}`
      );
      assert.equal(
        txSecDatas[txSecDatas.length - 1]["nAmount"],
        ExpectedLastAmount,
        `Do not matched ${ExpectedAmount} : ${txSecDatas[txSecDatas.length - 1]["nAmount"]}`
      );
      assert.equal(
        txSecDatas[txSecDatas.length - 1]["sTxHash"],
        ExpectedLastHash,
        `Do not matched ${ExpectedAddress} : ${txSecDatas[txSecDatas.length - 1]["sTxHash"]}`
      );
      assert.equal(
        txSecDatas[txSecDatas.length - 1]["sTimeStamp"],
        ExpectedLastTimeStamp,
        `Do not matched ${ExpectedTimeStamp} : ${txSecDatas[txSecDatas.length - 1]["sTimeStamp"]}`
      );

    await infoService.clearTxData(ExpectedAddress);
    isExists = await infoService.isExists(ExpectedAddress);

    assert.equal(isExists, false);
  });
});
