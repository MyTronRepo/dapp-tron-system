module.exports = {
  networks: {
    development: {
      privateKey: "",
      consume_user_resource_percent: 30,
      feeLimit: 100000000,
      fullHost: "https://api.nileex.io"
    }
  },

  compilers: {
    solc: {
      version: "0.8.0"
    }
  }
};