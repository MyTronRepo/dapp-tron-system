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
    try {
        const contract = await tronWeb.contract().at(
            process.env.CONTRACT_ADDRESS
        );

        const tx = await contract
            .registerProperty(
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
            )
            .send({
                feeLimit: 100000000
            });

        return tx;

    } catch (error) {
        console.log(
            "Register Property Blockchain Error:",
            error.message
        );

        throw error;
    }
};

module.exports = {
    registerPropertyOnBlockchain
};