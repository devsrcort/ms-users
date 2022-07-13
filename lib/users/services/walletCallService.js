const axios = require("axios");

class WalletCallService {
  constructor() {
    this.API_BASE =
      process.env.NODE_ENV == "production"
        ? "https://app.srt-wallet.io/"
        : // "https://app.dev.srt-wallet.io/";
          "http://192.168.0.7:38512/";
  }

  async createAccount() {

  }
}

module.exports = WalletCallService;
