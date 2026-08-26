require("dotenv").config();

const fs = require("fs");
const dns = require("dns");
const https = require("https");
const axios = require("axios");
const TronWeb = require("tronweb");

// =========================================================
// NILE CONFIG
// =========================================================

const NILE_HOST = "nile.trongrid.io";
const NILE_IP = "32.189.30.242";
const NILE_URL = `https://${NILE_HOST}`;

// =========================================================
// DEPLOY CONFIG
// =========================================================

const COMPILE_OUTPUT = "./compile-output.json";
const CONTRACT_NAME = "DappTronSystem";

const DEPLOYED_ADDRESS_FILE =
    "./deployed-contract-address.txt";

const FEE_LIMIT = 1_000_000_000;

const MAX_CONFIRMATION_ATTEMPTS = 40;
const CONFIRMATION_INTERVAL = 3000;

// =========================================================
// FORCE IPv4
// =========================================================

dns.setDefaultResultOrder("ipv4first");

const originalLookup = dns.lookup;

dns.lookup = function (hostname, options, callback) {
    if (hostname === NILE_HOST) {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }

        return callback(
            null,
            NILE_IP,
            4
        );
    }

    return originalLookup.call(
        dns,
        hostname,
        options,
        callback
    );
};

// =========================================================
// HTTPS AGENT
// =========================================================

const httpsAgent = new https.Agent({
    keepAlive: false,
    family: 4,
    servername: NILE_HOST,
    rejectUnauthorized: true
});

// =========================================================
// NILE REQUEST
// =========================================================

async function nileRequest(
    path,
    data = {},
    method = "post"
) {
    const normalizedPath =
        path.startsWith("/")
            ? path
            : `/${path}`;

    console.log(
        `[NILE] ${method.toUpperCase()} ${normalizedPath}`
    );

    const response = await axios({
        method: method.toLowerCase(),

        url:
            `https://${NILE_IP}` +
            normalizedPath,

        data,

        timeout: 45000,

        httpsAgent,

        headers: {
            Host: NILE_HOST,
            "Content-Type": "application/json",
            Connection: "close"
        },

        validateStatus: () => true
    });

    if (
        response.status < 200 ||
        response.status >= 300
    ) {
        const error = new Error(
            `Nile HTTP ${response.status}`
        );

        error.response = response;

        throw error;
    }

    return response.data;
}

// =========================================================
// ENV CHECK
// =========================================================

if (!process.env.PRIVATE_KEY) {
    throw new Error(
        "PRIVATE_KEY is missing from .env"
    );
}

if (
    process.env.PRIVATE_KEY ===
    "YOUR_MAIN_WALLET_PRIVATE_KEY"
) {
    throw new Error(
        "PRIVATE_KEY still contains placeholder value."
    );
}

// =========================================================
// TRONWEB
// =========================================================

const tronWeb = new TronWeb({
    fullHost: NILE_URL,
    privateKey: process.env.PRIVATE_KEY
});

// =========================================================
// PATCH PROVIDERS
// =========================================================

function patchProvider(provider, name) {
    if (!provider) {
        throw new Error(
            `${name} provider is missing`
        );
    }

    provider.request = async function (
        endpoint,
        payload = {},
        method = "post"
    ) {
        return nileRequest(
            endpoint,
            payload,
            method
        );
    };
}

patchProvider(
    tronWeb.fullNode,
    "Full node"
);

patchProvider(
    tronWeb.solidityNode,
    "Solidity node"
);

if (tronWeb.eventServer) {
    patchProvider(
        tronWeb.eventServer,
        "Event server"
    );
}

// =========================================================
// HELPERS
// =========================================================

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

function validBlock(block) {
    return (
        block &&
        block.block_header &&
        block.block_header.raw_data &&
        Number.isFinite(
            Number(
                block.block_header.raw_data.number
            )
        )
    );
}

