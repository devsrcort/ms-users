/* jshint -W079 */
const Promise = require("bluebird"),
    config = require("config"),
    log = require("metalogger")(),
    representor = require("kokua"),
    BN = require('bn.js'),
    _ = require("lodash");

const TxInfoModel = require("users/models/txInfo");

class TransactionService {
    constructor() {
        this.model = new TxInfoModel();

        this.strTestData = `[
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
          ]`;
    }

    async createTxData(targetAddr, fromAddr, toAddr, amount, txHash) {
        return await this.model.createTxData(targetAddr, fromAddr, toAddr, amount, txHash);
    }

    async getTxData(targetAddr) {
        return await this.model.getTxData(targetAddr);
    }

    async isExists(targetAddr) {
        return await this.model.isExists(targetAddr);
    }

    async clearTxData(targetAddr) {
        return await this.model.clearTxData(targetAddr);
    }

    async createInitialDatas(targetAddr) {
        const recvData = JSON.parse(this.strTestData);

        for (const item in recvData) {
            log.info(item);

            const fromAddr = recvData[item].from;
            const toAddr = recvData[item].to;
            const decimal = recvData[item].tokenDecimal;
            const txHash = recvData[item].hash;
            const amount = recvData[item].amount;

            log.info(`fromAddr : ${fromAddr}, toAddr : ${toAddr}, amount : ${amount}`);

            const modAmt = this.convertAmount(amount, decimal);
            
            await this.createTxData(targetAddr, fromAddr, toAddr, modAmt.toString(), txHash);
        }

        return true;
    }

    convertAmount (value, decimal) {
        
        const floatting = (new BN(10)).pow(new BN(decimal));
        return (new BN(value)).div(floatting);
    }
}

module.exports = TransactionService;