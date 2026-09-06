import contractAbi from "../contracts/contract-abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;


// ==============================
// GET TRONWEB
// ==============================

const getTronWeb = () => {

    const tronWeb =
        window.tronWeb ||
        window.tron?.tronWeb;

    if (!tronWeb) {
        throw new Error(
            "TronWeb unavailable. Please install/unlock TronLink."
        );
    }

    return tronWeb;
};


// ==============================
// CONNECT TRONLINK
// ==============================

export const connectTronLink = async () => {

    const tronWeb = getTronWeb();

    const address =
        tronWeb.defaultAddress?.base58;

    if (!address) {
        throw new Error(
            "Please unlock TronLink wallet first"
        );
    }

    console.log(
        "CONNECTED TRON ADDRESS:",
        address
    );

    return address;
};


// ==============================
// NETWORK CHECK
// ==============================

export const getTronNetwork = () => {

    const tronWeb = getTronWeb();

    const host =
        tronWeb.fullNode?.host || "";

    return {

        host,

        name:
            host.includes("nile")
                ? "Nile"
                : "Unknown",

        isCorrect:
            host.includes("nile")

    };
};


// ==============================
// CONTRACT
// ==============================

export const getContract = async () => {

    const tronWeb = getTronWeb();

    if (!CONTRACT_ADDRESS) {
        throw new Error(
            "Contract address missing"
        );
    }

    const address =
        tronWeb.defaultAddress?.base58;

    if (!address) {
        throw new Error(
            "TronLink wallet address not available"
        );
    }

    tronWeb.setAddress(address);

    return await tronWeb.contract(
        contractAbi,
        CONTRACT_ADDRESS
    );
};


// ==============================
// PROPERTY
// ==============================

export const getPropertyIds = async () => {

    const contract =
        await getContract();

    return await contract
        .getPropertyIds()
        .call();
};


export const getProperty = async (propertyId) => {

    if (!propertyId) {
        throw new Error(
            "Property ID required"
        );
    }

    const contract =
        await getContract();

    return await contract
        .getProperty(propertyId)
        .call();
};

export const registerPropertyOnBlockchain = async (
    propertyData
) => {

    if (!propertyData?.propertyId) {
        throw new Error(
            "Property ID required"
        );
    }

    const tronWeb =
        window.tronWeb ||
        window.tron?.tronWeb;

    if (!tronWeb) {
        throw new Error(
            "TronWeb unavailable. Please install/unlock TronLink."
        );
    }

    const ownerAddress =
        tronWeb.defaultAddress?.base58;

    if (!ownerAddress) {
        throw new Error(
            "Please unlock TronLink wallet first"
        );
    }

    const contract =
        await getContract();

    console.log(
        "REGISTERING PROPERTY ON BLOCKCHAIN:",
        {
            propertyId: propertyData.propertyId,
            owner: ownerAddress
        }
    );

    const transaction =
        await contract
            .registerProperty(
                propertyData.propertyId,
                propertyData.province,
                propertyData.city,
                propertyData.district,
                propertyData.parcelNumber,
                Number(propertyData.area),
                Number(propertyData.buildYear),
                propertyData.usageType,
                propertyData.constructionStatus,
               Math.round(Number(propertyData.latitude) * 10000),
Math.round(Number(propertyData.longitude) * 10000)
            )
            .send({
                feeLimit: 100_000_000
            });

    console.log(
        "PROPERTY REGISTER TX:",
        transaction
    );

    return {
        transactionId: transaction,
        propertyId: propertyData.propertyId,
        owner: ownerAddress
    };

};

// ==============================
// GET OWNERS
// BLOCKCHAIN
// ==============================

export const getOwners = async (propertyId) => {

    if (!propertyId) {
        throw new Error(
            "Property ID required"
        );
    }

    const contract =
        await getContract();

    const owners =
        await contract
            .getOwners(propertyId)
            .call();

    console.log(
        "BLOCKCHAIN OWNERS:",
        owners
    );

    return owners;
};


// ==============================
// READ TRANSFER COUNTER
// BLOCKCHAIN
// ==============================

export const getTransferCounter = async () => {

    try {

        const contract =
            await getContract();

        const counter =
            await contract
                .transferCounter()
                .call();

        const value =
            Number(counter.toString());

        console.log(
            "BLOCKCHAIN TRANSFER COUNTER:",
            value
        );

        return value;

    } catch (error) {

        console.error(
            "TRANSFER COUNTER READ ERROR:",
            error
        );

        throw error;
    }
};