function loadCompiledContract() {
    if (!fs.existsSync(COMPILE_OUTPUT)) {
        throw new Error(
            `Missing ${COMPILE_OUTPUT}. Run node compile.js first.`
        );
    }

    const output = JSON.parse(
        fs.readFileSync(
            COMPILE_OUTPUT,
            "utf8"
        )
    );

    // -----------------------------------------------------
    // Solidity compiler errors
    // -----------------------------------------------------

    const errors =
        output.errors?.filter(
            error =>
                error.severity === "error"
        ) || [];

    if (errors.length > 0) {
        console.error(
            "\nSolidity compilation errors:\n"
        );

        console.error(
            JSON.stringify(
                errors,
                null,
                2
            )
        );

        throw new Error(
            "compile-output.json contains Solidity errors."
        );
    }

    // -----------------------------------------------------
    // Contract
    // -----------------------------------------------------

    const compiled =
        output.contracts?.[
            "DappTronSystem.sol"
        ]?.[CONTRACT_NAME];

    if (!compiled) {
        throw new Error(
            `Compiled contract ${CONTRACT_NAME} not found in compile-output.json.`
        );
    }

    const abi =
        compiled.abi;

    const bytecode =
        compiled.evm?.bytecode?.object;

    if (
        !Array.isArray(abi) ||
        abi.length === 0
    ) {
        throw new Error(
            "Compiled ABI is missing or empty."
        );
    }

    if (
        typeof bytecode !== "string" ||
        bytecode.length === 0
    ) {
        throw new Error(
            "Compiled bytecode is missing or empty."
        );
    }

    return {
        abi,
        bytecode
    };
}

async function getBlockWithRetry(
    maxAttempts = 5
) {
    let lastError;

    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {
        try {
            console.log(
                `Checking Nile blockchain... attempt ${attempt}/${maxAttempts}`
            );

            const block =
                await tronWeb.trx.getCurrentBlock();

            if (!validBlock(block)) {
                throw new Error(
                    "Invalid block response."
                );
            }

            return block;

        } catch (error) {
            lastError = error;

            console.log(
                "Nile request failed:",
                error?.message || error
            );

            if (
                attempt < maxAttempts
            ) {
                await sleep(1500);
            }
        }
    }

    throw lastError;
}

async function waitForConfirmation(
    txid,
    maxAttempts = MAX_CONFIRMATION_ATTEMPTS
) {
    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {
        try {
            const info =
                await tronWeb.trx.getTransactionInfo(
                    txid
                );

            if (
                info &&
                info.receipt &&
                info.receipt.result
            ) {
                return info;
            }

        } catch (error) {
            console.log(
                `Confirmation request failed: ${
                    error?.message || error
                }`
            );
        }

        console.log(
            `Waiting confirmation... ${attempt}/${maxAttempts}`
        );

        await sleep(
            CONFIRMATION_INTERVAL
        );
    }

    throw new Error(
        "Transaction confirmation timeout."
    );
}

function extractContractAddress(
    txInfo
) {
    if (
        txInfo &&
        txInfo.contractResult &&
        txInfo.contractResult.length > 0
    ) {
        // Contract creation transactions
        // normally expose the deployed address
        // through contract_address in the transaction info.
    }

    if (
        txInfo?.contract_address
    ) {
        return txInfo.contract_address;
    }

    if (
        txInfo?.contractAddress
    ) {
        return txInfo.contractAddress;
    }

    return null;
}

// =========================================================
// DEPLOY
// =========================================================

