const axios = require("axios");

const res = async function() {
    await axios.get("https://app.srt-wallet.io/users/");
};

res();