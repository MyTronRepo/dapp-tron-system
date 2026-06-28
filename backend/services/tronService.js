const TronWeb = require("tronweb");

const tronWeb = new TronWeb({
    fullHost: process.env.TRON_FULL_HOST,
    privateKey: process.env.PRIVATE_KEY
});

// REGISTER PROPERTY (FIXED FOR REAL ESTATE CONTRACT)
const registerPropertyOnBlockchain = async (propertyId, documentHash = "0x00") => {
    try {
        const contract = await tronWeb.contract().at(process.env.CONTRACT_ADDRESS);

        const tx = await contract
            .registerProperty(propertyId, documentHash)
            .send({
                feeLimit: 100000000
            });

        return tx;

    } catch (error) {
        console.log("Register Error:", error.message);
        throw error;
    }
};

// UPDATE DOCUMENT
const updateDocumentOnBlockchain = async (propertyId, documentHash) => {
    try {
        const contract = await tronWeb.contract().at(process.env.CONTRACT_ADDRESS);

        const tx = await contract
            .updateDocument(propertyId, documentHash)
            .send({
                feeLimit: 100000000
            });

        return tx;

    } catch (error) {
        console.log("Update Error:", error.message);
        throw error;
    }
};

// CREATE TRANSFER
const createTransferOnBlockchain = async (transferId, propertyId, to, share) => {
    try {
        const contract = await tronWeb.contract().at(process.env.CONTRACT_ADDRESS);

        const tx = await contract
            .createTransfer(transferId, propertyId, to, share)
            .send({
                feeLimit: 100000000
            });

        return tx;

    } catch (error) {
        console.log("Transfer Error:", error.message);
        throw error;
    }
};

// APPROVE TRANSFER
const approveTransferOnBlockchain = async (transferId) => {
    try {
        const contract = await tronWeb.contract().at(process.env.CONTRACT_ADDRESS);

        const tx = await contract
            .approveTransfer(transferId)
            .send({
                feeLimit: 100000000
            });

        return tx;

    } catch (error) {
        console.log("Approve Error:", error.message);
        throw error;
    }
};

module.exports = {
    registerPropertyOnBlockchain,
    updateDocumentOnBlockchain,
    createTransferOnBlockchain,
    approveTransferOnBlockchain
};