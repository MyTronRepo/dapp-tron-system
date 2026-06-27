const fs = require("fs");

let TronWeb;
let tronWeb;
let contract;

const initTron = async () => {

    if (tronWeb) {

        return tronWeb;

    }

    TronWeb = (await import("tronweb")).default;

    tronWeb = new TronWeb({

        fullHost:

            process.env.TRON_FULL_HOST ||

            "https://nile.trongrid.io",

        privateKey:

            process.env.TRON_PRIVATE_KEY

    });

    return tronWeb;

};

const loadContract = async () => {

    if (contract) {

        return contract;

    }

    const tw = await initTron();

    contract = await tw.contract().at(

        process.env.CONTRACT_ADDRESS

    );

    return contract;

};

const registerPropertyOnBlockchain = async (

    propertyId,

    ownerWallet

) => {

    const c = await loadContract();

    return await c

        .registerProperty(

            propertyId,

            ownerWallet

        )

        .send();

};

const transferOwnershipOnBlockchain = async (

    propertyId,

    from,

    to,

    share

) => {

    const c = await loadContract();

    return await c

        .transferOwnership(

            propertyId,

            from,

            to,

            share

        )

        .send();

};

module.exports = {

    initTron,

    loadContract,

    registerPropertyOnBlockchain,

    transferOwnershipOnBlockchain

};