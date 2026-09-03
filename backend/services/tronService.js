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


/*
|--------------------------------------------------------------------------
| TRON WEB
|--------------------------------------------------------------------------
*/

const tronWeb = new TronWeb({
    fullNode: "https://nile.trongrid.io",
    solidityNode: "https://nile.trongrid.io",
    eventServer: "https://nile.trongrid.io",

    privateKey: process.env.PRIVATE_KEY
});


/*
|--------------------------------------------------------------------------
| REGISTER PROPERTY ON BLOCKCHAIN
|--------------------------------------------------------------------------
*/

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


        /*
        |--------------------------------------------------------------------------
        | Create contract instance
        |--------------------------------------------------------------------------
        */

        const contract = tronWeb.contract(
            contractArtifact.abi,
            process.env.CONTRACT_ADDRESS
        );


        /*
        |--------------------------------------------------------------------------
        | Convert values
        |--------------------------------------------------------------------------
        */

        const areaValue = Number(area);

        const buildYearValue = Number(buildYear);

        const latitudeValue =
            Math.round(Number(latitude) * 1000000);

        const longitudeValue =
            Math.round(Number(longitude) * 1000000);


        /*
        |--------------------------------------------------------------------------
        | Register property
        |--------------------------------------------------------------------------
        */

        const tx = await contract
            .registerProperty(
                propertyId,
                province,
                city,
                district,
                parcelNumber,
                areaValue,
                buildYearValue,
                usageType,
                constructionStatus,
                latitudeValue,
                longitudeValue
            )
            .send({
                feeLimit: 100000000
            });


        console.log(
            "PROPERTY REGISTERED TX:",
            tx
        );


        return tx;

    } catch (error) {

        console.log(
            "BLOCKCHAIN ERROR:",
            error.message
        );

        console.log(
            "BLOCKCHAIN ERROR FULL:",
            error
        );

        throw error;
    }

};


/*
|--------------------------------------------------------------------------
| GET PROPERTY FROM BLOCKCHAIN
|--------------------------------------------------------------------------
*/

const getPropertyFromBlockchain = async (propertyId) => {

    try {

        console.log(
            "READING PROPERTY FROM BLOCKCHAIN:",
            propertyId
        );

        console.log(
            "BLOCKCHAIN CONTRACT:",
            process.env.CONTRACT_ADDRESS
        );

        const contract = await tronWeb
            .contract()
            .at(process.env.CONTRACT_ADDRESS);

        console.log(
            "CONTRACT HAS getProperty:",
            typeof contract.methods.getProperty
        );

        const property = await contract.methods
            .getProperty(propertyId)
            .call();

        console.log(
            "BLOCKCHAIN RAW PROPERTY RESULT:",
            property
        );

        console.log(
            "BLOCKCHAIN RAW PROPERTY RESULT JSON:",
            JSON.stringify(property, null, 2)
        );

        if (
            !property ||
            !Array.isArray(property) ||
            property.length < 13
        ) {
            throw new Error(
                "Invalid blockchain property response"
            );
        }

        return {

            propertyId:
                property[0],

            province:
                property[1],

            city:
                property[2],

            district:
                property[3],

            parcelNumber:
                property[4],

            area:
                Number(
                    property[5].toString()
                ),

            buildYear:
                Number(
                    property[6].toString()
                ),

            usageType:
                property[7],

            constructionStatus:
                property[8],

            latitude:
                Number(
                    property[9].toString()
                ) / 1000000,

            longitude:
                Number(
                    property[10].toString()
                ) / 1000000,

            status:
                Number(
                    property[11].toString()
                ),

            exists:
                Boolean(
                    property[12]
                )

        };

    } catch (error) {

        console.log(
            "BLOCKCHAIN READ ERROR:",
            error?.message
        );

        console.log(
            "BLOCKCHAIN READ ERROR FULL:",
            error
        );

        throw error;

    }

};

/*
|--------------------------------------------------------------------------
| UPDATE PROPERTY ON BLOCKCHAIN
|--------------------------------------------------------------------------
*/

