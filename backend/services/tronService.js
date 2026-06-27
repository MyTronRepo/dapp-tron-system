const TronWeb = require("tronweb");

const tronWeb = new TronWeb({
    fullHost: process.env.TRON_FULL_HOST,
    privateKey: process.env.PRIVATE_KEY
});

const registerPropertyOnBlockchain = async (propertyId, ownerAddress) => {

    try {

        const contract = await tronWeb.contract().at(process.env.CONTRACT_ADDRESS);

        return await contract.registerProperty(propertyId, ownerAddress).send({
            feeLimit: 100000000
        });

    } catch (error) {
        console.log(error.message);
        throw error;
    }
};

const transferOwnershipOnBlockchain = async (propertyId, from, to, share) => {

    try {

        const contract = await tronWeb.contract().at(process.env.CONTRACT_ADDRESS);

        return await contract.transferOwnership(propertyId, from, to, share).send({
            feeLimit: 100000000
        });

    } catch (error) {
        console.log(error.message);
        throw error;
    }
};

module.exports = {
    registerPropertyOnBlockchain,
    transferOwnershipOnBlockchain
};