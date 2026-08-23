const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

require("dotenv").config();

const TronWeb = require("tronweb");

const tronWeb = new TronWeb({
    fullHost: process.env.TRON_FULL_HOST,
    privateKey: process.env.PRIVATE_KEY
});

const registerPropertyOnBlockchain = async ({
    propertyId,
    province,
    city,
    district,
    parcelNumber,
    area,
    buildYear,
    usageType,
    constructionStatus,
    latitude,
    longitude
}) => {

    console.log(
        "BLOCKCHAIN HOST:",
        process.env.TRON_FULL_HOST
    );

    console.log(
        "BLOCKCHAIN CONTRACT:",
        process.env.CONTRACT_ADDRESS
    );

    try {

        const contract = await tronWeb
            .contract()
            .at(process.env.CONTRACT_ADDRESS);


        const tx = await contract
            .registerProperty(
                propertyId,
                province,
                city,
                district,
                parcelNumber,
                Number(area),
                Number(buildYear),
                usageType,
                constructionStatus,
                Number(latitude),
                Number(longitude)
            )
            .send({
                feeLimit: 100000000
            });


        console.log(
            "PROPERTY REGISTERED ON BLOCKCHAIN:",
            tx
        );


        return tx;


    } catch (error) {

        console.log(
            "BLOCKCHAIN ERROR:",
            error.message
        );

        throw error;
    }
};


module.exports = {
    registerPropertyOnBlockchain
};