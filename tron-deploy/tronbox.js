module.exports = {

    networks: {



        
nile: {

    privateKey: "c48d74a3b40c6b125d9e9ac0fcbbcf85116cc942868350d0afda8600340b79a2",

    userFeePercentage: 100,

feeLimit: 500000000,

    fullHost:
    "https://nile.trongrid.io",

    network_id: "3",

    solidityNode:
    "https://nile.trongrid.io",

    eventServer:
    "https://nile.trongrid.io",

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

                }

            }

        }

    }

};