// ==============================
// TRANSFER REQUEST
// OWNER → BLOCKCHAIN
// ==============================

export const createTransferRequest = async (
    propertyId,
    buyer,
    transferredShare
) => {

    if (!propertyId) {
        throw new Error(
            "Property ID required"
        );
    }

    if (!buyer) {
        throw new Error(
            "Buyer wallet address required"
        );
    }

    if (
        !transferredShare ||
        Number(transferredShare) <= 0
    ) {
        throw new Error(
            "Transferred share must be greater than 0"
        );
    }

    if (Number(transferredShare) > 100) {
        throw new Error(
            "Transferred share cannot exceed 100"
        );
    }

    const tronWeb =
        getTronWeb();

    const ownerAddress =
        tronWeb.defaultAddress?.base58;

    if (!ownerAddress) {
        throw new Error(
            "Please connect Owner TronLink wallet first"
        );
    }

    if (
        buyer.toUpperCase() ===
        ownerAddress.toUpperCase()
    ) {
        throw new Error(
            "Buyer cannot be the seller"
        );
    }

    if (
        typeof tronWeb.isAddress === "function" &&
        !tronWeb.isAddress(buyer)
    ) {
        throw new Error(
            "Invalid buyer wallet address"
        );
    }

    console.log(
        "CREATING TRANSFER REQUEST ON BLOCKCHAIN:",
        {
            contract: CONTRACT_ADDRESS,
            propertyId,
            buyer,
            transferredShare:
                Number(transferredShare),
            seller: ownerAddress
        }
    );

    const contract =
        await getContract();

    const transaction =
        await contract
            .createTransferRequest(
                propertyId,
                buyer,
                Number(transferredShare)
            )
            .send({
                feeLimit: 100_000_000
            });

    console.log(
        "TRANSFER REQUEST TX:",
        transaction
    );

    return {
        transactionId: transaction,
        seller: ownerAddress
    };
};


// ==============================
// BUYER APPROVAL
// BUYER → BLOCKCHAIN
// ==============================

export const approveTransferByBuyer =
    async (transferId) => {

        if (
            transferId === undefined ||
            transferId === null ||
            transferId === ""
        ) {
            throw new Error(
                "Transfer ID required"
            );
        }

        const numericTransferId =
            Number(transferId);

        if (
            !Number.isInteger(numericTransferId) ||
            numericTransferId <= 0
        ) {
            throw new Error(
                "Invalid Transfer ID"
            );
        }

        const tronWeb =
            getTronWeb();

        const buyerAddress =
            tronWeb.defaultAddress?.base58;

        if (!buyerAddress) {
            throw new Error(
                "Please connect Buyer TronLink wallet first"
            );
        }

        console.log(
            "BUYER APPROVING TRANSFER:",
            {
                transferId:
                    numericTransferId,
                contract:
                    CONTRACT_ADDRESS,
                buyer:
                    buyerAddress
            }
        );

        const contract =
            await getContract();

        const transaction =
            await contract
                .approveTransferByBuyer(
                    numericTransferId
                )
                .send({
                    feeLimit: 100_000_000
                });

        console.log(
            "BUYER APPROVAL TX:",
            transaction
        );

        return {
            transactionId: transaction,
            buyer: buyerAddress
        };
    };


// ==============================
// ADMIN APPROVAL
// ADMIN → BLOCKCHAIN
// ==============================

export const approveTransferByAdmin =
    async (transferId) => {

        if (
            transferId === undefined ||
            transferId === null ||
            transferId === ""
        ) {
            throw new Error(
                "Transfer ID required"
            );
        }

        const numericTransferId =
            Number(transferId);

        if (
            !Number.isInteger(numericTransferId) ||
            numericTransferId <= 0
        ) {
            throw new Error(
                "Invalid Transfer ID"
            );
        }

        const tronWeb =
            getTronWeb();

        const adminAddress =
            tronWeb.defaultAddress?.base58;

        if (!adminAddress) {
            throw new Error(
                "Please connect Admin TronLink wallet first"
            );
        }

        console.log(
            "ADMIN APPROVING TRANSFER:",
            {
                transferId:
                    numericTransferId,
                contract:
                    CONTRACT_ADDRESS,
                admin:
                    adminAddress
            }
        );

        const contract =
            await getContract();

        const transaction =
            await contract
                .approveTransferByAdmin(
                    numericTransferId
                )
                .send({
                    feeLimit: 100_000_000
                });

        console.log(
            "ADMIN APPROVAL TX:",
            transaction
        );

        return {
            transactionId: transaction,
            admin: adminAddress
        };
    };