const updatePropertyOnBlockchain = async ({
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

        console.log(
            "UPDATING PROPERTY ON BLOCKCHAIN:",
            propertyId
        );

        console.log(
            "BLOCKCHAIN CONTRACT:",
            process.env.CONTRACT_ADDRESS
        );

        console.log(
            "TRON ADDRESS:",
            tronWeb.defaultAddress.base58
        );

        const contract = tronWeb.contract(
            contractArtifact.abi,
            process.env.CONTRACT_ADDRESS
        );

        const areaValue = Number(area);

        const buildYearValue = Number(buildYear);

        const latitudeValue =
            Math.round(Number(latitude) * 1000000);

        const longitudeValue =
            Math.round(Number(longitude) * 1000000);

    const tx = await contract
    .updateProperty([
        propertyId,
        province,
        city,
        district,
        parcelNumber,
        areaValue,
        buildYearValue,
        usageType,
        constructionStatus,
        latitudeValue,
        longitudeValue
    ])
    .send({
        feeLimit: 100000000
    });

        console.log(
            "PROPERTY UPDATED TX:",
            tx
        );

        return tx;

    } catch (error) {

        console.log(
            "BLOCKCHAIN UPDATE ERROR:",
            error?.message
        );

        console.log(
            "BLOCKCHAIN UPDATE ERROR FULL:",
            error
        );

        throw error;
    }

};

// GET ALL PROPERTY IDS FROM BLOCKCHAIN

const getPropertyIdsFromBlockchain = async () => {

    try {

        console.log(
            "READING PROPERTY IDS FROM BLOCKCHAIN"
        );

        console.log(
            "BLOCKCHAIN CONTRACT:",
            process.env.CONTRACT_ADDRESS
        );

        const contract = await tronWeb
            .contract()
            .at(process.env.CONTRACT_ADDRESS);

        console.log(
            "CONTRACT HAS getPropertyIds:",
            typeof contract.methods.getPropertyIds
        );

        const result = await contract.methods
            .getPropertyIds()
            .call();

        console.log(
            "BLOCKCHAIN PROPERTY IDS:",
            result
        );

        return result;

    } catch (error) {

        console.log(
            "GET PROPERTY IDS ERROR:",
            error.message
        );

        console.log(
            "GET PROPERTY IDS ERROR FULL:",
            error
        );

        throw error;
    }
};

/*
|--------------------------------------------------------------------------
| GET DOCUMENTS FROM BLOCKCHAIN
|--------------------------------------------------------------------------
*/

const getDocumentsFromBlockchain = async (propertyId) => {

    try {

        console.log(
            "READING DOCUMENTS FROM BLOCKCHAIN:",
            propertyId
        );

        const contract = await tronWeb
            .contract()
            .at(process.env.CONTRACT_ADDRESS);

        const documents = await contract.methods
            .getDocuments(propertyId)
            .call();

        console.log(
            "BLOCKCHAIN DOCUMENTS:",
            documents
        );

        return documents;

    } catch (error) {

        console.log(
            "GET DOCUMENTS BLOCKCHAIN ERROR:",
            error?.message
        );

        console.log(
            "GET DOCUMENTS BLOCKCHAIN ERROR FULL:",
            error
        );

        throw error;

    }

};

const registerDocumentOnBlockchain = async (
    propertyId,
    documentHash,
    documentURI
) => {

    try {

        console.log(
            "REGISTERING DOCUMENT ON BLOCKCHAIN:",
            propertyId
        );


        const contract = await tronWeb.contract(
            contractArtifact.abi,
            process.env.CONTRACT_ADDRESS
        );


        const formattedHash = "0x" + documentHash;


        const tx = await contract
            .registerDocument(
                propertyId,
                formattedHash,
                documentURI
            )
            .send({
                feeLimit: 100000000
            });


        console.log(
            "DOCUMENT REGISTERED TX:",
            tx
        );


        return tx;


    } catch (error) {

        console.log(
            "DOCUMENT REGISTER ERROR:",
            error?.message
        );


        console.log(
            "DOCUMENT REGISTER ERROR FULL:",
            error
        );


        throw error;

    }

};


const verifyDocumentOnBlockchain = async (
    propertyId,
    documentIndex
) => {

    try {

        console.log(
            "VERIFYING DOCUMENT ON BLOCKCHAIN:",
            propertyId,
            documentIndex
        );


        const contract = await tronWeb.contract(
            contractArtifact.abi,
            process.env.CONTRACT_ADDRESS
        );


        const tx = await contract
            .verifyDocument(
                propertyId,
                documentIndex
            )
            .send({
                feeLimit: 100000000
            });


        console.log(
            "DOCUMENT VERIFIED BLOCKCHAIN TX:",
            tx
        );


        return tx;


    } catch(error){

        console.log(
            "VERIFY DOCUMENT BLOCKCHAIN ERROR:",
            error.message
        );


        console.log(
            error
        );


        throw error;

    }

};

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/


module.exports = {

    tronWeb,

    registerPropertyOnBlockchain,

    verifyDocumentOnBlockchain,

    updatePropertyOnBlockchain,

    getPropertyFromBlockchain,

    getPropertyIdsFromBlockchain,

    getDocumentsFromBlockchain,

    registerDocumentOnBlockchain

};