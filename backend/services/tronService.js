const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

const originalLookup = dns.lookup;

dns.lookup = function (hostname, options, callback) {
    if (hostname === "nile.trongrid.io") {
        if (typeof options === "function") {
            return options(null, "52.33.11.204", 4);
        }

        if (typeof callback === "function") {
            return callback(null, "52.33.11.204", 4);
        }
    }

    return originalLookup.call(dns, hostname, options, callback);
};

require("dotenv").config();

const TronWeb = require("tronweb");


const contractArtifact =
    require("../../tron-deploy/build/contracts/DappTronSystem.json");

const tronWeb = new TronWeb({

    fullNode: "https://nile.trongrid.io",
solidityNode: "https://nile.trongrid.io",
eventServer: "https://nile.trongrid.io",

    privateKey: process.env.PRIVATE_KEY

});



// REGISTER PROPERTY ON BLOCKCHAIN

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
    "https://nile.trongrid.io"
);

    console.log(
        "BLOCKCHAIN CONTRACT:",
        process.env.CONTRACT_ADDRESS
    );


    try {


        console.log(
            "TRON ADDRESS:",
            tronWeb.defaultAddress.base58
        );



     const contract = tronWeb.contract(
    contractArtifact.abi,
    process.env.CONTRACT_ADDRESS
);



const tx = await contract
    .registerProperty([
        propertyId,
        province,
        city,
        district,
        parcelNumber,
        Number(area),
        Number(buildYear),
        usageType,
        constructionStatus,
        Math.round(Number(latitude) * 1000000),
        Math.round(Number(longitude) * 1000000)
    ])
    .send({
        feeLimit: 100000000
    });

console.log("PROPERTY REGISTERED TX:", tx);

return tx;



    } catch(error) {


        console.log(
            "BLOCKCHAIN ERROR:",
            error.message
        );


        throw error;

    }

};





// GET PROPERTY FROM BLOCKCHAIN

const getPropertyFromBlockchain = async (propertyId) => {
    try {
        const contract = await tronWeb
            .contract()
            .at(process.env.CONTRACT_ADDRESS);

        const result = await contract
            .getProperty(propertyId)
            .call();

        return {
            propertyId: result.propertyId ?? result[0],

            province: result.province ?? result[1],

            city: result.city ?? result[2],

            district: result.district ?? result[3],

            parcelNumber: result.parcelNumber ?? result[4],

            area: Number(
                (result.area ?? result[5]).toString()
            ),

            buildYear: Number(
                (result.buildYear ?? result[6]).toString()
            ),

            usageType:
                result.usageType ?? result[7]?.toString(),

            constructionStatus:
                result.constructionStatus ?? result[8]?.toString(),

            latitude:
                Number(
                    (result.latitude ?? result[9]).toString()
                ) / 1000000,

            longitude:
                Number(
                    (result.longitude ?? result[10]).toString()
                ) / 1000000,

            status: Number(
                (result.status ?? result[11]).toString()
            ),

            exists:
                result.exists ?? result[12]
        };

    } catch (error) {

        console.log(
            "BLOCKCHAIN READ ERROR:",
            error.message
        );

        throw error;
    }
};

module.exports = {

    tronWeb,

    registerPropertyOnBlockchain,

    getPropertyFromBlockchain

};