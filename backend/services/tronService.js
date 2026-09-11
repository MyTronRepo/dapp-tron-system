require("dotenv").config();

const TronWeb = require("tronweb");

const { Interface } = require("ethers");

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


const getTransactionCost = async (txid) => {
    if (!txid) {
        throw new Error("Transaction ID required");
    }

    let transaction = null;

    // --------------------------------------------------
    // STEP 1: Wait for transaction confirmation
    // --------------------------------------------------

    for (let attempt = 1; attempt <= 20; attempt++) {

        console.log(
            `CHECKING TRANSACTION STATUS (${attempt}/20):`,
            txid
        );

        transaction =
            await tronWeb.trx.getTransaction(txid);

        console.log(
            "TRANSACTION STATUS:",
            JSON.stringify(
                transaction,
                null,
                2
            )
        );

        if (
            transaction &&
            transaction.txID &&
            transaction.ret &&
            transaction.ret[0]?.contractRet === "SUCCESS"
        ) {
            console.log(
                "TRANSACTION CONFIRMED:",
                txid
            );

            break;
        }

        await new Promise(
            resolve =>
                setTimeout(resolve, 1500)
        );
    }

    if (
        !transaction ||
        transaction.ret?.[0]?.contractRet !== "SUCCESS"
    ) {
        throw new Error(
            "Transaction was not confirmed successfully"
        );
    }


    // --------------------------------------------------
    // STEP 2: Wait for transaction cost information
    // --------------------------------------------------

    let transactionInfo = null;

    for (let attempt = 1; attempt <= 30; attempt++) {

        console.log(
            `CHECKING TRANSACTION COST (${attempt}/30):`,
            txid
        );

        transactionInfo =
            await tronWeb.trx.getTransactionInfo(txid);

        console.log(
            "TRANSACTION COST INFO:",
            JSON.stringify(
                transactionInfo,
                null,
                2
            )
        );

        const receipt =
            transactionInfo?.receipt;

        if (
            transactionInfo?.blockNumber !== undefined &&
            receipt
        ) {

            const energyUsed =
                Number(
                    receipt.energy_usage_total || 0
                );

            const energyFee =
                Number(
                    receipt.energy_fee || 0
                );

            const bandwidthUsed =
                Number(
                    receipt.net_usage || 0
                );

            const bandwidthFee =
                Number(
                    receipt.net_fee || 0
                );

            const totalFee =
                Number(
                    transactionInfo.fee || 0
                );

            if (
                energyUsed > 0 ||
                energyFee > 0 ||
                bandwidthUsed > 0 ||
                bandwidthFee > 0 ||
                totalFee > 0
            ) {

                return {
                    txid,
                    energyUsed,
                    energyFee,
                    bandwidthUsed,
                    bandwidthFee,
                    totalFee,
                    totalTRX:
                        totalFee / 1_000_000
                };
            }
        }

        await new Promise(
            resolve =>
                setTimeout(resolve, 2000)
        );
    }

    throw new Error(
        "Transaction cost information not available yet"
    );
};

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


