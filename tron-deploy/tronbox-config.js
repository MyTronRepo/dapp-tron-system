require("dotenv").config({
    path: "../.env"
});

module.exports = {

    networks: {

        nile: {

            privateKey: process.env.PRIVATE_KEY,

            userFeePercentage: 100,

            feeLimit: 500000000,

            fullHost: "https://nile.trongrid.io",

            network_id: "3",

            solidityNode: "https://nile.trongrid.io",

            eventServer: "https://nile.trongrid.io",

            consume_user_resource_percent: 100
        }

    },

    compilers: {

        solc: {

            version: "0.8.25",

            settings: {

                optimizer: {

                    enabled: true,

                    runs: 200

                },

                viaIR: true

            }

        }

    }

};