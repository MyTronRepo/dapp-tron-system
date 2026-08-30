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

        const contract = tronWeb.contract(
    contractArtifact.abi,
    process.env.CONTRACT_ADDRESS
);

        const basic = await contract
            .getPropertyBasic(propertyId)
            .call();


        const details = await contract
            .getPropertyDetails(propertyId)
            .call();


        const location = await contract
            .getPropertyLocation(propertyId)
            .call();



        return {

            propertyId: basic[0],

            province: basic[1],

            city: basic[2],

            district: basic[3],

            parcelNumber: basic[4],


            area: Number(
                details[0].toString()
            ),

            buildYear: Number(
                details[1]
            ),

            usageType:
                details[2],

            constructionStatus:
                details[3],


            latitude:
                Number(
                    location[0].toString()
                ) / 1000000,


            longitude:
                Number(
                    location[1].toString()
                ) / 1000000,


            status:
                Number(
                    location[2]
                ),


            exists:
                location[3]

        };


    } catch(error){

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