/*
|--------------------------------------------------------------------------
| GET ALL PROPERTY IDS FROM BLOCKCHAIN
|--------------------------------------------------------------------------
*/

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
| REGISTER DOCUMENT ON BLOCKCHAIN
|--------------------------------------------------------------------------
*/

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

        console.log(
            "DOCUMENT HASH:",
            documentHash
        );

        console.log(
            "DOCUMENT URI:",
            documentURI
        );

        console.log(
            "BLOCKCHAIN CONTRACT:",
            process.env.CONTRACT_ADDRESS
        );

        const contract = tronWeb.contract(
            contractArtifact.abi,
            process.env.CONTRACT_ADDRESS
        );

        const formattedHash =
            documentHash.startsWith("0x")
                ? documentHash
                : "0x" + documentHash;

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
            "DOCUMENT REGISTERED BLOCKCHAIN TX:",
            tx
        );

        return tx;

    } catch (error) {

        console.log(
            "REGISTER DOCUMENT BLOCKCHAIN ERROR:",
            error?.message
        );

        console.log(
            "REGISTER DOCUMENT BLOCKCHAIN ERROR FULL:",
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

        console.log(
            "BLOCKCHAIN CONTRACT:",
            process.env.CONTRACT_ADDRESS
        );

        /*
         * ------------------------------------------------------------
         * Use the contract ABI to encode getDocuments(string)
         * ------------------------------------------------------------
         */

        const iface = new Interface(contractArtifact.abi);

        const functionData = iface.encodeFunctionData(
            "getDocuments",
            [propertyId]
        );

        const functionSelector =
            functionData.slice(0, 10);

        const parameter =
            functionData.slice(10);

        console.log(
            "GET DOCUMENTS FUNCTION SELECTOR:",
            functionSelector
        );

        console.log(
            "GET DOCUMENTS PARAMETER:",
            parameter
        );

        /*
         * ------------------------------------------------------------
         * Call TRON constant contract directly.
         *
         * TronWeb 5.3.5 may expose tuple[] returned by Solidity
         * as:
         *
         * [
         *     [],
         *     [],
         *     []
         * ]
         *
         * Therefore we bypass TronWeb's tuple conversion and decode
         * the raw constant_result ourselves using ethers.
         * ------------------------------------------------------------
         */

        const response = await fetch(
            "https://nile.trongrid.io/wallet/triggerconstantcontract",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    owner_address:
                        tronWeb.defaultAddress.base58,

                    contract_address:
                        process.env.CONTRACT_ADDRESS,

                    function_selector:
                        "getDocuments(string)",

                    parameter,

                    visible: true
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                `TRON constant call failed: HTTP ${response.status}`
            );
        }

        const result = await response.json();

        console.log(
            "TRON CONSTANT CONTRACT RESPONSE:",
            JSON.stringify(result, null, 2)
        );

        if (
            !result ||
            !Array.isArray(result.constant_result) ||
            result.constant_result.length === 0
        ) {
            throw new Error(
                "Blockchain returned no constant result for getDocuments"
            );
        }

        const rawResult =
            "0x" + result.constant_result[0];

        console.log(
            "GET DOCUMENTS RAW HEX:",
            rawResult
        );

        /*
         * ------------------------------------------------------------
         * Decode the raw Solidity return value.
         * ------------------------------------------------------------
         */

        const decoded =
            iface.decodeFunctionResult(
                "getDocuments",
                rawResult
            );

        console.log(
            "GET DOCUMENTS DECODED:",
            decoded
        );

        /*
         * decodeFunctionResult returns a Result object.
         *
         * The first output is the Document[] array.
         */

        const documents =
            decoded[0];

        console.log(
            "DECODED DOCUMENTS LENGTH:",
            documents.length
        );

        /*
         * ------------------------------------------------------------
         * Normalize decoded tuples
         * ------------------------------------------------------------
         */

        const normalizedDocuments =
            documents.map((doc, index) => {

                const propertyIdValue =
                    doc.propertyId ??
                    doc[0];

                const documentHashValue =
                    doc.documentHash ??
                    doc[1];

                const documentURIValue =
                    doc.documentURI ??
                    doc[2];

                const issueDateValue =
                    doc.issueDate ??
                    doc[3];

                const statusValue =
                    doc.status ??
                    doc[4];

                return {
                    index,

                    propertyId:
                        propertyIdValue !== undefined
                            ? String(propertyIdValue)
                            : null,

                    documentHash:
                        documentHashValue !== undefined
                            ? String(documentHashValue)
                            : null,

                    documentURI:
                        documentURIValue !== undefined
                            ? String(documentURIValue)
                            : null,

                    issueDate:
                        issueDateValue !== undefined
                            ? String(issueDateValue)
                            : null,

                    status:
                        statusValue !== undefined
                            ? Number(statusValue.toString())
                            : null
                };
            });

        console.log(
            "NORMALIZED DOCUMENTS:",
            JSON.stringify(
                normalizedDocuments,
                null,
                2
            )
        );

        return normalizedDocuments;

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

/*
|--------------------------------------------------------------------------
| VERIFY DOCUMENT ON BLOCKCHAIN
|--------------------------------------------------------------------------
*/

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

    } catch (error) {

        console.log(
            "VERIFY DOCUMENT BLOCKCHAIN ERROR:",
            error?.message
        );

        console.log(
            "VERIFY DOCUMENT BLOCKCHAIN ERROR FULL:",
            error
        );

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| REPLACE DOCUMENT ON BLOCKCHAIN
|--------------------------------------------------------------------------
*/

const replaceDocumentOnBlockchain = async (
    propertyId,
    documentIndex,
    newDocumentHash,
    newDocumentURI
) => {

    try {

        console.log(
            "REPLACING DOCUMENT ON BLOCKCHAIN:",
            propertyId,
            documentIndex
        );

        const contract = await tronWeb.contract(
            contractArtifact.abi,
            process.env.CONTRACT_ADDRESS
        );

        const formattedHash =
            newDocumentHash.startsWith("0x")
                ? newDocumentHash
                : "0x" + newDocumentHash;

        const tx = await contract
            .replaceDocument(
                propertyId,
                documentIndex,
                formattedHash,
                newDocumentURI
            )
            .send({
                feeLimit: 100000000
            });

        console.log(
            "DOCUMENT REPLACED BLOCKCHAIN TX:",
            tx
        );

        return tx;

    } catch (error) {

        console.log(
            "REPLACE DOCUMENT BLOCKCHAIN ERROR:",
            error?.message
        );

        console.log(
            "REPLACE DOCUMENT BLOCKCHAIN ERROR FULL:",
            error
        );

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| REVOKE DOCUMENT ON BLOCKCHAIN
|--------------------------------------------------------------------------
*/

const revokeDocumentOnBlockchain = async (
    propertyId,
    documentIndex
) => {

    try {

        console.log(
            "REVOKING DOCUMENT ON BLOCKCHAIN:",
            propertyId,
            documentIndex
        );

        const contract = tronWeb.contract(
            contractArtifact.abi,
            process.env.CONTRACT_ADDRESS
        );

        const tx = await contract
            .revokeDocument(
                propertyId,
                documentIndex
            )
            .send({
                feeLimit: 100000000
            });

        console.log(
            "DOCUMENT REVOKE TX ID:",
            tx
        );

        /*
         * ----------------------------------------------------------
         * IMPORTANT:
         * TronWeb returns the transaction ID immediately.
         * That does NOT necessarily mean the transaction succeeded.
         *
         * We must query the transaction result from the blockchain.
         * ----------------------------------------------------------
         */

        let transactionInfo = null;

        for (let attempt = 1; attempt <= 10; attempt++) {

            console.log(
                `CHECKING REVOKE TRANSACTION (${attempt}/10):`,
                tx
            );

            transactionInfo =
                await tronWeb.trx.getTransaction(tx);

            if (
                transactionInfo &&
                transactionInfo.ret &&
                transactionInfo.ret.length > 0
            ) {
                break;
            }

            await new Promise(resolve =>
                setTimeout(resolve, 1000)
            );
        }

        console.log(
            "REVOKE TRANSACTION INFO:",
            JSON.stringify(
                transactionInfo,
                null,
                2
            )
        );

        const contractRet =
            transactionInfo?.ret?.[0]?.contractRet;

        console.log(
            "REVOKE TRANSACTION RESULT:",
            contractRet
        );

        /*
         * ----------------------------------------------------------
         * Transaction failed
         * ----------------------------------------------------------
         */

        if (contractRet !== "SUCCESS") {

            const error = new Error(
                `Blockchain transaction failed: ${contractRet || "UNKNOWN"}`
            );

            error.code = contractRet || "UNKNOWN";
            error.transactionId = tx;
            error.transactionInfo = transactionInfo;

            throw error;
        }

        /*
         * ----------------------------------------------------------
         * Transaction succeeded
         * ----------------------------------------------------------
         */

        console.log(
            "DOCUMENT REVOKED SUCCESSFULLY ON BLOCKCHAIN:",
            tx
        );

        return tx;

    } catch (error) {

        console.log(
            "REVOKE DOCUMENT BLOCKCHAIN ERROR:",
            error?.message
        );

        console.log(
            "REVOKE DOCUMENT BLOCKCHAIN ERROR FULL:",
            error
        );

        throw error;
    }

};

/*
|--------------------------------------------------------------------------
| GET TRANSFER REQUEST FROM BLOCKCHAIN
|--------------------------------------------------------------------------
*/

const getTransferRequestFromBlockchain = async (
    transferId
) => {

    try {

        console.log(
            "READING TRANSFER REQUEST FROM BLOCKCHAIN:",
            transferId
        );

        const contract = await tronWeb
            .contract()
            .at(process.env.CONTRACT_ADDRESS);

        const transfer =
            await contract.methods
                .getTransferRequest(
                    transferId
                )
                .call();

        console.log(
            "BLOCKCHAIN TRANSFER REQUEST:",
            transfer
        );

        return transfer;

    } catch (error) {

        console.log(
            "GET TRANSFER REQUEST BLOCKCHAIN ERROR:",
            error?.message
        );

        console.log(
            "GET TRANSFER REQUEST BLOCKCHAIN ERROR FULL:",
            error
        );

        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| GET TRANSFER HISTORY FROM BLOCKCHAIN
|--------------------------------------------------------------------------
*/

const getTransferHistoryFromBlockchain = async (
    propertyId
) => {

    try {

        console.log(
            "READING TRANSFER HISTORY FROM BLOCKCHAIN:",
            propertyId
        );

        const contract = await tronWeb
            .contract()
            .at(process.env.CONTRACT_ADDRESS);

        const history =
            await contract.methods
                .getTransferHistory(
                    propertyId
                )
                .call();

        console.log(
            "BLOCKCHAIN TRANSFER HISTORY:",
            history
        );

        return history;

    } catch (error) {

        console.log(
            "GET TRANSFER HISTORY BLOCKCHAIN ERROR:",
            error?.message
        );

        console.log(
            "GET TRANSFER HISTORY BLOCKCHAIN ERROR FULL:",
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

    updatePropertyOnBlockchain,

    getPropertyFromBlockchain,

    getPropertyIdsFromBlockchain,

    registerDocumentOnBlockchain,

    getDocumentsFromBlockchain,

    verifyDocumentOnBlockchain,

    replaceDocumentOnBlockchain,

    revokeDocumentOnBlockchain,

    getTransferRequestFromBlockchain,

    getTransferHistoryFromBlockchain,

    getTransactionCost
    
};