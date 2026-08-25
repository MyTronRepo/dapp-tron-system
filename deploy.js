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
// FORCE IPv4 + NILE IP
// =========================================================

dns.setDefaultResultOrder("ipv4first");

const originalLookup = dns.lookup;

dns.lookup = function (hostname, options, callback) {
    if (hostname === NILE_HOST) {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }

        return callback(null, NILE_IP, 4);
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
// DIRECT NILE REQUEST
// =========================================================

async function nileRequest(path, data = {}, method = "post") {
    console.log(
        `[NILE] ${method.toUpperCase()} ${path}`
    );

    const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

const response = await axios({
    method: method.toLowerCase(),

    url: `https://${NILE_IP}${normalizedPath}`,
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
// TRONWEB
//
// IMPORTANT:
// Do NOT pass custom provider objects to constructor.
// TronWeb 5.3.5 validates the provider during construction.
// =========================================================

if (!process.env.PRIVATE_KEY) {
    throw new Error(
        "PRIVATE_KEY is missing from .env"
    );
}

const tronWeb = new TronWeb({
    fullHost: NILE_URL,
    privateKey: process.env.PRIVATE_KEY
});

// =========================================================
// PATCH TRONWEB PROVIDERS AFTER CONSTRUCTION
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
            "TRON NILE DEPLOY"
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

        // -------------------------------------------------
        // LOAD CONTRACT
        // -------------------------------------------------

        const abi = JSON.parse(
            fs.readFileSync(
                "contract-abi.json",
                "utf8"
            )
        );

        const bytecode =
            fs.readFileSync(
                "contract-bytecode.txt",
                "utf8"
            ).trim();

        if (!bytecode) {
            throw new Error(
                "contract-bytecode.txt is empty."
            );
        }

        console.log(
            "Bytecode length:",
            bytecode.length
        );

        // -------------------------------------------------
        // DEPLOYER
        // -------------------------------------------------

        const deployer =
            tronWeb.defaultAddress.base58;

        console.log();
        console.log(
            "Deployer:",
            deployer
        );

        // -------------------------------------------------
        // CHECK BLOCK
        // -------------------------------------------------

        console.log();

        const block =
            await getBlockWithRetry(5);

        console.log(
            "Nile connection OK - Block:",
            block.block_header
                .raw_data.number
        );

        // -------------------------------------------------
        // BALANCE
        // -------------------------------------------------

        const balance =
            await tronWeb.trx.getBalance(
                deployer
            );

        console.log(
            "Balance:",
            balance / 1e6,
            "TRX"
        );

        if (balance <= 0) {
            throw new Error(
                "Deployer has no TRX balance."
            );
        }

        // -------------------------------------------------
        // BUILD TRANSACTION
        // -------------------------------------------------

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
                            1_000_000_000,

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

        // -------------------------------------------------
        // TRANSACTION INFO
        // -------------------------------------------------

        const txTimestamp =
            Number(
                transaction.raw_data.timestamp
            );

        const expiration =
            Number(
                transaction.raw_data.expiration
            );

        console.log();
        console.log(
            "Transaction created."
        );

        console.log(
            "TX ID:",
            transaction.txID
        );

        console.log(
            "Created:",
            new Date(
                txTimestamp
            ).toISOString()
        );

        console.log(
            "Expiration:",
            new Date(
                expiration
            ).toISOString()
        );

        console.log(
            "Remaining:",
            Math.max(
                0,
                Math.floor(
                    (
                        expiration -
                        Date.now()
                    ) / 1000
                )
            ),
            "seconds"
        );

        // -------------------------------------------------
        // SIGN IMMEDIATELY
        // -------------------------------------------------

        if (
            Date.now() >= expiration
        ) {
            throw new Error(
                "Transaction expired before signing."
            );
        }

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

        // -------------------------------------------------
        // BROADCAST IMMEDIATELY
        // -------------------------------------------------

        const remaining =
            expiration - Date.now();

        console.log(
            "Remaining before broadcast:",
            Math.floor(
                Math.max(
                    0,
                    remaining
                ) / 1000
            ),
            "seconds"
        );

        if (remaining <= 0) {
            throw new Error(
                "Transaction expired before broadcast."
            );
        }

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
            "Broadcast result:",
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

        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

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
            transaction.txID
        );

        console.log();

        console.log(
            "The transaction was accepted by Nile."
        );

        console.log(
            "We will retrieve the contract address next."
        );

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