// ==============================
// READ TRANSFER REQUEST
// BLOCKCHAIN
// ==============================

export const getTransferRequest =
    async (transferId) => {

        if (
            transferId === undefined ||
            transferId === null ||
            transferId === ""
        ) {
            throw new Error(
                "Transfer ID required"
            );
        }

        const numericTransferId =
            Number(transferId);

        if (
            !Number.isInteger(numericTransferId) ||
            numericTransferId <= 0
        ) {
            throw new Error(
                "Invalid Transfer ID"
            );
        }

        console.log(
            "READING TRANSFER REQUEST FROM BLOCKCHAIN:",
            {
                transferId:
                    numericTransferId,
                contract:
                    CONTRACT_ADDRESS
            }
        );

        const contract =
            await getContract();

        const transfer =
            await contract
                .getTransferRequest(
                    numericTransferId
                )
                .call();

        console.log(
            "BLOCKCHAIN TRANSFER REQUEST:",
            transfer
        );

        return transfer;
    };


// ==============================
// READ TRANSFER HISTORY
// BLOCKCHAIN
// ==============================

export const getTransferHistory =
    async (propertyId) => {

        if (!propertyId) {
            throw new Error(
                "Property ID required"
            );
        }

        console.log(
            "READING TRANSFER HISTORY FROM BLOCKCHAIN:",
            {
                propertyId,
                contract:
                    CONTRACT_ADDRESS
            }
        );

        const contract =
            await getContract();

        const history =
            await contract
                .getTransferHistory(
                    propertyId
                )
                .call();

        console.log(
            "BLOCKCHAIN TRANSFER HISTORY:",
            history
        );

        return history;
    };

    // ==============================
// CHECK TRANSACTION
// BLOCKCHAIN
// ==============================
export const checkTransaction = async (txid) => {
    if (!txid) {
        throw new Error("Transaction ID required");
    }

    const tronWeb = getTronWeb();

    console.log(
        "CHECKING TRANSACTION:",
        txid
    );

    const tx =
        await tronWeb.trx.getTransaction(txid);

    const info =
        await tronWeb.trx.getTransactionInfo(txid);

    console.log(
        "TRANSACTION RAW:",
        tx
    );

    console.log(
        "TRANSACTION INFO:",
        info
    );

    const result = {
        txid: txid,

        contractAddress:
            tx?.raw_data?.contract?.[0]?.parameter?.value?.contract_address,

        ownerAddress:
            tx?.raw_data?.contract?.[0]?.parameter?.value?.owner_address,

        receiptResult:
            info?.receipt?.result,

        contractResult:
            info?.contractResult,

        resultMessage:
            info?.resMessage,

        blockNumber:
            info?.blockNumber,

        fee:
            info?.fee,

        energyUsageTotal:
            info?.energy_usage_total,

        energyFee:
            info?.energy_fee,

        netUsage:
            info?.net_usage,

        netFee:
            info?.net_fee
    };

    console.log(
        "IMPORTANT TRANSACTION RESULT:",
        result
    );

    return result;
};

// ==============================
// READ PROPERTY OWNERS
// BLOCKCHAIN
// ==============================

export const checkBlockchainOwners = async (propertyId) => {
    if (!propertyId) {
        throw new Error("Property ID required");
    }

    const tronWeb = getTronWeb();

    const contract = await getContract();

    console.log(
        "CHECKING BLOCKCHAIN OWNERS:",
        {
            propertyId,
            contract: CONTRACT_ADDRESS
        }
    );

    const owners =
        await contract
            .getOwners(propertyId)
            .call();

    const formattedOwners =
        owners.map((owner) => {

            const hexAddress =
                owner.walletAddress ||
                owner[0];

            const base58Address =
                tronWeb.address.fromHex(
                    hexAddress
                );

            const share =
                owner.share !== undefined
                    ? owner.share
                    : owner[2];

            return {
                hexAddress,
                base58Address,
                share:
                    typeof share === "bigint"
                        ? share.toString()
                        : String(share)
            };
        });

    console.log(
        "BLOCKCHAIN OWNERS FORMATTED:",
        formattedOwners
    );

    return formattedOwners;
};