async function deploy() {
    try {
        console.log();

        console.log(
            "================================"
        );

        console.log(
            "TRON NILE DEPLOY - NEW COMPILED CONTRACT"
        );

        console.log(
            "================================"
        );

        console.log(
            "Network:",
            NILE_URL
        );

        console.log(
            "Forced IPv4:",
            NILE_IP
        );

        console.log(
            "Host / SNI:",
            NILE_HOST
        );

        console.log();

        // =====================================================
        // LOAD NEW COMPILED CONTRACT
        // =====================================================

        console.log(
            "Loading compile-output.json..."
        );

        const {
            abi,
            bytecode
        } = loadCompiledContract();

        console.log(
            "Compiled contract:",
            CONTRACT_NAME
        );

        console.log(
            "ABI entries:",
            abi.length
        );

        console.log(
            "Bytecode length:",
            bytecode.length
        );

        console.log();

        // =====================================================
        // DEPLOYER
        // =====================================================

        const deployer =
            tronWeb.defaultAddress.base58;

        if (!deployer) {
            throw new Error(
                "Unable to determine deployer address."
            );
        }

        console.log(
            "Deployer:",
            deployer
        );

        // =====================================================
        // CHECK NILE
        // =====================================================

        const block =
            await getBlockWithRetry(5);

        console.log();

        console.log(
            "Nile connection OK."
        );

        console.log(
            "Nile block:",
            block.block_header
                .raw_data.number
        );

        // =====================================================
        // BALANCE
        // =====================================================

        const balance =
            await tronWeb.trx.getBalance(
                deployer
            );

        console.log(
            "Deployer balance:",
            balance / 1e6,
            "TRX"
        );

        if (balance <= 0) {
            throw new Error(
                "Deployer has no TRX balance."
            );
        }

        // =====================================================
        // BUILD DEPLOYMENT TRANSACTION
        // =====================================================

        console.log();

        console.log(
            "Building deployment transaction..."
        );

        const transaction =
            await tronWeb.transactionBuilder
                .createSmartContract(
                    {
                        abi,
                        bytecode,

                        feeLimit:
                            FEE_LIMIT,

                        callValue: 0,

                        userFeePercentage: 100,

                        originEnergyLimit:
                            10_000_000
                    },

                    deployer
                );

        if (
            !transaction ||
            !transaction.raw_data
        ) {
            throw new Error(
                "Failed to create deployment transaction."
            );
        }

        console.log(
            "Deployment transaction created."
        );

        console.log(
            "TX ID:",
            transaction.txID
        );

        // =====================================================
        // SIGN
        // =====================================================

        console.log();

        console.log(
            "Signing transaction..."
        );

        const signed =
            await tronWeb.trx.sign(
                transaction,
                process.env.PRIVATE_KEY
            );

        console.log(
            "Transaction signed."
        );

        // =====================================================
        // BROADCAST
        // =====================================================

        console.log();

        console.log(
            "Broadcasting transaction..."
        );

        const result =
            await tronWeb.trx.sendRawTransaction(
                signed
            );

        console.log();

        console.log(
            "Broadcast result:"
        );

        console.log(
            JSON.stringify(
                result,
                null,
                2
            )
        );

        if (
            !result ||
            result.result !== true
        ) {
            throw new Error(
                result?.code
                    ? `Broadcast failed: ${result.code}`
                    : "Broadcast failed."
            );
        }

        const txid =
            result.txid ||
            transaction.txID;

        console.log();

        console.log(
            "================================"
        );

        console.log(
            "DEPLOY BROADCAST SUCCESS"
        );

        console.log(
            "================================"
        );

        console.log(
            "Transaction ID:",
            txid
        );

        // =====================================================
        // WAIT FOR CONFIRMATION
        // =====================================================

        console.log();

        console.log(
            "Waiting for deployment confirmation..."
        );

        const txInfo =
            await waitForConfirmation(
                txid
            );

        console.log();

        console.log(
            "Transaction result:",
            txInfo?.receipt?.result
        );

        if (
            txInfo?.receipt?.result !==
            "SUCCESS"
        ) {
            console.error();

            console.error(
                "================================"
            );

            console.error(
                "DEPLOY FAILED"
            );

            console.error(
                "================================"
            );

            console.error(
                JSON.stringify(
                    txInfo,
                    null,
                    2
                )
            );

            process.exit(1);
        }

        // =====================================================
        // CONTRACT ADDRESS
        // =====================================================

        const contractAddress =
            extractContractAddress(
                txInfo
            );

        console.log();

        console.log(
            "Deployment confirmed."
        );

        if (contractAddress) {
            console.log();
            console.log(
                "================================"
            );
            console.log(
                "NEW CONTRACT DEPLOYED"
            );
            console.log(
                "================================"
            );

            console.log(
                "Contract address:",
                contractAddress
            );

            fs.writeFileSync(
                DEPLOYED_ADDRESS_FILE,
                contractAddress + "\n",
                "utf8"
            );

            console.log();
            console.log(
                "Saved to:",
                DEPLOYED_ADDRESS_FILE
            );
        } else {
            console.log();

            console.log(
                "Deployment succeeded, but contract address was not present in transaction info."
            );

            console.log(
                "Transaction info:"
            );

            console.log(
                JSON.stringify(
                    txInfo,
                    null,
                    2
                )
            );
        }

        // =====================================================
        // FINAL
        // =====================================================

        console.log();

        console.log(
            "================================"
        );

        console.log(
            "DEPLOY COMPLETE"
        );

        console.log(
            "================================"
        );

        console.log(
            "TX ID:",
            txid
        );

        if (contractAddress) {
            console.log(
                "Contract:",
                contractAddress
            );
        }

        console.log();

    } catch (error) {
        console.error();

        console.error(
            "================================"
        );

        console.error(
            "DEPLOY ERROR"
        );

        console.error(
            "================================"
        );

        if (
            error?.response?.data
        ) {
            console.error(
                JSON.stringify(
                    error.response.data,
                    null,
                    2
                )
            );
        } else {
            console.error(
                error?.message ||
                error
            );
        }

        process.exit(1);
    }
}

deploy();